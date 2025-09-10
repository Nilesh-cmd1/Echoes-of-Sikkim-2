import express from 'express'
import axios from 'axios'
const router = express.Router()
router.get('/nearby', async (req,res)=>{
  const { lat, lng, type, radius } = req.query
  if(!lat||!lng) return res.status(400).json({error:'lat,lng required'})
  const url = 'https://maps.googleapis.com/maps/api/place/nearbysearch/json'
  const params = { location:lat+','+lng, radius: radius||1500, type: type||'tourist_attraction', key: process.env.GOOGLE_MAPS_API_KEY }
  try{
    const r = await axios.get(url,{ params })
    res.json(r.data)
  }catch(e){ res.status(500).json({ error: e.toString() }) }
})
export default router
