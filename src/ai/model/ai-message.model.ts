import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table({
    tableName: 'ai_messages',
})
export class AiMessage extends Model<AiMessage> {
    @Column
    conversationId: number;

    @Column
    username: string;

    @Column
    sender: string;

    @Column
    role: string;

    @Column({
        type: DataType.TEXT('long'),
    })
    content: string;
}
