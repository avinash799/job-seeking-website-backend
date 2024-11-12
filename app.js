import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import fileUpload from "express-fileupload";
import userRoutes from './routes/userRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';
import jobRoutes from './routes/jobRoutes.js';
import { connectDB } from "./database/index.js";
import { DB_NAME } from "./constant.js";
import { errorMiddleware } from "./middlewares/error.js";

const app = express();

dotenv.config({
    path: './config/config.env'
})

//use is use when need middlewares and configuration setup
app.use(cors({
    origin: [process.env.FRONTEND_URL],
    methods: [`GET,POST,PUT,DELETE`, 'UPDATE'],
    Credentials: true,
}))

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/',
}));

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/application', applicationRoutes);
app.use('./api/v1/job', jobRoutes);

connectDB();
// .then(() => {
//     app.listen(process.env.PORT || 8000, () => {
//         console.log(`Server is running at port ${process.env.PORT}`);
//     })
// })
// .catch((err) => {
//     console.log("Mongo Db connection failed!!!", err)
// });

app.use(errorMiddleware);

export default app;
