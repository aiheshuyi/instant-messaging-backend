import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { findMessageListDTO } from './dto/find-messageList.dto';

@Controller()
export class MessageController {
  constructor(private readonly messageService: MessageService) { }

  @Post('message/send')
  async create(@Body() createMessageDto: CreateMessageDto) {
    return await this.messageService.create(createMessageDto);
  }

  @Post('message/list')
  async findAll(@Body() findMessageListDTO: findMessageListDTO) {

    return await this.messageService.findMessageList(findMessageListDTO);
  }

  @Get('messages')
  async findPaged(
    @Query('sender') sender: string,
    @Query('receiver') receiver: string,
    @Query('page') page = '1',
    @Query('pageSize') pageSize = '20',
  ) {
    return await this.messageService.findPagedMessageList({
      sender,
      receiver,
      page: Number(page),
      pageSize: Number(pageSize),
    });
  }
}
