import {Router} from 'express'
import MessageController from '../controllers/message_controller'
import verifyUser from '../middlewares/auth_middlewares'


const routes:Router = Router()

routes.post('/sendmessage',verifyUser,MessageController.sendMessage.bind(MessageController))
routes.get('/getallmessage',verifyUser,MessageController.getMessage.bind(MessageController))


export default routes