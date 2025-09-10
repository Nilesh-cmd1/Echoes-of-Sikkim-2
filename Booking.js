import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: [true, 'User name is required.'],
      trim: true,
    },
    userEmail: {
      type: String,
      required: [true, 'User email is required.'],
      trim: true,
      lowercase: true,
      match: [ /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/, 'Please provide a valid email address.'],
      index: true, // Adds a database index for much faster queries by email.
    },
    monastery: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Monastery',
      required: [true, 'Monastery reference is required.'],
      index: true, // Index for faster lookups based on the monastery.
    },
    serviceType: {
      type: String,
      required: [true, 'Service type is required.'],
      trim: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required.'],
      min: [0, 'Amount cannot be negative.'],
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR'],
    },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    status: {
      type: String,
      default: 'created',
      enum: {
        values: ['created', 'paid', 'confirmed', 'cancelled', 'failed'],
        message: '{VALUE} is not a supported status.',
      },
    },
  },
  {
    timestamps: true,
    // Ensure virtuals are included when converting to JSON (e.g., for API responses)
    toJSON: { virtuals: true }, 
    toObject: { virtuals: true },
  }
);

//== VIRTUAL PROPERTIES ==//
// Creates a dynamic property that is not stored in the database.
// Useful for creating combined or formatted fields.
bookingSchema.virtual('bookingSummary').get(function() {
  return ${this.serviceType} booking for ${this.userName} with status: ${this.status}.;
});

//== MIDDLEWARE (HOOKS) ==//
// This function runs automatically BEFORE a document is saved (.save()).
// Example: Prevent duplicate bookings for the same service by the same user.
bookingSchema.pre('save', async function(next) {
  // 'this' refers to the document being saved
  if (this.isNew) { // Only run this check for new documents
    const existingBooking = await this.constructor.findOne({ 
      userEmail: this.userEmail, 
      monastery: this.monastery,
      serviceType: this.serviceType,
      status: { $ne: 'cancelled' } // Allow re-booking if the old one was cancelled
    });

    if (existingBooking) {
      const err = new Error('An active booking for this service already exists for your email.');
      return next(err); // Stop the save operation
    }
  }
  next(); // Continue with the save operation
});


//== STATIC METHODS ==//
// Adds a custom, reusable function directly to the model.
// This helps keep your main application code clean.
bookingSchema.statics.findActiveBookingsForUser = function(userEmail) {
  return this.find({ 
    userEmail: userEmail,
    status: { $in: ['created', 'paid', 'confirmed'] } 
  }).sort({ createdAt: -1 }); // Return the user's active bookings, newest first
};

export default mongoose.model('Booking', bookingSchema);
