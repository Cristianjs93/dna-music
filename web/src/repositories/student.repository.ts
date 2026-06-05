import type { IStudentRepository } from './interfaces/student.repository';
import * as studentsService from '@/services/students.service';

export const studentRepository: IStudentRepository = {
  list: studentsService.listStudents,
  create: studentsService.createStudent,
  update: studentsService.updateStudent,
  setStatus: studentsService.setStudentStatus,
  delete: studentsService.deleteStudent,
};
