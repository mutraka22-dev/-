import { useState, useEffect } from 'react';
import { collection, query, getDocs, limit } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Merchant, OperationType } from '../types';
import { motion } from 'motion/react';
import { Search, MapPin, Star, Clock, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { handleFirestoreError } from '../lib/firestoreUtils';

export default function FoodDelivery() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchMerchants = async () => {
      try {
        const q = query(collection(db, 'merchants'), limit(10));
        const snap = await getDocs(q);
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Merchant));
        setMerchants(data);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'merchants');
      } finally {
        setLoading(false);
      }
    };
    fetchMerchants();
  }, []);

  const categories = [
    { id: 'all', label: 'الكل' },
    { id: 'fast_food', label: 'وجبات سريعة' },
    { id: 'traditional', label: 'شعبي' },
    { id: 'grocery', label: 'بقالة' },
    { id: 'pharmacy', label: 'صيدلية' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase">المطاعم والسلع</h2>
          <div className="flex items-center gap-1 text-zinc-400 text-xs mt-1">
             <MapPin className="w-3 h-3 text-brand" />
             <span className="font-semibold">التوصيل إلى:</span>
             <span>البصرة، حي الجزائر</span>
          </div>
        </div>
        <div className="relative group flex-1 md:max-w-xs">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-brand transition-colors" />
          <input
            type="text"
            placeholder="ابحث عن مطعم أو صنف..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-zinc-100 rounded-2xl pr-12 pl-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/20 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={cn(
              "px-6 py-2 rounded-full text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border",
              cat.id === 'all' 
                ? "bg-zinc-900 text-white border-zinc-900" 
                : "bg-white text-zinc-500 border-zinc-100 hover:border-brand"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-48 bg-zinc-100 animate-pulse rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {merchants.length === 0 ? (
             <div className="col-span-full py-20 text-center space-y-4">
                <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto">
                   <Star className="w-10 h-10 text-zinc-300" />
                </div>
                <div className="max-w-xs mx-auto">
                  <h3 className="font-bold text-zinc-900">لم يتم العثور على متاجر</h3>
                  <p className="text-sm text-zinc-400">نحن بصدد إضافة المزيد من المتاجر في منطقتك. تحقق لاحقاً!</p>
                </div>
                <button className="btn-secondary h-12 inline-flex">استكشف الخدمات الأخرى</button>
             </div>
          ) : (
            merchants.map((m) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="basra-card group cursor-pointer overflow-hidden p-0"
              >
                <div className="relative h-40 overflow-hidden">
                  <img src={m.image || `https://picsum.photos/seed/${m.id}/400`} alt={m.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 shadow-sm">
                    <Star className="w-3 h-3 text-brand fill-current" /> {m.rating}
                  </div>
                  <div className="absolute bottom-4 right-4 bg-zinc-900 text-white px-2 py-1 rounded-lg text-[10px] font-black shadow-sm uppercase tracking-wider">
                    {m.category === 'fast_food' ? 'وجبات سريعة' : m.category === 'traditional' ? 'شعبي' : m.category === 'grocery' ? 'بقالة' : m.category === 'pharmacy' ? 'صيدلية' : 'آخر'}
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="font-black text-lg tracking-tighter uppercase italic text-right">{m.name}</h4>
                  <div className="flex items-center gap-3 text-zinc-400 text-xs mt-2 font-medium">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> 20-30 دقيقة</span>
                    <span className="w-1 h-1 bg-zinc-200 rounded-full" />
                    <span>توصيل مجاني</span>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
