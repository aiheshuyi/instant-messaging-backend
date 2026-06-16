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

const databaseConfig = {
  host: process.env.DB_HOST || process.env.MYSQLHOST,
  port: Number(process.env.DB_PORT || process.env.MYSQLPORT || 3306),
  username: process.env.DB_USER || process.env.MYSQLUSER,
  password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || process.env.MYSQL_ROOT_PASSWORD,
  database: process.env.DB_NAME || process.env.MYSQLDATABASE || process.env.MYSQL_DATABASE,
}

@Module({
  imports: [
    SequelizeModule.forRoot({
      dialect: 'mysql',
      host: databaseConfig.host,
      port: databaseConfig.port,
      username: databaseConfig.username,
      password: databaseConfig.password,
      database: databaseConfig.database,
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
