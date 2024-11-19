import {Request,Response,NextFunction} from 'express'
import {verifyToken} from '../utils/jwt_utils'

export interface AuthRequest extends Request {
    admin?:string | object | boolean
}

const verifyAdmin = (req:AuthRequest,res:Response,next:NextFunction):Object | void => {
    const authHeader = req.headers['authorization'];

    if(!authHeader) {
        return res.status(401).json({message:'Authorization failed'})
    }

    const token = authHeader.split(' ')[1]

    if(!token){
        return res.status(401).json({message:'Token missing'})
    }

    const decoded = verifyToken(token)
    if(decoded){
        req.admin = decoded
        return next()
    }else{
        return res.status(403).json({message:'Invalid token!'})
    }
}

export default verifyAdmin