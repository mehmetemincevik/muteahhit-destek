import { IsUUID } from 'class-validator';

export class StartConversationDto {
  @IsUUID()
  projectId: string;

  @IsUUID()
  craftsmanId: string;
}
