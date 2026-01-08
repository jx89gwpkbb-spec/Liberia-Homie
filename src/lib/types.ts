

export type Extra = {
    name: string;
    price: number;
    type: 'per_stay' | 'per_person' | 'per_night';
}

export type Property = {
  id: string;
  name: string;
  location: string;
  pricePerNight: number;
  weekendPrice?: number;
  weeklyDiscount?: number;
  description: string;
  longStay: boolean;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  amenities: string[];
  extras?: Extra[];
  rating: number;
  reviewCount: number;
  viewCount?: number;
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

export type NotificationSettings = {
  newListingAlerts?: boolean;
  priceDropAlerts?: boolean;
  rentReminders?: boolean;
  marketingEmails?: boolean;
};

export type UserProfile = {
  id: string;
  name:string;
  email: string;
  avatar: string;
  whatsappNumber?: string;
  country?: string;
  createdAt?: any;
  role?: 'renter' | 'vendor';
  notificationSettings?: NotificationSettings;
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
  cleanliness: number;
  communication: number;
  checkIn: number;
  accuracy: number;
  location: number;
  value: number;
};

export type Booking = {
  id?: string;
  userId: string;
  vendorId: string;
  propertyId: string;
  checkInDate: any;
  checkOutDate: any;
  totalPrice: number;
  guests: number;
  createdAt: any;
  propertyName: string;
  propertyImage: string;
  propertyLocation: string;
  extras?: Extra[];
  user?: {
    name: string;
    avatar: string;
  },
  reminders?: {
    checkInReminderSent?: boolean;
    checkOutReminderSent?: boolean;
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

export type Setting = {
    siteName: string;
    contactEmail: string;
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  status: 'draft' | 'published';
  targetAudience: 'all' | 'renters' | 'vendors';
  createdAt: any;
  publishedAt?: any;
};

export type SupportTicket = {
  id?: string;
  userId?: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'New' | 'In Progress' | 'Resolved' | 'Closed';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  createdAt: any;
};
    
    

    







