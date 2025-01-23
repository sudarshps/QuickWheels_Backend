import {IOrder} from '../../models/orders'



interface OrderCancelType {
    isCancelled: boolean;
    message: string;
  }

  interface UserOrderType {
    totalPages : number;
    response:IOrder[] | null
  }


export interface IOrderService{
    successOrder(
        orderId: string,
        toDate: Date,
        fromDate: Date,
        carId: string,
        paymentId: string,
        method: string,
        amount: number,
        userId: string
      ): Promise<IOrder | undefined>
      userOrders(userId: string,pageNum:number,dataSize:number): Promise<UserOrderType | null>
      orderDetails(orderId: string): Promise<IOrder | null>
      cancelOrder(orderId: string): Promise<OrderCancelType>
      hostDashboardOrder(hostId:string):Promise<IOrder[] | null>
      
}