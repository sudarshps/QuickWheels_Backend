import {IChat} from '../../models/chat_model'

export interface IChatService {
    accessChat(receiverId:string,senderId:string):Promise<IChat | undefined| null>
    getChat(userId:string):Promise<IChat[] | undefined | null>
}