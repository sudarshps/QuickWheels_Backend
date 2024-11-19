import OrderModel from "../models/orders";
import User from "../models/user_model";
import WalletModel from "../models/wallet_model";
import CarModel from "../models/car_model";

class OrderRepository {
  async successOrder(order: object) {
    const orderData = new OrderModel(order);
    return await orderData.save();
  }

  async getWallet(userId: string) {
    return await User.findById(userId).select("wallet").populate("wallet");
  }

  async deductMoney(walletId: string, amount: number, history: object) {
    return await WalletModel.findByIdAndUpdate(walletId, {
      $inc: { balance: -amount },
      $push: { history: history },
    });
  }

  async reserveCar(carId: string, toDate: Date, fromDate: Date) {
    return await CarModel.findByIdAndUpdate(carId, {
      reservedDateFrom: fromDate,
      reservedDateTo: toDate,
    });
  }

  async userOrders(userId: string) {
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

  async orderDetails(orderId: string) {
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

  async cancelOrder(orderId: string) {
    return await OrderModel.findByIdAndUpdate(orderId, { status: "cancelled" });
  }

  async cancelCarReservation(carId: string) {
    return await CarModel.findByIdAndUpdate(carId, {
      $unset: { reservedDateFrom: 1, reservedDateTo: 1 },
    });
  }

  async findWallet(userId: string) {
    return await User.findById(userId).select("wallet");
  }

  async refundAmount(walletId: string, history: object, amount: number) {
    return await WalletModel.findByIdAndUpdate(walletId, {
      $inc: { balance: amount },
      $push: { history: history }, 
    });
  }

  async hostDashboardOrder(hostId: string) {
    return await OrderModel.find()
      .populate({
        path: "carId",
        match: { userId: hostId },
      })
      .populate({path:"userId", select:"name address"});
  }

  async updateOrderReview(orderId:string,reviewId:string) {
    return await OrderModel.findByIdAndUpdate(orderId,{review:reviewId})
  }
}

export default new OrderRepository();
