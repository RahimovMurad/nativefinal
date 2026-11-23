export type DestinationDetailParams = {
  id: string;
};

export type CreateTripParams = {
  destinationId?: string;
  city?: string;
  country?: string;
};

export type TripDetailParams = {
  id: string;
};

export type ActivityFormParams = {
  id: string;
  activityId?: string;
  day?: string;
  placeName?: string;
};
