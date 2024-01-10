const express=require('express')
const Services = require('../models/services')
const routes=express.Router()

//Route for adding new services
routes.post('/newservice',async(req,res)=>{
    try{
           const newService=new Services(req.body)
           await newService.save()
           res.send("created")
    }
    catch(error){
           
            res.send(error)
    }

   
})

//Route for delete the services
routes.delete('/deleteservice/:id',async(req,res)=>{
    try{
        const deletedService= await Services.deleteOne({_id:req.params.id})
        res.json({message:"Service deleted"})
    }
    catch(error){
        res.send(error)
    }
})

//Route for get all services
routes.get('/getallservices',async(req,res)=>{
    try{
         const servies=await Services.find()
         res.json(servies)
    }
    catch(error){
        res.send(error)
    }
})


//Route for edit the services
routes.patch("/editservice/:id",async(req,res)=>{
    try{
        const data=req.body;
       
        const editedService=await Services.findByIdAndUpdate(req.params.id,{$set:data},{new:true})
        if(!editedService){
            return res.status(404).json({message:"Service not found"})
        }
        res.status(201).json({message:"service edited"})
    }
    catch(error){
        res.send(error)
    }

})








module.exports=routes