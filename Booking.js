import mongoose from 'mongoose'
const BookingSchema = new mongoose.Schema({
  userName:String,
  userEmail:String,
  monastery:{ type: mongoose.Schema.Types.ObjectId, ref:'Monastery' },
  serviceType:String,
  serviceItemId:String,
  amount:Number,
  currency:{ type:String, default:'INR' },
  razorpayOrderId:String,
  razorpayPaymentId:String,
  status:{ type:String, default:'created' },
  createdAt:{ type:Date, default: Date.now }
})
export default mongoose.model('Booking', BookingSchema)
