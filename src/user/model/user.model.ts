import { Column, DataType, Model, Table } from 'sequelize-typescript';

@Table
export class User extends Model<User> {
  @Column
  username: string;
  @Column
  password: string;
  @Column(DataType.TEXT)
  avatar: string;
}
