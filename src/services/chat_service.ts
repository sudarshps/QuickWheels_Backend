import { IChat } from '../models/chat_model'
import ChatRepository from '../repositories/chat_repository'
import { IChatRepository } from '../interface/chat/IChatRepository'
import {IChatService} from '../interface/chat/IChatService'

class ChatService implements IChatService{
    constructor(private _chatRepository:IChatRepository){}
    async accessChat(receiverId:string,senderId:string):Promise<IChat | undefined| null> {
        try {
            let chat = await this._chatRepository.checkChat(receiverId,senderId)
 
            if(!chat){
                 const createChat = await this._chatRepository.createChat(receiverId,senderId)
                 chat = await this._chatRepository.checkChat(receiverId,senderId)
            }
            return chat 
           
        } catch (error) {
            console.error('error in sending message',error); 
        }
    }

    async getChat(userId:string):Promise<IChat[] | undefined | null>{
        try {            
            let chats = await this._chatRepository.getChat(userId)            
            if(!chats){
                return null
            }
            chats = chats?.map(chat => {
                const chatObject = chat.toObject();
                chatObject.users = chatObject.users.filter((user: any) => user._id.toString() !== userId); 
                return chatObject;
            })
            
            return chats
        } catch (error) {
            console.error('error while fetching messages',error);
        }
    }
}


export default new ChatService(ChatRepository)

