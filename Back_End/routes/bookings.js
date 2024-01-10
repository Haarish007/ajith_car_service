const express=require('express')
const routes=express.Router()
const currentBookings=require('../models/currentBookings')
const completedBookings=require("../models/completedBookings")
const { ObjectId } = require('mongodb');
const User = require('../models/users');
const nodemailer = require("nodemailer");


//Route for adding new bookings
routes.post('/newbooking', async (req, res) => {
    try {
      const { userId, bikeModel, bikeMake, bookingDate ,selectedServices, totalCost } = req.body;
      const objectId = new ObjectId(userId);

      const user = await User.findById(userId);
      if(!user){
          res.send("user not found please signup")
      }

      //create new booking in DB
      const newbooking = new currentBookings({
        userId: objectId,
        bikeModel,
        bikeMake,
        bookingDate,
        selectedServices,
        totalCost,
      });
  
      await newbooking.save(); 
     
     
       

     
        user.currentBookings.push(newbooking._id);
        
        await user.save();
     

       // Send an email to the customer

       //creating variable for nodemailer
       const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: "haarishda.20cse@kongu.edu",
            pass: "hari@007",
          },
        });


      //create email variable with required credentials
      const email={
          from:user.userEmail,
          to:"haarishda.20cse@kongu.edu",
          text: "New booking has been created. Here are the details:",
          html: `
           <h5>Your Booking with
            <h5>User Name:</h5><p>${user.userName}</p>
            <h5>Bike Model:</h5><p>${bikeModel}</p>
            <h5>Bike Make:</h5><p>${bikeMake}</p>
            <h5>Booking Date:</h5><p>${bookingDate}</p>
            <h5>Selected Services:</h5><p>${selectedServices.join(', ')}</p>
            <h5>Total Cost:</h5><p>${totalCost}</p>
          `,
        }

      //sending mail to the admin when new booking is requested
      const emailInfo = await transporter.sendMail(email);
      

      res.send('posted');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error creating a new booking');
    }
  });


//Route for changing the status of booking to ready for pickup
routes.patch('/changestatus', async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    const booking = await currentBookings.findByIdAndUpdate( bookingId,{ status: status },{ new: true })

    if (!booking) {
      
      return res.status(404).json({ message: 'Service booking not found' });
    }

    return res.json({ message: 'Status changed to Ready for Pickup', booking });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
});

//Route for making bookings completed
  routes.post("/completedbooking/:id",async(req,res)=>{
    
    try{
        const bookingInfo=await currentBookings.findById({_id:req.params.id})
        if(bookingInfo){
        const completedBooking=new completedBookings({
            userId:bookingInfo.userId,
            bikeMake:bookingInfo.bikeMake,
            bikeModel:bookingInfo.bikeModel,
            totalCost:bookingInfo.totalCost,
            services:bookingInfo.selectedServices
        })
        await completedBooking.save()

       //changing the status of the booking to the user
        const user = await User.findById(bookingInfo.userId); 
        user.completedServiceBookings.push(completedBooking._id);
        user.currentBookings = user.currentBookings.filter(id => id.toString()!==req.params.id);
        await user.save();
      


        const deletedBooking= await currentBookings.findByIdAndDelete({_id:req.params.id})
        
         // Send an email to the customer regarding booking completed and ready for pickup
       
         const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          port: 465,
          secure: true,
          auth: {
            user: "haarishda.20cse@kongu.edu",
            pass: "hari@007",
          },
        });

        const formattedDate = bookingInfo.bookingDate.toISOString().split('T')[0];

        //create email variable with required credentials
        const email={
          from:"haarishda.20cse@kongu.edu",
          to:user.userEmail,
          text: "Your Booking is completed. Here are the details:",
          html:  `
          <h5>Your Booking </h5>
          <h5>User Name:</h5><p>${user.userName}</p>
          <h5>Bike Model:</h5><p>${bookingInfo.bikeModel}</p>
          <h5>Bike Make:</h5><p>${bookingInfo.bikeMake}</p>
          <h5>Booking Date:</h5><p>${formattedDate}</p>
          <h5>Selected Services:</h5><p>${bookingInfo.selectedServices.join(', ')}</p>
          <h5>Total Cost:</h5><p>${bookingInfo.totalCost}</p>
          <p>has been completed come and pick your bike. Thank you for choosing our service.</p>
        `,
        }

      const emailInfo = await transporter.sendMail(email);
      

      }
      else{
        res.send("no current open booking found")
      }

    }
    catch(err){
        res.send(err);
    }

      res.send({message:"booking added to completed"})
  })



//Route for getting every current open bookings for admin
routes.get("/currentbookings/admin",async(req,res)=>{
  try{
    const bookings=await currentBookings.find().populate('userId', 'userName userEmail userContact');
    if(!bookings){
      res.status(404).json({message:"no current bookingd found"})
    }

    const detailedBookings=bookings.map((booking)=>{
          return{
            _id:booking._id,
            bikeMake:booking.bikeMake,
            bikeModel:booking.bikeModel,
            selectedServices:booking.selectedServices,
            totalCost:booking.totalCost,
            status:booking.status,
            bookingDate:booking.bookingDate,
            userId:booking.userId._id,
            userName:booking.userId.userName,
            userEmail:booking.userId.userEmail,
            userContact:booking.userId.userContact
          }
    })
    res.status(200).send(detailedBookings)
    
  }
  catch(error){
    res.status(404).send({message:error})
  }
})

//Route for getting every completed bookings for admin
routes.get("/completedbookings/admin",async(req,res)=>{
  try{
    const bookings=await completedBookings.find().populate('userId', 'userName userEmail userContact')
    if(!bookings){
      res.status(404).json({message:"no completed bookings found"})
    }
    
    const detailedBookings=bookings.map((booking)=>{
      return {
        _id:booking._id,
        bikeMake:booking.bikeMake,
        bikeModel:booking.bikeModel,
        completedDate:booking.completedDate,
        totalCost:booking.totalCost,
        services:booking.services,
        status:booking.status,
        userId:booking.userId._id,
        userName:booking.userId.userName,
        userEmail:booking.userId.userEmail,
        userContact:booking.userId.userContact
      };
    })
    res.status(200).send(detailedBookings)
    
  }
  catch(error){
    res.status(404).send({message:error})
  }
})


//Route for getting every current open bookings of the user with their user id
routes.get("/currentbookings/user/:id",async(req,res)=>{
  try{
    const bookings=await currentBookings.find({userId:req.params.id})
    
    res.status(200).send(bookings)
    
  }
  catch(error){
    res.status(404).send({message:error})
  }
})


//Route getting every completed bookings of the user with their user id
routes.get("/completedbookings/user/:id",async(req,res)=>{
  try{
    const bookings=await completedBookings.find({userId:req.params.id})
    res.status(200).send(bookings)
    
  }
  catch(error){
    res.status(404).send({message:error})
  }
})



module.exports=routes