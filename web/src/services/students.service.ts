import type {
  CreateStudentPayload,
  Student,
  UpdateStudentPayload,
} from '@/types/api.types';
import { api } from './api';

export async function listStudents(): Promise<Student[]> {
  const { data } = await api.get<Student[]>('/students');
  return data;
}

export async function createStudent(
  payload: CreateStudentPayload,
): Promise<Student> {
  const { data } = await api.post<Student>('/students', payload);
  return data;
}

export async function updateStudent(
  id: string,
  payload: UpdateStudentPayload,
): Promise<Student> {
  const { data } = await api.patch<Student>(`/students/${id}`, payload);
  return data;
}

export async function setStudentStatus(
  id: string,
  isActive: boolean,
): Promise<Student> {
  const { data } = await api.patch<Student>(`/students/${id}/status`, {
    isActive,
  });
  return data;
}

export async function deleteStudent(id: string): Promise<Student> {
  const { data } = await api.delete<Student>(`/students/${id}`);
  return data;
}
