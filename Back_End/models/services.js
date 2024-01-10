const mongoose=require("mongoose")

const servicesSchema=new mongoose.Schema({
    serviceName:{
        type:String,
        required:true
    },
    serviceCost:{
        type:Number,
        required:true
    }
})


const Services=mongoose.model("Services",servicesSchema)

module.exports=Services