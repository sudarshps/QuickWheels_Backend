import BaseRepository from '../repositories/base_repository'
import messageModel,{IMessage} from '../models/message_model'
import { IMessageRepository } from '../interface/message/IMessageRepository'

class MessageRepository extends BaseRepository<IMessage> implements IMessageRepository{
    constructor(){
        super(messageModel)
    }

    async sendMessage(newMessage: object): Promise<IMessage | null> {
        let message = await this.create(newMessage);
        message = await message.populate("sender", "name email");
        message = await message.populate("chat");
        return message;
      }

      async getMessage(chatId: string): Promise<IMessage[] | null> {
        const messages = await this.model
          .find({ chat: chatId })
          .populate("sender", "name email")
          .populate("chat")
          .exec();
      
        return messages;
      }
      
}

export default new MessageRepository()