import express from "express"
import 'dotenv/config'
import cors from 'cors'
import userRoute from "./routes/userRoute.js"


const app = express()
const PORT = process.env.PORT || 4000

app.use(express.json())

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);


app.use('api/user', userRoute)


app.listen(PORT,()=>{
    console.log(`Server is listening at port ${PORT}`);  
})
