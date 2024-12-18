import { Types } from 'mongoose'
import ChatModel,{IChat} from '../models/chat_model'
import MessageModel,{IMessage} from '../models/message_model'
import {IChatRepository} from '../interface/chat/IChatRepository'

class ChatRepository implements IChatRepository{
    async checkChat(receiverId:string,senderId:string):Promise<IChat | null> {
        return await ChatModel.findOne({
            $and:[
                {users:{$elemMatch:{$eq:senderId}}},
                {users:{$elemMatch:{$eq:receiverId}}}
            ]
        }).populate({path:'users',select:'name email'}).populate({path:'latestMessage.sender',select:'name email'})
    }
    
    async createChat(receiverId:string,senderId:string):Promise<IChat | null> {
        return await ChatModel.create({
            users:[senderId,receiverId],
            
        })
    } 

    async newMessage(receiverId:string,senderId:string,message:string):Promise<IMessage | null> {
        
        return await MessageModel.create({
            sender:senderId,
            receiver:receiverId,
            content:message
        })as IMessage
    }

    async pushMessage(chatId:string,messageId:string):Promise<IChat | null> {
        return await ChatModel.findByIdAndUpdate(chatId,{$push:{messages:messageId}})
    }

    async getChat(userId:string):Promise<IChat[] | null> {
        return await ChatModel.find({ 
            users:{$elemMatch:{$eq:userId}}
        }).populate({path:'users',select:'name email'}).populate('latestMessage').sort({updatedAt:-1})
    }

    async sendMessage(newMessage:object):Promise<IMessage | null>{
        let message = await MessageModel.create(newMessage)
        message = await message.populate('sender','name email')
        message = await message.populate('chat')
        return message
    }

    async latestMessage(chatId:string,message:Types.ObjectId):Promise<IChat | null>{
        return await ChatModel.findByIdAndUpdate(chatId,{latestMessage:message})
    }

    async getMessage(chatId:string):Promise<IMessage[] | null> {
        return await MessageModel.find({chat:chatId}).populate('sender','name email').populate('chat')
    }
}

export default new ChatRepository()