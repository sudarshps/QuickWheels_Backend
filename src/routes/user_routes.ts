import {Router} from 'express'
import userController from '../controllers/user_controller'
import verifyUser from '../middlewares/auth_middlewares'
import upload from '../services/upload_service'

const router: Router = Router() 

router.post('/checkMail',userController.checkUserMail.bind(userController)) 
router.get('/verifyToken',userController.verifyUserToken.bind(userController))
router.post('/userRegister',userController.createUser.bind(userController)) 
router.post('/userLogin',userController.userLogin.bind(userController)) 
router.patch('/updateuserpassword',userController.updatePassword.bind(userController)) 
router.post('/userprofile',upload.fields([{name:'drivingIDFront',maxCount:1},{name:'drivingIDBack',maxCount:1}]),userController.userProfileCompletion.bind(userController))
router.put('/edituserprofile',upload.fields([{name:'drivingIDFront',maxCount:1},{name:'drivingIDBack',maxCount:1}]),userController.editUserProfile.bind(userController))
router.post('/logout',userController.userLogout.bind(userController))   
router.get('/authorized',verifyUser,userController.authorizedUser.bind(userController)) 
router.get('/userDetails',verifyUser,userController.userDetails.bind(userController))
router.get('/getwalletdetails',verifyUser,userController.getWallet.bind(userController))
router.post('/usercarrating',verifyUser,userController.carRating.bind(userController)) 
router.get('/carreview',verifyUser,userController.carReview.bind(userController))  

export default router;