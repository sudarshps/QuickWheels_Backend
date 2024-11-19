import mongoose, {Document,Schema} from 'mongoose'


export interface ICarMakeCategory extends Document {
    name:string;
}

const carMakeSchema:Schema<ICarMakeCategory> = new mongoose.Schema({
    name:{type:String,required:true}
})

const CarMake = mongoose.model<ICarMakeCategory>('CarMake',carMakeSchema)

export default CarMake