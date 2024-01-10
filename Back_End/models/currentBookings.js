const mongoose = require('mongoose');

const currentServiceBookingSchema = new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId, // Assuming you have a User model
    ref:'User', // Reference to the User model
    required:true,
  },
  bikeMake:{
    type:String,
    required: true,
  },
  bikeModel:{
    type:String,
    required:true,
  },
  selectedServices:[{
    type:String,
  }],
  totalCost:{
    type:Number,
    required:true,
  },
  status:{
    type:String,
    enum:['Pending', 'Ready for Pickup', 'Completed'],
    default:'Pending',
  },
  bookingDate:{
    type:Date,
    default:Date.now,
    required:true,
  }
});

const CurrentServiceBooking = mongoose.model('CurrentServiceBooking', currentServiceBookingSchema);

module.exports = CurrentServiceBooking;
