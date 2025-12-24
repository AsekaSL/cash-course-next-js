import mongoose, { Document, Model, Schema, Types } from 'mongoose'

// Attributes required to create an Event
export interface EventAttrs {
  title: string
  slug?: string
  description: string
  overview: string
  image: string
  venue: string
  location: string
  date: string
  time: string
  mode: string
  audience: string
  agenda: string[]
  organizer: string
  tags: string[]
}

// Document returned from MongoDB
export interface EventDoc extends Document {
  title: string
  slug: string
  description: string
  overview: string
  image: string
  venue: string
  location: string
  date: string
  time: string
  mode: string
  audience: string
  agenda: string[]
  organizer: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

// Model type with a builder helper
export interface EventModel extends Model<EventDoc> {
  build(attrs: EventAttrs): EventDoc
}

// Simple slugify helper to create URL-friendly slugs
const slugify = (input: string) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

const eventSchema = new Schema<EventDoc, EventModel>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true, trim: true },
    time: { type: String, required: true, trim: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: { type: [String], required: true },
    organizer: { type: String, required: true, trim: true },
    tags: { type: [String], required: true },
  },
  {
    timestamps: true,
    strict: true,
  }
)

// Pre-save hook: generate unique slug only when title changes; normalize date and time
eventSchema.pre<EventDoc>('save', async function (next) {
  try {
    // Generate/refresh slug only if title changed
    if (this.isModified('title')) {
      const base = slugify(this.title)
      let candidate = base
      let counter = 1
      // Ensure slug uniqueness by appending a counter if needed
      // Uses mongoose.models.Event to avoid circular imports
      // Loop until unique (unique index still enforces uniqueness at DB)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const EventModelAny: any = mongoose.models.Event
      while (await EventModelAny.exists({ slug: candidate, _id: { $ne: this._id } })) {
        candidate = `${base}-${counter++}`
      }
      this.slug = candidate
    }

    // Normalize/validate date: convert to JS Date and store ISO string
    if (this.isModified('date')) {
      const parsed = new Date(this.date)
      if (Number.isNaN(parsed.getTime())) {
        throw new Error('Invalid date format; expected a parseable date')
      }
      this.date = parsed.toISOString()
    }

    // Normalize time to HH:MM (24-hour) format
    if (this.isModified('time')) {
      const t = this.time.trim()
      // Accept HH:MM optionally with AM/PM
      const timeMatch = t.match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM|am|pm))?$/)
      if (!timeMatch) {
        throw new Error('Invalid time format; expected HH:MM or HH:MM AM/PM')
      }
      let hours = parseInt(timeMatch[1], 10)
      const minutes = parseInt(timeMatch[2], 10)
      const ampm = timeMatch[3]
      if (ampm) {
        const isPM = /pm/i.test(ampm)
        if (isPM && hours < 12) hours += 12
        if (!isPM && hours === 12) hours = 0
      }
      if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        throw new Error('Invalid time values')
      }
      const hh = String(hours).padStart(2, '0')
      const mm = String(minutes).padStart(2, '0')
      this.time = `${hh}:${mm}`
    }

    next()
  } catch (err) {
    next(err as Error)
  }
})

// Build helper for type-safe creation
eventSchema.statics.build = (attrs: EventAttrs) => new Event(attrs)

// Export model
const Event = mongoose.model<EventDoc, EventModel>('Event', eventSchema)

export { Event }
export default Event
