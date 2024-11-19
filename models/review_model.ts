import mongoose,{Document,ObjectId,Schema} from 'mongoose'

export interface IReview extends Document {
    reviewerId:ObjectId;
    carId:ObjectId;
    rating:number;
    feedback:string;
}

const reviewSchema: Schema<IReview> = new mongoose.Schema({
    reviewerId:{type:Schema.Types.ObjectId,ref:'User',required:true},
    carId:{type:Schema.Types.ObjectId,ref:'CarModel',required:true},
    rating:{type:Number,required:true},
    feedback:{type:String}
},{timestamps:true})

const ReviewModel = mongoose.model<IReview>('ReviewModel',reviewSchema)

export default ReviewModel