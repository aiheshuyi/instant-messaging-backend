import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, MaxLength } from "class-validator";

export class CreateMessageDto {
    @IsNotEmpty()
    @MaxLength(200)
    @ApiProperty({
        default: 'Hello',
        description: '消息内容',
        example: 'Hello',
        required: true,
    })
    content: string;

    @IsNotEmpty()
    @ApiProperty({
        default: 'yang',
        description: '消息发送者',
        example: 'yang',
        required: true,
    })
    sender: string;

    @IsNotEmpty()
    @ApiProperty({
        default: 'xiaoxin',
        description: '消息接收者',
        example: 'xiaoxin',
        required: true,
    })
    receiver: string;
}
