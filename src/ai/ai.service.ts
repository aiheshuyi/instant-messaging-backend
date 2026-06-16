import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import axios from 'axios';
import { Response } from 'express';
import { DEEPSEEK_ASSISTANT_NAME, deepseekConfig, getDeepseekConfigStatus } from './deepseek.config';
import { AiConversation } from './model/ai-conversation.model';
import { AiMessage } from './model/ai-message.model';

type DeepseekMessage = {
    role: 'system' | 'user' | 'assistant';
    content: string;
};

@Injectable()
export class AiService {
    constructor(
        @InjectModel(AiConversation) private conversationModel: typeof AiConversation,
        @InjectModel(AiMessage) private aiMessageModel: typeof AiMessage,
    ) { }

    getConfigStatus() {
        return getDeepseekConfigStatus();
    }

    async getConversations(username: string) {
        const conversations = await this.conversationModel.findAll({
            where: { username },
            order: [['lastMessageAt', 'DESC'], ['id', 'DESC']],
        });

        return {
            code: '200',
            msg: '查询成功',
            data: conversations,
        };
    }

    async createConversation(username: string) {
        const conversation = await this.conversationModel.create({
            username,
            title: '新对话',
            lastMessageAt: new Date(),
        });

        return {
            code: '200',
            msg: '创建成功',
            data: conversation,
        };
    }

    async getConversationMessages(username: string, conversationId: number) {
        const conversation = await this.findConversation(username, conversationId);
        if (!conversation) {
            return {
                code: '404',
                msg: '会话不存在',
                data: [],
            };
        }

        const messages = await this.aiMessageModel.findAll({
            where: { username, conversationId },
            order: [['id', 'ASC']],
        });

        return {
            code: '200',
            msg: '查询成功',
            data: messages,
        };
    }

    async deleteConversation(username: string, conversationId: number) {
        const conversation = await this.findConversation(username, conversationId);
        if (!conversation) {
            return {
                code: '404',
                msg: '会话不存在',
            };
        }

        await this.aiMessageModel.destroy({
            where: {
                username,
                conversationId,
            },
        });
        await conversation.destroy();

        return {
            code: '200',
            msg: '删除成功',
        };
    }

    async renameConversation(username: string, conversationId: number, title: string) {
        const conversation = await this.findConversation(username, conversationId);
        if (!conversation) {
            return {
                code: '404',
                msg: '会话不存在',
            };
        }

        const nextTitle = this.normalizeTitle(title);
        await conversation.update({
            title: nextTitle,
        });

        return {
            code: '200',
            msg: '重命名成功',
            data: {
                id: conversation.id,
                title: nextTitle,
            },
        };
    }

