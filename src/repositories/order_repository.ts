import OrderModel, { IOrder } from "../models/orders";
import WalletModel, { IWallet } from "../models/wallet_model";
import { IOrderRepository } from "../interface/order/IOrderRepository";

class OrderRepository implements IOrderRepository {
  async successOrder(order: object):Promise<IOrder> {
    const orderData = new OrderModel(order);
    return await orderData.save();
  }

  async deductMoney(walletId: string, amount: number, history: object):Promise<IWallet | null> {
    return await WalletModel.findByIdAndUpdate(walletId, {
      $inc: { balance: -amount },
      $push: { history: history },
    });
  }

  async userOrders(userId: string):Promise<IOrder[] | null> {
    return await OrderModel.find({ userId: userId })
      .populate({
        path: "carId",
        populate: [
          {
            path: "make",
          },
          { path: "userId" },
        ],
      })
      .exec();
  }

  async orderDetails(orderId: string):Promise<IOrder | null> {
    return await OrderModel.findById(orderId)
      .populate([
        {
          path: "carId",
          populate: [
            {
              path: "make",
            },
            {
              path: "userId",
              select:"name email phone"
            },
          ],
        },
        { path: "userId" },
      ])
      .exec();
  }

  async cancelOrder(orderId: string):Promise<IOrder | null> {
    return await OrderModel.findByIdAndUpdate(orderId, { status: "cancelled" });
  }

  async refundAmount(walletId: string, history: object, amount: number):Promise<IWallet | null> {
    return await WalletModel.findByIdAndUpdate(walletId, {
      $inc: { balance: amount },
      $push: { history: history }, 
    });
  }

  async hostDashboardOrder(hostId: string):Promise<IOrder[] | null> {
    return await OrderModel.find()
      .populate({
        path: "carId",
        match: { userId: hostId },
      })
      .populate({path:"userId", select:"name address"});
  }

  async updateOrderReview(orderId:string,reviewId:string):Promise<IOrder | null> {
    return await OrderModel.findByIdAndUpdate(orderId,{review:reviewId})
  }
}

export default new OrderRepository();
