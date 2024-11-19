import mongoose from 'mongoose'

const connectDb = async (): Promise<void> => {
    try {
        await mongoose.connect(process.env.MONGO_URI as string)
    } catch (error) {
        console.error('Error connecting to MongoDB Atlas',error)
    }
}


export default connectDb