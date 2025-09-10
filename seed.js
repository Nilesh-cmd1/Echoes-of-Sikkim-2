// backend/seed.js
// Fetch images from Wikimedia Commons categories and insert Monastery docs into MongoDB.
//
// Usage:
// 1) set backend/.env with MONGO_URI
// 2) npm install axios mongoose dotenv
// 3) node seed.js

import mongoose from "mongoose"
import dotenv from "dotenv"
import axios from "axios"
import Monastery from "./models/Monastery.js"

dotenv.config()

const PER_MONASTERY = Number(process.env.PER_MONASTERY) || 20
const COMMONS_API = "https://commons.wikimedia.org/w/api.php"

const monasteries = [
  // Extended list of Sikkim monasteries (core ones + many smaller, historic and modern sites)
  { key: "Rumtek_Monastery", name: "Rumtek Monastery", description: "Seat of the Karmapa (Karma Kagyu)", history: "Rebuilt by the 16th Karmapa in 1960s", latitude: 27.3389, longitude: 88.6065, category: "Category:Rumtek_Monastery", images: [] },
  { key: "Pemayangtse_Monastery", name: "Pemayangtse Monastery", description: "One of Sikkim's oldest, near Pelling", history: "Founded c.1705 by Lhatsun Chempo", latitude: 27.3092, longitude: 88.2487, category: "Category:Pemayangtse_Monastery", images: [] },
  { key: "Enchey_Monastery", name: "Enchey Monastery", description: "Gangtok monastery, ~200 years old", history: "Associated with Lama Drupthob Karpo", latitude: 27.3369, longitude: 88.6131, category: "Category:Enchey_Monastery", images: [] },
  { key: "Phodong_Monastery", name: "Phodong Monastery", description: "Important Kagyu monastery", history: "Early 18th century", latitude: 27.3990, longitude: 88.5931, category: "Category:Phodong_Monastery", images: [] },
  { key: "Tashiding_Monastery", name: "Tashiding Monastery", description: "Sacred hilltop monastery", history: "Founded 1641", latitude: 27.2742, longitude: 88.2955, category: "Category:Tashiding_Monastery", images: [] },
  { key: "Ralang_Monastery", name: "Ralang Monastery", description: "Ravangla-area Kagyu monastery", history: "", latitude: 27.3087, longitude: 88.3645, category: "Category:Ralang_Monastery", images: [] },
  { key: "Lingdum_Monastery", name: "Lingdum / Ranka Monastery", description: "Modern monastery near Ranka", history: "", latitude: 27.3423, longitude: 88.7022, category: "Category:Ranka_Monastery", images: [] },
  { key: "Dubdi_Monastery", name: "Dubdi Monastery", description: "Yuksom's historic monastery (Dubdi)", history: "Early 1700s", latitude: 27.3245, longitude: 88.2210, category: "Category:Dubdi_Monastery", images: [] },
  { key: "Sanga_Choeling", name: "Sanga Choeling Monastery", description: "Ancient meditation hermitage near Pelling", history: "", latitude: 27.3016, longitude: 88.2752, category: "Category:Sangachoeling_Monastery", images: [] },
  { key: "Tholung_Monastery", name: "Tholung Monastery", description: "Sacred repository of relics", history: "", latitude: 27.5450, longitude: 88.5900, category: "Category:Tholung_Monastery", images: [] },
  { key: "Lachen_Monastery", name: "Lachen Monastery", description: "Monastery in Lachen (North Sikkim)", history: "", latitude: 27.5550, longitude: 88.6166, category: "Category:Lachen", images: [] },
  { key: "Lachung_Monastery", name: "Lachung Monastery", description: "Monastery in Lachung (North Sikkim)", history: "", latitude: 27.6833, longitude: 88.6480, category: "Category:Lachung", images: [] },
  { key: "Karma_Thekchen_Ling", name: "Karma Thekchen Ling", description: "Karma Kagyu monastery (Gangtok)", history: "", latitude: 27.3300, longitude: 88.6167, category: "Category:Karma_Thekchen_Ling", images: [] },
  { key: "Zurmang_Kagyud", name: "Zurmang Kagyud Monastery", description: "Zurmang Kagyud lineage site", history: "", latitude: 27.2, longitude: 88.4, category: "Category:Zurmang_Monastery", images: [] },
  { key: "Sang_Monastery", name: "Sang Monastery", description: "Local monastery", history: "", latitude: 27.3, longitude: 88.4, category: "Category:Sang_Monastery", images: [] },
  { key: "Labrang_Monastery", name: "Labrang Monastery", description: "Local Labrang (small) monastery", history: "", latitude: 27.35, longitude: 88.5, category: "Category:Labrang_Monastery", images: [] },
  { key: "Hee_Gyathang", name: "Hee Gyathang Monastery", description: "Hee Gyathang near Namchi", history: "", latitude: 27.15, longitude: 88.36, category: "Category:Hee_Gyathang", images: [] },
  { key: "Sangachoeling_Monastery", name: "Sangachoeling monastery (alt)", description: "", history: "", latitude: 27.3, longitude: 88.28, category: "Category:Sangachoeling", images: [] },
  { key: "Bon_Monastery_Kewzing", name: "Bon monastery, Kewzing", description: "Bon tradition site", history: "", latitude: 27.15, longitude: 88.28, category: "Category:Bon_Monastery_Kewzing", images: [] },
  { key: "Phensang_Monastery", name: "Phensang Monastery", description: "Monastery in Sikkim", history: "", latitude: 27.4, longitude: 88.6, category: "Category:Phensang_Monastery", images: [] },
  { key: "Others_Monastery1", name: "Chamling Monastery", description: "", history: "", latitude: 27.28, longitude: 88.33, category: "Category:Chamling_Monastery", images: [] },
  { key: "Others_Monastery2", name: "Nyingma Monastery (example)", description: "", history: "", latitude: 27.31, longitude: 88.30, category: "Category:Nyingma_Monastery_Sikkim", images: [] },
  // Add more entries here if you want — script will attempt to fetch category images for each
]

