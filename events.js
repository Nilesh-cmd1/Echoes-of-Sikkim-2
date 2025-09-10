import express from 'express'
import Event from '../models/Event.js'
const router = express.Router()
router.get('/', async (req,res)=>{ const q = req.query.q || ''; const docs = await Event.find(q?{ title:{$regex:q,$options:'i'} }:{}).populate('monastery').sort({date:1}).limit(200); res.json(docs) })
router.post('/', async (req,res)=>{ const doc = await Event.create(req.body); res.status(201).json(doc) })
router.get('/:id', async (req,res)=>{ const doc = await Event.findById(req.params.id).populate('monastery'); if(!doc) return res.status(404).json({error:'Not found'}); res.json(doc) })
router.put('/:id', async (req,res)=>{ const doc = await Event.findByIdAndUpdate(req.params.id, req.body, {new:true}); res.json(doc) })
router.delete('/:id', async (req,res)=>{ const r = await Event.findByIdAndDelete(req.params.id); res.json({ok:!!r}) })
export default router
