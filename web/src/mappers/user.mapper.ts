import type { CreateUserPayload, UpdateUserPayload } from '@/types/user.types';
import type { UserFormValues } from '@/hooks/users/user.types';

export function toCreateUserPayload(values: UserFormValues): CreateUserPayload {
  return {
    name: values.name,
    email: values.email,
    password: values.password,
    role: values.role,
    headquarterId:
      values.role === 'OPERADOR' ? values.headquarterId ?? undefined : undefined,
  };
}

export function toUpdateUserPayload(values: UserFormValues): UpdateUserPayload {
  return {
    name: values.name,
    email: values.email,
    role: values.role,
    headquarterId:
      values.role === 'OPERADOR' ? values.headquarterId ?? undefined : null,
  };
}
