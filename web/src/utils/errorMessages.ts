const API_ERROR_TRANSLATIONS: Record<string, string> = {
  'Invalid credentials': 'Credenciales inválidas.',
  'Insufficient permissions': 'No tienes permisos suficientes.',
  'User not found': 'Usuario no encontrado.',
  'Headquarter not found': 'Sede no encontrada.',
  'Headquarter is not active': 'La sede seleccionada no está activa.',
  'Headquarter name already exists': 'Ya existe una sede con ese nombre.',
  'Student not found': 'Estudiante no encontrado.',
  'Student with this email, phone, or identity card already exists':
    'Ya existe un estudiante con ese correo, teléfono o documento.',
  'You can only access students from your assigned branch':
    'Solo puedes acceder a estudiantes de tu sede asignada.',
  'headquarterId must match your assigned branch':
    'La sede debe coincidir con tu sede asignada.',
  'OPERADOR users must have a headquarter assigned':
    'Los operadores deben tener una sede asignada.',
  'ADMIN users must not have a headquarter assigned':
    'Los administradores no deben tener sede asignada.',
  'You can only update your own profile': 'Solo puedes actualizar tu propio perfil.',
  'You are not allowed to modify privileged fields':
    'No puedes modificar campos privilegiados.',
  'Resource already exists': 'El recurso ya existe.',
};

export const validationMessages = {
  required: 'Este campo es obligatorio.',
  email: 'Ingresa un correo válido.',
  minLength: (length: number) => `Debe tener al menos ${length} caracteres.`,
} as const;

export function translateApiError(message: string): string {
  return API_ERROR_TRANSLATIONS[message] ?? message;
}
