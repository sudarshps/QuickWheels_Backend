import {Router} from 'express'
import verifyUser from '../middlewares/auth_middlewares'
import {makeOrder,refundOrder} from '../utils/razor_pay'
import OrderController from '../controllers/order_controller'

const router: Router = Router()

 
router.post('/successorder',verifyUser,OrderController.successOrder)
router.get('/userorders',verifyUser,OrderController.userOrders)
router.get('/orderdetails',verifyUser,OrderController.orderDetails)  
router.put('/cancelorder',verifyUser,OrderController.cancelOrder)
router.get('/hostdashboardorders',verifyUser,OrderController.hostDashboardOrder)

//razor pay
router.post('/order',verifyUser,makeOrder)
router.post('/refund',verifyUser,refundOrder)

export default router