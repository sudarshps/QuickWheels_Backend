import { Request,Response } from "express";
import MessageService from '../services/message_service'
import {IMessageService} from '../interface/message/IMessageService'


class MessageController{
    constructor(private _messageService:IMessageService){}
    async sendMessage(req:Request,res:Response):Promise<void>{
        try {
            const{chatId,senderId,content} = req.body
            
           const message = await this._messageService.sendMessage(chatId,senderId,content)
            res.json(message)
        } catch (error) {
            console.error('error while send message',error);
            
        }
    }

    async getMessage(req:Request,res:Response):Promise<void>{
        try {
            const chatId = req.query.userChatId as string
            
            const message = await this._messageService.getMessage(chatId)
            res.json(message)
        } catch (error) {
            console.error('error while fetching messages',error);
            
        }
    }
}

export default new MessageController(MessageService)