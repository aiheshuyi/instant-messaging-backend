import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, MaxLength } from "class-validator";

export class AiChatDto {
    @IsNotEmpty()
    @ApiProperty({
        default: 'yang',
        description: '当前登录用户',
        required: true,
    })
    username: string;

    @IsNotEmpty()
    @MaxLength(1000)
    @ApiProperty({
        default: '帮我解释一下这个项目的聊天流程',
        description: '用户发给 AI 助手的问题',
        required: true,
    })
    content: string;

    @IsOptional()
    @ApiProperty({
        default: 1,
        description: 'AI 会话 ID，不传时后端会自动创建新会话',
        required: false,
    })
    conversationId?: number;
}
