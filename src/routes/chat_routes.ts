import {Router} from 'express'
import ChatController from '../controllers/chat_controller'
import verifyUser from '../middlewares/auth_middlewares'


const routes:Router = Router()

routes.post('/accesschat',verifyUser,ChatController.accessChat.bind(ChatController))
routes.get('/getchat',verifyUser,ChatController.getChat.bind(ChatController))


export default routes