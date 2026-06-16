import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class CreateAiConversationDto {
    @IsNotEmpty()
    @ApiProperty({
        default: 'yang',
        description: '当前登录用户',
        required: true,
    })
    username: string;
}
