import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/sequelize';
import { User } from './model/user.model';

@Injectable()
export class UserService {
  constructor(@InjectModel(User) private userModel: typeof User) { }

  async create(createUserDto: CreateUserDto) {
    const res = await this.userModel.build({
      ...createUserDto
    })
    await res.save()
    return res
  }

  async findAll() {
    return await this.userModel.findAll({
      attributes: ['id', 'username', 'avatar', 'createdAt', 'updatedAt']
    })
  }

  async find(createUserDto: CreateUserDto) {
    return await this.userModel.findOne({
      where: {
        ...createUserDto
      }
    })
  }

  async findOne(username: string) {
    const res = await this.userModel.findOne({
      where: {
        username
      }
    })
    return res !== null ? res : null
  }

  async uploadAvatar(username: string, avatar: string) {
    const res = await this.userModel.update({
      avatar
    }, {
      where: {
        username: username
      }
    })
    return {
      code: '200',
      msg: "上传成功",
      data: res
    }
  }

  async hasAvatar(username: string) {
    const res = await this.userModel.findOne({
      where: {
        username: username
      }
    })
    return !!res?.avatar
  }
}
