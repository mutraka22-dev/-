export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export type Role = 'customer' | 'driver' | 'merchant' | 'admin';

export interface UserProfile {
  uid: string;
  name: string;
  email?: string;
  phone?: string;
  role: Role;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Merchant {
  id: string;
  ownerId: string;
  name: string;
  category: 'fast_food' | 'traditional' | 'grocery' | 'pharmacy' | 'other';
  address: string;
  location: { lat: number; lng: number };
  image: string;
  rating: number;
}

export interface Product {
  id: string;
  merchantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface Order {
  id: string;
  customerId: string;
  driverId?: string;
  merchantId?: string;
  type: 'food' | 'parcel' | 'buy_for_me';
  status: 'pending' | 'accepted' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  items?: Array<{ productId: string; quantity: number; name: string; price: number }>;
  parcelInfo?: { weight: string; description: string; size: 'small' | 'medium' | 'large' };
  buyForMeRequest?: string;
  buyForMeImage?: string;
  pickupLocation: { lat: number; lng: number; address: string };
  deliveryLocation: { lat: number; lng: number; address: string };
  totalPrice: number;
  eta?: number;
  verificationCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverTracking {
  driverId: string;
  location: { lat: number; lng: number };
  updatedAt: string;
  isAvailable: boolean;
}
