import express from "express"
import 'dotenv/config'
import cors from 'cors'
import userRoute from "./routes/userRoute.js"
import triageRoute from "./routes/triageRoute.js"


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


app.use('/api/v1/auth', userRoute)
app.use("/api/v1/triage", triageRoute);

app.listen(PORT,()=>{
    console.log(`Server is listening at port ${PORT}`);  
})
