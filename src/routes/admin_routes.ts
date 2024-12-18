import { Router } from "express";
import adminController from "../controllers/admin_controller";
import verifyAdmin from "../middlewares/adminAuth_middlewares";

const router: Router = Router();

router.get("/getuserlist", verifyAdmin, adminController.getUserList.bind(adminController));
router.get("/getuserdetails", verifyAdmin, adminController.getUserDetails.bind(adminController));
router.get("/gethostlist", verifyAdmin, adminController.getHostList.bind(adminController));
router.get("/getorderslist", verifyAdmin, adminController.getOrderList.bind(adminController));
router.get("/gethostdetails", verifyAdmin, adminController.getHostDetails.bind(adminController));
router.get("/getorderdetails", verifyAdmin, adminController.getOrderDetails.bind(adminController));
router.get("/allorderdetails", verifyAdmin, adminController.dashboardOrder.bind(adminController));
router.post("/adminlogin", adminController.login.bind(adminController));
router.post("/verifyuser", verifyAdmin, adminController.verifyUser.bind(adminController));
router.post("/verifyhost", verifyAdmin, adminController.verifyHost.bind(adminController));
router.post("/addmakecategory", verifyAdmin, adminController.addMakeCategory.bind(adminController));
router.post("/addtypecategory", verifyAdmin, adminController.addTypeCategory.bind(adminController));
router.get("/getmakecategory", verifyAdmin, adminController.makeCategory.bind(adminController));
router.get("/gettypecategory", verifyAdmin, adminController.typeCategory.bind(adminController));
router.delete(
  "/removemakecategory",
  verifyAdmin,
  adminController.removeMakeCategory.bind(adminController)
);
router.delete(
  "/removetypecategory",
  verifyAdmin,
  adminController.removeTypeCategory.bind(adminController)
);
router.put(
  "/updatemakecategory",
  verifyAdmin,
  adminController.updateMakeCategory.bind(adminController)
);
router.put(
  "/updatetypecategory",
  verifyAdmin,
  adminController.updateTypeCategory.bind(adminController)
);
router.put("/userstatus", verifyAdmin, adminController.userStatus.bind(adminController));
router.put("/hoststatus", verifyAdmin, adminController.hostStatus.bind(adminController));
router.get("/leaderboardorder", verifyAdmin, adminController.leaderboard.bind(adminController));
router.get("/recentorders", verifyAdmin, adminController.recentOrders.bind(adminController));

export default router;
