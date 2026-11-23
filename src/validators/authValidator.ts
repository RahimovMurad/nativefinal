import type {
  FormErrors,
  LoginFormValues,
  RegisterFormValues,
  ValidationResult,
} from '@/types';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLoginForm(
  values: LoginFormValues
): ValidationResult<LoginFormValues> {
  const errors: FormErrors<LoginFormValues> = {};

  if (!values.email.trim()) {
    errors.email = 'Email və ya istifadəçi adı daxil edilməlidir';
  } else if (
    values.email.includes('@') &&
    !EMAIL_REGEX.test(values.email.trim())
  ) {
    errors.email = 'Düzgün email formatı daxil edin';
  }

  if (!values.password) {
    errors.password = 'Şifrə daxil edilməlidir';
  } else if (values.password.length < 4) {
    errors.password = 'Şifrə ən azı 4 simvol olmalıdır';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateRegisterForm(
  values: RegisterFormValues
): ValidationResult<RegisterFormValues> {
  const errors: FormErrors<RegisterFormValues> = {};

  if (values.fullName.trim().length < 2) {
    errors.fullName = 'Ad və soyad ən azı 2 simvol olmalıdır';
  }

  if (!values.email.trim()) {
    errors.email = 'Email daxil edilməlidir';
  } else if (!EMAIL_REGEX.test(values.email.trim())) {
    errors.email = 'Düzgün email ünvanı daxil edin';
  }

  if (!values.password || values.password.length < 6) {
    errors.password = 'Şifrə ən azı 6 simvol olmalıdır';
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'Şifrələr uyğun gəlmir';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
