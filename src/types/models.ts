export type DestinationCategory =
  | 'All'
  | 'City'
  | 'Beach'
  | 'Mountain'
  | 'Historical'
  | 'Nature';

export type ActivityCategory =
  | 'Sightseeing'
  | 'Food'
  | 'Transport'
  | 'Hotel'
  | 'Adventure'
  | 'Shopping';

export type ExpenseCategory =
  | 'Accommodation'
  | 'Food & Drink'
  | 'Transport'
  | 'Tickets'
  | 'Shopping'
  | 'Other';

export type TripStatus = 'upcoming' | 'active' | 'completed';

export type User = {
  id: number;
  fullName: string;
  email: string;
  avatarUri: string | null;
  bio: string;
  createdAt: string;
};

export type Destination = {
  id: number;
  name: string;
  country: string;
  category: Exclude<DestinationCategory, 'All'>;
  description: string;
  imageUrl: string;
  rating: number;
  reviewCount: number;
  latitude: number;
  longitude: number;
  avgDailyCost: number;
  bestSeason: string;
  highlights: string[];
};

export type Place = {
  id: number;
  destinationId: number;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  rating: number;
  latitude: number;
  longitude: number;
  estimatedCost: number;
  durationHours: number;
};

export type Trip = {
  id: number;
  title: string;
  destinationId: number;
  city: string;
  country: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: TripStatus;
  notes: string;
  reminderEnabled: boolean;
  createdAt: string;
};

export type TripSummary = Trip & {
  activityCount: number;
  completedActivityCount: number;
  totalExpenses: number;
  daysCount: number;
};

export type Activity = {
  id: number;
  tripId: number;
  dayNumber: number;
  title: string;
  placeName: string;
  time: string;
  category: ActivityCategory;
  note: string;
  estimatedCost: number;
  isCompleted: boolean;
};

export type Expense = {
  id: number;
  tripId: number;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  note: string;
};

export type JournalEntry = {
  id: number;
  tripId: number | null;
  tripTitle: string;
  title: string;
  content: string;
  imageUri: string | null;
  locationName: string;
  createdAt: string;
};

export type ChartPoint = {
  label: string;
  value: number;
  color?: string;
};

export type DashboardStats = {
  tripCount: number;
  activeTripCount: number;
  totalBudget: number;
  totalSpent: number;
  favoriteCount: number;
  journalCount: number;
  categoryExpenses: ChartPoint[];
};

export type Coordinates = {
  latitude: number;
  longitude: number;
};
