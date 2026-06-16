import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class LoginDTO {
    @IsNotEmpty()
    @ApiProperty({
        default: "boyyang",
        required: true
    })
    username: string;

    @IsNotEmpty()
    @ApiProperty({
        default: "haoshuai",
        required: true
    })
    password: string;
}
