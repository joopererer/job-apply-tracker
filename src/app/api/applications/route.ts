import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { normalizeCompany, normalizeTitle, cleanAndFormatJd } from '@/lib/scraper';

/**
 * GET /api/applications
 * 支持按 q (全文反查公司名、职位名、JD 内容、HR 联系方式、备注) 与 status 过滤
 * 结果按 applied_at 倒序排列
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const status = searchParams.get('status')?.trim();

    let query = supabase.from('applications').select('*');

    // 1. 状态精确过滤
    if (status) {
      query = query.eq('status', status);
    }

    // 2. 关键词全文检索 (针对 HR 突然来电等场景的反向急救检索)
    if (q) {
      // 过滤 PostgREST .or() 语法保留字符
      const sanitized = q.replace(/[,()]/g, ' ').trim();
      if (sanitized) {
        const filter = [
          `company_raw.ilike.%${sanitized}%`,
          `company_norm.ilike.%${sanitized}%`,
          `title_raw.ilike.%${sanitized}%`,
          `title_norm.ilike.%${sanitized}%`,
          `jd_content.ilike.%${sanitized}%`,
          `notes.ilike.%${sanitized}%`,
          `hr_contact->>name.ilike.%${sanitized}%`,
          `hr_contact->>phone.ilike.%${sanitized}%`,
          `hr_contact->>email.ilike.%${sanitized}%`,
          `hr_contact->>raw.ilike.%${sanitized}%`,
        ].join(',');

        query = query.or(filter);
      }
    }

    // 3. 按投递时间倒序排列
    query = query.order('applied_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      applications: data || [],
      total: data?.length || 0,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/applications
 * 保存确认投递的职位记录 (兼容驼峰与下划线字段格式)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const companyRaw = body.company_raw || body.companyRaw || '';
    const titleRaw = body.title_raw || body.titleRaw || '';

    if (!companyRaw || !titleRaw) {
      return NextResponse.json(
        { error: 'Missing required fields: company and title are required' },
        { status: 400 }
      );
    }

    const companyNorm =
      body.company_norm || body.companyNorm || normalizeCompany(companyRaw);
    const titleNorm =
      body.title_norm || body.titleNorm || normalizeTitle(titleRaw);

    // 处理 HR 联系方式 (支持直接对象或字符串包装)
    let hrContact = body.hr_contact || body.hrContact || null;
    if (typeof hrContact === 'string') {
      hrContact = { raw: hrContact, phone: hrContact };
    }

    const postedAt = body.posted_at || body.postedAt || null;

    const newRecord: Record<string, any> = {
      platform: body.platform || 'OTHER',
      external_job_id: body.external_job_id ?? body.externalJobId ?? null,
      clean_url: body.clean_url || body.cleanUrl || '',
      company_raw: companyRaw,
      company_norm: companyNorm,
      title_raw: titleRaw,
      title_norm: titleNorm,
      contract_type: body.contract_type || body.contractType || 'OTHER',
      location: body.location ?? null,
      salary_range: body.salary_range ?? body.salaryRange ?? null,
      language: body.language || 'FR',
      jd_content: body.jd_content || body.jdContent || '',
      status: body.status || 'APPLIED',
      notes: body.notes || null,
      hr_contact: hrContact,
      posted_at: postedAt,
      applied_at:
        body.applied_at || body.appliedAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let { data, error } = await supabase
      .from('applications')
      .insert(newRecord)
      .select()
      .single();

    // 容错：如果 Supabase 表尚未添加 posted_at 字段，自动移除并降级保存
    if (error && error.message?.includes('posted_at')) {
      delete newRecord.posted_at;
      const retry = await supabase
        .from('applications')
        .insert(newRecord)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { application: data },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to save application' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/applications
 * 完整更新职位记录的所有字段（公司、职位、合同、地点、薪资、状态、备注、JD等）
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { id } = body;

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    // 1. 公司名与标准化
    if (body.company_raw !== undefined || body.companyRaw !== undefined) {
      const cRaw = (body.company_raw ?? body.companyRaw ?? '').trim();
      updates.company_raw = cRaw;
      updates.company_norm = normalizeCompany(cRaw);
    }

    // 2. 职位名与标准化
    if (body.title_raw !== undefined || body.titleRaw !== undefined) {
      const tRaw = (body.title_raw ?? body.titleRaw ?? '').trim();
      updates.title_raw = tRaw;
      updates.title_norm = normalizeTitle(tRaw);
    }

    // 3. 合同类型与平台
    if (body.contract_type !== undefined || body.contractType !== undefined) {
      updates.contract_type = body.contract_type ?? body.contractType;
    }
    if (body.platform !== undefined) updates.platform = body.platform;
    if (body.language !== undefined) updates.language = body.language;

    // 4. 地点与薪资
    if (body.location !== undefined) updates.location = body.location;
    if (body.salary_range !== undefined || body.salaryRange !== undefined) {
      updates.salary_range = body.salary_range ?? body.salaryRange;
    }

    // 5. 状态与时间
    if (body.status !== undefined) updates.status = body.status;
    if (body.posted_at !== undefined || body.postedAt !== undefined) {
      updates.posted_at = body.posted_at ?? body.postedAt;
    }
    if (body.applied_at !== undefined || body.appliedAt !== undefined) {
      updates.applied_at = body.applied_at ?? body.appliedAt;
    }

    // 6. 链接与备注
    if (body.clean_url !== undefined || body.cleanUrl !== undefined) {
      updates.clean_url = body.clean_url ?? body.cleanUrl;
    }
    if (body.notes !== undefined) updates.notes = body.notes;

    // 7. 更新 HR 联系方式
    if (body.hr_contact !== undefined || body.hrContact !== undefined) {
      let hr = body.hr_contact ?? body.hrContact;
      if (typeof hr === 'string') {
        hr = { raw: hr, phone: hr };
      }
      updates.hr_contact = hr;
    }

    // 8. JD 正文内容格式化
    if (body.jd_content !== undefined || body.jdContent !== undefined) {
      const jdRaw = body.jd_content ?? body.jdContent ?? '';
      updates.jd_content = cleanAndFormatJd(jdRaw);
    }

    let { data, error } = await supabase
      .from('applications')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error && error.message?.includes('posted_at')) {
      delete updates.posted_at;
      const retry = await supabase
        .from('applications')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      application: data,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to update application' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/applications
 * 删除指定的求职记录 (支持 query param ?id=xxx 或 body { id })
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body?.id;
    }

    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('applications')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      deletedId: id,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to delete application' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

