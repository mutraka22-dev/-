import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Order, Merchant, OperationType } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Store, ShoppingBag, Clock, CheckCircle, RefreshCcw, AlertCircle } from 'lucide-react';
import { formatPrice, formatDate, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { handleFirestoreError } from '../lib/firestoreUtils';

export default function MerchantDashboard() {
  const { profile } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    // Find the merchant profile for this user
    const qMerchant = query(collection(db, 'merchants'), where('ownerId', '==', profile.uid));
    const unsubMerchant = onSnapshot(qMerchant, (snap) => {
       if (!snap.empty) {
         const mId = snap.docs[0].id;
         setMerchant({ id: mId, ...snap.docs[0].data() } as Merchant);
         
         // If merchant exists, listen to their orders
         const qOrders = query(collection(db, 'orders'), where('merchantId', '==', mId));
         const unsubOrders = onSnapshot(qOrders, (orderSnap) => {
            setOrders(orderSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order)));
            setLoading(false);
         }, (error) => {
            handleFirestoreError(error, OperationType.GET, 'orders');
         });
         return () => unsubOrders();
       } else {
         setLoading(false);
       }
    }, (error) => {
       handleFirestoreError(error, OperationType.GET, 'merchants');
    });

    return () => unsubMerchant();
  }, [profile]);

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

  if (!merchant && !loading) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto text-zinc-300">
           <Store className="w-10 h-10" />
        </div>
        <div>
          <h2 className="text-2xl font-black italic tracking-tighter uppercase">المتجر غير موجود</h2>
          <p className="text-zinc-500 mt-2">لم تقم بإعداد متجرك بعد. تواصل مع الإدارة لبدء التسجيل.</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-xl flex gap-3 text-blue-800 text-right">
           <AlertCircle className="w-5 h-5 shrink-0" />
           <p className="text-xs font-medium leading-relaxed">
             يجب على التجار في البصرة تقديم سجل تجاري صالح وتصاريح السلامة الغذائية قبل البدء في قبول الطلبات على بصرة إكسبريس.
           </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20 text-right">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
         <div>
            <h2 className="text-3xl font-black italic tracking-tighter uppercase">{merchant?.name || 'مركز المتجر'}</h2>
            <div className="flex items-center gap-2 mt-1">
               <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                 {merchant?.category === 'fast_food' ? 'وجبات سريعة' : merchant?.category === 'traditional' ? 'شعبي' : merchant?.category === 'grocery' ? 'بقالة' : merchant?.category === 'pharmacy' ? 'صيدلية' : 'آخر'} • البصرة، العراق
               </span>
            </div>
         </div>
         <div className="flex gap-2">
            <div className="basra-card py-2 px-4 flex flex-col items-center">
               <span className="text-[10px] font-bold text-zinc-400 uppercase">اليوم</span>
               <span className="font-black italic tracking-tighter text-left">182 ألف د.ع</span>
            </div>
            <div className="basra-card py-2 px-4 flex flex-col items-center">
               <span className="text-[10px] font-bold text-zinc-400 uppercase">الطلبات</span>
               <span className="font-black italic tracking-tighter">{orders.length}</span>
            </div>
         </div>
      </div>

      <section className="space-y-4">
         <div className="flex items-center justify-between px-2">
            <h3 className="font-bold text-xs uppercase tracking-widest text-zinc-500">طلبات مباشرة</h3>
            <button className="text-brand-dark p-2 hover:bg-brand/10 rounded-full transition-colors">
               <RefreshCcw className="w-4 h-4" />
            </button>
         </div>

         <div className="space-y-4">
            {orders.filter(o => o.status !== 'delivered').length === 0 ? (
              <div className="basra-card py-20 text-center text-zinc-400 border-dashed border-2">
                 لا توجد طلبات نشطة حالياً.
              </div>
            ) : (
              orders.filter(o => o.status !== 'delivered').map(order => (
                <motion.div key={order.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="basra-card bg-zinc-50/50 p-0 overflow-hidden text-right">
                   <div className="p-4 flex items-center justify-between border-b border-white">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-brand">
                            <ShoppingBag className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-[10px] font-black uppercase text-zinc-400">طلب #{order.id.slice(-6).toUpperCase()}</p>
                            <p className="font-bold text-sm italic">{formatDate(order.createdAt)}</p>
                         </div>
                      </div>
                      <span className={cn(
                        "text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider",
                        order.status === 'preparing' ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700"
                      )}>
                        {order.status === 'pending' ? 'بانتظار الموافقة' : order.status === 'preparing' ? 'قيد التحضير' : order.status}
                      </span>
                   </div>
                   
                   <div className="p-4 space-y-2">
                      {order.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                           <span className="text-zinc-600 font-medium">x{item.quantity} {item.name}</span>
                           <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                   </div>

                   <div className="p-4 flex gap-2 bg-white/50">
                      <button 
                        onClick={() => updateStatus(order.id, 'preparing')}
                        className="btn-secondary h-12 flex-1 text-xs"
                      >
                         قبول وتحضير
                      </button>
                      <button 
                         onClick={() => updateStatus(order.id, 'out_for_delivery')}
                         className="btn-primary h-12 flex-1 text-xs"
                      >
                         <CheckCircle className="w-4 h-4" /> جاهز للاستلام
                      </button>
                   </div>
                </motion.div>
              ))
            )}
         </div>
      </section>
    </div>
  );
}