    async streamChat(username: string, content: string, conversationId: number, response: Response) {
        response.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
        response.setHeader('Cache-Control', 'no-cache, no-transform');
        response.setHeader('Connection', 'keep-alive');

        if (!deepseekConfig.apiKey) {
            this.writeSse(response, 'error', '请先在后端 .env 配置 DEEPSEEK_API_KEY，然后重启后端服务');
            response.end();
            return;
        }

        const conversation = await this.getOrCreateConversation(username, conversationId);
        if (!conversation) {
            this.writeSse(response, 'error', 'AI 会话不存在，请新建对话后再试');
            response.end();
            return;
        }

        const nextTitle = conversation.title === '新对话'
            ? this.createTitle(content)
            : conversation.title;
        await conversation.update({
            title: nextTitle,
            lastMessageAt: new Date(),
        });
        this.writeSse(response, 'conversation', {
            id: conversation.id,
            title: nextTitle,
        });

        await this.aiMessageModel.create({
            conversationId: conversation.id,
            username,
            sender: username,
            role: 'user',
            content,
        });

        let assistantAnswer = '';
        let streamBuffer = '';
        const contextMessages = await this.getContextMessages(username, conversation.id);

        try {
            const deepseekResponse = await axios.post(
                deepseekConfig.apiUrl,
                {
                    model: deepseekConfig.model,
                    stream: true,
                    messages: [
                        {
                            role: 'system',
                            content: '你是 Deepseek，一个独立的 AI 助手。请如实介绍自己的身份，不要把自己固定描述为全栈学习助手；当用户询问技术学习问题时，再提供清晰、具体的帮助。',
                        },
                        ...contextMessages,
                    ],
                },
                {
                    responseType: 'stream',
                    headers: {
                        Authorization: `Bearer ${deepseekConfig.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            deepseekResponse.data.on('data', (buffer: Buffer) => {
                streamBuffer += buffer.toString('utf8');
                const blocks = streamBuffer.split('\n\n');
                streamBuffer = blocks.pop() || '';

                for (const block of blocks) {
                    const dataLine = block
                        .split('\n')
                        .map(line => line.trim())
                        .find(line => line.startsWith('data:'));

                    if (!dataLine) {
                        continue;
                    }

                    const data = dataLine.replace(/^data:\s*/, '');
                    if (data === '[DONE]') {
                        continue;
                    }

                    try {
                        const parsed = JSON.parse(data);
                        const delta = parsed?.choices?.[0]?.delta?.content || '';
                        if (delta) {
                            assistantAnswer += delta;
                            this.writeSse(response, 'message', delta);
                        }
                    } catch (error) {
                        this.writeSse(response, 'error', 'AI 响应解析失败');
                    }
                }
            });

            deepseekResponse.data.on('end', async () => {
                try {
                    if (assistantAnswer) {
                        await this.aiMessageModel.create({
                            conversationId: conversation.id,
                            username,
                            sender: DEEPSEEK_ASSISTANT_NAME,
                            role: 'assistant',
                            content: assistantAnswer,
                        });
                        await conversation.update({ lastMessageAt: new Date() });
                    }
                    this.writeSse(response, 'done', '[DONE]');
                } catch (error) {
                    this.writeSse(response, 'error', 'AI 回复已生成，但保存到数据库失败，请检查 ai_messages.content 字段类型');
                } finally {
                    response.end();
                }
            });

            deepseekResponse.data.on('error', () => {
                this.writeSse(response, 'error', 'AI 响应中断，请稍后重试');
                response.end();
            });
        } catch (error) {
            this.writeSse(response, 'error', this.getDeepseekErrorMessage(error));
            response.end();
        }
    }

    private async getOrCreateConversation(username: string, conversationId?: number) {
        if (conversationId) {
            return await this.findConversation(username, conversationId);
        }

        return await this.conversationModel.create({
            username,
            title: '新对话',
            lastMessageAt: new Date(),
        });
    }

    private async findConversation(username: string, conversationId: number) {
        if (!conversationId) {
            return null;
        }

        return await this.conversationModel.findOne({
            where: {
                id: conversationId,
                username,
            },
        });
    }

    private async getContextMessages(username: string, conversationId: number): Promise<DeepseekMessage[]> {
        const messages = await this.aiMessageModel.findAll({
            where: { username, conversationId },
            order: [['id', 'DESC']],
            limit: 20,
        });

        return messages.reverse().map(message => ({
            role: message.role === 'assistant' ? 'assistant' : 'user',
            content: message.content,
        }));
    }

    private createTitle(content: string) {
        const title = content.replace(/\s+/g, ' ').trim();
        return title.length > 18 ? `${title.slice(0, 18)}...` : title || '新对话';
    }

    private normalizeTitle(title: string) {
        const nextTitle = String(title || '').replace(/\s+/g, ' ').trim();
        if (!nextTitle) {
            return '新对话';
        }

        return nextTitle.length > 30 ? nextTitle.slice(0, 30) : nextTitle;
    }

    private getDeepseekErrorMessage(error: unknown) {
        if (axios.isAxiosError(error)) {
            const status = error.response?.status;
            if (status) {
                const statusHintMap: Record<number, string> = {
                    400: '请求参数不正确，请检查模型名或消息内容',
                    401: 'API Key 无效、格式错误，或者没有权限',
                    402: 'DeepSeek 账户余额不足',
                    403: 'API Key 没有访问权限',
                    404: '接口地址或模型名不正确',
                    429: '请求太频繁，请稍后再试',
                    500: 'DeepSeek 服务异常，请稍后再试',
                    503: 'DeepSeek 服务暂时不可用',
                };
                const hint = statusHintMap[status] || '请检查 API Key、余额、模型名和接口地址';
                return `DeepSeek API 调用失败：HTTP ${status}，${hint}`;
            }

            if (error.code) {
                return `DeepSeek API 网络连接失败：${error.code}，请检查本机网络或代理`;
            }
        }

        return 'DeepSeek API 调用失败，请检查 API Key、余额、模型名或网络';
    }

    private writeSse(response: Response, event: string, data: unknown) {
        response.write(`event: ${event}\n`);
        response.write(`data: ${JSON.stringify(data)}\n\n`);
    }
}
