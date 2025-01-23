import { IOrderRepository } from "../interface/order/IOrderRepository";
import { IOrder } from "../models/orders";
import OrderRepository from '../repositories/order_repository'
import {IOrderService} from '../interface/order/IOrderService'
import { IUserRepository } from "../interface/user/IUserRepository";
import user_repository from "../repositories/user_repository";
import { ICarRepository } from "../interface/car/ICarRepository";
import car_repository from "../repositories/car_repository";


interface OrderCancelType {
  isCancelled: boolean;
  message: string;
}

interface UserOrderType {
  totalPages : number;
  response:IOrder[] | null
}

class OrderService implements IOrderService{

  constructor(private _orderRepository:IOrderRepository,
    private _userRepository:IUserRepository,
    private _carRepository:ICarRepository
  ){}
    async successOrder(
        orderId: string,
        toDate: Date,
        fromDate: Date,
        carId: string,
        paymentId: string,
        method: string,
        amount: number,
        userId: string
      ): Promise<IOrder | undefined> {
        try {
          let orderAmount = amount
        if(method==='razorpay'){
          orderAmount = amount/100
        }
        
        const order = {
          orderId: orderId,
          carId: carId,
          amount: orderAmount,
          pickUpDate: fromDate,
          dropOffDate: toDate,
          userId: userId,
          paymentId: paymentId,
          method: method,
          status: "success",
        };
        const response = await this._orderRepository.successOrder(order);
        if (!response) {
          return undefined;
        }
    
        // wallet money deduction
        if (method === "wallet") {
    
          const getWallet = await this._userRepository.getWallet(userId);
          const walletId = getWallet?.wallet._id.toString();
          if (!walletId) {
            return undefined;
          }
          const history = {
            date: new Date(),
            type: "Debit",
            amount: amount,
            reason: "Order Placed",
          };
    
          const moneyDeducted = await this._orderRepository.deductMoney(
            walletId,
            amount,
            history
          );
    
          if (!moneyDeducted) {
            return undefined;
          }
          const reserveCar = await this._carRepository.reserveCar(
            carId,
            toDate,
            fromDate
          );
          
          if (!reserveCar) {
            return undefined;
          }
          return response;
        }
        const reserveCar = await this._carRepository.reserveCar(carId, toDate, fromDate);
        if (!reserveCar) {
          return undefined;
        }
        return response;
        } catch (error) {
          console.error('error while order creation!');
          throw error
        }
        
      }

      async userOrders(userId: string,pageNum:number,dataSize:number): Promise<UserOrderType | null> {
        try {
          let response =  await this._orderRepository.userOrders(userId);
          const startIndex = (pageNum-1) * dataSize
          const endIndex = pageNum * dataSize
          let totalPages = 0
          if(response && response.length){
            totalPages = Math.ceil(response?.length/dataSize)
            response = response?.slice(startIndex,endIndex)
          }
          return{
            totalPages,
            response
          }
        } catch (error) {
          console.error('error in user orders!');
          throw error
        }
      }

      async orderDetails(orderId: string): Promise<IOrder | null> {
        try {
          return await this._orderRepository.orderDetails(orderId);
        } catch (error) {
          console.error('error in fetching order details!');
          throw error
        }
      }
 

      async cancelOrder(orderId: string): Promise<OrderCancelType> {
        try {
          const response = await this._orderRepository.cancelOrder(orderId);
        if (!response) {
          return {
            isCancelled: false,
            message: "Order was not cancelled",
          };
        }
        // removing the reserved date from car model
        const carId = response.carId.toString();
        const updateCarDetails = await this._carRepository.cancelCarReservation(carId);
    
        if (!updateCarDetails) {
          return {
            isCancelled: false,
            message: "Order was not cancelled",
          };
        }
        const amount = response.amount;
        const userId = response.userId.toString();
        const reason = "Cancelled the order";
        const refundDate = new Date();
        const getWalletId = await this._userRepository.findWallet(userId);
    
        const history = {
          date: refundDate,
          type: "Credit",
          amount: amount,
          reason: reason, 
        };
        if (!getWalletId) {
          return {
            isCancelled: false,
            message: "refund error",
          };
        }
        const walletId = getWalletId.wallet.toString();
    
        const refundAmount = await this._orderRepository.refundAmount(
          walletId,
          history,
          amount
        );
    
        if (!refundAmount) {
          return {
            isCancelled: false,
            message: "refund error",
          };
        }
        return {
          isCancelled: true,
          message: "Order cancellation successful",
        };
        } catch (error) {
          console.error('error while cancelling order!');
          throw error
        }
      }

      async hostDashboardOrder(hostId:string):Promise<IOrder[] | null> {
        try {
          const response = await this._orderRepository.hostDashboardOrder(hostId)
        if(response){
          return response.filter(order=>order.carId !== null)
        }
        return null
        } catch (error) {
          console.error('error in host dashboard order!');
          throw error
        }
      }
}

export default new OrderService(OrderRepository,user_repository,car_repository)