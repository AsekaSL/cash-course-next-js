import mongoose from 'mongoose'
import { Event, EventAttrs, EventDoc } from '../event.model'

describe('Event Model', () => {
  describe('Model Creation and Validation', () => {
    it('should create a valid event with all required fields', async () => {
      const eventAttrs: EventAttrs = {
        title: 'React Summit 2024',
        description: 'The biggest React conference',
        overview: 'Join us for an amazing React experience',
        image: 'https://example.com/react-summit.jpg',
        venue: 'Convention Center',
        location: 'San Francisco, CA',
        date: '2024-06-15',
        time: '09:00',
        mode: 'hybrid',
        audience: 'developers',
        agenda: ['Keynote', 'Workshops', 'Networking'],
        organizer: 'React Community',
        tags: ['react', 'javascript', 'frontend'],
      }

      const event = Event.build(eventAttrs)
      await event.save()

      expect(event._id).toBeDefined()
      expect(event.title).toBe('React Summit 2024')
      expect(event.slug).toBe('react-summit-2024')
      expect(event.description).toBe('The biggest React conference')
      expect(event.overview).toBe('Join us for an amazing React experience')
      expect(event.image).toBe('https://example.com/react-summit.jpg')
      expect(event.venue).toBe('Convention Center')
      expect(event.location).toBe('San Francisco, CA')
      expect(event.date).toBe('2024-06-15T00:00:00.000Z')
      expect(event.time).toBe('09:00')
      expect(event.mode).toBe('hybrid')
      expect(event.audience).toBe('developers')
      expect(event.agenda).toEqual(['Keynote', 'Workshops', 'Networking'])
      expect(event.organizer).toBe('React Community')
      expect(event.tags).toEqual(['react', 'javascript', 'frontend'])
      expect(event.createdAt).toBeInstanceOf(Date)
      expect(event.updatedAt).toBeInstanceOf(Date)
    })

    it('should fail when required fields are missing', async () => {
      const incompleteEvent = new Event({
        title: 'Incomplete Event',
      })

      await expect(incompleteEvent.save()).rejects.toThrow()
    })

    it('should fail when title is missing', async () => {
      const eventAttrs = {
        description: 'Test description',
        overview: 'Test overview',
        image: 'test.jpg',
        venue: 'Test Venue',
        location: 'Test Location',
        date: '2024-01-01',
        time: '10:00',
        mode: 'online',
        audience: 'all',
        agenda: ['test'],
        organizer: 'Test Org',
        tags: ['test'],
      }

      const event = new Event(eventAttrs)
      await expect(event.save()).rejects.toThrow()
    })

    it('should trim whitespace from string fields', async () => {
      const eventAttrs: EventAttrs = {
        title: '  Whitespace Event  ',
        description: '  Description with spaces  ',
        overview: '  Overview with spaces  ',
        image: '  image.jpg  ',
        venue: '  Venue Name  ',
        location: '  Location  ',
        date: '2024-01-01',
        time: '10:00',
        mode: '  online  ',
        audience: '  developers  ',
        agenda: ['item1', 'item2'],
        organizer: '  Organizer  ',
        tags: ['tag1', 'tag2'],
      }

      const event = Event.build(eventAttrs)
      await event.save()

      expect(event.title).toBe('Whitespace Event')
      expect(event.description).toBe('Description with spaces')
      expect(event.overview).toBe('Overview with spaces')
      expect(event.image).toBe('image.jpg')
      expect(event.venue).toBe('Venue Name')
      expect(event.location).toBe('Location')
      expect(event.mode).toBe('online')
      expect(event.audience).toBe('developers')
      expect(event.organizer).toBe('Organizer')
    })
  })

  describe('Slug Generation', () => {
    it('should generate a slug from title automatically', async () => {
      const event = Event.build({
        title: 'Amazing JavaScript Conference',
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
        tags: ['js'],
      })
      await event.save()

      expect(event.slug).toBe('amazing-javascript-conference')
    })

    it('should handle special characters in title when generating slug', async () => {
      const event = Event.build({
        title: 'React & Vue: The Ultimate Battle!!!',
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
        tags: ['react', 'vue'],
      })
      await event.save()

      expect(event.slug).toBe('react-vue-the-ultimate-battle')
    })

    it('should handle multiple spaces and dashes in title', async () => {
      const event = Event.build({
        title: 'Node.js    Conference  --  2024',
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
        tags: ['nodejs'],
      })
      await event.save()

      expect(event.slug).toBe('nodejs-conference-2024')
    })

    it('should create unique slugs for events with same title', async () => {
      const baseAttrs: EventAttrs = {
        title: 'Web Dev Conference',
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
        tags: ['web'],
      }

      const event1 = Event.build(baseAttrs)
      await event1.save()

      const event2 = Event.build(baseAttrs)
      await event2.save()

      const event3 = Event.build(baseAttrs)
      await event3.save()

      expect(event1.slug).toBe('web-dev-conference')
      expect(event2.slug).toBe('web-dev-conference-1')
      expect(event3.slug).toBe('web-dev-conference-2')
    })

    it('should update slug when title is modified', async () => {
      const event = Event.build({
        title: 'Original Title',
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
      })
      await event.save()

      expect(event.slug).toBe('original-title')

      event.title = 'Updated Title'
      await event.save()

      expect(event.slug).toBe('updated-title')
    })

    it('should not regenerate slug if title unchanged', async () => {
      const event = Event.build({
        title: 'Consistent Title',
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
      })
      await event.save()

      const originalSlug = event.slug

      event.description = 'Updated description'
      await event.save()

      expect(event.slug).toBe(originalSlug)
    })

    it('should handle unicode characters in slug generation', async () => {
      const event = Event.build({
        title: 'Café JavaScript 2024 ☕',
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
        tags: ['js'],
      })
      await event.save()

      expect(event.slug).toBe('caf-javascript-2024')
    })
  })

  describe('Date Validation and Normalization', () => {
    it('should accept valid ISO date string', async () => {
      const event = Event.build({
        title: 'Test Event',
        description: 'desc',
        overview: 'overview',
        image: 'img.jpg',
        venue: 'venue',
        location: 'location',
        date: '2024-12-25T00:00:00.000Z',
        time: '10:00',
        mode: 'online',
        audience: 'all',
        agenda: ['test'],
        organizer: 'org',
        tags: ['test'],
      })
      await event.save()

      expect(event.date).toBe('2024-12-25T00:00:00.000Z')
    })

    it('should normalize YYYY-MM-DD date format to ISO string', async () => {
      const event = Event.build({
        title: 'Test Event',
        description: 'desc',
        overview: 'overview',
        image: 'img.jpg',
        venue: 'venue',
        location: 'location',
        date: '2024-06-15',
        time: '10:00',
        mode: 'online',
        audience: 'all',
        agenda: ['test'],
        organizer: 'org',
        tags: ['test'],
      })
      await event.save()

      expect(event.date).toMatch(/2024-06-15T\d{2}:\d{2}:\d{2}\.\d{3}Z/)
    })

    it('should normalize various date formats to ISO string', async () => {
      const event = Event.build({
        title: 'Test Event',
        description: 'desc',
        overview: 'overview',
        image: 'img.jpg',
        venue: 'venue',
        location: 'location',
        date: 'June 15, 2024',
        time: '10:00',
        mode: 'online',
        audience: 'all',
        agenda: ['test'],
        organizer: 'org',
        tags: ['test'],
      })
      await event.save()

      const parsedDate = new Date(event.date)
      expect(parsedDate.getFullYear()).toBe(2024)
      expect(parsedDate.getMonth()).toBe(5) // June is month 5 (0-indexed)
      expect(parsedDate.getDate()).toBe(15)
    })

    it('should reject invalid date format', async () => {
      const event = Event.build({
        title: 'Test Event',
        description: 'desc',
        overview: 'overview',
        image: 'img.jpg',
        venue: 'venue',
        location: 'location',
        date: 'not-a-valid-date',
        time: '10:00',
        mode: 'online',
        audience: 'all',
        agenda: ['test'],
        organizer: 'org',
        tags: ['test'],
      })

      await expect(event.save()).rejects.toThrow('Invalid date format')
    })

    it('should reject empty date string', async () => {
      const event = Event.build({
        title: 'Test Event',
        description: 'desc',
        overview: 'overview',
        image: 'img.jpg',
        venue: 'venue',
        location: 'location',
        date: '',
        time: '10:00',
        mode: 'online',
        audience: 'all',
        agenda: ['test'],
        organizer: 'org',
        tags: ['test'],
      })

      await expect(event.save()).rejects.toThrow()
    })

    it('should update date when modified', async () => {
      const event = Event.build({
        title: 'Test Event',
        description: 'desc',
        overview: 'overview',
        image: 'img.jpg',
        venue: 'venue',
        location: 'location',
        date: '2024-06-15',
        time: '10:00',
        mode: 'online',
        audience: 'all',
        agenda: ['test'],
        organizer: 'org',
        tags: ['test'],
      })
      await event.save()

      event.date = '2024-12-25'
      await event.save()

      expect(event.date).toMatch(/2024-12-25T/)
    })
  })

  describe('Time Validation and Normalization', () => {
    it('should accept valid 24-hour time format HH:MM', async () => {
      const event = Event.build({
        title: 'Test Event',
        description: 'desc',
        overview: 'overview',
        image: 'img.jpg',
        venue: 'venue',
        location: 'location',
        date: '2024-01-01',
        time: '14:30',
        mode: 'online',
        audience: 'all',
        agenda: ['test'],
        organizer: 'org',
        tags: ['test'],
      })
      await event.save()

      expect(event.time).toBe('14:30')
    })

    it('should normalize AM time to 24-hour format', async () => {
      const event = Event.build({
        title: 'Test Event',
        description: 'desc',
        overview: 'overview',
        image: 'img.jpg',
        venue: 'venue',
        location: 'location',
        date: '2024-01-01',
        time: '9:30 AM',
        mode: 'online',
        audience: 'all',
        agenda: ['test'],
        organizer: 'org',
        tags: ['test'],
      })
      await event.save()

      expect(event.time).toBe('09:30')
    })

    it('should normalize PM time to 24-hour format', async () => {
      const event = Event.build({
        title: 'Test Event',
        description: 'desc',
        overview: 'overview',
        image: 'img.jpg',
        venue: 'venue',
        location: 'location',
        date: '2024-01-01',
        time: '3:45 PM',
        mode: 'online',
        audience: 'all',
        agenda: ['test'],
        organizer: 'org',
        tags: ['test'],
      })
      await event.save()

      expect(event.time).toBe('15:45')
    })

    it('should handle 12:00 AM (midnight) correctly', async () => {
      const event = Event.build({
        title: 'Test Event',
        description: 'desc',
        overview: 'overview',
        image: 'img.jpg',
        venue: 'venue',
        location: 'location',
        date: '2024-01-01',
        time: '12:00 AM',
        mode: 'online',
        audience: 'all',
        agenda: ['test'],
        organizer: 'org',
        tags: ['test'],
      })
      await event.save()

      expect(event.time).toBe('00:00')
    })

    it('should handle 12:00 PM (noon) correctly', async () => {
      const event = Event.build({
        title: 'Test Event',
        description: 'desc',
        overview: 'overview',
        image: 'img.jpg',
        venue: 'venue',
        location: 'location',
        date: '2024-01-01',
        time: '12:00 PM',
        mode: 'online',
        audience: 'all',
        agenda: ['test'],
        organizer: 'org',
        tags: ['test'],
      })
      await event.save()

      expect(event.time).toBe('12:00')
    })

    it('should handle lowercase am/pm', async () => {
      const event = Event.build({
        title: 'Test Event',
        description: 'desc',
        overview: 'overview',
        image: 'img.jpg',
        venue: 'venue',
        location: 'location',
        date: '2024-01-01',
        time: '2:15 pm',
        mode: 'online',
        audience: 'all',
        agenda: ['test'],
        organizer: 'org',
        tags: ['test'],
      })
      await event.save()

      expect(event.time).toBe('14:15')
    })

    it('should pad single-digit hours with zero', async () => {
      const event = Event.build({
        title: 'Test Event',
        description: 'desc',
        overview: 'overview',
        image: 'img.jpg',
        venue: 'venue',
        location: 'location',
        date: '2024-01-01',
        time: '9:00',
        mode: 'online',
        audience: 'all',
        agenda: ['test'],
        organizer: 'org',
        tags: ['test'],
      })
      await event.save()

      expect(event.time).toBe('09:00')
    })

    it('should reject invalid time format', async () => {
      const event = Event.build({
        title: 'Test Event',
        description: 'desc',
        overview: 'overview',
        image: 'img.jpg',
        venue: 'venue',
        location: 'location',
        date: '2024-01-01',
        time: 'not-a-time',
        mode: 'online',
        audience: 'all',
        agenda: ['test'],
        organizer: 'org',
        tags: ['test'],
      })

      await expect(event.save()).rejects.toThrow('Invalid time format')
    })

    it('should reject time with invalid hours', async () => {
      const event = Event.build({
        title: 'Test Event',
        description: 'desc',
        overview: 'overview',
        image: 'img.jpg',
        venue: 'venue',
        location: 'location',
        date: '2024-01-01',
        time: '25:00',
        mode: 'online',
        audience: 'all',
        agenda: ['test'],
        organizer: 'org',
        tags: ['test'],
      })

      await expect(event.save()).rejects.toThrow('Invalid time values')
    })

    it('should reject time with invalid minutes', async () => {
      const event = Event.build({
        title: 'Test Event',
        description: 'desc',
        overview: 'overview',
        image: 'img.jpg',
        venue: 'venue',
        location: 'location',
        date: '2024-01-01',
        time: '12:99',
        mode: 'online',
        audience: 'all',
        agenda: ['test'],
        organizer: 'org',
        tags: ['test'],
      })

      await expect(event.save()).rejects.toThrow('Invalid time values')
    })

    it('should reject time without minutes', async () => {
      const event = Event.build({
        title: 'Test Event',
        description: 'desc',
        overview: 'overview',
        image: 'img.jpg',
        venue: 'venue',
        location: 'location',
        date: '2024-01-01',
        time: '14',
        mode: 'online',
        audience: 'all',
        agenda: ['test'],
        organizer: 'org',
        tags: ['test'],
      })

      await expect(event.save()).rejects.toThrow('Invalid time format')
    })

    it('should update time when modified', async () => {
      const event = Event.build({
        title: 'Test Event',
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
      })
      await event.save()

      event.time = '3:30 PM'
      await event.save()

      expect(event.time).toBe('15:30')
    })
  })

  describe('Array Fields', () => {
    it('should accept agenda as array of strings', async () => {
      const agenda = ['Registration', 'Keynote Speech', 'Workshop', 'Lunch', 'Panel Discussion']
      const event = Event.build({
        title: 'Test Event',
        description: 'desc',
        overview: 'overview',
        image: 'img.jpg',
        venue: 'venue',
        location: 'location',
        date: '2024-01-01',
        time: '10:00',
        mode: 'online',
        audience: 'all',
        agenda,
        organizer: 'org',
        tags: ['test'],
      })
      await event.save()

      expect(event.agenda).toEqual(agenda)
    })

    it('should accept tags as array of strings', async () => {
      const tags = ['javascript', 'react', 'nodejs', 'frontend', 'backend']
      const event = Event.build({
        title: 'Test Event',
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
        tags,
      })
      await event.save()

      expect(event.tags).toEqual(tags)
    })

    it('should accept empty arrays for agenda and tags', async () => {
      const event = Event.build({
        title: 'Test Event',
        description: 'desc',
        overview: 'overview',
        image: 'img.jpg',
        venue: 'venue',
        location: 'location',
        date: '2024-01-01',
        time: '10:00',
        mode: 'online',
        audience: 'all',
        agenda: [],
        organizer: 'org',
        tags: [],
      })
      await event.save()

      expect(event.agenda).toEqual([])
      expect(event.tags).toEqual([])
    })
  })

  describe('Timestamps', () => {
    it('should automatically set createdAt timestamp', async () => {
      const event = Event.build({
        title: 'Test Event',
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
      })

      const beforeSave = new Date()
      await event.save()
      const afterSave = new Date()

      expect(event.createdAt).toBeInstanceOf(Date)
      expect(event.createdAt.getTime()).toBeGreaterThanOrEqual(beforeSave.getTime())
      expect(event.createdAt.getTime()).toBeLessThanOrEqual(afterSave.getTime())
    })

    it('should automatically update updatedAt timestamp on modification', async () => {
      const event = Event.build({
        title: 'Test Event',
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
      })
      await event.save()

      const originalUpdatedAt = event.updatedAt

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 10))

      event.description = 'Updated description'
      await event.save()

      expect(event.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime())
    })
  })

  describe('Build Helper Method', () => {
    it('should create event using build helper', () => {
      const attrs: EventAttrs = {
        title: 'Helper Test',
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
      }

      const event = Event.build(attrs)

      expect(event).toBeInstanceOf(Event)
      expect(event.title).toBe('Helper Test')
    })

    it('should enforce type safety through build helper', () => {
      const attrs: EventAttrs = {
        title: 'Type Safe Event',
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
      }

      const event = Event.build(attrs)
      expect(event.title).toBe('Type Safe Event')
    })
  })

  describe('Query Operations', () => {
    it('should find event by slug', async () => {
      const event = Event.build({
        title: 'Findable Event',
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
      })
      await event.save()

      const found = await Event.findOne({ slug: 'findable-event' })

      expect(found).toBeDefined()
      expect(found?.title).toBe('Findable Event')
    })

    it('should find events by tag', async () => {
      await Event.build({
        title: 'React Event',
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
        tags: ['react', 'frontend'],
      }).save()

      await Event.build({
        title: 'Node Event',
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
        tags: ['nodejs', 'backend'],
      }).save()

      const reactEvents = await Event.find({ tags: 'react' })

      expect(reactEvents).toHaveLength(1)
      expect(reactEvents[0].title).toBe('React Event')
    })

    it('should enforce unique slug constraint', async () => {
      const event1 = Event.build({
        title: 'Unique Event',
        slug: 'custom-slug',
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
      })
      await event1.save()

      const event2 = new Event({
        title: 'Another Event',
        slug: 'custom-slug',
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
      })

      await expect(event2.save()).rejects.toThrow()
    })
  })

  describe('Edge Cases', () => {
    it('should handle very long title', async () => {
      const longTitle = 'A'.repeat(500)
      const event = Event.build({
        title: longTitle,
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
      })
      await event.save()

      expect(event.title).toBe(longTitle)
      expect(event.slug).toBeDefined()
    })

    it('should handle agenda with many items', async () => {
      const manyItems = Array.from({ length: 100 }, (_, i) => `Item ${i + 1}`)
      const event = Event.build({
        title: 'Big Agenda Event',
        description: 'desc',
        overview: 'overview',
        image: 'img.jpg',
        venue: 'venue',
        location: 'location',
        date: '2024-01-01',
        time: '10:00',
        mode: 'online',
        audience: 'all',
        agenda: manyItems,
        organizer: 'org',
        tags: ['test'],
      })
      await event.save()

      expect(event.agenda).toHaveLength(100)
    })

    it('should handle many tags', async () => {
      const manyTags = Array.from({ length: 50 }, (_, i) => `tag${i + 1}`)
      const event = Event.build({
        title: 'Many Tags Event',
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
        tags: manyTags,
      })
      await event.save()

      expect(event.tags).toHaveLength(50)
    })
  })
})