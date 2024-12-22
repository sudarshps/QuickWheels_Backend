import {Router} from 'express'
import car_controller from '../controllers/car_controller'
import verifyUser from '../middlewares/auth_middlewares'
import upload from '../services/upload_service'

const router: Router = Router()
  
router.get('/getrentcardetails',car_controller.rentCarDetails.bind(car_controller))
router.get('/cardetails',car_controller.userCarDetails.bind(car_controller))
router.get('/getcarmake',car_controller.getCarMake.bind(car_controller))
router.get('/getcartype',car_controller.getCarType.bind(car_controller))
router.post('/hostregister',upload.fields([{name:'images',maxCount:5},{name:'RCDoc',maxCount:1},{name:'InsuranceDoc',maxCount:1}]),car_controller.hostCarDetails.bind(car_controller))
router.put('/editcardetails',upload.fields([{name:'images',maxCount:5},{name:'RCDoc',maxCount:1},{name:'InsuranceDoc',maxCount:1}]),car_controller.editCarDetails.bind(car_controller))
router.get('/getcardetails',verifyUser,car_controller.carDetails.bind(car_controller))
router.put('/setavailablitydate',verifyUser,car_controller.setCarDate.bind(car_controller))
router.delete('/removecarfromhost',verifyUser,car_controller.removeHostCar.bind(car_controller))


export default router;