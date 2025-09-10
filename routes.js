import express from 'express'
import axios from 'axios'
import Route from '../models/Route.js'
import Monastery from '../models/Monastery.js'
const router = express.Router()
router.get('/:monasteryId', async (req,res)=>{
  const { monasteryId } = req.params
  const { lat, lng } = req.query
  if(!lat || !lng) return res.status(400).json({ error:'origin lat,lng required' })
  const existing = await Route.findOne({ monastery: monasteryId, 'origin.lat': parseFloat(lat), 'origin.lng': parseFloat(lng) })
  if(existing) return res.json(existing)
  const mon = await Monastery.findById(monasteryId)
  if(!mon) return res.status(404).json({ error:'Monastery not found' })
  try{
    const r = await axios.get('https://maps.googleapis.com/maps/api/directions/json',{ params:{ origin:${lat},${lng}, destination:${mon.latitude},${mon.longitude}, mode:'walking', key: process.env.GOOGLE_MAPS_API_KEY }})
    if(!r.data.routes?.length) return res.status(400).json({ error:'No route found' })
    const steps = r.data.routes[0].legs[0].steps
    const saved = await Route.create({ monastery: mon._id, origin:{ lat:parseFloat(lat), lng:parseFloat(lng) }, steps })
    res.json(saved)
  }catch(e){ res.status(500).json({ error: e.toString().slice(0,500) }) }
})
router.get('/', async (req,res)=>{ const list = await Route.find().populate('monastery'); res.json(list) })
export default router
