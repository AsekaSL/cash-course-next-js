import mongoose, { Document, Model, Schema, Types } from 'mongoose'
import { Event } from './event.model'

// Attributes required to create a Booking
export interface BookingAttrs {
  eventId: Types.ObjectId | string
  email: string
}

// Document returned from MongoDB
export interface BookingDoc extends Document {
  eventId: Types.ObjectId
  email: string
  createdAt: Date
  updatedAt: Date
}

// Model type with builder helper
export interface BookingModel extends Model<BookingDoc> {
  build(attrs: BookingAttrs): BookingDoc
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const bookingSchema = new Schema<BookingDoc, BookingModel>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    email: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (v: string) => emailRegex.test(v),
        message: 'Invalid email format',
      },
    },
  },
  {
    timestamps: true,
    strict: true,
  }
)

// Pre-save hook: ensure referenced Event exists before saving a booking
bookingSchema.pre<BookingDoc>('save', async function (next) {
  try {
    // Always check that the referenced event exists
    const exists = await Event.exists({ _id: this.eventId })
    if (!exists) {
      throw new Error('Referenced Event not found')
    }
    next()
  } catch (err) {
    next(err as Error)
  }
})

// Build helper for type-safe creation
bookingSchema.statics.build = (attrs: BookingAttrs) => new Booking(attrs)

const Booking = mongoose.model<BookingDoc, BookingModel>('Booking', bookingSchema)

export { Booking }
export default Booking
