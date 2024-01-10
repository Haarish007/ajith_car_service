const express=require('express');
const User = require('../models/users');
const bcrypt=require("bcrypt")
const routes=express.Router()



//Route for the user signup
routes.post("/usersignup",async(req,res)=>{
    try{
         const email=req.body.userEmail
        const pwd=req.body.userPassword;
        const duplicateEmail=await User.find({userEmail:email})
        if(duplicateEmail.length){
             return res.status(409).send("Email Already found")
        }
        const salt = 10;
        const hashedPassword= await bcrypt.hash(pwd, salt);
        
        const newUser= new User({
            userName:req.body.userName,
            userEmail:email,
            userPassword:hashedPassword,
            userContact:req.body.userContact

        })
        await newUser.save()
        res.status(201).send("user created")

    }
    catch(error){
       
        res.status(500).send(error)
    }
})


//Route for the user login
routes.post("/userlogin",async(req,res)=>{
    try{
      const {userPassword,userEmail}=req.body
      const user = await User.findOne({userEmail});
      if(!user){
        return res.status.json({message:"user not found please signup"})
      }

      const pwd=await bcrypt.compare(userPassword,user.userPassword)
      if(!pwd){
            return res.status(401).json({message:"Incorrect password"})
      }

      res.send(user)

    }
    catch(error){
       
        res.status(500).json({message:"login failed"})
    }
})





module.exports=routes;