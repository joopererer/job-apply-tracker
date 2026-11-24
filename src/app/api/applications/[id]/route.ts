import { NextRequest, NextResponse } from 'next/server';
import { normalizeCompany, normalizeTitle, cleanAndFormatJd } from '@/lib/scraper';
import { authenticateRequest, unauthorizedResponse } from '@/lib/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/applications/[id]
 * 获取单个属于当前用户的职位投递记录
 */
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Missing application id' }, { status: 400 });
    }

    const { data, error } = await auth.client
      .from('applications')
      .select('*')
      .eq('id', id)
      .eq('user_id', auth.user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    return NextResponse.json({ application: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/applications/[id]
 * 更新指定属于当前用户的职位记录字段
 */
export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Missing application id' }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
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

    if (body.status !== undefined) updates.status = body.status;
    if (body.rating !== undefined) updates.rating = body.rating;
    if (body.is_starred !== undefined || body.isStarred !== undefined) {
      updates.is_starred = body.is_starred ?? body.isStarred;
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

    let { data, error } = await auth.client
      .from('applications')
      .update(updates)
      .eq('id', id)
      .eq('user_id', auth.user.id)
      .select()
      .single();

    if (error && (error.message?.includes('posted_at') || error.message?.includes('rating') || error.message?.includes('is_starred') || error.message?.includes('work_mode'))) {
      if (error.message?.includes('posted_at')) delete updates.posted_at;
      if (error.message?.includes('rating')) delete updates.rating;
      if (error.message?.includes('is_starred')) delete updates.is_starred;
      if (error.message?.includes('work_mode')) delete updates.work_mode;

      const retry = await auth.client
        .from('applications')
        .update(updates)
        .eq('id', id)
        .eq('user_id', auth.user.id)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ application: data });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to update application' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/applications/[id]
 * 删除指定属于当前用户的职位记录
 */
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Missing application id' }, { status: 400 });
    }

    const { error } = await auth.client
      .from('applications')
      .delete()
      .eq('id', id)
      .eq('user_id', auth.user.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, deletedId: id });
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
