import { motion } from 'motion/react';
import { Utensils, Package, ShoppingCart, ArrowRight, Star, Clock, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const services = [
    {
      id: 'food',
      title: 'توصيل الطعام',
      desc: 'أفضل المطاعم المحلية لباب بيتك',
      icon: Utensils,
      color: 'bg-orange-500',
      path: '/food'
    },
    {
      id: 'parcel',
      title: 'اللوجستيات',
      desc: 'خدمة مندوب موثوقة للأفراد والشركات',
      icon: Package,
      color: 'bg-brand',
      path: '/parcel'
    },
    {
      id: 'courier',
      title: 'اشتري لي',
      desc: 'دعنا نتسوق لاحتياجاتك ونوصلها',
      icon: ShoppingCart,
      color: 'bg-zinc-900',
      path: '/courier'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Promo Banner */}
      <section className="relative h-48 md:h-64 rounded-3xl overflow-hidden bg-brand p-8 flex flex-col justify-center">
        <div className="relative z-10 max-w-sm">
          <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter leading-tight">
            خصم 50% على <br /> أول طلب لك
          </h2>
          <p className="text-zinc-900 font-bold text-xs mt-2 uppercase tracking-widest opacity-80">استخدم الكود: BASRA50</p>
          <button className="mt-4 bg-zinc-900 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase flex items-center gap-2 hover:px-6 transition-all">
            اطلب الآن <ArrowRight className="w-3 h-3 rotate-180" />
          </button>
        </div>
        <div className="absolute left-0 bottom-0 opacity-20 transform translate-y-4 -translate-x-4">
          <Truck className="w-64 h-64 text-zinc-900" />
        </div>
      </section>

      {/* Services Grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-zinc-500 uppercase tracking-widest text-[10px]">ماذا تحتاج اليوم؟</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {services.map((service, idx) => (
            <motion.button
              key={service.id}
              whileHover={{ y: -4 }}
              onClick={() => navigate(service.path)}
              className="basra-card flex flex-col items-start text-right p-6 group h-full"
            >
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform", service.color)}>
                <service.icon className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-lg font-black italic tracking-tighter uppercase">{service.title}</h4>
              <p className="text-zinc-400 text-sm mt-1">{service.desc}</p>
              <div className="mt-auto pt-6 flex items-center gap-1 text-[10px] font-black uppercase text-brand-dark group-hover:gap-2 transition-all">
                استكشف <ArrowRight className="w-3 h-3 rotate-180" />
              </div>
            </motion.button>
          ))}
        </div>
      </section>

      {/* Recommended for you */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-zinc-900 text-lg tracking-tighter">المفضلات القريبة</h3>
          <button className="text-brand-dark font-bold text-xs uppercase underline">عرض الكل</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div key={i} className="basra-card flex gap-4 overflow-hidden group cursor-pointer">
               <div className="w-24 h-24 bg-zinc-100 rounded-xl overflow-hidden shrink-0">
                  <img src={`https://picsum.photos/seed/restaurant${i}/200`} alt="restaurant" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
               </div>
               <div className="flex-1 py-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-md">شواية البصرة وأكثر</h4>
                    <span className="flex items-center gap-1 text-xs font-bold text-orange-500">
                      <Star className="w-3 h-3 fill-current" /> 4.8
                    </span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-1">شعبي • $$$ • 25-35 دقيقة</p>
                  <div className="mt-4 flex items-center gap-3">
                    <span className="text-[10px] font-bold bg-zinc-50 px-2 py-1 rounded text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 5.2 كم
                    </span>
                    <span className="text-[10px] font-bold bg-green-50 text-green-600 px-2 py-1 rounded">
                      توصيل مجاني
                    </span>
                  </div>
               </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

import { Truck } from 'lucide-react';
import { cn } from '../lib/utils';
