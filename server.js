import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'
import morgan from 'morgan'
import path from 'path'
import { fileURLToPath } from 'url'
import monasteries from './routes/monasteries.js'
import places from './routes/places.js'
import routesApi from './routes/routes.js'
import events from './routes/events.js'
import bookings from './routes/bookings.js'
import payments from './routes/payments.js'
import chatbot from './routes/chatbot.js'
dotenv.config()
const __filename = fileURLToPath(import.meta.url)
const _dirname = path.dirname(_filename)
const app = express()
app.use(express.json({limit:'8mb'}))
app.use(morgan('dev'))
app.use(cors({ origin: process.env.ALLOWED_ORIGIN?.split(',') || '*' }))
mongoose.connect(process.env.MONGODB_URI || '')
app.use('/api/monasteries', monasteries)
app.use('/api/places', places)
app.use('/api/routes', routesApi)
app.use('/api/events', events)
app.use('/api/bookings', bookings)
app.use('/api/payments', payments)
app.use('/api/chatbot', chatbot)
app.use('/translations', express.static(path.join(__dirname,'../frontend/translations')))
app.use('/assets', express.static(path.join(__dirname,'../frontend/assets')))
app.use('/', express.static(path.join(__dirname,'../frontend')))
app.get('/manifest.json', (req,res)=>res.sendFile(path.join(__dirname,'../frontend/manifest.json')))
app.get('/service-worker.js', (req,res)=>res.sendFile(path.join(__dirname,'../frontend/service-worker.js')))
app.get('/', (req,res)=>res.sendFile(path.join(__dirname,'../frontend/lang.html')))
const port = process.env.PORT || 4000
app.listen(port, ()=>{})
