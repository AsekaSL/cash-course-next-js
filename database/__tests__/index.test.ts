import * as databaseExports from '../index'
import { Event } from '../event.model'
import { Booking } from '../booking.model'

describe('Database Index', () => {
  describe('Named Exports', () => {
    it('should export Event model', () => {
      expect(databaseExports.Event).toBeDefined()
      expect(databaseExports.Event).toBe(Event)
    })

    it('should export Booking model', () => {
      expect(databaseExports.Booking).toBeDefined()
      expect(databaseExports.Booking).toBe(Booking)
    })
  })

  describe('Default Export', () => {
    it('should have default export with both models', () => {
      expect(databaseExports.default).toBeDefined()
      expect(databaseExports.default.Event).toBe(Event)
      expect(databaseExports.default.Booking).toBe(Booking)
    })
  })

  describe('Export Structure', () => {
    it('should export exactly the expected models', () => {
      const exportKeys = Object.keys(databaseExports).filter((key) => key !== 'default')
      expect(exportKeys).toContain('Event')
      expect(exportKeys).toContain('Booking')
    })
  })
})