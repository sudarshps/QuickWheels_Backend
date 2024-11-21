import mongoose from 'mongoose'

const connectDb = async (): Promise<void> => {
    try {
        const mongoUri = process.env.MONGO_URI as string;        
        if (!mongoUri) {
            throw new Error('MONGO_URI is not defined in the environment variables');
        }

        await mongoose.connect(mongoUri);
    } catch (error) {
        console.error('Error connecting to MongoDB Atlas',error)
    }
}


export default connectDb