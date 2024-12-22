import {Router} from 'express'
import userController from '../controllers/user_controller'
import verifyUser from '../middlewares/auth_middlewares'
import upload from '../services/upload_service'

const router: Router = Router() 

router.post('/checkMail',userController.checkUserMail.bind(userController)) 
router.post('/userRegister',userController.createUser.bind(userController)) 
router.post('/userLogin',userController.userLogin.bind(userController)) 
router.patch('/updateuserpassword',userController.updatePassword.bind(userController)) 
router.post('/userprofile',upload.fields([{name:'drivingIDFront',maxCount:1},{name:'drivingIDBack',maxCount:1}]),userController.userProfileCompletion.bind(userController))
router.put('/edituserprofile',upload.fields([{name:'drivingIDFront',maxCount:1},{name:'drivingIDBack',maxCount:1}]),userController.editUserProfile.bind(userController))
router.post('/logout',userController.userLogout.bind(userController))   
router.get('/authorized',verifyUser,userController.authorizedUser.bind(userController)) 
router.get('/userDetails',verifyUser,userController.userDetails.bind(userController))
// router.get('/getrentcardetails',userController.rentCarDetails.bind(userController))
// router.get('/cardetails',userController.userCarDetails.bind(userController))
// router.get('/getcarmake',userController.getCarMake.bind(userController))
// router.get('/getcartype',userController.getCarType.bind(userController))
// router.post('/hostregister',upload.fields([{name:'images',maxCount:5},{name:'RCDoc',maxCount:1},{name:'InsuranceDoc',maxCount:1}]),userController.hostCarDetails.bind(userController))
// router.put('/editcardetails',upload.fields([{name:'images',maxCount:5},{name:'RCDoc',maxCount:1},{name:'InsuranceDoc',maxCount:1}]),userController.editCarDetails.bind(userController))
// router.get('/getcardetails',verifyUser,userController.carDetails.bind(userController))
// router.put('/setavailablitydate',verifyUser,userController.setCarDate.bind(userController))
// router.delete('/removecarfromhost',verifyUser,userController.removeHostCar.bind(userController))
router.get('/getwalletdetails',verifyUser,userController.getWallet.bind(userController))
router.post('/usercarrating',verifyUser,userController.carRating.bind(userController)) 
router.get('/carreview',verifyUser,userController.carReview.bind(userController))  

export default router;