import { NextRequest, NextResponse } from 'next/server';
import { normalizeCompany, normalizeTitle, cleanAndFormatJd } from '@/lib/scraper';
import { authenticateRequest, unauthorizedResponse } from '@/lib/auth';

/**
 * GET /api/applications
 * 仅返回当前登录用户的投递记录
 * 支持按 q 全文反查与 status 精确过滤，按 applied_at 倒序排列
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { user, client } = auth;
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q')?.trim();
    const status = searchParams.get('status')?.trim();

    // 严格绑定当前登录用户 user_id
    let query = client.from('applications').select('*').eq('user_id', user.id);

    // 1. 状态精确过滤
    if (status) {
      query = query.eq('status', status);
    }

    // 2. 关键词全文检索
    if (q) {
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
 * 保存确认投递的职位记录，自动绑定 user_id: user.id
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { user, client } = auth;
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

    let hrContact = body.hr_contact || body.hrContact || null;
    if (typeof hrContact === 'string') {
      hrContact = { raw: hrContact, phone: hrContact };
    }

    const postedAt = body.posted_at || body.postedAt || null;
    const rating = body.rating || 'B';
    const isStarred = body.is_starred ?? body.isStarred ?? false;

    const newRecord: Record<string, any> = {
      user_id: user.id,
      platform: body.platform || 'OTHER',
      external_job_id: body.external_job_id ?? body.externalJobId ?? null,
      clean_url: body.clean_url || body.cleanUrl || '',
      company_raw: companyRaw,
      company_norm: companyNorm,
      title_raw: titleRaw,
      title_norm: titleNorm,
      contract_type: body.contract_type || body.contractType || 'UNKNOWN',
      work_mode: body.work_mode ?? body.workMode ?? null,
      location: body.location ?? null,
      salary_range: body.salary_range ?? body.salaryRange ?? null,
      language: body.language || 'FR',
      jd_content: body.jd_content || body.jdContent || '',
      status: body.status || 'APPLIED',
      rating: rating,
      is_starred: isStarred,
      notes: body.notes || null,
      hr_contact: hrContact,
      posted_at: postedAt,
      applied_at:
        body.applied_at || body.appliedAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    let { data, error } = await client
      .from('applications')
      .insert(newRecord)
      .select()
      .single();

    // 容错处理：若数据库表尚未执行某些列迁移
    if (error && error.message) {
      let needsRetry = false;
      if (error.message.includes('work_mode')) {
        delete newRecord.work_mode;
        needsRetry = true;
      }
      if (error.message.includes('posted_at')) {
        delete newRecord.posted_at;
        needsRetry = true;
      }
      if (error.message.includes('rating')) {
        delete newRecord.rating;
        needsRetry = true;
      }
      if (error.message.includes('is_starred')) {
        delete newRecord.is_starred;
        needsRetry = true;
      }
      if (needsRetry) {
        const retry = await client
          .from('applications')
          .insert(newRecord)
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }
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
 * 更新属于当前用户的职位记录
 */
export async function PATCH(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { user, client } = auth;
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

    if (body.company_raw !== undefined || body.companyRaw !== undefined) {
      const cRaw = (body.company_raw ?? body.companyRaw ?? '').trim();
      updates.company_raw = cRaw;
      updates.company_norm = normalizeCompany(cRaw);
    }
    if (body.title_raw !== undefined || body.titleRaw !== undefined) {
      const tRaw = (body.title_raw ?? body.titleRaw ?? '').trim();
      updates.title_raw = tRaw;
      updates.title_norm = normalizeTitle(tRaw);
    }

    if (body.contract_type !== undefined || body.contractType !== undefined) {
      updates.contract_type = body.contract_type ?? body.contractType;
    }
    if (body.work_mode !== undefined || body.workMode !== undefined) {
      updates.work_mode = body.work_mode ?? body.workMode;
    }
    if (body.platform !== undefined) updates.platform = body.platform;
    if (body.language !== undefined) updates.language = body.language;
    if (body.location !== undefined) updates.location = body.location;
    if (body.salary_range !== undefined || body.salaryRange !== undefined) {
      updates.salary_range = body.salary_range ?? body.salaryRange;
    }
    if (body.status !== undefined) updates.status = body.status;
    if (body.rating !== undefined) updates.rating = body.rating;
    if (body.is_starred !== undefined || body.isStarred !== undefined) {
      updates.is_starred = body.is_starred ?? body.isStarred;
    }
    if (body.posted_at !== undefined || body.postedAt !== undefined) {
      updates.posted_at = body.posted_at ?? body.postedAt;
    }
    if (body.applied_at !== undefined || body.appliedAt !== undefined) {
      updates.applied_at = body.applied_at ?? body.appliedAt;
    }
    if (body.clean_url !== undefined || body.cleanUrl !== undefined) {
      updates.clean_url = body.clean_url ?? body.cleanUrl;
    }
    if (body.notes !== undefined) updates.notes = body.notes;

    if (body.hr_contact !== undefined || body.hrContact !== undefined) {
      let hr = body.hr_contact ?? body.hrContact;
      if (typeof hr === 'string') {
        hr = { raw: hr, phone: hr };
      }
      updates.hr_contact = hr;
    }

    if (body.jd_content !== undefined || body.jdContent !== undefined) {
      const jdRaw = body.jd_content ?? body.jdContent ?? '';
      updates.jd_content = cleanAndFormatJd(jdRaw);
    }

    // 严格限制只能更新当前用户的记录
    let { data, error } = await client
      .from('applications')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error && (error.message?.includes('posted_at') || error.message?.includes('rating') || error.message?.includes('is_starred') || error.message?.includes('work_mode'))) {
      if (error.message?.includes('posted_at')) delete updates.posted_at;
      if (error.message?.includes('rating')) delete updates.rating;
      if (error.message?.includes('is_starred')) delete updates.is_starred;
      if (error.message?.includes('work_mode')) delete updates.work_mode;

      const retry = await client
        .from('applications')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
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
 * 删除指定属于当前用户的求职记录
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { user, client } = auth;
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

    const { error } = await client
      .from('applications')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

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
