import mongoose from 'mongoose';

/**
 * @typedef {object} Event
 * @property {string} title - The title of the event. Must be between 3 and 100 characters.
 * @property {string} description - A detailed description of the event. Must be no more than 1000 characters.
 * @property {mongoose.Schema.Types.ObjectId} monastery - A reference to the Monastery hosting the event.
 * @property {Date} date - The starting date and time of the event. Must be a future date.
 * @property {number} durationHours - The duration of the event in hours. Must be a positive number.
 * @property {number} price - The price of the event in your chosen currency. Defaults to 0 for free events.
 * @property {Date} createdAt - The date and time this document was created.
 * @property {Date} updatedAt - The date and time this document was last updated.
 */

const EventSchema = new mongoose.Schema({
  // --- Event Details ---
  title: {
    type: String,
    required: [true, 'Event title is required.'], // Provides a custom error message
    trim: true, // Removes leading/trailing whitespace
    minlength: [3, 'Title must be at least 3 characters long.'],
    maxlength: [100, 'Title cannot exceed 100 characters.'],
  },
  description: {
    type: String,
    required: [true, 'Event description is required.'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters.'],
  },

  // --- Relational & Scheduling ---
  monastery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Monastery', // Establishes a relationship with the Monastery model
    required: [true, 'Associated monastery is required.'],
    index: true, // Improves query performance when finding events by monastery
  },
  date: {
    type: Date,
    required: [true, 'Event date is required.'],
    validate: {
      validator: function(value) {
        // The event date must be in the future.
        return value > Date.now();
      },
      message: 'Event date must be in the future.'
    }
  },
  durationHours: {
    type: Number,
    required: [true, 'Duration in hours is required.'],
    min: [0.5, 'Duration must be at least 30 minutes (0.5 hours).'], // Events must have a minimum duration
  },

  // --- Financial ---
  price: {
    type: Number,
    required: [true, 'Price is required.'],
    min: [0, 'Price cannot be negative.'],
    default: 0, // Sets a default value if none is provided, useful for free events
  },
}, {
  // --- Schema Options ---
  // Automatically adds createdAt and updatedAt fields to the document
  timestamps: true,
});

// To prevent Mongoose from overwriting the model during hot-reloads in development,
// we check if the model already exists before creating it.
export default mongoose.models.Event || mongoose.model('Event', EventSchema);
