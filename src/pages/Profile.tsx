import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LogOut, User, Phone, Mail, Shield, UserCog } from 'lucide-react';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Role } from '../types';

export default function Profile() {
  const { profile, signOut } = useAuth();
  const [updating, setUpdating] = useState(false);

  const changeRole = async (newRole: Role) => {
    if (!profile) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, 'users', profile.uid), {
        role: newRole,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div className="text-center">
        <div className="w-24 h-24 bg-brand rounded-3xl mx-auto mb-4 flex items-center justify-center text-4xl font-black text-zinc-900 shadow-xl rotate-3">
          {profile?.name?.[0].toUpperCase() || 'م'}
        </div>
        <h2 className="text-2xl font-black tracking-tighter uppercase italic">{profile?.name || 'اسم المستخدم'}</h2>
        <p className="text-zinc-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-1">{profile?.role === 'driver' ? 'سائق' : profile?.role === 'merchant' ? 'تاجر' : 'عميل'}</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-500 px-4">معلومات الحساب</h3>
        <div className="basra-card p-0 divide-y divide-zinc-50">
          <div className="p-4 flex items-center gap-4">
            <Mail className="w-5 h-5 text-zinc-400" />
            <div className="flex-1">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">البريد الإلكتروني</p>
              <p className="text-sm font-medium">{profile?.email || 'غير متوفر'}</p>
            </div>
          </div>
          <div className="p-4 flex items-center gap-4">
            <Phone className="w-5 h-5 text-zinc-400" />
            <div className="flex-1">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">رقم الهاتف</p>
              <p className="text-sm font-medium">{profile?.phone || 'غير متوفر'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Switcher for Demo */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 px-4">
          <UserCog className="w-4 h-4 text-brand-dark" />
          <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-500">تغيير الرتبة (للعرض)</h3>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {(['customer', 'driver', 'merchant'] as Role[]).map((r) => (
            <button
              key={r}
              onClick={() => changeRole(r)}
              disabled={updating || profile?.role === r}
              className={cn(
                "py-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border",
                profile?.role === r 
                  ? "bg-brand border-brand text-zinc-900 shadow-sm" 
                  : "bg-white border-zinc-100 text-zinc-400 hover:border-brand/50"
              )}
            >
              {r === 'customer' ? 'عميل' : r === 'driver' ? 'سائق' : 'تاجر'}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-8">
        <button
          onClick={() => signOut()}
          className="w-full btn-secondary h-14 border border-zinc-200"
        >
          <LogOut className="w-5 h-5" />
          تسجيل الخروج
        </button>
      </div>

      <div className="text-center py-8">
        <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.3em]">بصرة إكسبريس v1.0.0</p>
        <p className="text-[10px] font-bold text-zinc-300 uppercase tracking-[0.3em] mt-1">شركة سومر للخدمات اللوجستية</p>
      </div>
    </div>
  );
}

import { cn } from '../lib/utils';
