import { ObjectId } from 'mongodb'
import mongoose,{Document,Schema} from 'mongoose'
import { ICarMakeCategory } from './carmake-category_model';
import { ICarTypeCategory } from './cartype-category_model';

interface ILocation {   
    type: "Point";
    coordinates: [number, number];
  }


export interface ICar extends Document{
    _id:ObjectId
    userId:ObjectId,
    make:ObjectId | ICarMakeCategory,
    carModel:string,
    carType:ObjectId | ICarTypeCategory,
    transmission:string,
    seatCapacity:string,
    rentAmount:string,
    registerNumber:string,
    insuranceExp:string,
    fuel:string,
    features:[string],
    RCDoc:string,
    InsuranceDoc:string,
    location:ILocation,
    address:string,
    isVerified:boolean,
    status:string,
    availabilityFrom:Date,
    availabilityTo:Date,
    reservedDateFrom:Date,
    reservedDateTo:Date,
    note:string,
    isActive:boolean,
    images:[string]
}


const carSchema:Schema<ICar> = new Schema({
    userId:{type:Schema.Types.ObjectId,ref:'User',required:true},
    make:{type:Schema.Types.ObjectId,ref:'CarMake',required:true},
    carModel:{type:String,required:true},
    carType:{type:Schema.Types.ObjectId,ref:'CarType',required:true},
    transmission:{type:String,required:true},
    seatCapacity:{type:String,required:true},
    rentAmount:{type:String,required:true},
    registerNumber:{type:String,required:true},
    insuranceExp:{type:String,required:true},
    fuel:{type:String,required:true},
    features:{type:[String],required:true},
    RCDoc:{type:String,required:true},
    InsuranceDoc:{type:String,required:true},
    location:{
        type: {
          type: String,
          enum: ["Point"],
        },
        coordinates: {
          type: [Number],
        },
      },
      address:{type:String},
    isVerified:{type:Boolean,required:true},
    status:{type:String,required:true},
    availabilityFrom:{type:Date},
    availabilityTo:{type:Date},
    reservedDateFrom:{type:Date},
    reservedDateTo:{type:Date},
    note:{type:String},
    isActive:{type:Boolean},
    images:{type:[String],required:true}
},{timestamps:true})


carSchema.index({ location: "2dsphere" });

const CarModel = mongoose.model<ICar>('CarModel',carSchema)

export default CarModel