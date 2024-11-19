import mongoose, {Document,Schema} from 'mongoose'


export interface ICarTypeCategory extends Document {
    name:string;
}

const carTypeSchema:Schema<ICarTypeCategory> = new mongoose.Schema({
    name:{type:String,required:true}
})

const CarType = mongoose.model<ICarTypeCategory>('CarType',carTypeSchema)

export default CarType