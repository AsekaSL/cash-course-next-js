import { NextResponse } from 'next/server'
import { connectToDatabase } from '../../../../lib/mongodb'
import { Event } from '../../../../database'
import type { EventDoc } from '../../../../database/event.model'

// GET /api/events/:slug
// Returns event details by slug. Validates input, connects to MongoDB, and returns JSON.
export async function GET(_request: Request, { params }: { params: { slug?: string } }) {
  try {
    const slug = params?.slug

    // Validate slug presence and basic format (lowercase, numbers, hyphens)
    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 })
    }

    const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
    if (!slugPattern.test(slug)) {
      return NextResponse.json({ error: 'Invalid slug format' }, { status: 400 })
    }

    // Ensure DB connection is established (cached in lib/mongodb)
    await connectToDatabase()

    // Query the Event by slug. Return the mongoose document for safe typing,
    // then map to a plain JSON-friendly object with ISO dates.
    const doc = await Event.findOne({ slug }).exec()

    if (!doc) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Map document fields to a lean response shape and serialize dates to ISO.
    const response = {
      _id: doc._id.toString(),
      title: doc.title,
      slug: doc.slug,
      description: doc.description,
      overview: doc.overview,
      image: doc.image,
      venue: doc.venue,
      location: doc.location,
      date: doc.date,
      time: doc.time,
      mode: doc.mode,
      audience: doc.audience,
      agenda: Array.isArray(doc.agenda) ? doc.agenda.slice() : [],
      organizer: doc.organizer,
      tags: Array.isArray(doc.tags) ? doc.tags.slice() : [],
      createdAt: doc.createdAt ? doc.createdAt.toISOString() : null,
      updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : null,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (err) {
    // Unexpected errors — keep message generic for production but log details server-side
    // eslint-disable-next-line no-console
    console.error('GET /api/events/[slug] error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
