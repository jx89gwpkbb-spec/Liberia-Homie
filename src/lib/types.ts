export type Property = {
  id: string;
  name: string;
  location: string;
  pricePerNight: number;
  description: string;
  longStay: boolean;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  rating: number;
  reviewCount: number;
  images: string[];
  owner: {
    id: string;
    name: string;
    avatar: string;
  };
  propertyType: 'House' | 'Apartment' | 'Condo' | 'Villa';
  petFriendly?: boolean;
  gps?: {
    lat: number;
    lng: number;
  };
  virtualTourUrl?: string;
  status: 'pending' | 'approved' | 'rejected';
};

export type UserProfile = {
  id: string;
  name:string;
  email: string;
  avatar: string;
  createdAt?: any;
  role?: 'renter' | 'vendor';
};

export type AdminProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  creationDate: any;
  lastLogin: any;
  role: string;
  permissions: string[];
};

export type Review = {
  id: string;
  propertyId: string;
  user: UserProfile;
  rating: number;
  comment: string;
  createdAt: string;
};

export type Booking = {
  id?: string;
  userId: string;
  propertyId: string;
  checkInDate: any;
  checkOutDate: any;
  totalPrice: number;
  guests: number;
  createdAt: any;
  propertyName: string;
  propertyImage: string;
  propertyLocation: string;
  user?: {
    name: string;
    avatar: string;
  }
};

export type Favorite = {
  propertyId: string;
  createdAt: any;
};

export type Document = {
  id?: string;
  userId: string;
  fileName: string;
  fileUrl: string;
  documentType: 'ID Proof' | 'Rental Agreement' | 'Receipt' | 'Other';
  uploadedAt: any;
};

export type SavedSearch = {
    id: string;
    name: string;
    createdAt: any;
    filters: {
        location?: string;
        price?: number;
        duration?: string;
        amenities?: string[];
        bedrooms?: number;
        petFriendly?: boolean;
    }
};

export type Visit = {
  id?: string;
  propertyId: string;
  userId: string;
  visitDate: any;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: any;
  propertyName?: string;
  propertyImage?: string;
};

export type User = UserProfile;

    