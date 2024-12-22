import { IMessage } from "../../models/message_model";


export interface IMessageRepository{
    sendMessage(newMessage:object):Promise<IMessage | null>
    getMessage(chatId:string):Promise<IMessage[] | null>

}