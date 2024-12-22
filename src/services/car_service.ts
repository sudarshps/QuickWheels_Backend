import { ICar } from "../models/car_model";
import { ICarMakeCategory } from "../models/carmake-category_model";
import { ICarTypeCategory } from "../models/cartype-category_model";
import { ICarRepository } from "../interface/car/ICarRepository";
import car_repository from "../repositories/car_repository";
import { ICarService } from "../interface/car/ICarService";

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
  

class CarService implements ICarService{
    constructor(private _carRepository:ICarRepository){}

    async editCarDetails(carId:string,editedDetails:EditedCarDetailsType,isVerified:boolean,status:string):Promise<ICar | null>{

        const{images,...otherDetails} = editedDetails
    
        const carDetails = await this._carRepository.editCarDetails(carId,otherDetails,images,isVerified,status)
    
        if(carDetails)return carDetails
    
        return null
      }


      async carDetails(
        email: string,
        carData: object,
        isVerified: boolean,
        status: string,
        isActive: boolean
      ): Promise<CarDetailsResponse> {
        const carDetails = await this._carRepository.carDetails(
          email,
          carData,
          isVerified,
          status,
          isActive
        );
    
        if (carDetails) {
          return {
            updatedCarDetails: true,
            message: "Car Details Created",
          };
        }
    
        return {
          updatedCarDetails: false,
          message: "Car Details Creation failed",
        };
      }



      async getCarDetails(email: string): Promise<ICar[] | null> {
        const carDetails = await this._carRepository.getCarDetails(email);
    
        if (!carDetails) {
          return null;
        }
    
        return carDetails;
      }

      async rentCarDetails(
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
      ): Promise<ICar[] | null> {
        let carDetails = await this._carRepository.getRentCarDetails();
    
        if (carDetails && lng !== 0 && lat !== 0) {
          carDetails = await this._carRepository.getCarDistance(lng, lat, distanceValue);
        }
    
        if (carDetails && searchInput.trim()) {
          const regex = new RegExp(searchInput, "i");
          carDetails = carDetails?.filter((car) => {
            const carTypeName =
              car.carType &&
              typeof car.carType === "object" &&
              "name" in car.carType
                ? car.carType.name
                : "";
            const carMakeName =
              car.make && typeof car.make === "object" && "name" in car.make
                ? car.make.name
                : "";
    
            return (
              regex.test(carMakeName) ||
              regex.test(carTypeName) ||
              regex.test(car.carModel) ||
              regex.test(car.transmission) ||
              regex.test(car.seatCapacity) ||
              regex.test(car.fuel)
            );
          });
        }
    
        if (!carDetails) {
          return null;
        }
    
        if (dateFrom && dateTo) {
          carDetails = carDetails.filter((car) => {
            const from = new Date(dateFrom);
            const to = new Date(dateTo);
            if (car.reservedDateFrom && car.reservedDateTo) {
              return (
                to < car.reservedDateFrom ||
                (from > car.reservedDateTo &&
                  from >= car.availabilityFrom &&
                  to <= car.availabilityTo)
              );
            }
    
            return from >= car.availabilityFrom && to <= car.availabilityTo;
          });
        }
    
        if (userId) {
          carDetails = carDetails.filter((car) => {
            return car.userId.toString() !== userId;
          });
        }
    
        if (make) {
          carDetails = carDetails.filter((car) => {
            const carMakeName =
              typeof car.make === "object" && "name" in car.make
                ? car.make.name
                : "";
            return carMakeName === make;
          });
        }
    
        if (transmission && transmission.length > 0) {
          carDetails = carDetails.filter((car) =>
            transmission.includes(car.transmission)
          );
        }
    
        if (carType && carType.length > 0) {
          carDetails = carDetails.filter((car) => {
            const carTypeName =
              typeof car.carType === "object" && "name" in car.carType
                ? car.carType.name
                : "";
            return carType.includes(carTypeName);
          });
        }
    
        if (fuel && fuel.length > 0) {
          carDetails = carDetails.filter((car) => fuel.includes(car.fuel));
        }
    
        if (seat && seat.length > 0) {
          carDetails = carDetails.filter((car) => seat.includes(car.seatCapacity));
        }
    
        if (sort === "lowtohigh") {
          return carDetails.sort(
            (carA, carB) => Number(carA.rentAmount) - Number(carB.rentAmount)
          );
        } else if (sort === "hightolow") {
          return carDetails.sort(
            (carA, carB) => Number(carB.rentAmount) - Number(carA.rentAmount)
          );
        }
    
        carDetails = carDetails.filter(
          (car) => car.isVerified === true && car.isActive === true
        );
    
        return carDetails;
      }

      async userCarDetails(id: string): Promise<ICarWithHostName | null> {
        const response = (await this._carRepository.userCarDetails(
          id
        )) as ICarWithHostName;
    
        return response;
      } 

      async getCarMake(): Promise<ICarMakeCategory[]> {
        return await this._carRepository.getCarMake();
      }
      async getCarType(): Promise<ICarTypeCategory[]> {
        return await this._carRepository.getCarType();
      }


      async setCarDate(
        dateFrom: Date,
        dateTo: Date,
        carId: string
      ): Promise<ICar | null> {
        return await this._carRepository.setCarDate(dateFrom, dateTo, carId);
      }

      async removeHostCar(carId: string): Promise<CarStatus> {
        const response = await this._carRepository.removeHostCar(carId);
        if (!response) {
          return {
            isRemoved: false,
            message: "car removal failed",
          };
        }
        return {
          isRemoved: true,
          message: "car removed successfully",
        };
      }

}

export default new CarService(car_repository)