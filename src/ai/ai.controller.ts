import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { AiService } from './ai.service';
import { AiChatDto } from './dto/ai-chat.dto';
import { CreateAiConversationDto } from './dto/create-ai-conversation.dto';

@Controller('ai')
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Get('config/status')
    getConfigStatus() {
        return this.aiService.getConfigStatus();
    }

    @Get('conversations')
    async getConversations(@Query('username') username: string) {
        return await this.aiService.getConversations(username);
    }

    @Post('conversations')
    async createConversation(@Body() body: CreateAiConversationDto) {
        return await this.aiService.createConversation(body.username);
    }

    @Get('conversations/:id/messages')
    async getConversationMessages(
        @Param('id') id: string,
        @Query('username') username: string,
    ) {
        return await this.aiService.getConversationMessages(username, Number(id));
    }

    @Delete('conversations/:id')
    async deleteConversation(
        @Param('id') id: string,
        @Query('username') username: string,
    ) {
        return await this.aiService.deleteConversation(username, Number(id));
    }

    @Patch('conversations/:id')
    async renameConversation(
        @Param('id') id: string,
        @Body('username') username: string,
        @Body('title') title: string,
    ) {
        return await this.aiService.renameConversation(username, Number(id), title);
    }

    @Post('chat/stream')
    async streamChat(
        @Body() body: AiChatDto,
        @Res() response: Response,
    ) {
        return await this.aiService.streamChat(body.username, body.content, body.conversationId, response);
    }
}
