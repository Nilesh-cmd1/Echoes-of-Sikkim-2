import mongoose from 'mongoose';

/**
 * @typedef {object} Route
 * @property {mongoose.Schema.Types.ObjectId} monastery - A reference to the Monastery this route belongs to.
 * @property {object} origin - The starting point of the route in GeoJSON format.
 * @property {object} steps - The path of the route as a GeoJSON LineString.
 * @property {number} distanceKm - The total distance of the route in kilometers.
 * @property {number} durationMinutes - The estimated time to complete the route in minutes.
 * @property {Date} createdAt - The date and time this document was created.
 * @property {Date} updatedAt - The date and time this document was last updated.
 */

const RouteSchema = new mongoose.Schema({
  // --- Relational & Core Info ---
  monastery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Monastery',
    required: [true, 'A route must be associated with a monastery.'],
    index: true, // Simple index for quickly finding all routes for a monastery.
  },

  // --- Geospatial Data ---
  // Using the GeoJSON format is a Mongoose best practice.
  // It enables powerful geospatial queries like finding routes "near" a certain point.
  origin: {
    type: {
      type: String,
      enum: ['Point'], // The type must be 'Point'.
      required: true,
    },
    coordinates: {
      type: [Number], // Array of numbers: [longitude, latitude]
      required: [true, 'Origin coordinates are required.'],
      validate: {
        validator: function(coords) {
          // Coordinates must be [longitude, latitude]
          if (!Array.isArray(coords) || coords.length !== 2) return false;
          const [lng, lat] = coords;
          return lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
        },
        message: 'Invalid coordinates. Must be an array of [longitude, latitude] within valid range.'
      }
    }
  },
  // We define the structure for the steps in the route for data consistency.
  // A LineString is the appropriate GeoJSON type for a path.
  steps: {
      type: {
          type: String,
          enum: ['LineString'],
          default: 'LineString',
      },
      coordinates: {
          type: [[Number]], // An array of [lng, lat] coordinate pairs
          default: [],
      }
  },

  // --- Route Metadata (Optional but Recommended) ---
  distanceKm: {
      type: Number,
      min: [0, 'Distance cannot be negative.'],
  },
  durationMinutes: {
      type: Number,
      min: [0, 'Duration cannot be negative.'],
  },

}, {
  // --- Schema Options ---
  // Automatically adds createdAt and updatedAt fields.
  timestamps: true,
});

// --- Indexes for Performance ---
// A compound index to ensure a monastery doesn't have two routes starting at the exact same point.
RouteSchema.index({ monastery: 1, origin: 1 }, { unique: true });

// A 2dsphere index on the 'origin' field is crucial for efficient geospatial queries.
// This allows you to use queries like $near, $geoWithin, etc.
RouteSchema.index({ origin: '2dsphere' });


// To prevent Mongoose from overwriting the model during hot-reloads in development,
// we check if the model already exists before creating it.
export default mongoose.models.Route || mongoose.model('Route', RouteSchema);
