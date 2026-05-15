import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Package, Truck, User, MapPin, Store, LayoutDashboard, LogIn } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { cn } from './lib/utils';
import { useState } from 'react';

// Pages - placeholder imports
import Home from './pages/Home';
import FoodDelivery from './pages/FoodDelivery';
import ParcelDelivery from './pages/ParcelDelivery';
import CourierService from './pages/CourierService';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import DriverDashboard from './pages/DriverDashboard';
import MerchantDashboard from './pages/MerchantDashboard';

export default function App() {
  const { user, profile, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-zinc-50">
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <AnimatePresence mode="wait">
        <Routes location={location}>
          {!user ? (
            <Route path="*" element={<Auth />} />
          ) : (
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/food" element={<FoodDelivery />} />
              <Route path="/parcel" element={<ParcelDelivery />} />
              <Route path="/courier" element={<CourierService />} />
              <Route path="/profile" element={<Profile />} />
              {profile?.role === 'driver' && <Route path="/driver" element={<DriverDashboard />} />}
              {profile?.role === 'merchant' && <Route path="/merchant" element={<MerchantDashboard />} />}
            </Route>
          )}
        </Routes>
      </AnimatePresence>
    </div>
  );
}

function MainLayout() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'الرئيسية', icon: ShoppingBag, path: '/' },
    { label: 'الطلبات', icon: Package, path: '/parcel' },
    { label: 'تتبع', icon: MapPin, path: '/courier' },
    { label: 'الملف الشخصي', icon: User, path: '/profile' },
  ];

  // Adjust nav items based on role
  if (profile?.role === 'driver') {
    navItems.splice(1, 2, { label: 'السائق', icon: Truck, path: '/driver' });
  } else if (profile?.role === 'merchant') {
    navItems.splice(1, 2, { label: 'المتجر', icon: Store, path: '/merchant' });
  }

  return (
    <div className="flex-1 flex flex-col mb-20 md:mb-0 md:pr-64">
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-50 glass px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold italic tracking-tighter text-brand-dark">بصرة إكسبريس</h1>
        <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center">
          <User className="w-4 h-4 text-brand-dark" />
        </div>
      </header>

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 fixed inset-y-0 right-0 bg-white border-l border-zinc-100 p-6">
        <div className="mb-12">
          <h1 className="text-2xl font-black italic tracking-tighter text-brand-dark">بصرة إكسبريس</h1>
          <p className="text-xs text-zinc-400 font-medium tracking-widest uppercase mt-2">التطبيق الشامل</p>
        </div>

        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all",
                location.pathname === item.path 
                  ? "bg-brand text-zinc-900 shadow-sm" 
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-4 bg-zinc-50 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-sm font-bold">
            {profile?.name?.[0].toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm truncate">{profile?.name || 'مستخدم'}</p>
            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">{profile?.role === 'driver' ? 'سائق' : profile?.role === 'merchant' ? 'تاجر' : profile?.role === 'admin' ? 'مدير' : 'عميل'}</p>
          </div>
        </div>
      </aside>

      {/* Page Content */}
      <main className="flex-1 p-6 max-w-5xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/food" element={<FoodDelivery />} />
            <Route path="/parcel" element={<ParcelDelivery />} />
            <Route path="/courier" element={<CourierService />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/driver" element={<DriverDashboard />} />
            <Route path="/merchant" element={<MerchantDashboard />} />
          </Routes>
        </motion.div>
      </main>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 glass border-t border-zinc-100 flex items-center justify-around py-3 px-4">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.path)}
            className={cn(
              "nav-item",
              location.pathname === item.path && "active"
            )}
          >
            <item.icon className={cn("w-6 h-6", location.pathname === item.path && "fill-current")} />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
