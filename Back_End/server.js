const express=require("express")
const app=express()
const mongoose=require("mongoose")
const dotenv=require("dotenv")
const bodyParser=require("body-parser")
const cors = require("cors")
app.use(bodyParser.json())
app.use(cors())
dotenv.config()

//connecting to mongoDb
mongoose.connect(process.env.MONGODB_URI).then(()=>{
    console.log("db connected")
})

//route paths for the apis
app.use("/bikeservice/bookings",require("./routes/bookings"))
app.use("/bikeservice/services",require("./routes/services"))
app.use("/bikeservice/users",require("./routes/users"))



//connecting to server
app.listen(3000,()=>{
    console.log("server connected");
})