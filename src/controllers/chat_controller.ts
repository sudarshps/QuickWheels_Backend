import { Request,Response } from "express";
import ChatService from '../services/chat_service'
import { IChatService } from "../interface/chat/IChatService";

class ChatController {
    constructor(private _chatService:IChatService){}
    async accessChat(req:Request,res:Response):Promise<void> {
        try {
            const {receiverId,senderId} = req.body            
            const chat = await this._chatService.accessChat(receiverId,senderId)
            res.json(chat)
        } catch (error) {
            console.error('error in creating chat room',error);
        }
    }

    async getChat(req:Request,res:Response):Promise<void> {
        try {             
            const userId = req.query.userId as string            
            const messages = await this._chatService.getChat(userId)                        
            res.json(messages)
        } catch (error) {
            console.error('erron while fetching message details',error);
        }
    } 

}

export default new ChatController(ChatService)