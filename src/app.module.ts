import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SequelizeModule } from '@nestjs/sequelize'
import { User } from './user/model/user.model';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { EventsModule } from './ws/event.module';
import { MessageModule } from './message/message.module';
import { Message } from './message/model/message.model';
import { AiModule } from './ai/ai.module';
import { AiConversation } from './ai/model/ai-conversation.model';
import { AiMessage } from './ai/model/ai-message.model';

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 3306),
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      models: [User, Message, AiConversation, AiMessage],
      autoLoadModels: true,
      synchronize: true,
      sync: {
        alter: true
      }
    }),
    SequelizeModule.forFeature([User, Message, AiConversation, AiMessage]),
    UserModule,
    AuthModule,
    EventsModule,
    MessageModule,
    AiModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
  ],
})
export class AppModule { }
