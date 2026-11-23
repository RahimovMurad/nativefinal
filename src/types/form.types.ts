export type FormErrors<T extends Record<string, unknown>> = Partial<
  Record<keyof T, string>
>;

export type ValidationResult<T extends Record<string, unknown>> = {
  isValid: boolean;
  errors: FormErrors<T>;
};

export type LoginFormValues = {
  email: string;
  password: string;
};

export type RegisterFormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type TripFormValues = {
  title: string;
  city: string;
  country: string;
  startDate: string;
  endDate: string;
  budget: string;
  notes: string;
};

export type ActivityFormValues = {
  dayNumber: string;
  title: string;
  placeName: string;
  time: string;
  estimatedCost: string;
  note: string;
};

export type ExpenseFormValues = {
  title: string;
  amount: string;
  date: string;
  note: string;
};

export type JournalFormValues = {
  title: string;
  locationName: string;
  content: string;
};
