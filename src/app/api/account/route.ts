import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, unauthorizedResponse, getAdminClient } from '@/lib/auth';

/**
 * DELETE /api/account
 * 彻底注销删除当前用户账号：
 * 1. 先清空当前用户的投递数据
 * 2. 再使用 SUPABASE_SERVICE_ROLE_KEY 初始化 Admin 客户端调用 auth.admin.deleteUser(user.id) 永久注销
 */
export async function DELETE(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return unauthorizedResponse();
    }

    const { user, client } = auth;

    // 1. 清空当前用户所有的投递记录
    const { error: dataError } = await client
      .from('applications')
      .delete()
      .eq('user_id', user.id);

    if (dataError) {
      return NextResponse.json(
        { error: `Failed to delete user data: ${dataError.message}` },
        { status: 500 }
      );
    }

    // 2. 调用 Admin 接口永久删除 Supabase Auth 中的账号
    try {
      const adminClient = getAdminClient();
      const { error: authError } = await adminClient.auth.admin.deleteUser(user.id);
      if (authError) {
        return NextResponse.json(
          { error: `Failed to delete user account: ${authError.message}` },
          { status: 500 }
        );
      }
    } catch (adminErr: any) {
      return NextResponse.json(
        { error: adminErr?.message || 'Admin credentials not configured' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Account and associated data deleted successfully.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Failed to delete account' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

