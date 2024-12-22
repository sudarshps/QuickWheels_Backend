import {ICar} from '../../models/car_model'
import { ICarMakeCategory } from '../../models/carmake-category_model';
import { ICarTypeCategory } from '../../models/cartype-category_model';


interface EditedCarDetailsType {
    make?:string,
    carModel?:string,
    carType?:string,
    transmission?:string,
    fuel?:string,
    seatCapacity?:string,
    rentAmount?:number,
    registerNumber?:string,
    insuranceExp?:Date,
    images?:string[],
    RCDoc?:string,
    InsuranceDoc?:string
  }

  interface CarDetailsResponse {
    updatedCarDetails: boolean;
    message?: string;
  }

  type ICarWithHostName = ICar & {
    hostName?: string;
  };

  interface CarStatus {
    isRemoved: boolean;
    message: string;
  }

  interface CarDetailsResponse {
    updatedCarDetails: boolean;
    message?: string;
  }

  
  interface EditedCarDetailsType {
    make?:string,
    carModel?:string,
    carType?:string,
    transmission?:string,
    fuel?:string,
    seatCapacity?:string,
    rentAmount?:number,
    registerNumber?:string,
    insuranceExp?:Date,
    images?:string[],
    RCDoc?:string,
    InsuranceDoc?:string
  }


  

export interface ICarService{
    editCarDetails(carId:string,editedDetails:EditedCarDetailsType,isVerified:boolean,status:string):Promise<ICar | null>
    carDetails(
        email: string,
        carData: object,
        isVerified: boolean,
        status: string,
        isActive: boolean
      ): Promise<CarDetailsResponse>
      getCarDetails(email: string): Promise<ICar[] | null>
      rentCarDetails(
        userId: string,
        sort: string,
        transmission: string[],
        fuel: string[],
        seat: string[],
        lng: number,
        lat: number,
        distanceValue: number,
        searchInput: string,
        carType: string[],
        make: string,
        dateFrom: Date | undefined,
        dateTo: Date | undefined
      ): Promise<ICar[] | null>
      userCarDetails(id: string): Promise<ICarWithHostName | null>
      getCarMake(): Promise<ICarMakeCategory[]>
      getCarType(): Promise<ICarTypeCategory[]>
      setCarDate(
        dateFrom: Date,
        dateTo: Date,
        carId: string
      ): Promise<ICar | null>
      removeHostCar(carId: string): Promise<CarStatus>

}