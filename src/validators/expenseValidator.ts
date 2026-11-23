import type {
  ExpenseFormValues,
  FormErrors,
  JournalFormValues,
  ValidationResult,
} from '@/types';
import { isIsoDate } from '@/utils/format';

export function validateExpenseForm(
  values: ExpenseFormValues
): ValidationResult<ExpenseFormValues> {
  const errors: FormErrors<ExpenseFormValues> = {};

  if (values.title.trim().length < 2) {
    errors.title = 'Xərc adı ən azı 2 simvol olmalıdır';
  }

  const amount = Number(values.amount);
  if (!values.amount.trim() || Number.isNaN(amount) || amount <= 0) {
    errors.amount = 'Məbləğ 0-dan böyük olmalıdır';
  }

  if (!isIsoDate(values.date.trim())) {
    errors.date = 'Tarix YYYY-MM-DD formatında olmalıdır';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateJournalForm(
  values: JournalFormValues
): ValidationResult<JournalFormValues> {
  const errors: FormErrors<JournalFormValues> = {};

  if (values.title.trim().length < 3) {
    errors.title = 'Qeyd başlığı ən azı 3 simvol olmalıdır';
  }

  if (values.locationName.trim().length < 2) {
    errors.locationName = 'Məkan adı daxil edilməlidir';
  }

  if (values.content.trim().length < 10) {
    errors.content = 'Qeyd mətni ən azı 10 simvol olmalıdır';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
