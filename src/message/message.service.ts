import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { CreateMessageDto } from './dto/create-message.dto';
import { Message } from './model/message.model';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message) private messageModel: typeof Message
  ) { }

  async create(createMessageDto: CreateMessageDto) {
    await this.messageModel.create(createMessageDto)
    return {
      code: '200',
      msg: '发送成功'
    }
  }

  async findMessageList(findMessageListObj) {
    const messageList = await this.messageModel.findAll({
      where: {
        [Op.or]: [
          {
            sender: findMessageListObj.username,
            receiver: findMessageListObj.currentChater
          },
          {
            sender: findMessageListObj.currentChater,
            receiver: findMessageListObj.username
          }
        ]
      },
      order: [['id', 'ASC']]
    })

    return {
      code: '200',
      msg: '查询成功',
      data: {
        messageList
      }
    }
  }

  async findPagedMessageList(findMessageListObj) {
    const page = Number.isFinite(findMessageListObj.page) && findMessageListObj.page > 0
      ? findMessageListObj.page
      : 1
    const pageSize = Number.isFinite(findMessageListObj.pageSize) && findMessageListObj.pageSize > 0
      ? Math.min(findMessageListObj.pageSize, 50)
      : 20
    const offset = (page - 1) * pageSize
    const where = {
      [Op.or]: [
        {
          sender: findMessageListObj.sender,
          receiver: findMessageListObj.receiver
        },
        {
          sender: findMessageListObj.receiver,
          receiver: findMessageListObj.sender
        }
      ]
    }

    const total = await this.messageModel.count({ where })
    const messageList = await this.messageModel.findAll({
      where,
      order: [['id', 'DESC']],
      limit: pageSize,
      offset
    })

    return {
      code: '200',
      msg: '查询成功',
      data: {
        messageList: messageList.reverse(),
        page,
        pageSize,
        total,
        hasMore: offset + messageList.length < total
      }
    }
  }
}
