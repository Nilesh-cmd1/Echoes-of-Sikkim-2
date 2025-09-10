import express from 'express'
import Booking from '../models/Booking.js'
const router = express.Router()
router.post('/', async (req,res)=>{ const b = await Booking.create(req.body); res.json(b) })
router.get('/', async (req,res)=>{ const list = await Booking.find().populate('monastery').sort({createdAt:-1}); res.json(list) })
router.put('/:id', async (req,res)=>{ const u = await Booking.findByIdAndUpdate(req.params.id, req.body, { new:true }); res.json(u) })
export default router
