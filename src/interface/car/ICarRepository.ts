import {ICar} from '../../models/car_model'
import { ICarMakeCategory } from "../../models/carmake-category_model";
import { ICarTypeCategory } from "../../models/cartype-category_model";

export interface ICarRepository{
    editCarDetails(carId:string,editedDetails:object,images:string[]|undefined,isVerified:boolean,status:string):Promise<ICar | null>
      carDetails(   
        email: string,
        carData: object,
        isVerified: boolean,
        status: string,
        isActive: boolean
      ): Promise<ICar | null>
      getCarDetails(email: string): Promise<ICar[] | null>
      reserveCar(carId: string, toDate: Date, fromDate: Date):Promise<ICar | null>
      getRentCarDetails(): Promise<ICar[] | null>
      userCarDetails(id: string): Promise<ICar | null>
      cancelCarReservation(carId: string):Promise<ICar | null>
      getCarDistance(
        lng: number,
        lat: number,
        distanceValue: number
      ): Promise<ICar[] | null>
      getCarMake(): Promise<ICarMakeCategory[]>
      getCarType(): Promise<ICarTypeCategory[]>
      setCarDate(
        dateFrom: Date,
        dateTo: Date,
        carId: string
      ): Promise<ICar | null>
      removeHostCar(carId: string): Promise<ICar | null>

}