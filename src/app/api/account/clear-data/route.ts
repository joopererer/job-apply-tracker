import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, unauthorizedResponse } from '@/lib/auth';

/**
 * POST /api/account/clear-data
 * 清空当前登录用户在 applications 表中的所有个人投递数据（保留账号本身）
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { user, client } = auth;

    // 清空当前用户的所有投递记录
    const { error } = await client
      .from('applications')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'All your applications data has been cleared.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to clear account data' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

