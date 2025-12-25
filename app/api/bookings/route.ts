import { NextResponse } from 'next/server'
import { connectToDatabase } from '../../../../lib/mongodb'
import { Booking } from '../../../../database/booking.model'
import { Event } from '../../../../database/event.model'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { slug, email } = body || {}

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid slug' }, { status: 400 })
    }
    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid email' }, { status: 400 })
    }

    await connectToDatabase()

    const event = await Event.findOne({ slug }).exec()
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    const booking = Booking.build({ eventId: event._id, email })
    await booking.save()

    return NextResponse.json({ message: 'Booking created', bookingId: booking._id }, { status: 201 })
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('POST /api/bookings error:', err)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}
