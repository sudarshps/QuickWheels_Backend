import { Router } from "express";
import adminController from "../controllers/admin_controller";
import verifyAdmin from "../middlewares/adminAuth_middlewares";

const router: Router = Router();

router.get("/getuserlist", verifyAdmin, adminController.getUserList);
router.get("/getuserdetails", verifyAdmin, adminController.getUserDetails);
router.get("/gethostlist", verifyAdmin, adminController.getHostList);
router.get("/getorderslist", verifyAdmin, adminController.getOrderList);
router.get("/gethostdetails", verifyAdmin, adminController.getHostDetails);
router.get("/getorderdetails", verifyAdmin, adminController.getOrderDetails);
router.get("/allorderdetails", verifyAdmin, adminController.dashboardOrder);
router.post("/adminlogin", adminController.login);
router.post("/verifyuser", verifyAdmin, adminController.verifyUser);
router.post("/verifyhost", verifyAdmin, adminController.verifyHost);
router.post("/addmakecategory", verifyAdmin, adminController.addMakeCategory);
router.post("/addtypecategory", verifyAdmin, adminController.addTypeCategory);
router.get("/getmakecategory", verifyAdmin, adminController.makeCategory);
router.get("/gettypecategory", verifyAdmin, adminController.typeCategory);
router.delete(
  "/removemakecategory",
  verifyAdmin,
  adminController.removeMakeCategory
);
router.delete(
  "/removetypecategory",
  verifyAdmin,
  adminController.removeTypeCategory
);
router.put(
  "/updatemakecategory",
  verifyAdmin,
  adminController.updateMakeCategory
);
router.put(
  "/updatetypecategory",
  verifyAdmin,
  adminController.updateTypeCategory
);
router.put("/userstatus", verifyAdmin, adminController.userStatus);
router.put("/hoststatus", verifyAdmin, adminController.hostStatus);
router.get("/leaderboardorder", verifyAdmin, adminController.leaderboard);
router.get("/recentorders", verifyAdmin, adminController.recentOrders);

export default router;
