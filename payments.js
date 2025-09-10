import express from 'express'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import Booking from '../models/Booking.js'
const router = express.Router()
const instance = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
router.post('/order', async (req,res)=>{
  const { amount, currency, receipt, notes } = req.body
  const opts = { amount: Math.round(amount*100), currency: currency||'INR', receipt: receipt||'rcpt_'+Date.now(), notes: notes||{} }
  try{
    const order = await instance.orders.create(opts)
    res.json(order)
  }catch(e){ res.status(500).json({ error: e.toString().slice(0,500) }) }
})
router.post('/verify', async (req,res)=>{
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body
  const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET).update(razorpay_order_id + "|" + razorpay_payment_id).digest('hex')
  if(hmac === razorpay_signature){
    if(bookingId) await Booking.findByIdAndUpdate(bookingId, { razorpayOrderId: razorpay_order_id, razorpayPaymentId: razorpay_payment_id, status: 'paid' })
    res.json({ ok:true })
  } else res.status(400).json({ error:'Invalid signature' })
})
export default router
