import { APIProvider, Map, AdvancedMarker, Pin, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { useEffect, useState, type ReactNode } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Truck, MapPin } from 'lucide-react';
import { handleFirestoreError } from '../lib/firestoreUtils';
import { OperationType } from '../types';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

export function MapProvider({ children }: { children: ReactNode }) {
  if (!hasValidKey) {
    return (
      <div className="flex items-center justify-center h-64 bg-zinc-100 rounded-3xl p-6 text-center">
         <div className="max-w-xs space-y-3">
             <div className="w-12 h-12 bg-zinc-200 rounded-2xl flex items-center justify-center mx-auto text-zinc-400">
                <MapPin className="w-6 h-6" />
             </div>
             <h3 className="font-bold text-zinc-900 uppercase italic tracking-tighter">مفتاح Google Maps API مطلوب</h3>
             <p className="text-xs text-zinc-400 font-medium">لتفعيل التتبع المباشر، يرجى إضافة <code>GOOGLE_MAPS_PLATFORM_KEY</code> إلى الإعدادات الخاصة بك.</p>
         </div>
      </div>
    );
  }

  return (
    <APIProvider apiKey={API_KEY} version="weekly">
      {children}
    </APIProvider>
  );
}

export function DriverTracker({ driverId, orderId }: { driverId?: string, orderId?: string }) {
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);

  useEffect(() => {
    if (!driverId) return;

    const unsub = onSnapshot(doc(db, 'tracking', driverId), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setLocation(data.location);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, `tracking/${driverId}`);
    });

    return () => unsub();
  }, [driverId]);

  if (!location) return null;

  return (
    <div className="h-64 rounded-3xl overflow-hidden shadow-inner border border-zinc-100">
      <Map
        defaultCenter={location}
        defaultZoom={15}
        mapId="BASRA_EXPRESS_MAP"
        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
        style={{ width: '100%', height: '100%' }}
        disableDefaultUI
      >
        <AdvancedMarker position={location}>
           <div className="bg-brand text-zinc-900 p-2 rounded-full shadow-lg border-2 border-white">
              <Truck className="w-4 h-4" />
           </div>
        </AdvancedMarker>
      </Map>
    </div>
  );
}
