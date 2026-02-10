export class EmployeeResponseDto {
  id: string;
  name: string;
  email: string;
  position: string;
  phone?: string;
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
