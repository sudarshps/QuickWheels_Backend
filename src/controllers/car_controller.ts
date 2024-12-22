import { Request, Response } from "express";
import { ICarService } from "../interface/car/ICarService";
import car_service from "../services/car_service";
import { uploadToS3 } from "../services/upload_service";



interface UploadedCarFiles {
    images: Express.Multer.File[];
    RCDoc: Express.Multer.File[];
    InsuranceDoc: Express.Multer.File[];
  }


class CarController {
    constructor(private _carService:ICarService){}

    async hostCarDetails(req: Request, res: Response) {
        try {
          const { email, ...rest } = req.body;
    
          if (!req.files) {
            return res.status(400).json({ message: "No files uploaded" });
          }
          let carData = rest;
    
          function isUploadedFiles(files: any): files is UploadedCarFiles {
            return (
              files &&
              typeof files === "object" &&
              "images" in files &&
              "RCDoc" in files &&
              "InsuranceDoc" in files
            );
          }
    
          if (isUploadedFiles(req.files)) {
            const bucketName = process.env.AWS_BUCKET_NAME as string;
            const uploadCarImages = await Promise.all(
              req.files.images.map((file, index) => {
                const fileBuffer = file.buffer;
                const fileName = `carimage_${index}_${Date.now()}_${
                  file.originalname
                }`;
                const fileType = file.mimetype as string;
                return uploadToS3(fileBuffer, bucketName, fileName, fileType);
              })
            );
    
            const rcFileType = req.files.RCDoc[0].mimetype as string;
            const rcFileName = `rcimage_${Date.now()}_${
              req.files.RCDoc[0].originalname
            }`;
            const rcBuffer = req.files.RCDoc[0].buffer;
            const uploadRcDoc = await uploadToS3(
              rcBuffer,
              bucketName,
              rcFileName,
              rcFileType
            );
    
            const insuranceFileName = `insuranceimage_${Date.now()}_${
              req.files.InsuranceDoc[0].originalname
            }`;
            const insuranceFileType = req.files.InsuranceDoc[0].mimetype as string;
            const insuranceBuffer = req.files.InsuranceDoc[0].buffer;
            const uploadInsurance = await uploadToS3(
              insuranceBuffer,
              bucketName,
              insuranceFileName,
              insuranceFileType
            );
    
            const failedUploads = uploadCarImages.filter((result) => !result);
            if (failedUploads.length > 0) {
              return res
                .status(500)
                .json({ message: "some files failed to upload" });
            }
            if (!uploadRcDoc || !uploadInsurance) {
              return res.status(500).json({
                message: "file upload failed",
              });
            }
    
            carData.images = uploadCarImages;
            carData.RCDoc = uploadRcDoc;
            carData.InsuranceDoc = uploadInsurance;
    
            let isVerified = false;
            let status = "Verification Pending";
            let isActive = true;
    
            const carDetails = await this._carService.carDetails(
              email,
              carData,
              isVerified,
              status,
              isActive
            );
    
            res.json(carDetails);
          } else {
            return res.status(400).json({ message: "Incorrect file structure" });
          }
        } catch (error) {
          console.error("error in creating user");
        }
      }


      async editCarDetails(req: Request, res: Response) {
        try {
          const { carId, removedImages, ...rest } = req.body;
    
          let editedDetails = rest;
          let removedImagesDetails;
          if (removedImages) {
            removedImagesDetails = JSON.parse(removedImages);
          }
    
          function isUploadedFiles(files: any): files is UploadedCarFiles {
            return (
              (files && typeof files === "object" && "images" in files) ||
              "RCDoc" in files ||
              "InsuranceDoc" in files
            );
          }
    
          if (isUploadedFiles(req.files)) {
            const bucketName = process.env.AWS_BUCKET_NAME as string;
    
            if (req.files.images && req.files.images.length > 0) {
              const uploadPromise:Promise<any>[] = [];
              for (let i = 0; i < req.files.images.length; i++) {
                const fileBuffer = req.files.images[i].buffer;
                const url = removedImagesDetails?.carImages[i];
                const nameSlice = url.lastIndexOf("/");
                const fileName = url.slice(nameSlice + 1);
                const fileType = req.files.images[i].mimetype as string;
                const upload = uploadToS3(
                  fileBuffer,
                  bucketName,
                  fileName,
                  fileType
                );
                uploadPromise.push(upload);
              }
              if (uploadPromise.length) {
                const filePromise = await Promise.all(
                  uploadPromise.map((data, ind) => {
                    return data;
                  })
                );
    
                const failedUploads = filePromise.filter((result) => !result);
                if (failedUploads.length > 0) {
                  return res
                    .status(500)
                    .json({ message: "some files failed to upload" });
                }
    
                editedDetails.images = filePromise;
              }
            }
    
            if (
              (req.files.RCDoc && req.files.RCDoc[0]) ||
              (req.files.InsuranceDoc && req.files.InsuranceDoc[0])
            ) {
              let uploadRc;
              let uploadInsurance;
              if (req.files.RCDoc) {
                let url;
                const fileBuffer = req.files.RCDoc[0].buffer;
                if (removedImagesDetails?.rcFile) {
                  url = removedImagesDetails?.rcFile;
                  const nameSlice = url.lastIndexOf("/");
                  const fileName = url.slice(nameSlice + 1);
                  const rcFileType = req.files.RCDoc[0].mimetype as string;
                  uploadRc = await uploadToS3(
                    fileBuffer,
                    bucketName,
                    fileName,
                    rcFileType
                  );
                }
              }
    
              if (req.files.InsuranceDoc) {
                let url;
                const fileBuffer = req.files.InsuranceDoc[0].buffer;
                if (removedImagesDetails?.insuranceFile) {
                  url = removedImagesDetails?.insuranceFile;
                  const nameSlice = url.lastIndexOf("/");
                  const fileName = url.slice(nameSlice + 1);
                  const insuranceFileType = req.files.InsuranceDoc[0]
                    .mimetype as string;
                  uploadInsurance = await uploadToS3(
                    fileBuffer,
                    bucketName,
                    fileName,
                    insuranceFileType
                  );
                }
              }
    
              if (uploadRc) editedDetails.RCDoc = uploadRc;
              if (uploadInsurance) editedDetails.InsuranceDoc = uploadInsurance;
            }
          }
    
          let isVerified = false;
          let status = "Verification Pending";
    
          const carDetails = await this._carService.editCarDetails(
            carId,
            editedDetails,
            isVerified,
            status
          );
    
          res.json(carDetails);
        } catch (error) {
          console.error("error in editing car details", error);
        }
      }

