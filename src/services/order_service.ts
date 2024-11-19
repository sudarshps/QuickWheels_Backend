import { IOrder } from "../models/orders";
import OrderRepository from '../repositories/order_repository'

interface OrderCancelType {
  isCancelled: boolean;
  message: string;
}

class OrderService {
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
        const response = await OrderRepository.successOrder(order);
        if (!response) {
          return undefined;
        }
    
        // wallet money deduction
        if (method === "wallet") {
    
          const getWallet = await OrderRepository.getWallet(userId);
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
    
          const moneyDeducted = await OrderRepository.deductMoney(
            walletId,
            amount,
            history
          );
    
          if (!moneyDeducted) {
            return undefined;
          }
          const reserveCar = await OrderRepository.reserveCar(
            carId,
            toDate,
            fromDate
          );
          
          if (!reserveCar) {
            return undefined;
          }
          return response;
        }
        const reserveCar = await OrderRepository.reserveCar(carId, toDate, fromDate);
        if (!reserveCar) {
          return undefined;
        }
        return response;
      }

      async userOrders(userId: string): Promise<IOrder[] | null> {
        return await OrderRepository.userOrders(userId);
      }

      async orderDetails(orderId: string): Promise<IOrder | null> {
        return await OrderRepository.orderDetails(orderId);
      }
 

      async cancelOrder(orderId: string): Promise<OrderCancelType> {
        const response = await OrderRepository.cancelOrder(orderId);
        if (!response) {
          return {
            isCancelled: false,
            message: "Order was not cancelled",
          };
        }
        // removing the reserved date from car model
        const carId = response.carId.toString();
        const updateCarDetails = await OrderRepository.cancelCarReservation(carId);
    
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
        const getWalletId = await OrderRepository.findWallet(userId);
    
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
    
        const refundAmount = await OrderRepository.refundAmount(
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
      }

      async hostDashboardOrder(hostId:string):Promise<IOrder[] | null> {
        const response = await OrderRepository.hostDashboardOrder(hostId)
        return response.filter(order=>order.carId !== null)
      }
}

export default new OrderService()