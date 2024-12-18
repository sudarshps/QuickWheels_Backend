import { Request, Response } from "express";
import AdminService from "../services/admin_service";
import { IAdminService } from "../interface/admin/IAdminService";

class AdminController {
  constructor(private _adminService:IAdminService){}
  async getUserList(req: Request, res: Response): Promise<void> {
    try {
      const getUsers = await this._adminService.getUsers();
      res.json(getUsers);
    } catch (error) {
      console.error("error in getting user list", error);
    }
  }

  async getUserDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.query;
      if (!id) {
        res.status(400).json({ message: "ID parameter is missing" });
        return;
      }
      const getUserDetails = await this._adminService.userDetails(id as string);
      res.json(getUserDetails);
    } catch (error) {
      console.error("error getting user details", error);
    }
  }

  async getHostDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.query;
      if (!id) {
        res.status(400).json({ message: "ID parameter is missing" });
        return;
      }
      const getHostDetails = await this._adminService.hostDetails(id as string);

      res.json(getHostDetails);
    } catch (error) {
      console.error("error in fetching host details", error);
    }
  }

  async getHostList(req: Request, res: Response): Promise<void> {
    try {
      const getHosts = await this._adminService.hostList();
      res.json(getHosts);
    } catch (error) {
      console.error("error in fetching host list", error);
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      const validate = await this._adminService.login(email, password);
      if (validate.validated) {
        const accessToken = validate.accessToken as string;
        res.cookie("adminAccessToken", accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "none",
          maxAge: 1800000,
        });
        res.json(validate);
      } else {
        res.json(validate);
      }
    } catch (error) {
      console.error("error in admin log in", error);
    }
  }

  async verifyUser(req: Request, res: Response): Promise<void> {
    try {
      const { userStatus, id, note } = req.body;

      const response = await this._adminService.verifyUser(userStatus, id, note);
      res.json(response);
    } catch (error) {
      console.error("error in verifying user", error);
    }
  }

  async verifyHost(req: Request, res: Response): Promise<void> {
    try {
      const { hostStatus, id, note } = req.body;

      const response = await this._adminService.verifyHost(hostStatus, id, note);
      res.json(response);
    } catch (error) {
      console.error("error in verifying host", error);
    }
  }

  async addMakeCategory(req: Request, res: Response): Promise<void> {
    try {
      const { newCategory } = req.body;
      const response = await this._adminService.addMakeCategory(newCategory);
      res.json(response);
    } catch (error) {
      console.error("error in posting category", error);
    }
  }

  async addTypeCategory(req: Request, res: Response): Promise<void> {
    try {
      const { newCategory } = req.body;
      const response = await this._adminService.addTypeCategory(newCategory);
      res.json(response);
    } catch (error) {
      console.error("error in posting category", error);
    }
  }

  async makeCategory(req: Request, res: Response): Promise<void> {
    try {
      const { page } = req.query;
      const dataSize = 5;
      const pageNum = Number(page);
      const makeCategory = await this._adminService.makeCategory(pageNum, dataSize);

      res.json(makeCategory);
    } catch (error) {
      console.error("error in getting category", error);
    }
  }

  async typeCategory(req: Request, res: Response): Promise<void> {
    try {
      const { page } = req.query;
      const dataSize = 5;
      const pageNum = Number(page);
      const typeCategory = await this._adminService.typeCategory(pageNum, dataSize);
      res.json(typeCategory);
    } catch (error) {
      console.error("error in getting category", error);
    }
  }

  async removeMakeCategory(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.query;
      if (typeof categoryId === "string") {
        const response = await this._adminService.removeMakeCategory(categoryId);
        res.json(response);
      }
    } catch (error) {
      console.error("error in deleting category", error);
    }
  }

  async removeTypeCategory(req: Request, res: Response): Promise<void> {
    try {
      const { categoryId } = req.query;
      if (typeof categoryId === "string") {
        const response = await this._adminService.removeTypeCategory(categoryId);
        res.json(response);
      }
    } catch (error) {
      console.error("error in deleting category", error);
    }
  }

  async updateMakeCategory(req: Request, res: Response): Promise<void> {
    try {
      const { newCategory, categoryId } = req.body;
      const response = await this._adminService.updateMakeCategory(
        newCategory,
        categoryId
      );
      res.json(response);
    } catch (error) {
      console.error("error in updating category", error);
    }
  }

  async updateTypeCategory(req: Request, res: Response): Promise<void> {
    try {
      const { newCategory, categoryId } = req.body;
      const response = await this._adminService.updateTypeCategory(
        newCategory,
        categoryId
      );
      res.json(response);
    } catch (error) {
      console.error("error in updating category", error);
    }
  }

  async userStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status, userId } = req.body;
      const response = await this._adminService.userStatus(status, userId);
      res.json(response);
    } catch (error) {
      console.error("error in updating user block/unblock", error);
    }
  }

  async hostStatus(req: Request, res: Response): Promise<void> {
    try {
      const { status, hostId, carId } = req.body;
      const response = await this._adminService.hostStatus(status, hostId, carId);
      res.json(response);
    } catch (error) {
      console.error("error in updating host status", error);
    }
  }

  async getOrderList(req:Request,res:Response):Promise<void> {
    try {
      const response = await this._adminService.getOrderList()
      res.json(response)
    } catch (error) {
      console.error('error while getting orders list',error);
      
    }
  }

  async getOrderDetails(req:Request,res:Response):Promise<void> {
    try {
      const id = req.query.id as string
      const response = await this._adminService.getOrderDetails(id)
      res.json(response)
    } catch (error) {
      console.error('error while fetching order details',error);
      
    }
  }

  async dashboardOrder(req:Request,res:Response):Promise<void> {
    try {
      const response = await this._adminService.dashboardOrder()
      res.json(response)
    } catch (error) {
      console.error('error while fatching order details',error);
    }
  }

  async leaderboard(req:Request,res:Response):Promise<void> {
    try {
      const response = await this._adminService.leaderboard()
      res.json(response)
    } catch (error) {
      console.error('error while fetching dashboard details',error);
    }
  }

  async recentOrders(req:Request,res:Response):Promise<void> {
    try {
      const response = await this._adminService.recentOrders()
      res.json(response)
    } catch (error) {          
      console.error('error while fetching orders',error);
    }
  }
}

export default new AdminController(AdminService);
