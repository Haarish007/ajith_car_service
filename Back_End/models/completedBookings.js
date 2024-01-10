const mongoose = require('mongoose');

const completedServiceBookingSchema = new mongoose.Schema({
  userId:{
    type: mongoose.Schema.Types.ObjectId, // Assuming you have a User model
    ref:'User', // Reference to the User model
    required:true,
  },
  bikeMake:{
    type: String,
    required:true,
  },
  bikeModel:{
    type: String,
    required:true,
  },
  completedDate:{
    type:Date,
    default:Date.now, // Set the default value to the current date and time
    required:true,
  },
  totalCost: {
    type:Number,
    required:true,
  },
  services:[
    {
      type:String, 
    },
  ],
  status:{
    type:String,
    default:'Completed',
  },
});

const CompletedServiceBooking = mongoose.model('CompletedServiceBooking', completedServiceBookingSchema);

module.exports = CompletedServiceBooking;
