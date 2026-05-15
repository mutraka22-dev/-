import { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Camera, HelpCircle, Send, ArrowRight, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { handleFirestoreError } from '../lib/firestoreUtils';
import { OperationType } from '../types';

export default function CourierService() {
  const { profile } = useAuth();
  const [request, setRequest] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!request) return;
    setLoading(true);
    try {
      if (!profile) return;
      await addDoc(collection(db, 'orders'), {
        customerId: profile.uid,
        type: 'buy_for_me',
        status: 'pending',
        buyForMeRequest: request,
        pickupLocation: { lat: 0, lng: 0, address: 'Pending market finder' },
        deliveryLocation: { lat: 30.5081, lng: 47.7835, address: 'Current Location' },
        totalPrice: 0, // Dynamic pricing
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setSuccess(true);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'orders');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center py-20 px-6 space-y-6">
        <div className="w-20 h-20 bg-brand rounded-full flex items-center justify-center mx-auto text-zinc-900 shadow-xl">
           <Send className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-black italic tracking-tighter uppercase">تم إرسال الطلب!</h2>
        <p className="text-zinc-500 max-w-xs mx-auto">نبحث الآن عن سائق للتسوق بالنيابة عنك. ستتلقى عرض سعر قريباً.</p>
        <button className="btn-primary w-full max-w-xs" onClick={() => window.location.href = '/'}>العودة للرئيسية</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-right">
        <h2 className="text-3xl font-black italic tracking-tighter uppercase">اشتري لي</h2>
        <p className="text-zinc-400 text-sm mt-1">هل تحتاج شيئاً من المتجر؟ أخبرنا وسنقوم بإحضاره لك.</p>
      </div>

      <div className="basra-card p-6 space-y-6 text-right">
        <div className="space-y-4">
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block">صف طلبك</label>
          <textarea
            placeholder="مثلاً: علبتين بنادول من صيدلية الرازي، و 1 كغم تمر خستاوي من السوق."
            rows={5}
            value={request}
            onChange={(e) => setRequest(e.target.value)}
            className="w-full bg-zinc-50 border-none rounded-2xl p-6 text-sm focus:ring-2 focus:ring-brand/20 resize-none font-medium leading-relaxed"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
           <button className="btn-secondary h-14 border border-zinc-100 flex flex-col items-center justify-center py-8">
              <Camera className="w-6 h-6 mb-2" />
              <span className="text-[10px] font-bold uppercase">إضافة صورة</span>
           </button>
           <button className="btn-secondary h-14 border border-zinc-100 flex flex-col items-center justify-center py-8">
              <ShoppingBag className="w-6 h-6 mb-2" />
              <span className="text-[10px] font-bold uppercase">قائمة تسوق</span>
           </button>
        </div>

        <div className="flex gap-3 items-start p-4 bg-zinc-50 rounded-2xl">
           <HelpCircle className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
           <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">كيف تعمل الخدمة؟</p>
              <p className="text-xs text-zinc-500 mt-1 leading-relaxed">
                سيقوم سائقونا بزيارة المتجر، والتحقق من تكاليف الأصناف، وإرسال رابط لك للموافقة على السعر النهائي + رسوم التوصيل.
              </p>
           </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={!request || loading}
          className="btn-primary w-full h-16 text-lg"
        >
          {loading ? 'جاري الإرسال...' : 'إرسال الطلب'} <ArrowRight className="w-6 h-6 mr-2 rotate-180" />
        </button>
      </div>
    </div>
  );
}
