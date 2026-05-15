import { useState } from 'react';
import { motion } from 'motion/react';
import { Package, MapPin, Hash, ShieldCheck, ArrowRight, Info } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { cn } from '../lib/utils';
import { handleFirestoreError } from '../lib/firestoreUtils';
import { OperationType } from '../types';

export default function ParcelDelivery() {
  const { profile } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    description: '',
    size: 'small',
    pickup: 'Al-Hakimiya, Street 14',
    delivery: 'Al-Abullah, Commercial Area',
    weight: '0-5kg'
  });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (!profile) return;
      await addDoc(collection(db, 'orders'), {
        customerId: profile.uid,
        type: 'parcel',
        status: 'pending',
        parcelInfo: {
          description: formData.description,
          size: formData.size,
          weight: formData.weight
        },
        pickupLocation: { lat: 30.5081, lng: 47.7835, address: formData.pickup },
        deliveryLocation: { lat: 30.5342, lng: 47.8214, address: formData.delivery },
        totalPrice: 5000,
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
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-green-100 flex items-center justify-center rounded-full text-green-600">
           <ShieldCheck className="w-10 h-10" />
        </div>
        <div className="max-w-xs">
          <h2 className="text-2xl font-black italic tracking-tighter uppercase">تم حجز المندوب!</h2>
          <p className="text-zinc-500 mt-2">سيصل السائق إلى <strong>{formData.pickup}</strong> خلال 15 دقيقة.</p>
        </div>
        <button 
          onClick={() => window.location.href = '/'}
          className="btn-primary w-full max-w-xs"
        >
          عرض طلباتي
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-black italic tracking-tighter uppercase">إرسال طرد</h2>
        <p className="text-zinc-400 text-sm mt-1">خدمة توصيل موثوقة من الباب إلى الباب في البصرة.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className={cn("h-1 rounded-full", step >= 1 ? "bg-brand" : "bg-zinc-100")} />
        <div className={cn("h-1 rounded-full", step >= 2 ? "bg-brand" : "bg-zinc-100")} />
      </div>

      <div className="basra-card p-6 space-y-6 text-right">
        {step === 1 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="space-y-4 text-right">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">تفاصيل الطرد</label>
              <div className="relative">
                <Package className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  type="text" 
                  placeholder="ماذا سترسل؟ (مثلاً: وثائق، صندوق)"
                  className="w-full bg-zinc-50 border-none rounded-2xl pr-12 pl-4 py-4 text-sm focus:ring-2 focus:ring-brand/20"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block text-right">فئة الحجم</label>
              <div className="grid grid-cols-3 gap-3">
                {['small', 'medium', 'large'].map((s) => (
                  <button
                    key={s}
                    onClick={() => setFormData({...formData, size: s as any})}
                    className={cn(
                      "p-4 rounded-xl border flex flex-col items-center gap-2 transition-all",
                      formData.size === s ? "bg-brand/10 border-brand" : "bg-white border-zinc-100 text-zinc-400"
                    )}
                  >
                    <Package className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase">{s === 'small' ? 'صغير' : s === 'medium' ? 'متوسط' : 'كبير'}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-yellow-50 rounded-xl flex gap-3 text-yellow-800">
               <Info className="w-5 h-5 shrink-0" />
               <p className="text-xs font-medium leading-relaxed">
                 يجب أن تكون جميع الطرود ملفوفة بإحكام. المواد الخطرة أو المحظورة ممنوعة تماماً وسيتم التبليغ عنها.
               </p>
            </div>

            <button 
              onClick={() => setStep(2)}
              disabled={!formData.description}
              className="btn-primary w-full h-14"
            >
              التالي: الموقع والسعر <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 text-right">
            <div className="space-y-4">
              <div className="relative pr-8 border-r-2 border-dashed border-zinc-200 space-y-8">
                <div className="relative">
                   <div className="absolute -right-10 top-0 w-4 h-4 rounded-full bg-brand p-1 cursor-default">
                      <div className="w-full h-full bg-white rounded-full" />
                   </div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">نقطة الاستلام</label>
                   <input 
                      type="text" 
                      value={formData.pickup}
                      onChange={(e) => setFormData({...formData, pickup: e.target.value})}
                      className="w-full bg-zinc-50 border-none rounded-xl px-4 py-2 text-sm font-medium"
                   />
                </div>
                <div className="relative">
                   <div className="absolute -right-10 bottom-0 w-4 h-4 rounded-full bg-zinc-900 p-1 cursor-default">
                      <div className="w-full h-full bg-white rounded-full" />
                   </div>
                   <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-2">وجهة التوصيل</label>
                   <input 
                      type="text" 
                      value={formData.delivery}
                      onChange={(e) => setFormData({...formData, delivery: e.target.value})}
                      className="w-full bg-zinc-50 border-none rounded-xl px-4 py-2 text-sm font-medium"
                   />
                </div>
              </div>
            </div>

            <div className="p-4 bg-zinc-50 rounded-2xl flex items-center justify-between border border-dashed border-zinc-200">
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">رسوم التوصيل المقدرة</p>
                  <p className="text-xl font-black italic tracking-tighter">5,000 د.ع</p>
               </div>
               <div className="text-left">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">الوصول المتوقع</p>
                  <p className="text-md font-bold text-brand-dark">15-20 دقيقة</p>
               </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary h-14 flex-1">رجوع</button>
              <button 
                onClick={handleSubmit} 
                disabled={loading}
                className="btn-primary h-14 flex-[2]"
              >
                {loading ? 'جاري الحجز...' : 'تأكيد الطلب'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
