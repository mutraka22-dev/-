import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, OperationType } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth';
import { Truck, MapPin, Package, CheckCircle, Navigation, Phone } from 'lucide-react';
import { cn, formatPrice, formatDate } from '../lib/utils';
import { handleFirestoreError } from '../lib/firestoreUtils';

export default function DriverDashboard() {
  const { profile } = useAuth();
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    // Listen to orders assigned to this driver
    const q1 = query(collection(db, 'orders'), where('driverId', '==', profile.uid));
    const unsub1 = onSnapshot(q1, (snap) => {
      setActiveOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'orders');
    });

    // Listen to available orders
    const q2 = query(collection(db, 'orders'), where('status', '==', 'pending'));
    const unsub2 = onSnapshot(q2, (snap) => {
      setAvailableOrders(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'orders');
    });

    return () => { unsub1(); unsub2(); };
  }, [profile]);

  const acceptOrder = async (orderId: string) => {
    if (!profile) return;
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        driverId: profile.uid,
        status: 'accepted',
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  const updateStatus = async (orderId: string, status: Order['status']) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), {
        status,
        updatedAt: new Date().toISOString()
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `orders/${orderId}`);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
         <div className="text-right">
            <h2 className="text-3xl font-black italic tracking-tighter uppercase">مركز السائق</h2>
            <div className="flex items-center gap-2 mt-1">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">نشط ومتصل</span>
            </div>
         </div>
         <div className="bg-brand text-zinc-900 px-4 py-2 rounded-xl text-xs font-bold shadow-sm">
            الأرباح: 24,500 د.ع
         </div>
      </div>

      {activeOrders.length > 0 && (
        <section className="space-y-4">
           <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-500 text-right">التوصيلات النشطة</h3>
           {activeOrders.map(order => (
             <div key={order.id} className="basra-card border-brand border-2 text-right">
                <div className="flex items-center justify-between mb-4">
                   <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-brand" />
                      <span className="font-black italic uppercase tracking-tighter">طلب {order.type === 'food' ? 'طعام' : order.type === 'parcel' ? 'طرد' : 'شراء'}</span>
                   </div>
                   <span className="text-[10px] font-black bg-zinc-100 px-2 py-1 rounded uppercase">
                     {order.status === 'accepted' ? 'تم القبول' : order.status === 'out_for_delivery' ? 'في الطريق' : order.status}
                   </span>
                </div>

                <div className="space-y-4 mb-6">
                   <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-4 h-4 rounded-full border-2 border-brand" />
                        <div className="flex-1 w-0.5 bg-zinc-100 my-1" />
                        <div className="w-4 h-4 rounded-full bg-zinc-900" />
                      </div>
                      <div className="flex-1 space-y-6">
                        <div>
                           <p className="text-[10px] font-bold text-zinc-400 uppercase">الاستلام</p>
                           <p className="text-sm font-semibold">{order.pickupLocation.address}</p>
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-zinc-400 uppercase">التوصيل</p>
                           <p className="text-sm font-semibold">{order.deliveryLocation.address}</p>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                   <button 
                     onClick={() => updateStatus(order.id, 'out_for_delivery')}
                     className={cn("btn-secondary h-12 text-xs", order.status === 'out_for_delivery' && "bg-brand text-zinc-900")}
                   >
                     <Navigation className="w-4 h-4" /> تتبع للاستلام
                   </button>
                   <button 
                     onClick={() => updateStatus(order.id, 'delivered')}
                     className="btn-primary h-12 text-xs !bg-green-500 !text-white"
                   >
                     <CheckCircle className="w-4 h-4" /> تم التوصيل
                   </button>
                </div>
             </div>
           ))}
        </section>
      )}

      <section className="space-y-4">
         <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-500 text-right">الطلبات المتاحة حالياً</h3>
         <AnimatePresence>
           {availableOrders.length === 0 ? (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="basra-card text-center py-10 text-zinc-400">
                جاري البحث عن طلبات قريبة...
             </motion.div>
           ) : (
             availableOrders.map(order => (
               <motion.div
                 key={order.id}
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 className="basra-card flex items-center justify-between gap-4 text-right"
               >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400">
                       {order.type === 'food' ? <ShoppingCart className="w-6 h-6" /> : <Package className="w-6 h-6" />}
                    </div>
                    <div>
                       <h4 className="font-bold text-sm uppercase tracking-tighter italic">طلب {order.type === 'food' ? 'طعام' : 'طرد'}</h4>
                       <p className="text-xs text-zinc-400">{order.pickupLocation.address.split(',')[0]} ← {order.deliveryLocation.address.split(',')[0]}</p>
                    </div>
                  </div>
                  <div className="text-left flex flex-col items-end gap-2 text-left">
                    <span className="font-black italic text-brand-dark">{formatPrice(order.totalPrice)}</span>
                    <button 
                      onClick={() => acceptOrder(order.id)}
                      className="bg-zinc-900 text-white px-4 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-brand hover:text-zinc-900 transition-colors"
                    >
                      قبول الطلب
                    </button>
                  </div>
               </motion.div>
             ))
           )}
         </AnimatePresence>
      </section>
    </div>
  );
}
import { ShoppingCart } from 'lucide-react';
