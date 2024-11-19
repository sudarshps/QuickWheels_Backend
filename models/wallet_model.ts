import {ObjectId} from 'mongodb'
import mongoose, {Document,Schema} from 'mongoose'

export interface IWallet extends Document{
    _id:ObjectId,
    balance:number,
    history:[object]

}


const walletSchema:Schema<IWallet> = new Schema({
    balance:{type:Number,default:0},
    history:[{
        date:{
            type:Date
        },
        type:{
            type:String
        },
        amount:{
            type:Number
        },
        reason:{ 
            type:String
        }
    }]
})


const walletModel = mongoose.model<IWallet>('Wallet',walletSchema)
export default walletModel