      async carDetails(req: Request, res: Response): Promise<void> {
        const email = req.query.email as string;
    
        try {
          const carDetails = await this._carService.getCarDetails(email);
          if (carDetails) {
            res.json(carDetails);
          }
        } catch (error) {
          console.error("error fetching user details", error);
        }
      }

      async rentCarDetails(req: Request, res: Response): Promise<void> {
        try {
          const userId = req.query.userId as string;
          const sort = req.query.sort as string;
          const make = req.query.carMake as string;
          const transmission = req.query.transmission as string[];
          const fuel = req.query.fuel as string[];
          const seat = req.query.seat as string[];
          const distance = req.query.distance as string[];
          const searchInput = req.query.userSearch as string;
          const carType = req.query.carType as string[];
          let lngQuery = req.query.lng;
          let latQuery = req.query.lat;
          let distanceValue = 0;
          const dateFrom = req.query.dateFrom as Date | undefined;
          const dateTo = req.query.dateTo as Date | undefined;
    
          if (distance) {
            distanceValue = parseFloat(distance[0]);
          }
    
          let lng: number | undefined;
          let lat: number | undefined;
    
          if (typeof lngQuery === "string") {
            lng = parseFloat(lngQuery);
          }
    
          if (typeof latQuery === "string") {
            lat = parseFloat(latQuery);
          }
    
          if (lng === undefined || isNaN(lng) || lat === undefined || isNaN(lat)) {
            res.status(400).send({ error: "Invalid longitude or latitude value" });
            return;
          }
    
          const carDetails = await this._carService.rentCarDetails(
            userId,
            sort,
            transmission,
            fuel,
            seat,
            lng,
            lat,
            distanceValue,
            searchInput,
            carType,
            make,
            dateFrom,
            dateTo
          );
          res.json(carDetails);
        } catch (error) {
          console.error("error in fetching rent car details", error);
        }
      }

      async userCarDetails(req: Request, res: Response): Promise<void> {
        try {
          const { id } = req.query;
    
          const carDetails = await this._carService.userCarDetails(id as string);
          res.json(carDetails);
        } catch (error) {
          console.error("error in fetching user car details", error);
        }
      }

      async getCarMake(req: Request, res: Response): Promise<void> {
        try {
          const response = await this._carService.getCarMake();
          res.json(response);
        } catch (error) {
          console.error("error in getting car make list", error);
        }
      }
    
      async getCarType(req: Request, res: Response): Promise<void> {
        try {
          const response = await this._carService.getCarType();
          res.json(response);
        } catch (error) {
          console.error("error in getting car make list", error);
        }
      }

      async setCarDate(req: Request, res: Response): Promise<void> {
        try {
          const { dateFrom, dateTo, carId } = req.body;
          const response = await this._carService.setCarDate(dateFrom, dateTo, carId);
          if (!response) {
            res.json({ dateUpdated: false, message: "not updated" });
          }
          res.json({
            dateFrom: response?.availabilityFrom,
            dateTo: response?.availabilityTo,
            dateUpdated: true,
            message: "updated",
          });
        } catch (error) {
          console.error("error in updating availability date!", error);
        }
      }
    
      async removeHostCar(req: Request, res: Response): Promise<void> {
        try {
          const { carId } = req.body;
          const response = await this._carService.removeHostCar(carId);
          res.json(response);
        } catch (error) {
          console.error("error in deleting the host car", error);
        }
      }

}


export default new CarController(car_service)