import {IMessage} from '../../models/message_model'


export interface IMessageService{
    sendMessage(chatId:string,senderId:string,content:string):Promise<IMessage | null | undefined>
    getMessage(chatId:string):Promise<IMessage[] | null | undefined>
}