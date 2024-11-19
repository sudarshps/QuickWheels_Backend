import mongoose,{Document,Schema} from 'mongoose'

export interface IPayment extends Document {
    status:string;
    method:string;

}

const paymentSchema: Schema<IPayment> = new mongoose.Schema({
    status:{type:String,required:true},
    method:{type:String,required:true}
},{timestamps:true}) 


const PaymentModel = mongoose.model<IPayment>('PaymentModel',paymentSchema)

export default PaymentModel
