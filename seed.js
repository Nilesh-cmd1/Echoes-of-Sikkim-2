import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Monastery from '../models/Monastery.js'
import Event from '../models/Event.js'
dotenv.config()
await mongoose.connect(process.env.MONGODB_URI || '')
const data = [
  { code:'rumtek', name:'Rumtek Monastery', translations:[{lang:'en',name:'Rumtek Monastery',history:'Seat of the Karmapa and important center.'}], latitude:27.3179, longitude:88.62, images:['/assets/rumtek1.jpg'], panoramas:['/assets/panoramas/rumtek_pano.jpg'], audio:'/assets/audio/rumtek_story.mp3', hotspots:[{yaw:10,pitch:0,label:'Main Shrine',text:'Main shrine details.'}] },
  { code:'pemayangtse', name:'Pemayangtse Monastery', translations:[{lang:'en',name:'Pemayangtse Monastery',history:'Old monastery near Pelling.'}], latitude:27.2995, longitude:88.2335, images:['/assets/pem1.jpg'], panoramas:['/assets/panoramas/pem_pano.jpg'], audio:'/assets/audio/pem_story.mp3' },
  { code:'tashiding', name:'Tashiding Monastery', translations:[{lang:'en',name:'Tashiding Monastery',history:'Sacred monastery in West Sikkim.'}], latitude:27.2796, longitude:88.2810, images:['/assets/tash1.jpg'], panoramas:['/assets/panoramas/tash_pano.jpg'], audio:'/assets/audio/tash_story.mp3' },
  { code:'enchey', name:'Enchey Monastery', translations:[{lang:'en',name:'Enchey Monastery',history:'Nyingma order monastery in Gangtok.'}], latitude:27.3458, longitude:88.6198, images:['/assets/enchey1.jpg'], panoramas:['/assets/panoramas/enchey_pano.jpg'], audio:'/assets/audio/enchey_story.mp3' }
]
await Monastery.deleteMany({})
await Monastery.insertMany(data)
await Event.deleteMany({})
await Event.insertMany([
  { title:'Morning Prayer - Rumtek', description:'Guided prayer session', monastery:(await Monastery.findOne({ code:'rumtek' }))._id, date:new Date(Date.now()+1000*60*60*24*3), durationHours:2, price:10 },
  { title:'Cultural Talk - Pemayangtse', description:'Talk on traditions', monastery:(await Monastery.findOne({ code:'pemayangtse' }))._id, date:new Date(Date.now()+1000*60*60*24*7), durationHours:1.5, price:5 }
])
process.exit(0)
