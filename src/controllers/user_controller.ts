import { Request, Response } from "express";
import UserService from "../services/user_service";
import upload, { uploadToS3 } from "../services/upload_service";

interface UploadedUserFiles {
  drivingIDFront: Express.Multer.File[];
  drivingIDBack: Express.Multer.File[];
}

interface UploadedCarFiles {
  images: Express.Multer.File[];
  RCDoc: Express.Multer.File[];
  InsuranceDoc: Express.Multer.File[];
}

class UserController {
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { userName, password, email,loginMethod } = req.body;

      const createUser = await UserService.createUser({
        name: userName,
        password,
        email,
        isVerified: false,
        isHost: false,
        isActive: true,
        profileUpdated: false,
        status: "Verification Pending",
        approvedHost: false,
        role: ["USER"],
      }, loginMethod);

      if (createUser?.validUser) {
        const accessToken = createUser.accessToken;
        const refreshToken = createUser.refreshToken;

        res.cookie("accessToken", accessToken, { maxAge: 1800000 });
        res.cookie("refreshToken", refreshToken, {
          maxAge: 5 * 60 * 60 * 1000,
          httpOnly: true,
          secure: true,
          sameSite: "none",
        });

        res.status(200).json(createUser);
      } else {
        res.json(createUser);
      }
    } catch (error) {
      console.error("error in creating user");
    }
  }

  async checkUserMail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const validate = await UserService.validateEmail({ email });

      res.status(200).json(validate);
    } catch (error) {
      console.error("Error in mail checking", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async userLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password,loginMethod } = req.body;
      const validate = await UserService.validateUser({ email, password },loginMethod );
      if (validate.validUser) {
        const accessToken = validate.accessToken;
        const refreshToken = validate.refreshToken;

        res.cookie("accessToken", accessToken, { maxAge: 1800000 });
        res.cookie("refreshToken", refreshToken, {
          maxAge: 5 * 60 * 60 * 1000,
          httpOnly: true,
          secure: true,
          sameSite: "none",
        });

        res.status(200).json(validate);
      } else {
        res.json(validate);
      }
    } catch (error) {
      console.error("error in logging user", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async updatePassword(req:Request,res:Response):Promise<void> {
    try {
      const{email,password} = req.body
      const response = await UserService.updatePassword(email,password)
      res.json(response)
    } catch (error) {
      console.error('error while updating password',error);
    }
  }

  async editUserProfile(req: Request, res: Response) {
    const {
      email,
      phone,
      dob,
      address,
      drivingID,
      drivingExpDate,
      existingFrontID,
      existingBackID,
    } = req.body;
    const userData = {
      ...(phone && { phone }),
      ...(dob && { dob }),
      ...(address && { address }),
      ...(drivingID && { drivingID }),
      ...(drivingExpDate && { drivingExpDate }),
    };

    function isUploadedFiles(files: any): files is UploadedUserFiles {
      return (
        files &&
        typeof files === "object" &&
        ("drivingIDFront" in files || "drivingIDBack" in files)
      );
    }

    if (isUploadedFiles(req.files)) {
      let frontFileBuffer = null;
      let backFileBuffer = null;
      if (req.files.drivingIDFront && req.files.drivingIDFront[0]) {
        frontFileBuffer = req.files.drivingIDFront[0].buffer;
      }
      if (req.files.drivingIDBack && req.files.drivingIDBack[0]) {
        backFileBuffer = req.files.drivingIDBack[0].buffer;
      }

      const bucketName = process.env.AWS_BUCKET_NAME as string;
      const fileType = "image/jpeg";
      if (existingFrontID) {
        const frontImage = existingFrontID;
        const frontImageUpload = await uploadToS3(
          frontFileBuffer,
          bucketName,
          frontImage,
          fileType
        );
        userData.drivingIDFront = frontImageUpload;

        if (!frontImageUpload) {
          return res.status(500).json({
            message: "File upload failed",
          });
        }
      }

      if (existingBackID) {
        const backImage = existingBackID;
        const backImageUpload = await uploadToS3(
          backFileBuffer,
          bucketName,
          backImage,
          fileType
        );
        userData.drivingIDBack = backImageUpload;
        if (!backImageUpload) {
          return res.status(500).json({
            message: "File upload failed",
          });
        }
      }
    }

    const userProfile = await UserService.editUserProfile(userData, email);

    res.json(userProfile);
  }

  async userProfileCompletion(req: Request, res: Response) {
    if (!req.files) {
      return res.status(400).json({ message: "No files uploaded" });
    }
    let { longitude, latitude, ...userData } = req.body;

    function isUploadedFiles(files: any): files is UploadedUserFiles {
      return (
        files &&
        typeof files === "object" &&
        "drivingIDFront" in files &&
        "drivingIDBack" in files
      );
    }

    if (isUploadedFiles(req.files)) {
      const frontFileBuffer = req.files.drivingIDFront[0].buffer;
      const backFileBuffer = req.files.drivingIDBack[0].buffer;
      const frontImage = `drivingIdFront_${Date.now()}${
        req.files.drivingIDFront[0].originalname
      }`;
      const backImage = `drivingIdBack_${Date.now()}${
        req.files.drivingIDBack[0].originalname
      }`;
      const bucketName = process.env.AWS_BUCKET_NAME as string;
      const fileType = "image/jpeg";
      const frontImageUpload = await uploadToS3(
        frontFileBuffer,
        bucketName,
        frontImage,
        fileType
      );
      const backImageUpload = await uploadToS3(
        backFileBuffer,
        bucketName,
        backImage,
        fileType
      );

      if (!frontImageUpload || !backImageUpload) {
        return res.status(500).json({
          message: "File upload failed",
        });
      }

      userData.drivingIDFront = frontImageUpload;
      userData.drivingIDBack = backImageUpload;
      userData.profileUpdated = true;

      const userProfile = await UserService.userProfile(
        userData,
        longitude,
        latitude
      );

      res.json(userProfile);
    } else {
      return res.status(400).json({ message: "Incorrect file structure" });
    }
  }

  async userLogout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie("accessToken", {
        path: "/",
        httpOnly: true,
        sameSite: "none",
      });

      res.clearCookie("refreshToken", {
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "none",
      });

      res
        .status(200)
        .json({ status: true, message: "Logged out successfully" });
    } catch (error) {
      console.error("user logout server error", error);
    }
  }

  async authorizedUser(req: Request, res: Response): Promise<object> {
    try {
      const userPayload = req.user;

      return res.json({
        user: userPayload,
        valid: true,
        message: "authorized user",
      });
    } catch (error) {
      return res.json({ valid: false, message: "not authorized" });
    }
  }

  async userDetails(req: Request, res: Response): Promise<void> {
    const email = req.query.email as string;
    try {
      const userDetails = await UserService.userDetails(email);
      if (userDetails) {
        res.json(userDetails);
      }
    } catch (error) {
      console.error("error fetching user details", error);
    }
  }

  // Host

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

        const carDetails = await UserService.carDetails(
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
          const uploadPromise = [];
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

      const carDetails = await UserService.editCarDetails(
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
      const carDetails = await UserService.getCarDetails(email);
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

      const carDetails = await UserService.rentCarDetails(
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

      const carDetails = await UserService.userCarDetails(id as string);
      res.json(carDetails);
    } catch (error) {
      console.error("error in fetching user car details", error);
    }
  }

  async getCarMake(req: Request, res: Response): Promise<void> {
    try {
      const response = await UserService.getCarMake();
      res.json(response);
    } catch (error) {
      console.error("error in getting car make list", error);
    }
  }

  async getCarType(req: Request, res: Response): Promise<void> {
    try {
      const response = await UserService.getCarType();
      res.json(response);
    } catch (error) {
      console.error("error in getting car make list", error);
    }
  }

  async setCarDate(req: Request, res: Response): Promise<void> {
    try {
      const { dateFrom, dateTo, carId } = req.body;
      const response = await UserService.setCarDate(dateFrom, dateTo, carId);
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
      const response = await UserService.removeHostCar(carId);
      res.json(response);
    } catch (error) {
      console.error("error in deleting the host car", error);
    }
  }

  async getWallet(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.userId as string;
      const response = await UserService.getWallet(userId);
      res.json(response);
    } catch (error) {
      console.error("error while fetching wallet details", error);
    }
  }

  async carRating(req: Request, res: Response): Promise<void> {
    try {
      const { userId, carId, orderId, rating, feedback } = req.body;
      const response = await UserService.carRating(
        userId,
        carId,
        orderId,
        rating,
        feedback
      );
      res.json(response);
    } catch (error) {
      console.error("error while posting car rating and feedback", error);
    }
  }

  async carReview(req: Request, res: Response): Promise<void> {
    try {
      const id = req.query.id as string;
      const response = await UserService.carReview(id);
      res.json(response);
    } catch (error) {
      console.error("error while fetching car rating", error);
    }
  }
}

export default new UserController();
