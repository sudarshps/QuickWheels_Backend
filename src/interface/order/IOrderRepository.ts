import { IOrder } from "../../models/orders";
import { IUser } from "../../models/user_model";
import { IWallet } from "../../models/wallet_model";
import { ICar } from "../../models/car_model";

export interface IOrderRepository {
  successOrder(order: object): Promise<IOrder>;
  getWallet(userId: string): Promise<IUser | null>;
  deductMoney(
    walletId: string,
    amount: number,
    history: object
  ): Promise<IWallet | null>;
  reserveCar(carId: string, toDate: Date, fromDate: Date):Promise<ICar | null>
  userOrders(userId: string):Promise<IOrder[] | null>
  orderDetails(orderId: string):Promise<IOrder | null>
  cancelOrder(orderId: string):Promise<IOrder | null>
  cancelCarReservation(carId: string):Promise<ICar | null>
  findWallet(userId: string):Promise<IUser | null>
  refundAmount(walletId: string, history: object, amount: number):Promise<IWallet | null>
  hostDashboardOrder(hostId: string):Promise<IOrder[] | null>
  updateOrderReview(orderId: string, reviewId: string): Promise<IOrder | null>;
}
