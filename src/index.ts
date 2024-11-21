import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors' 
import session from 'express-session'
import userRoutes from './routes/user_routes'
import adminRoutes from './routes/admin_routes'
import otpRoutes from './routes/otp_routes'
import orderRoutes from './routes/order_routes'
import chatRoutes from './routes/chat_routes'
import connectDb from './config/database'
import path from 'path'
import cookieParser = require('cookie-parser')
import {app,server} from './socket/socket'
dotenv.config({path:'../.env'})

connectDb()

app.use(cors({
    origin: ['https://qw-frontend.vercel.app'],
    methods:['GET','POST','PUT','DELETE','PATCH'],
    credentials:true
}))

app.use(cookieParser())

app.use('/Uploads',express.static(path.join(__dirname,'Uploads')))

app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));


app.use(express.json())

app.use('/',userRoutes)
app.use('/',otpRoutes)
app.use('/',orderRoutes)
app.use('/chat',chatRoutes)
app.use('/admin',adminRoutes)

const PORT = process.env.port || 3000



server.listen(PORT,()=>{
    console.log('Server is running'); 
}) 