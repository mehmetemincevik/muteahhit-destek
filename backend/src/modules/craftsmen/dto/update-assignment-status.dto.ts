import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { AssignmentStatus } from '../entities/project-craftsman-assignment.entity';

export class UpdateAssignmentStatusDto {
  @IsEnum(AssignmentStatus)
  status: AssignmentStatus;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
