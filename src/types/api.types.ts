import type {
  ActivityCategory,
  DestinationCategory,
  TripStatus,
} from './models';

export type ApiResponse<T> = {
  data: T;
  source: 'network' | 'cache' | 'local';
  timestamp: string;
  statusCode: number;
};

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
};

export type DestinationFilterParams = {
  search?: string;
  category?: DestinationCategory;
  minRating?: number;
  page?: number;
  limit?: number;
};

export type CreateTripDto = {
  title: string;
  destinationId: number;
  city: string;
  country: string;
  coverImage: string;
  startDate: string;
  endDate: string;
  budget: number;
  notes?: string;
  reminderEnabled?: boolean;
};

export type UpdateTripDto = Partial<CreateTripDto> & {
  status?: TripStatus;
};

export type CreateActivityDto = {
  dayNumber: number;
  title: string;
  placeName: string;
  time: string;
  category: ActivityCategory;
  note?: string;
  estimatedCost?: number;
};

export type UpdateActivityDto = Partial<CreateActivityDto> & {
  isCompleted?: boolean;
};
