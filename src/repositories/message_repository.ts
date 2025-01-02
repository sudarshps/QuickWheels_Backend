import BaseRepository from "../repositories/base_repository";
import messageModel, { IMessage } from "../models/message_model";
import { IMessageRepository } from "../interface/message/IMessageRepository";

class MessageRepository
  extends BaseRepository<IMessage>
  implements IMessageRepository
{
  constructor() {
    super(messageModel);
  }

  async sendMessage(newMessage: object): Promise<IMessage | null> {
    try {
      let message = await this.create(newMessage);
      message = await message.populate("sender", "name email");
      message = await message.populate("chat");
      return message;
    } catch (error) {
      console.error("error in sending message:", error);
      throw error;
    }
  }

  async getMessage(chatId: string): Promise<IMessage[] | null> {
    try {
      const messages = await this.model
      .find({ chat: chatId })
      .populate("sender", "name email")
      .populate("chat")
      .exec();

    return messages;
    } catch (error) {
      console.error('error in getting message:',error);
      throw error
    }
    
  }
}

export default new MessageRepository();
