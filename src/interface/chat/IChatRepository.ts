import {IChat} from '../../models/chat_model'
import { Types } from 'mongoose'


export interface IChatRepository {
    checkChat(receiverId:string,senderId:string):Promise<IChat | null>
    createChat(receiverId:string,senderId:string):Promise<IChat | null>
    getChat(userId:string):Promise<IChat[] | null>
    latestMessage(chatId:string,message:Types.ObjectId):Promise<IChat | null>
}