import { Request,Response } from "express";
import ChatService from '../services/chat_service'

class ChatController {
    async accessChat(req:Request,res:Response):Promise<void> {
        try {
            const {receiverId,senderId} = req.body            
            const chat = await ChatService.accessChat(receiverId,senderId)
            res.json(chat)
        } catch (error) {
            console.error('error in creating chat room',error);
        }
    }

    async getChat(req:Request,res:Response):Promise<void> {
        try {             
            const userId = req.query.userId as string            
            const messages = await ChatService.getChat(userId)                        
            res.json(messages)
        } catch (error) {
            console.error('erron while fetching message details',error);
        }
    } 

    async sendMessage(req:Request,res:Response):Promise<void>{
        try {
            const{chatId,senderId,content} = req.body
            
           const message = await ChatService.sendMessage(chatId,senderId,content)
            res.json(message)
        } catch (error) {
            console.error('error while send message',error);
            
        }
    }

    async getMessage(req:Request,res:Response):Promise<void>{
        try {
            const chatId = req.query.userChatId as string
            
            const message = await ChatService.getMessage(chatId)
            res.json(message)
        } catch (error) {
            console.error('error while fetching messages',error);
            
        }
    }
}

export default new ChatController()