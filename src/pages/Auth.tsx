import { useState } from 'react';
import { auth, db } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { LogIn, Rocket, ShieldCheck } from 'lucide-react';
import { handleFirestoreError } from '../lib/firestoreUtils';
import { OperationType } from '../types';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if profile exists
      const docRef = doc(db, 'users', user.uid);
      let docSnap;
      try {
        docSnap = await getDoc(docRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${user.uid}`);
      }

      if (docSnap && !docSnap.exists()) {
        try {
          await setDoc(docRef, {
            uid: user.uid,
            name: user.displayName || 'User',
            email: user.email,
            role: 'customer',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          });
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
        }
      }
    } catch (err: any) {
      console.error(err);
      try {
        const errorDetail = JSON.parse(err.message);
        setError(`Access Denied: ${errorDetail.error}`);
      } catch {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 bg-zinc-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand/10 blur-3xl rounded-full -mr-48 -mt-48" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-200/20 blur-3xl rounded-full -ml-48 -mb-48" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full basra-card text-center relative z-10"
      >
        <div className="mb-8">
          <div className="w-16 h-16 bg-brand rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3 overflow-hidden">
             <Rocket className="w-8 h-8 text-zinc-900" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter italic text-zinc-900 uppercase">بصرة إكسبريس</h1>
          <p className="text-zinc-500 mt-2 font-medium">نسهل حياتك اليومية في البصرة، طلباً بعد الآخر.</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full btn-primary h-14"
          >
            {loading ? (
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                <ShieldCheck className="w-5 h-5" />
              </motion.div>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                تسجيل الدخول بواسطة جوجل
              </>
            )}
          </button>
          
          <div className="flex items-center gap-4 py-2">
            <div className="h-px bg-zinc-100 flex-1" />
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">آمن وموثوق</span>
            <div className="h-px bg-zinc-100 flex-1" />
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            بتسجيل الدخول، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بنا. سيُطلب التحقق من رقم الهاتف عند طلبك الأول.
          </p>
        </div>

        {error && (
          <div className="mt-4 p-4 text-sm text-red-500 bg-red-50 rounded-xl font-medium border border-red-100">
            {error}
          </div>
        )}
      </motion.div>
    </div>
  );
}
