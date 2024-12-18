import { Request,Response } from "express";
import OrderService from '../services/order_service'
import { IOrderService } from "../interface/order/IOrderService";

class OrderController{
  constructor(private _orderService:IOrderService){}
    async successOrder(req:Request,res:Response):Promise<void> {
        try {     
          const {orderId,toDate,fromDate,carId,paymentId,method,amount,userId} = req.body
          const response = await this._orderService.successOrder(orderId,toDate,fromDate,carId,paymentId,method,amount,userId)  
          res.json(response)
        } catch (error) {
          console.error('error in posting success order!',error);
        }
      }

      async userOrders(req:Request,res:Response):Promise<void> {
        try {
          const userId = req.query.userId as string 
          const response = await this._orderService.userOrders(userId)            
          res.json(response)
        } catch (error) {
          console.error('error in fetching user orders',error);
        }     
      }

      async orderDetails(req:Request,res:Response):Promise<void> {
        try {
          const orderId = req.query.orderId as string          
          const response = await this._orderService.orderDetails(orderId)                
          res.json(response)
        } catch (error) {
          console.error('error while getting order details',error);
        }
      } 
  
      async cancelOrder(req:Request,res:Response):Promise<void>{
        try {
          const orderId = req.body.id as string
          const razorpayResponse = req.body.razorpayResponse
          const response = await this._orderService.cancelOrder(orderId)
          res.json({response,razorpayResponse})
        } catch (error) {
          console.error('error in cancelling order',error); 
        }
      }

      async hostDashboardOrder(req:Request,res:Response):Promise<void>{
        try { 
          const hostId = req.query.hostId as string
          const response = await this._orderService.hostDashboardOrder(hostId)
          res.json(response)
        } catch (error) {
          console.error('error while fetching host orders',error);
           
        }
      }

}

export default new OrderController(OrderService)