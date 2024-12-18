import { Types } from 'mongoose'
import { IChat } from '../models/chat_model'
import { IMessage } from '../models/message_model'
import ChatRepository from '../repositories/chat_repository'
import { IChatRepository } from '../interface/chat/IChatRepository'
import {IChatService} from '../interface/chat/IChatService'

class ChatService implements IChatService{
    constructor(private _chatRepository:IChatRepository){}
    async accessChat(receiverId:string,senderId:string):Promise<IChat | undefined| null> {
        try {
            let chat = await this._chatRepository.checkChat(receiverId,senderId)
 
            if(!chat){
                 const createChat = await this._chatRepository.createChat(receiverId,senderId)
                 chat = await this._chatRepository.checkChat(receiverId,senderId)
            }
            return chat 
           
        } catch (error) {
            console.error('error in sending message',error);
        }
    }

    async getChat(userId:string):Promise<IChat[] | undefined | null>{
        try {            
            let chats = await this._chatRepository.getChat(userId)            
            if(!chats){
                return null
            }
            chats = chats?.map(chat => {
                const chatObject = chat.toObject(); // Convert Mongoose object to plain JS object
                chatObject.users = chatObject.users.filter((user: any) => user._id.toString() !== userId); // Exclude the logged-in user
                return chatObject;
            })
            
            return chats
        } catch (error) {
            console.error('error while fetching messages',error);
        }
    }

    async sendMessage(chatId:string,senderId:string,content:string):Promise<IMessage | null | undefined> {
        try {
            const newMessage = {
                sender:senderId,
                chat:chatId,
                content
            }
            const message = await this._chatRepository.sendMessage(newMessage)
            if(!message){
                return null
            }
            const messageId = new Types.ObjectId(message._id)
            const latestMessage = await this._chatRepository.latestMessage(chatId,messageId)
            if(!latestMessage){
                return null
            }
            return message
        } catch (error) {
            console.error('error in sending message',error);
            
        }
    }

    async getMessage(chatId:string):Promise<IMessage[] | null | undefined>{
        try {
            return await this._chatRepository.getMessage(chatId)
        } catch (error) {
            console.error('error while fetching message list',error);
            
        }
    }
}


export default new ChatService(ChatRepository)

