import {Router} from 'express'
import verifyUser from '../middlewares/auth_middlewares'
import {makeOrder,refundOrder} from '../utils/razor_pay'
import OrderController from '../controllers/order_controller'

const router: Router = Router()

 
router.post('/successorder',verifyUser,OrderController.successOrder.bind(OrderController))
router.get('/userorders',verifyUser,OrderController.userOrders.bind(OrderController))
router.get('/orderdetails',verifyUser,OrderController.orderDetails.bind(OrderController))  
router.put('/cancelorder',verifyUser,OrderController.cancelOrder.bind(OrderController))
router.get('/hostdashboardorders',verifyUser,OrderController.hostDashboardOrder.bind(OrderController))

//razor pay
router.post('/order',verifyUser,makeOrder)
router.post('/refund',verifyUser,refundOrder)

export default router