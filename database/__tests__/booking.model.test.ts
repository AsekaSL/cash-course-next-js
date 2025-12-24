import mongoose from 'mongoose'
import { Booking, BookingAttrs } from '../booking.model'
import { Event, EventAttrs } from '../event.model'

describe('Booking Model', () => {
  // Helper function to create a test event
  const createTestEvent = async () => {
    const eventAttrs: EventAttrs = {
      title: 'Test Event',
      description: 'Test description',
      overview: 'Test overview',
      image: 'test.jpg',
      venue: 'Test Venue',
      location: 'Test Location',
      date: '2024-06-15',
      time: '10:00',
      mode: 'online',
      audience: 'developers',
      agenda: ['test'],
      organizer: 'Test Org',
      tags: ['test'],
    }
    const event = Event.build(eventAttrs)
    await event.save()
    return event
  }

  describe('Model Creation and Validation', () => {
    it('should create a valid booking with all required fields', async () => {
      const event = await createTestEvent()

      const bookingAttrs: BookingAttrs = {
        eventId: event._id,
        email: 'user@example.com',
      }

      const booking = Booking.build(bookingAttrs)
      await booking.save()

      expect(booking._id).toBeDefined()
      expect(booking.eventId.toString()).toBe(event._id.toString())
      expect(booking.email).toBe('user@example.com')
      expect(booking.createdAt).toBeInstanceOf(Date)
      expect(booking.updatedAt).toBeInstanceOf(Date)
    })

    it('should fail when eventId is missing', async () => {
      const booking = new Booking({
        email: 'user@example.com',
      })

      await expect(booking.save()).rejects.toThrow()
    })

    it('should fail when email is missing', async () => {
      const event = await createTestEvent()

      const booking = new Booking({
        eventId: event._id,
      })

      await expect(booking.save()).rejects.toThrow()
    })

    it('should accept string eventId and convert to ObjectId', async () => {
      const event = await createTestEvent()

      const booking = Booking.build({
        eventId: event._id.toString(),
        email: 'user@example.com',
      })
      await booking.save()

      expect(booking.eventId).toBeInstanceOf(mongoose.Types.ObjectId)
      expect(booking.eventId.toString()).toBe(event._id.toString())
    })
  })

  describe('Email Validation', () => {
    it('should accept valid email addresses', async () => {
      const event = await createTestEvent()

      const validEmails = [
        'user@example.com',
        'test.user@example.com',
        'user+tag@example.co.uk',
        'user123@test-domain.com',
        'a@b.c',
      ]

      for (const email of validEmails) {
        const booking = Booking.build({
          eventId: event._id,
          email,
        })
        await booking.save()
        expect(booking.email).toBe(email)
      }
    })

    it('should reject invalid email formats', async () => {
      const event = await createTestEvent()

      const invalidEmails = [
        'notanemail',
        'missing@domain',
        '@example.com',
        'user@',
        'user @example.com',
        'user@example',
      ]

      for (const email of invalidEmails) {
        const booking = Booking.build({
          eventId: event._id,
          email,
        })
        await expect(booking.save()).rejects.toThrow('Invalid email format')
      }
    })

    it('should trim whitespace from email', async () => {
      const event = await createTestEvent()

      const booking = Booking.build({
        eventId: event._id,
        email: '  user@example.com  ',
      })
      await booking.save()

      expect(booking.email).toBe('user@example.com')
    })

    it('should reject email with only whitespace', async () => {
      const event = await createTestEvent()

      const booking = Booking.build({
        eventId: event._id,
        email: '   ',
      })

      await expect(booking.save()).rejects.toThrow()
    })

    it('should reject empty email after trimming', async () => {
      const event = await createTestEvent()

      const booking = new Booking({
        eventId: event._id,
        email: '',
      })

      await expect(booking.save()).rejects.toThrow()
    })
  })

  describe('Event Reference Validation', () => {
    it('should fail when referenced event does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId()

      const booking = Booking.build({
        eventId: nonExistentId,
        email: 'user@example.com',
      })

      await expect(booking.save()).rejects.toThrow('Referenced Event not found')
    })

    it('should succeed when referenced event exists', async () => {
      const event = await createTestEvent()

      const booking = Booking.build({
        eventId: event._id,
        email: 'user@example.com',
      })

      await expect(booking.save()).resolves.toBeDefined()
    })

    it('should validate event reference even on update', async () => {
      const event = await createTestEvent()

      const booking = Booking.build({
        eventId: event._id,
        email: 'user@example.com',
      })
      await booking.save()

      // Try to update to non-existent event
      const nonExistentId = new mongoose.Types.ObjectId()
      booking.eventId = nonExistentId

      await expect(booking.save()).rejects.toThrow('Referenced Event not found')
    })

    it('should allow updating to a different valid event', async () => {
      const event1 = await createTestEvent()
      const event2 = await Event.build({
        title: 'Second Event',
        description: 'desc',
        overview: 'overview',
        image: 'img.jpg',
        venue: 'venue',
        location: 'location',
        date: '2024-01-01',
        time: '10:00',
        mode: 'online',
        audience: 'all',
        agenda: ['test'],
        organizer: 'org',
        tags: ['test'],
      }).save()

      const booking = Booking.build({
        eventId: event1._id,
        email: 'user@example.com',
      })
      await booking.save()

      booking.eventId = event2._id
      await booking.save()

      expect(booking.eventId.toString()).toBe(event2._id.toString())
    })
  })

  describe('Build Helper Method', () => {
    it('should create booking using build helper', async () => {
      const event = await createTestEvent()

      const attrs: BookingAttrs = {
        eventId: event._id,
        email: 'user@example.com',
      }

      const booking = Booking.build(attrs)

      expect(booking).toBeInstanceOf(Booking)
      expect(booking.email).toBe('user@example.com')
    })

    it('should enforce type safety through build helper', async () => {
      const event = await createTestEvent()

      const attrs: BookingAttrs = {
        eventId: event._id,
        email: 'typed@example.com',
      }

      const booking = Booking.build(attrs)
      expect(booking.email).toBe('typed@example.com')
    })
  })

  describe('Timestamps', () => {
    it('should automatically set createdAt timestamp', async () => {
      const event = await createTestEvent()

      const booking = Booking.build({
        eventId: event._id,
        email: 'user@example.com',
      })

      const beforeSave = new Date()
      await booking.save()
      const afterSave = new Date()

      expect(booking.createdAt).toBeInstanceOf(Date)
      expect(booking.createdAt.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime())
      expect(booking.createdAt.getTime()).toBeLessThanOrEqual(afterSave.getTime())
    })

    it('should automatically update updatedAt timestamp on modification', async () => {
      const event = await createTestEvent()

      const booking = Booking.build({
        eventId: event._id,
        email: 'user@example.com',
      })
      await booking.save()

      const originalUpdatedAt = booking.updatedAt

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10))

      booking.email = 'updated@example.com'
      await booking.save()

      expect(booking.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
    })
  })

  describe('Query Operations', () => {
    it('should find bookings by eventId', async () => {
      const event = await createTestEvent()

      await Booking.build({
        eventId: event._id,
        email: 'user1@example.com',
      }).save()

      await Booking.build({
        eventId: event._id,
        email: 'user2@example.com',
      }).save()

      const bookings = await Booking.find({ eventId: event._id })

      expect(bookings).toHaveLength(2)
      expect(bookings.map((b) => b.email)).toContain('user1@example.com')
      expect(bookings.map((b) => b.email)).toContain('user2@example.com')
    })

    it('should find booking by email', async () => {
      const event = await createTestEvent()

      await Booking.build({
        eventId: event._id,
        email: 'findme@example.com',
      }).save()

      const booking = await Booking.findOne({ email: 'findme@example.com' })

      expect(booking).toBeDefined()
      expect(booking?.email).toBe('findme@example.com')
    })

    it('should allow multiple bookings for same event with different emails', async () => {
      const event = await createTestEvent()

      const booking1 = Booking.build({
        eventId: event._id,
        email: 'user1@example.com',
      })
      await booking1.save()

      const booking2 = Booking.build({
        eventId: event._id,
        email: 'user2@example.com',
      })
      await booking2.save()

      const bookings = await Booking.find({ eventId: event._id })
      expect(bookings).toHaveLength(2)
    })

    it('should allow same email for different events', async () => {
      const event1 = await createTestEvent()
      const event2 = await Event.build({
        title: 'Second Event',
        description: 'desc',
        overview: 'overview',
        image: 'img.jpg',
        venue: 'venue',
        location: 'location',
        date: '2024-01-01',
        time: '10:00',
        mode: 'online',
        audience: 'all',
        agenda: ['test'],
        organizer: 'org',
        tags: ['test'],
      }).save()

      const booking1 = Booking.build({
        eventId: event1._id,
        email: 'user@example.com',
      })
      await booking1.save()

      const booking2 = Booking.build({
        eventId: event2._id,
        email: 'user@example.com',
      })
      await booking2.save()

      const bookings = await Booking.find({ email: 'user@example.com' })
      expect(bookings).toHaveLength(2)
    })
  })

  describe('Population', () => {
    it('should populate event details when querying booking', async () => {
      const event = await createTestEvent()

      const booking = Booking.build({
        eventId: event._id,
        email: 'user@example.com',
      })
      await booking.save()

      const populatedBooking = await Booking.findById(booking._id).populate('eventId')

      expect(populatedBooking).toBeDefined()
      expect(populatedBooking?.eventId).toBeDefined()
      // TypeScript doesn't know it's populated, so we cast
      const populatedEvent = populatedBooking?.eventId as any
      expect(populatedEvent.title).toBe('Test Event')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long email addresses', async () => {
      const event = await createTestEvent()
      const longEmail = 'a'.repeat(50) + '@' + 'b'.repeat(50) + '.com'

      const booking = Booking.build({
        eventId: event._id,
        email: longEmail,
      })
      await booking.save()

      expect(booking.email).toBe(longEmail)
    })

    it('should handle special characters in email local part', async () => {
      const event = await createTestEvent()

      const booking = Booking.build({
        eventId: event._id,
        email: 'user+tag.test@example.com',
      })
      await booking.save()

      expect(booking.email).toBe('user+tag.test@example.com')
    })

    it('should reject email with consecutive dots', async () => {
      const event = await createTestEvent()

      const booking = Booking.build({
        eventId: event._id,
        email: 'user..name@example.com',
      })

      // This should be rejected by the email regex
      await expect(booking.save()).rejects.toThrow()
    })
  })

  describe('Indexing', () => {
    it('should have eventId indexed for query performance', async () => {
      const indexes = await Booking.collection.getIndexes()

      // Check if eventId is indexed
      const hasEventIdIndex = Object.values(indexes).some((index: any) => {
        return index.some((field: any) => field[0] === 'eventId')
      })

      expect(hasEventIdIndex).toBe(true)
    })
  })

  describe('Strict Mode', () => {
    it('should reject unknown fields in strict mode', async () => {
      const event = await createTestEvent()

      const booking = new Booking({
        eventId: event._id,
        email: 'user@example.com',
        unknownField: 'should not be saved',
      } as any)

      await booking.save()

      // unknownField should not be saved due to strict mode
      expect((booking as any).unknownField).toBeUndefined()
    })
  })

  describe('Delete Operations', () => {
    it('should successfully delete a booking', async () => {
      const event = await createTestEvent()

      const booking = Booking.build({
        eventId: event._id,
        email: 'user@example.com',
      })
      await booking.save()

      const bookingId = booking._id

      await Booking.deleteOne({ _id: bookingId })

      const deletedBooking = await Booking.findById(bookingId)
      expect(deletedBooking).toBeNull()
    })

    it('should allow deleting event with associated bookings', async () => {
      const event = await createTestEvent()

      await Booking.build({
        eventId: event._id,
        email: 'user@example.com',
      }).save()

      // Deleting event should succeed (cascade behavior depends on application logic)
      await Event.deleteOne({ _id: event._id })

      const deletedEvent = await Event.findById(event._id)
      expect(deletedEvent).toBeNull()

      // Booking still exists (no cascade delete at DB level)
      const booking = await Booking.findOne({ eventId: event._id })
      expect(booking).toBeDefined()
    })
  })
})