import { IOrder } from "../../models/orders";
import { IWallet } from "../../models/wallet_model";

export interface IOrderRepository {
  successOrder(order: object): Promise<IOrder>;
  deductMoney(
    walletId: string,
    amount: number,
    history: object
  ): Promise<IWallet | null>;
  userOrders(userId: string):Promise<IOrder[] | null>
  orderDetails(orderId: string):Promise<IOrder | null>
  cancelOrder(orderId: string):Promise<IOrder | null>
  refundAmount(walletId: string, history: object, amount: number):Promise<IWallet | null>
  hostDashboardOrder(hostId: string):Promise<IOrder[] | null>
  updateOrderReview(orderId: string, reviewId: string): Promise<IOrder | null>;
}
