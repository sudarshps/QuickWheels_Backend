import { IMessageService } from "../interface/message/IMessageService";
import { IMessage } from '../models/message_model'
import { Types } from 'mongoose'
import {IMessageRepository} from '../interface/message/IMessageRepository'
import {IChatRepository} from '../interface/chat/IChatRepository'
import MessageRepository from '../repositories/message_repository'
import ChatRepository from '../repositories/chat_repository'


class MessageService implements IMessageService{
    constructor(private _messageRepository:IMessageRepository,
        private _chatRepository:IChatRepository){}
    async sendMessage(chatId:string,senderId:string,content:string):Promise<IMessage | null | undefined> {
            try {
                const newMessage = {
                    sender:senderId,
                    chat:chatId,
                    content
                }
                const message = await this._messageRepository.sendMessage(newMessage)
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
                return await this._messageRepository.getMessage(chatId)
            } catch (error) {
                console.error('error while fetching message list',error);
                
            }
        }
}

export default new MessageService(MessageRepository,ChatRepository)