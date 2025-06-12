import connectDB from "./db/index.ts";
import dotenv from "dotenv";
import { app } from "./app.ts";
dotenv.config({
        path: "./.env",
});
connectDB()
        .then(() => {
                app.listen(process.env.PORT || 8000, () => {
                        console.log(`Server is running at port : ${process.env.PORT}`);
                });
        })
        .catch((err) => {
                console.log("MongoDB connection Failed !!!", err);
        });