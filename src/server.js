import express from "express";
import dotenv from 'dotenv'
import cors from 'cors'
import colors from 'colors'
import cookieParser from "cookie-parser";
import authRouter from "./routes/authRoutes.js";
import { connectDB } from './lib/db.js'
import bookRouter from "./routes/bookRoutes.js";
import job from './lib/cron.js'


dotenv.config()
const app = express()
const PORT = process.env.PORT || 5000

job.start() // Start the cron job

//middlewares
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}))

app.use('/api/auth', authRouter)
app.use('/api/books', bookRouter)

//connect to DB and start server
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`.green.bold.underline);
        });
    })
    .catch((err) => {
        console.error('Failed to connect to DB:', err.message.red.bold);
        process.exit(1); // Stop the server
    });
