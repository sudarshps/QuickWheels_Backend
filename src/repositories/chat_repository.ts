import { Types } from "mongoose";
import ChatModel, { IChat } from "../models/chat_model";
import { IChatRepository } from "../interface/chat/IChatRepository";
import BaseRepository from "../repositories/base_repository";

class ChatRepository extends BaseRepository<IChat> implements IChatRepository {
  constructor() {
    super(ChatModel);
  }

  async checkChat(receiverId: string, senderId: string): Promise<IChat | null> {
    try {
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
    } catch (error) {
      console.error("error in finding chat:", error);
      throw error;
    }
  }

  async createChat(
    receiverId: string,
    senderId: string
  ): Promise<IChat | null> {
    try {
      return await this.create({
        users: [senderId, receiverId],
      });
    } catch (error) {
      console.error("error in creating chat:", error);
      throw error;
    }
  }

  async getChat(userId: string): Promise<IChat[] | null> {
    try {
      return await ChatModel.find({
        users: { $elemMatch: { $eq: userId } },
      })
        .populate({ path: "users", select: "name email" })
        .populate("latestMessage")
        .sort({ updatedAt: -1 });
    } catch (error) {
      console.error("error in getting chat:", error);
      throw error;
    }
  }

  async latestMessage(
    chatId: string,
    message: Types.ObjectId
  ): Promise<IChat | null> {
    try {
      return await this.findByIdAndUpdate(chatId, {
        latestMessage: message,
      });
    } catch (error) {
      console.error("error in updating latest message:", error);
      throw error;
    }
  }
}

export default new ChatRepository();
