import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import db from "./config/db.js";
import router from "./routes/user.routes.js";
dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use('/',router);

let PORT = process.env.PORT || 5002;

app.listen(PORT, () => {
  console.log(`server is running on port ${PORT}`);
});