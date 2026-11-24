import { NextRequest, NextResponse } from 'next/server';
import { User, createClient, SupabaseClient } from '@supabase/supabase-js';
import { supabase, supabaseUrl, supabaseKey } from './supabase';

export interface AuthContext {
  user: User;
  token: string;
  client: SupabaseClient;
}

/**
 * 从请求中提取 Token 并校验当前登录用户
 * 支持：
 * 1. Authorization: Bearer <access_token> (Chrome 插件 / 外部 API 调用)
 * 2. Supabase Auth Cookie (Web 浏览器端调用)
 */
export async function authenticateRequest(request: NextRequest): Promise<AuthContext | null> {
  let token: string | null = null;

  // 1. 优先从 Authorization 头读取 Bearer Token
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
    token = authHeader.slice(7).trim();
  }

  // 2. 若无 Authorization 头，尝试从 Cookie 中解析 Supabase Session
  if (!token) {
    const directCookie =
      request.cookies.get('sb-access-token')?.value ||
      request.cookies.get('sb-token')?.value;

    if (directCookie) {
      token = directCookie;
    } else {
      // 遍历所有可能的 Supabase 项目 Auth Cookie (形如 sb-xxx-auth-token)
      for (const cookie of request.cookies.getAll()) {
        if (cookie.name.startsWith('sb-') && cookie.name.endsWith('-auth-token')) {
          try {
            const parsed = JSON.parse(cookie.value);
            if (Array.isArray(parsed) && parsed[0]) {
              token = parsed[0];
            } else if (parsed && typeof parsed === 'object' && parsed.access_token) {
              token = parsed.access_token;
            }
          } catch {
            token = cookie.value;
          }
          if (token) break;
        }
      }
    }
  }

  if (!token) {
    return null;
  }

  try {
    // 3. 调用 Supabase 验证 Token 有效性与用户身份
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      return null;
    }

    // 4. 创建带该用户 Token 上下文的 Scoped Client (自动遵循 RLS: auth.uid() = user.id)
    const client = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    return {
      user: data.user,
      token,
      client,
    };
  } catch {
    return null;
  }
}

/**
 * 统一未授权 401 响应
 */
export function unauthorizedResponse(message = 'UNAUTHORIZED') {
  return NextResponse.json(
    { error: message },
    {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Bearer error="invalid_token"',
      },
    }
  );
}

/**
 * 获取拥有最高特权的 Admin Supabase Client (仅用于服务端注销删除账号等敏感操作)
 */
export function getAdminClient(): SupabaseClient {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY in environment variables');
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

