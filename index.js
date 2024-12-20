import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./db/db.js";
import cookieParser from "cookie-parser";
import userRoute from "./route/userRoute.js";
import productRoute from "./route/productRoute.js";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import cors from "cors";

const app = express();

app.use(cors({
  origin: ["http://localhost:3000", "https://my-store-frontend-chi.vercel.app","http://my-store-frontend-chi.vercel.app"],   
  methods: ["GET", "POST", "PUT", "DELETE"],  
  allowedHeaders: ["Content-Type", "Authorization"],   
  credentials: true,  
  preflightContinue: true, 
}));

  

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  timeout: 6000000,
});

connectDB();
const _dirname = path.resolve();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use((req, res, next) => {
    console.log("CORS headers being sent");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
  });
app.get('/', (req, res) => {
  res.send("is Working");
});
app.use('/api/user', userRoute);
app.use('/api/p', productRoute);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`http://localhost:${port}`));
