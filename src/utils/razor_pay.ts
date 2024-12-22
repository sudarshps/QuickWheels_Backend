import Razorpay from 'razorpay'
import dotenv from 'dotenv'
import{Request,Response} from 'express'
import OrderController from '../controllers/order_controller'

dotenv.config() 


export const makeOrder = async(req:Request, res:Response) => {    

    const {totalAmount} = req.body
    const razorpay = new Razorpay({
        key_id: process.env.RAZOR_PAY_API_KEY as string,
           key_secret: process.env.RAZOR_PAY_KEY_SECRET
        })
       
        const options = {
            amount:totalAmount * 100,
            currency:'INR',
            receipt:"237t23rb32j",
            payment_capture:1
        }

        try {
            const response = await razorpay.orders.create(options)
        res.json({
            order_id: response.id,
            currency: response.currency,
            amount: response.amount,
        })
        } catch (error) {
            res.status(400).send('Not able to create order.Please try again!');
        }
}


export const refundOrder = async(req:Request,res:Response) => {
    try {
        const razorpay = new Razorpay({
            key_id: process.env.RAZOR_PAY_API_KEY as string,
               key_secret: process.env.RAZOR_PAY_KEY_SECRET
            })
        const {paymentId,amount,orderId} = req.body     
           
        const razorpayResponse = await razorpay.payments.refund(paymentId,{
            "amount":amount,
            "speed":"normal"
        })
        if(!razorpayResponse){
            res.json({
                cancelled:false,
                message:'order cancellation and refund to account was failed!'
            })
            return
        }
        const request = {
            body:{id:orderId,razorpayResponse}
        } as Request
        
         OrderController.cancelOrder(request,res)
         
       
        // res.json(razorpayResponse)
      } catch (error) {  
        console.log(error);
        res.status(400).send('unable to issue a refund')
      }
}


