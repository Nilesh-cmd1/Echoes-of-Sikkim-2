import mongoose from 'mongoose'
const EventSchema = new mongoose.Schema({
  title:String,
  description:String,
  monastery:{ type: mongoose.Schema.Types.ObjectId, ref:'Monastery' },
  date:Date,
  durationHours:Number,
  price:Number
},{ timestamps:true })
export default mongoose.model('Event', EventSchema)
