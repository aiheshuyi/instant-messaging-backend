import { Column, Model, Table } from 'sequelize-typescript';

@Table({
    tableName: 'ai_conversations',
})
export class AiConversation extends Model<AiConversation> {
    @Column
    username: string;

    @Column
    title: string;

    @Column
    lastMessageAt: Date;
}
