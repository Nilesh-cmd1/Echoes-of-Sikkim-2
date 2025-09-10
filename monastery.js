import mongoose from 'mongoose'
const TransSchema = new mongoose.Schema({ lang:String, name:String, description:String, history:String })
const MonasterySchema = new mongoose.Schema({
  code:String,
  translations:[TransSchema],
  name:String,
  description:String,
  history:String,
  latitude:Number,
  longitude:Number,
  images:[String],
  panoramas:[String],
  audio:String,
  hotspots:[Object],
  services:[String],
  createdAt:{ type:Date, default: Date.now }
})
export default mongoose.model('Monastery', MonasterySchema)
