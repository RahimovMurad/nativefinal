import type {
  ActivityFormValues,
  FormErrors,
  TripFormValues,
  ValidationResult,
} from '@/types';
import { isIsoDate } from '@/utils/format';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function validateTripForm(
  values: TripFormValues
): ValidationResult<TripFormValues> {
  const errors: FormErrors<TripFormValues> = {};

  if (values.title.trim().length < 3) {
    errors.title = 'Səyahət adı ən azı 3 simvol olmalıdır';
  }

  if (values.city.trim().length < 2) {
    errors.city = 'Şəhər adı daxil edilməlidir';
  }

  if (values.country.trim().length < 2) {
    errors.country = 'Ölkə adı daxil edilməlidir';
  }

  if (!isIsoDate(values.startDate.trim())) {
    errors.startDate = 'Başlanğıc tarixi YYYY-MM-DD formatında olmalıdır';
  }

  if (!isIsoDate(values.endDate.trim())) {
    errors.endDate = 'Bitmə tarixi YYYY-MM-DD formatında olmalıdır';
  } else if (
    isIsoDate(values.startDate.trim()) &&
    values.endDate.trim() < values.startDate.trim()
  ) {
    errors.endDate = 'Bitmə tarixi başlanğıc tarixindən əvvəl ola bilməz';
  }

  const budgetNumber = Number(values.budget);
  if (!values.budget.trim() || Number.isNaN(budgetNumber) || budgetNumber <= 0) {
    errors.budget = 'Büdcə 0-dan böyük rəqəm olmalıdır';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateActivityForm(
  values: ActivityFormValues,
  maxDays: number
): ValidationResult<ActivityFormValues> {
  const errors: FormErrors<ActivityFormValues> = {};

  const day = Number(values.dayNumber);
  if (!values.dayNumber.trim() || Number.isNaN(day) || day < 1 || day > maxDays) {
    errors.dayNumber = `Gün 1 ilə ${maxDays} arasında olmalıdır`;
  }

  if (values.title.trim().length < 2) {
    errors.title = 'Fəaliyyət başlığı daxil edilməlidir';
  }

  if (values.placeName.trim().length < 2) {
    errors.placeName = 'Məkan adı daxil edilməlidir';
  }

  if (!TIME_REGEX.test(values.time.trim())) {
    errors.time = 'Saat formatı HH:MM olmalıdır (məs. 14:30)';
  }

  if (values.estimatedCost.trim()) {
    const cost = Number(values.estimatedCost);
    if (Number.isNaN(cost) || cost < 0) {
      errors.estimatedCost = 'Məbləğ mənfi ola bilməz';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
