import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { AiConversation } from './model/ai-conversation.model';
import { AiMessage } from './model/ai-message.model';

@Module({
    imports: [SequelizeModule.forFeature([AiConversation, AiMessage])],
    controllers: [AiController],
    providers: [AiService],
})
export class AiModule { }
