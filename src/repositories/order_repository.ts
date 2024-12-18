import OrderModel, { IOrder } from "../models/orders";
import User, { IUser } from "../models/user_model";
import WalletModel, { IWallet } from "../models/wallet_model";
import CarModel, { ICar } from "../models/car_model";
import { IOrderRepository } from "../interface/order/IOrderRepository";

class OrderRepository implements IOrderRepository {
  async successOrder(order: object):Promise<IOrder> {
    const orderData = new OrderModel(order);
    return await orderData.save();
  }

  async getWallet(userId: string):Promise<IUser | null> {
    return await User.findById(userId).select("wallet").populate("wallet");
  }

  async deductMoney(walletId: string, amount: number, history: object):Promise<IWallet | null> {
    return await WalletModel.findByIdAndUpdate(walletId, {
      $inc: { balance: -amount },
      $push: { history: history },
    });
  }

  async reserveCar(carId: string, toDate: Date, fromDate: Date):Promise<ICar | null> {
    return await CarModel.findByIdAndUpdate(carId, {
      reservedDateFrom: fromDate,
      reservedDateTo: toDate,
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

  async cancelCarReservation(carId: string):Promise<ICar | null> {
    return await CarModel.findByIdAndUpdate(carId, {
      $unset: { reservedDateFrom: 1, reservedDateTo: 1 },
    });
  }

  async findWallet(userId: string):Promise<IUser | null> {
    return await User.findById(userId).select("wallet");
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
