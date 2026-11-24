import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { refresh_token } = body;

    if (!refresh_token) {
      return NextResponse.json(
        { error: 'Missing refresh_token' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token,
    });

    if (error || !data.session) {
      return NextResponse.json(
        { error: error?.message || 'Failed to refresh session' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      session: data.session,
      user: data.user,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Token refresh failed' },
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

