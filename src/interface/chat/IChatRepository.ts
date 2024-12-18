import {IChat} from '../../models/chat_model'
import {IMessage} from '../../models/message_model'
import { Types } from 'mongoose'


export interface IChatRepository {
    checkChat(receiverId:string,senderId:string):Promise<IChat | null>
    createChat(receiverId:string,senderId:string):Promise<IChat | null>
    newMessage(receiverId:string,senderId:string,message:string):Promise<IMessage | null>
    pushMessage(chatId:string,messageId:string):Promise<IChat | null>
    getChat(userId:string):Promise<IChat[] | null>
    sendMessage(newMessage:object):Promise<IMessage | null>
    latestMessage(chatId:string,message:Types.ObjectId):Promise<IChat | null>
    getMessage(chatId:string):Promise<IMessage[] | null>
}