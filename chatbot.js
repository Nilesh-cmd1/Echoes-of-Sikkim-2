import express from 'express'
import axios from 'axios'
import Monastery from '../models/Monastery.js'
import Event from '../models/Event.js'
const router = express.Router()
async function localSearch(q){
  const mon = await Monastery.find({ $or:[{name:{$regex:q,$options:'i'}},{ 'translations.name':{$regex:q,$options:'i'} }] }).limit(10)
  const ev = await Event.find({ $or:[{title:{$regex:q,$options:'i'}},{description:{$regex:q,$options:'i'}}] }).limit(6).populate('monastery')
  return { mon, ev }
}
router.post('/', async (req,res)=>{
  const q = String(req.body.q||'').trim()
  if(!q) return res.status(400).json({ error:'q required' })
  if(!process.env.OPENAI_API_KEY){
    const fallback = await localSearch(q)
    return res.json({ source:'local', answer:Found ${fallback.mon.length} monasteries and ${fallback.ev?.length||0} events, localResults: fallback })
  }
  try{
    const prompt = You are an assistant about Sikkim monasteries. User: ${q}
    const r = await axios.post('https://api.openai.com/v1/chat/completions',{
      model:'gpt-4o-mini',
      messages:[{role:'system',content:'You are a helpful assistant.'},{role:'user',content:prompt}],
      max_tokens:600
    },{ headers:{ Authorization:Bearer ${process.env.OPENAI_API_KEY} }})
    const content = r.data.choices?.[0]?.message?.content || 'No reply'
    const local = await localSearch(q)
    res.json({ source:'openai', answer:content, localResults:local })
  }catch(err){
    const fallback = await localSearch(q)
    res.json({ source:'error', error:err.toString().slice(0,300), localResults:fallback })
  }
})
export default router
