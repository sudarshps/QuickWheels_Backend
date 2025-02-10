import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors' 
import userRoutes from './routes/user_routes'
import adminRoutes from './routes/admin_routes'
import messageRoutes from './routes/message_routes'
import otpRoutes from './routes/otp_routes'
import orderRoutes from './routes/order_routes'
import carRoutes from './routes/car_routes'
import chatRoutes from './routes/chat_routes'
import authRoutes from './routes/auth_routes'
import connectDb from './config/database'
import path from 'path'
import cookieParser = require('cookie-parser')
import {app,server} from './socket/socket'
import logger from './config/logger'
import morgan from 'morgan'
import './config/passport'
import passport from 'passport'
dotenv.config({path:'../.env'})

const morganFormat = ":method :url :status :response-time ms";
  
connectDb()

app.use(passport.initialize())

app.use(
    morgan(morganFormat, {
      stream: {
        write: (message) => {
          const logObject = {
            method: message.split(" ")[0],
            url: message.split(" ")[1],
            status: message.split(" ")[2],
            responseTime: message.split(" ")[3],
          };
          logger.info(JSON.stringify(logObject));
        },
      },
    })
)

app.use(cors({
    origin: [process.env.FRONTEND_URL || ''],
    methods:['GET','POST','PUT','DELETE','PATCH'],
    credentials:true
}))

app.use(cookieParser())

app.use('/Uploads',express.static(path.join(__dirname,'Uploads')))


app.use(express.json())

app.use('/',userRoutes)
app.use('/',otpRoutes)
app.use('/',orderRoutes)
app.use('/',carRoutes)
app.use('/chat',chatRoutes)
app.use('/chat',messageRoutes)
app.use('/admin',adminRoutes)
app.use('/',authRoutes)

const PORT = process.env.port || 3000


server.listen(PORT,()=>{
    console.log('Server is running'); 
}) 