import { Types } from "mongoose";
import ChatModel, { IChat } from "../models/chat_model";
import { IChatRepository } from "../interface/chat/IChatRepository";
import BaseRepository from "../repositories/base_repository";


class ChatRepository extends BaseRepository<IChat> implements IChatRepository {
  constructor() {
    super(ChatModel);
  }

  async checkChat(receiverId: string, senderId: string): Promise<IChat | null> {
    let checkChat = await this.findOne({
      $and: [
        { users: { $elemMatch: { $eq: senderId } } },
        { users: { $elemMatch: { $eq: receiverId } } },
      ],
    });
    if (checkChat) {
      await checkChat.populate({ path: "users", select: "name email" });
      await checkChat.populate({
        path: "latestMessage.sender",
        select: "name email",
      });
    }    
    return checkChat;
  }

  async createChat(
    receiverId: string,
    senderId: string
  ): Promise<IChat | null> {
    return await this.create({
      users: [senderId, receiverId],
    });
  }


  async getChat(userId: string): Promise<IChat[] | null> {
    return await ChatModel.find({
      users: { $elemMatch: { $eq: userId } },
    })
      .populate({ path: "users", select: "name email" })
      .populate("latestMessage")
      .sort({ updatedAt: -1 });
  }


  async latestMessage(
    chatId: string,
    message: Types.ObjectId
  ): Promise<IChat | null> {
    return await this.findByIdAndUpdate(chatId, {
      latestMessage: message,
    });
  }


}

export default new ChatRepository();
