import { Request, Response } from "express";
import UserService from "../services/user_service";
import { uploadToS3 } from "../services/upload_service";
import { IUserService } from "../interface/user/IUserService";
import jwt from 'jsonwebtoken'

interface UploadedUserFiles {
  drivingIDFront: Express.Multer.File[];
  drivingIDBack: Express.Multer.File[];
}

class UserController {
  constructor(private _userService: IUserService) {}
  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { userName, password, email, loginMethod } = req.body;

      const createUser = await this._userService.createUser(
        {
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
        },
        loginMethod
      );

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

  async verifyUserToken(req:Request,res:Response):Promise<any> {
    try {
      const token = req.headers.authorization?.split(' ')[1]
      if (!token) {
        return res.status(401).json({ message: "No token provided" });
      }
      const secret = process.env.JWT_GAUTH_SECRET as string
      jwt.verify(token,secret,(err,decoded)=>{
        if(err){
          return res.status(401).json({ message: "Invalid or expired token" });
        }
        if(decoded && typeof decoded === 'object'){
          const {email,given_name} = decoded                   
          return res.status(200).json({
            message: "Token verified successfully",
            email,
            given_name,
          }); 
        }
        
      })
    } catch (error) {
      console.error('Error in token verifying (gauth)',error);
      res.status(500).json({message: "Internal Server Error"})
    }
  }

  async checkUserMail(req: Request, res: Response): Promise<void> {
    try {
      const { email } = req.body;
      const validate = await this._userService.validateEmail({ email });

      res.status(200).json(validate);
    } catch (error) {
      console.error("Error in mail checking", error);
      res.status(500).json({ message: "Internal Server Error" });
    }
  }

  async userLogin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, loginMethod } = req.body;
      const validate = await this._userService.validateUser(
        { email, password },
        loginMethod
      );
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

  async updatePassword(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const response = await this._userService.updatePassword(email, password);
      res.json(response);
    } catch (error) {
      console.error("error while updating password", error);
    }
  }

  async editUserProfile(req: Request, res: Response) {
    try {
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

      const userProfile = await this._userService.editUserProfile(
        userData,
        email
      );

      res.json(userProfile);
    } catch (error) {
      res.status(500).json({ message: "User profile editing failed!" });
    }
  }

  async userProfileCompletion(req: Request, res: Response) {
    try {
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

        const userProfile = await this._userService.userProfile(
          userData,
          longitude,
          latitude
        );

        res.json(userProfile);
      } else {
        return res.status(400).json({ message: "Incorrect file structure" });
      }
    } catch (error) {
      res.status(500).json({ message: "Profile completion failed!" });
    }
  }

  async userLogout(req: Request, res: Response): Promise<void> {
    try {
      res.clearCookie("accessToken", {
        path: "/",
        httpOnly: true,
        secure: true,
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
      const userDetails = await this._userService.userDetails(email);
      if (userDetails) {
        res.json(userDetails);
      }
    } catch (error) {
      console.error("error fetching user details", error);
    }
  }

  async getWallet(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.query.userId as string;
      const response = await this._userService.getWallet(userId);
      res.json(response);
    } catch (error) {
      console.error("error while fetching wallet details", error);
    }
  }

  async carRating(req: Request, res: Response): Promise<void> {
    try {
      const { userId, carId, orderId, rating, feedback } = req.body;
      const response = await this._userService.carRating(
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
      const response = await this._userService.carReview(id);
      res.json(response);
    } catch (error) {
      console.error("error while fetching car rating", error);
    }
  }
}

export default new UserController(UserService);
