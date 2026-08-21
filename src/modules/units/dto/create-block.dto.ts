import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateBlockDto {
  @IsString()
  @IsNotEmpty()
  name: string; // "A Blok" gibi

  @IsOptional()
  @IsInt()
  @Min(1)
  floorCount?: number;
}
