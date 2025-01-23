import OrderModel, { IOrder } from "../models/orders";
import WalletModel, { IWallet } from "../models/wallet_model";
import { IOrderRepository } from "../interface/order/IOrderRepository";

class OrderRepository implements IOrderRepository {
  async successOrder(order: object):Promise<IOrder> {
    try {
      const orderData = new OrderModel(order);
    return await orderData.save();
    } catch (error) {
      console.error('error in making order:',error);
      throw error
    }
    
  }

  async deductMoney(walletId: string, amount: number, history: object):Promise<IWallet | null> {
    try {
      return await WalletModel.findByIdAndUpdate(walletId, {
        $inc: { balance: -amount },
        $push: { history: history },
      });
    } catch (error) {
      console.error('error in deduct money:',error);
      throw error
    }
    
  }

  async userOrders(userId: string):Promise<IOrder[] | null> {
    try {
      return await OrderModel.find({ userId: userId }).sort({_id:-1})
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
    } catch (error) {
      console.error('error in finding user orders:',error);
      throw error
    }
  }

  async orderDetails(orderId: string):Promise<IOrder | null> {
    try {
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
    } catch (error) {
      console.error('error in finding order details:',error);
      throw error
    }
   
  }

  async cancelOrder(orderId: string):Promise<IOrder | null> {
    try {
      return await OrderModel.findByIdAndUpdate(orderId, { status: "cancelled" });
    } catch (error) {
      console.error('error in cancelling order:',error);
      throw error
    }
  }

  async refundAmount(walletId: string, history: object, amount: number):Promise<IWallet | null> {
    try {
      return await WalletModel.findByIdAndUpdate(walletId, {
        $inc: { balance: amount },
        $push: { history: history }, 
      });
    } catch (error) {
      console.error('error in refund order:',error);
      throw error
    }
    
  }

  async hostDashboardOrder(hostId: string):Promise<IOrder[] | null> {
    try {
      return await OrderModel.find()
      .populate({
        path: "carId",
        match: { userId: hostId },
      })
      .populate({path:"userId", select:"name address"});
    } catch (error) {
      console.error('error in finding host dashboard order:',error);
      throw error
    }
    
  }

  async updateOrderReview(orderId:string,reviewId:string):Promise<IOrder | null> {
    try {
      return await OrderModel.findByIdAndUpdate(orderId,{review:reviewId})
    } catch (error) {
      console.error('error in updating order review:',error);
      throw error
    }
  }
}

export default new OrderRepository();
