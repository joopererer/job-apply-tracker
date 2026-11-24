'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  CheckCircle2,
  KeyRound,
  Loader2,
  LogOut,
  ShieldAlert,
  Trash2,
  User,
  X,
  XCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n/I18nProvider';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string | null;
  onDataCleared: () => void;
}

export default function AccountSettingsModal({
  isOpen,
  onClose,
  userEmail,
  onDataCleared,
}: AccountSettingsModalProps) {
  const router = useRouter();
  const { t } = useI18n();

  // 1. 修改密码状态
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdMessage, setPwdMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 2. 清空数据状态
  const [clearConfirmText, setClearConfirmText] = useState('');
  const [clearLoading, setClearLoading] = useState(false);
  const [clearMessage, setClearMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // 3. 注销账号状态
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  // 获取当前用户的 Bearer Token
  const getAccessToken = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  // 修改密码处理
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMessage(null);

    if (!newPassword || newPassword.length < 6) {
      setPwdMessage({ type: 'error', text: t('account.pwdMinLength') });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPwdMessage({ type: 'error', text: t('account.pwdMismatch') });
      return;
    }

    setPwdLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      setPwdMessage({ type: 'success', text: t('account.pwdSuccess') });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwdMessage({ type: 'error', text: err.message || t('account.pwdFailed') });
    } finally {
      setPwdLoading(false);
    }
  };

  // 清空所有投递数据
  const handleClearData = async () => {
    setClearMessage(null);
    if (clearConfirmText.trim() !== 'CLEAR') {
      setClearMessage({ type: 'error', text: t('account.clearPrompt', { word: 'CLEAR' }) });
      return;
    }

    setClearLoading(true);
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/account/clear-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t('account.clearFailed'));
      }

      setClearMessage({ type: 'success', text: t('account.clearSuccess') });
      setClearConfirmText('');
      onDataCleared();
    } catch (err: any) {
      setClearMessage({ type: 'error', text: err.message || t('account.clearFailed') });
    } finally {
      setClearLoading(false);
    }
  };

  // 永久注销删除账号
  const handleDeleteAccount = async () => {
    setDeleteMessage(null);
    if (deleteConfirmText.trim() !== 'DELETE') {
      setDeleteMessage({ type: 'error', text: t('account.deletePrompt', { word: 'DELETE' }) });
      return;
    }

    setDeleteLoading(true);
    try {
      const token = await getAccessToken();
      const res = await fetch('/api/account', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t('account.deleteFailed'));
      }

      // 注销前端登录态并跳转
      await supabase.auth.signOut();
      router.replace('/login');
    } catch (err: any) {
      setDeleteMessage({ type: 'error', text: err.message || t('account.deleteFailed') });
      setDeleteLoading(false);
    }
  };

  // 退出登录
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.replace('/login');
    } catch {
      router.replace('/login');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90 sticky top-0 z-10 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 text-white font-bold">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">{t('account.title')}</h2>
              <p className="text-[11px] text-slate-400 font-medium truncate max-w-[240px]">
                {userEmail || t('account.currentLogin')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto text-xs">
          {/* 功能 1：修改密码 */}
          <section className="space-y-3 p-4 rounded-2xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-200 font-bold text-sm">
              <KeyRound className="w-4 h-4 text-blue-400" />
              <span>{t('account.changePassword')}</span>
            </div>

            {pwdMessage && (
              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  pwdMessage.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                    : 'bg-red-950/60 border-red-800 text-red-200'
                }`}
              >
                {pwdMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <XCircle className="w-4 h-4 shrink-0 text-red-400" />
                )}
                <span>{pwdMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-2.5">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t('account.newPwdLabel')}</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder={t('account.newPwdPlaceholder')}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t('account.confirmPwdLabel')}</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={t('account.confirmPwdPlaceholder')}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>

              <button
                type="submit"
                disabled={pwdLoading || !newPassword}
                className="py-1.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ml-auto"
              >
                {pwdLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{t('account.savingPwd')}</span>
                  </>
                ) : (
                  <span>{t('account.savePwd')}</span>
                )}
              </button>
            </form>
          </section>

          {/* 功能 2：清空个人投递数据 */}
          <section className="space-y-3 p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40">
            <div className="flex items-center gap-2 text-amber-200 font-bold text-sm">
              <Trash2 className="w-4 h-4 text-amber-400" />
              <span>{t('account.clearTitle')}</span>
            </div>
            <p className="text-[11px] text-slate-400">
              {t('account.clearDesc')}
            </p>

            {clearMessage && (
              <div
                className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                  clearMessage.type === 'success'
                    ? 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
                    : 'bg-red-950/60 border-red-800 text-red-200'
                }`}
              >
                <span>{clearMessage.text}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[11px] text-amber-300/80">
                {t('account.clearPrompt', { word: 'CLEAR' })}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={clearConfirmText}
                  onChange={(e) => setClearConfirmText(e.target.value)}
                  placeholder={t('account.clearPlaceholder')}
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-amber-700/60 rounded-xl text-amber-200 font-mono focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleClearData}
                  disabled={clearLoading || clearConfirmText.trim() !== 'CLEAR'}
                  className="py-1.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {clearLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{t('account.clearing')}</span>
                    </>
                  ) : (
                    <span>{t('account.clearBtn')}</span>
                  )}
                </button>
              </div>
            </div>
          </section>

          {/* 功能 3：永久注销账号 */}
          <section className="space-y-3 p-4 rounded-2xl bg-red-950/30 border border-red-800/60">
            <div className="flex items-center gap-2 text-red-200 font-bold text-sm">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              <span>{t('account.deleteTitle')}</span>
            </div>
            <p className="text-[11px] text-red-300/80">
              {t('account.deleteWarning')}
            </p>

            {deleteMessage && (
              <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-800 text-red-200 text-xs">
                <span>{deleteMessage.text}</span>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-[11px] text-red-300/80">
                {t('account.deletePrompt', { word: 'DELETE' })}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder={t('account.deletePlaceholder')}
                  className="flex-1 px-3 py-1.5 bg-slate-950 border border-red-700/80 rounded-xl text-red-200 font-mono focus:outline-none focus:border-red-400"
                />
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteLoading || deleteConfirmText.trim() !== 'DELETE'}
                  className="py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {deleteLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{t('account.deleting')}</span>
                    </>
                  ) : (
                    <span>{t('account.deleteBtn')}</span>
                  )}
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-900/90">
          <button
            type="button"
            onClick={handleSignOut}
            className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition flex items-center gap-1.5 font-bold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400" />
            <span>{t('account.logout')}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="py-1.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition cursor-pointer"
          >
            {t('common.done')}
          </button>
        </div>
      </div>
    </div>
  );
}

