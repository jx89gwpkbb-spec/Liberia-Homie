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
};

export type User = {
  id: string;
  name:string;
  email: string;
  avatar: string;
  createdAt?: any;
};

export type Review = {
  id: string;
  propertyId: string;
  user: User;
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
};
