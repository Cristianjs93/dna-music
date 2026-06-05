import type { FieldValues, RegisterOptions } from 'react-hook-form';
import { validationMessages } from './errorMessages';

export const requiredRule = {
  required: validationMessages.required,
} satisfies RegisterOptions<FieldValues>;

export const emailRule = {
  required: validationMessages.required,
  pattern: {
    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: validationMessages.email,
  },
} satisfies RegisterOptions<FieldValues>;

export const passwordRule = {
  required: validationMessages.required,
  minLength: {
    value: 8,
    message: validationMessages.minLength(8),
  },
} satisfies RegisterOptions<FieldValues>;
