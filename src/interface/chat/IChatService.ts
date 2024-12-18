import {IChat} from '../../models/chat_model'
import {IMessage} from '../../models/message_model'

export interface IChatService {
    accessChat(receiverId:string,senderId:string):Promise<IChat | undefined| null>
    getChat(userId:string):Promise<IChat[] | undefined | null>
    sendMessage(chatId:string,senderId:string,content:string):Promise<IMessage | null | undefined>
    getMessage(chatId:string):Promise<IMessage[] | null | undefined>
    
}