'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Lock,
  Mail,
  Loader2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useI18n, LanguageSwitcher } from '@/lib/i18n/I18nProvider';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/';
  const { t } = useI18n();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  // 若已登录，自动跳转到目标页
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace(redirectTo);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          router.replace(redirectTo);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setInfoMsg(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMsg(t('login.emailPasswordRequired'));
      return;
    }

    if (password.length < 6) {
      setErrorMsg(t('login.pwdMinLength'));
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        // 注册
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
        });

        if (error) {
          throw error;
        }

        if (data.session) {
          // 注册成功并自动登录
          router.replace(redirectTo);
        } else {
          // 需要邮箱确认
          setInfoMsg(t('login.regSuccessEmailConfirm'));
          setIsRegister(false);
        }
      } else {
        // 登录
        const { error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password,
        });

        if (error) {
          throw error;
        }

        router.replace(redirectTo);
      }
    } catch (err: any) {
      setErrorMsg(err.message || t('login.opFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}${redirectTo}` : undefined,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err.message || t('login.googleFailed'));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* 顶部右上角语言切换 */}
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>

      {/* 背景柔光装饰 */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 backdrop-blur-md space-y-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Logo 与标题 */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 mx-auto flex items-center justify-center shadow-lg shadow-blue-500/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            {t('login.title')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {isRegister ? t('login.subtitleRegister') : t('login.subtitleLogin')}
          </p>
        </div>

        {/* 提示信息 */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-start gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {infoMsg && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-200 text-xs flex items-start gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{infoMsg}</span>
          </div>
        )}

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              {t('login.emailLabel')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Mail className="w-4 h-4 text-slate-500" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-300">
              {t('login.passwordLabel')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Lock className="w-4 h-4 text-slate-500" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-98 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{t('login.processing')}</span>
              </>
            ) : (
              <>
                <span>{isRegister ? t('login.submitRegister') : t('login.submitLogin')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 分割线 */}
        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-800 w-full" />
          <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase font-semibold">
            {t('login.or')}
          </span>
        </div>

        {/* Google 快捷登录 */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          className="w-full py-2.5 px-3 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700/80 text-xs sm:text-sm font-semibold text-slate-200 flex items-center justify-center gap-2 transition active:scale-98"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>{t('login.googleLogin')}</span>
        </button>

        {/* 切换登录/注册模式 */}
        <div className="text-center text-xs text-slate-400">
          {isRegister ? (
            <span>
              {t('login.haveAccount')}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setErrorMsg(null);
                  setInfoMsg(null);
                }}
                className="text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer"
              >
                {t('login.loginDirectly')}
              </button>
            </span>
          ) : (
            <span>
              {t('login.noAccount')}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setErrorMsg(null);
                  setInfoMsg(null);
                }}
                className="text-blue-400 hover:text-blue-300 font-bold underline cursor-pointer"
              >
                {t('login.registerFree')}
              </button>
            </span>
          )}
        </div>

        {/* 底部安全说明 */}
        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>{t('login.rlsNotice')}</span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