/* --- helpers: commons category -> file titles -> image URLs --- */

async function commonsCategoryFileTitles(category, limit = 500) {
  try {
    const r = await axios.get(COMMONS_API, {
      params: {
        action: "query",
        list: "categorymembers",
        cmtitle: category,
        cmtype: "file",
        cmlimit: limit,
        format: "json",
        origin: "*"
      },
      timeout: 20000
    })
    const members = r.data?.query?.categorymembers || []
    return members.map(m => m.title).filter(Boolean)
  } catch (err) {
    console.warn("commonsCategoryFileTitles error for", category, err.message)
    return []
  }
}

async function fetchImageUrlsForTitles(titles = []) {
  const urls = []
  const batchSize = 50
  for (let i = 0; i < titles.length; i += batchSize) {
    const batch = titles.slice(i, i + batchSize).join("|")
    try {
      const r = await axios.get(COMMONS_API, {
        params: {
          action: "query",
          titles: batch,
          prop: "imageinfo",
          iiprop: "url|mime|size",
          format: "json",
          origin: "*"
        },
        timeout: 20000
      })
      const pages = r.data?.query?.pages || {}
      for (const pid of Object.keys(pages)) {
        const p = pages[pid]
        if (p?.imageinfo && p.imageinfo[0]?.url) urls.push(p.imageinfo[0].url)
      }
    } catch (err) {
      console.warn("fetchImageUrlsForTitles batch error", err.message)
    }
  }
  return [...new Set(urls)] // dedupe
}

async function gatherImagesForCategory(category, want = PER_MONASTERY) {
  try {
    const titles = await commonsCategoryFileTitles(category, 500)
    if (!titles.length) return []
    const imageUrls = await fetchImageUrlsForTitles(titles.slice(0, 500))
    const unique = [...new Set(imageUrls)]
    return unique.slice(0, want)
  } catch (err) {
    console.warn("gatherImagesForCategory error:", err)
    return []
  }
}

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log("MongoDB connected for seeding")

    await Monastery.deleteMany({})
    console.log("Cleared existing Monastery documents")

    for (const m of monasteries) {
      console.log(\n=== Processing: ${m.name} (category: ${m.category}) ===)
      let imgs = []
      try {
        imgs = await gatherImagesForCategory(m.category, PER_MONASTERY)
      } catch (e) {
        console.warn("Error fetching images for", m.name, e.message)
      }
      if (!imgs.length && m.images && m.images.length) {
        imgs = m.images // fallback static if provided
      }
      console.log(Found ${imgs.length} images for ${m.name})
      const doc = new Monastery({
        name: m.name,
        description: m.description,
        history: m.history,
        latitude: m.latitude,
        longitude: m.longitude,
        images: imgs
      })
      await doc.save()
      console.log(Saved ${m.name} -> ${doc._id})
      // small delay to be polite to API
      await new Promise(res => setTimeout(res, 400))
    }

    console.log("\nSeeding complete")
    process.exit(0)
  } catch (err) {
    console.error("Seeding failed:", err)
    process.exit(1)
  }
}

seed()
