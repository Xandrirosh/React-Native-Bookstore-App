import mongoose from "mongoose";
import  dotenv from "dotenv";
dotenv.config()

if (!process.env.MONGO_URI) {
    throw new Error('please provide the connection string ')
}

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB Connected: ${conn.connection.host}`.cyan.underline)
    } catch (error) {
        console.log('Connection error', error)
        process.exit(1)
    }
}

