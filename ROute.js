import mongoose from 'mongoose'
const RouteSchema = new mongoose.Schema({
  monastery: { type: mongoose.Schema.Types.ObjectId, ref: 'Monastery' },
  origin: { lat:Number, lng:Number },
  steps: Array,
  createdAt:{ type: Date, default: Date.now }
})
RouteSchema.index({ monastery:1, 'origin.lat':1, 'origin.lng':1 }, { unique:true })
export default mongoose.model('Route', RouteSchema)
