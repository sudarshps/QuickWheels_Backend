import {Router} from 'express'
import ChatController from '../controllers/chat_controller'
import verifyUser from '../middlewares/auth_middlewares'


const routes:Router = Router()

routes.post('/accesschat',verifyUser,ChatController.accessChat)
routes.get('/getchat',verifyUser,ChatController.getChat)
routes.post('/sendmessage',verifyUser,ChatController.sendMessage)
routes.get('/getallmessage',verifyUser,ChatController.getMessage)


export default routes