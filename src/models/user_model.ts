import { ObjectId } from "mongodb";
import mongoose, { Date, Document, Number, Schema } from "mongoose";

interface ILocation {
  type: "Point";
  coordinates: [number, number];
}

export interface IUser extends Document {
  _id?: ObjectId;
  name: string;
  email: string;
  password: string;
  dob: string;
  phone: string;
  drivingExpDate: string;
  address: string;
  location: ILocation;
  drivingID: string;
  drivingIDFront: string;
  drivingIDBack: string;
  isHost: Boolean;
  isVerified: Boolean;
  profileUpdated: Boolean;
  profileImage: string;
  status: string;
  note:string;
  isActive:Boolean;
  role:string[];
  orders:string[];
  approvedHost: Boolean;
  wallet:ObjectId
}

const userSchema: Schema<IUser> = new Schema(
  {
    name: { type: String },
    email: { type: String, required: true },
    password: { type: String },
    dob: { type: String },
    phone: { type: String },
    drivingExpDate: { type: String },
    address: { type: String },
    location: {
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
      },
    },
    drivingID: { type: String },
    drivingIDFront: { type: String },
    drivingIDBack: { type: String },
    isHost: { type: Boolean },
    isVerified: { type: Boolean },
    profileUpdated: { type: Boolean },
    profileImage: { type: String },
    status: { type: String },
    note: {type:String},
    role:{type:[String]},
    orders:{type:[String]},
    isActive:{type:Boolean},
    approvedHost: { type: Boolean },
    wallet:{type:Schema.Types.ObjectId,ref:'Wallet'}
  },
  { timestamps: true }
);

userSchema.index({ location: "2dsphere" });
const User = mongoose.model<IUser>("User", userSchema);

export default User;
