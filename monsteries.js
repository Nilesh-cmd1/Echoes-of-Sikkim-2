import express from 'express'
import Monastery from '../models/Monastery.js'
const router = express.Router()
router.get('/', async (req,res)=>{ const q = req.query.q || ''; const docs = await Monastery.find(q?{ $or:[{name:{$regex:q,$options:'i'}},{ 'translations.name':{$regex:q,$options:'i'} }]}:{}).sort({name:1}).limit(500); res.json(docs) })
router.get('/:id', async (req,res)=>{ const doc = await Monastery.findById(req.params.id); if(!doc) return res.status(404).json({error:'Not found'}); res.json(doc) })
router.post('/', async (req,res)=>{ const doc = await Monastery.create(req.body); res.status(201).json(doc) })
router.put('/:id', async (req,res)=>{ const doc = await Monastery.findByIdAndUpdate(req.params.id, req.body, { new:true }); if(!doc) return res.status(404).json({error:'Not found'}); res.json(doc) })
router.delete('/:id', async (req,res)=>{ const r = await Monastery.findByIdAndDelete(req.params.id); if(!r) return res.status(404).json({error:'Not found'}); res.json({ok:true}) })
export default router
