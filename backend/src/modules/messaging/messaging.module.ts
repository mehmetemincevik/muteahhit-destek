import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './entities/conversation.entity';
import { Message } from './entities/message.entity';
import { Offer } from './entities/offer.entity';
import { CraftsmanProfile } from '../craftsmen/entities/craftsman-profile.entity';
import { Project } from '../projects/entities/project.entity';
import { MessagingService } from './messaging.service';
import { MessagingController } from './messaging.controller';
import { ProjectsModule } from '../projects/projects.module';
import { CraftsmenModule } from '../craftsmen/craftsmen.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Conversation, Message, Offer, CraftsmanProfile, Project]),
    ProjectsModule,
    CraftsmenModule, // CraftsmenService.createAssignment (teklif kabul edildiğinde) için
  ],
  controllers: [MessagingController],
  providers: [MessagingService],
})
export class MessagingModule {}
