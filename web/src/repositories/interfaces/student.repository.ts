import type {
  CreateStudentPayload,
  Student,
  UpdateStudentPayload,
} from '@/types/student.types';

export interface IStudentRepository {
  list(): Promise<Student[]>;
  create(payload: CreateStudentPayload): Promise<Student>;
  update(id: string, payload: UpdateStudentPayload): Promise<Student>;
  setStatus(id: string, isActive: boolean): Promise<Student>;
  delete(id: string): Promise<Student>;
}
