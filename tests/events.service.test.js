const { ValidationError, ForeignKeyConstraintError } = require('sequelize')

jest.mock('../models/dbConfig', () => ({
    username: 'root',
    password: 'admin',
    database: 'testevents',
    host: 'localhost',
    dialect: 'mysql',
    define: {
        timestamps: false
    },
    logging: false
}))

// Setup db and service
const db = require('../models')
const EventService = require('../services/eventService');
const eventService = new EventService(db)

beforeAll(async () => {
    await db.sequelize.sync({force: true})
    await db.EventType.bulkCreate([
        { id: 1, name: 'Conference' },
        { id: 2, name: 'Meetup' },
        { id: 3, name: 'Workshop' },
        { id: 4, name: 'Seminar' }
    ])
    await db.Event.bulkCreate([
        { id: 1, title: 'Test Event 1', date: '2025-05-01', location: 'Oslo', eventTypeId: 1},
        { id: 2, title: 'Test Event 2', date: '2025-06-10', location: 'Bergen', eventTypeId: 2}
    ])
});

describe('Event service GET tests', () => {
    test('EventService getAll, should return array of events', async () => {
        const events = await eventService.getAll()

        expect(events).toBeInstanceOf(Array)
        expect(events.length).toEqual(2)
    })

    test('EventService getById with valid ID, should return event', async () => {
        const validID = 1
        const event = await eventService.getById(validID)

        // I changed eventTypeIdId to instead show the event type as string for getById to demonstrate how to flatten returned objects
        expect(event).toEqual({ id: 1, title: 'Test Event 1', date: '2025-05-01', location: 'Oslo', eventType: 'Conference'})
    })

    test('EventService getById with invalid ID, should return null', async () => {
        const invalidId = 999
        const event = await eventService.getById(invalidId)

        expect(event).toEqual(null)
    })
})

describe('Event service POST tests', () => {
    test('EventService create with valid data, should return newly created event', async () => {
        const validData = {
            title: 'Test Event 3',
            date: '2025-06-11',
            location: 'Oslo',
            eventTypeId: 1
        }

        const newEvent = await eventService.create(validData)

        expect(newEvent).toEqual({ id: 3, ...validData})
    })

    test('EventService create with invalid data (missing title), should throw ValidationError', async () => {
        const invalidData = {
            date: '2025-06-11',
            location: 'Oslo',
            eventTypeId: 1
        }
        // Adapted from https://jestjs.io/docs/asynchronous#asyncawait
        await expect(eventService.create(invalidData)).rejects.toThrow(ValidationError);
    })

    test('EventService create with invalid data (past date), should throw ValidationError', async () => {
        const invalidData = {
            title: 'Test Event 3',
            date: '2024-06-11',
            location: 'Oslo',
            eventTypeId: 1
        }
        // Adapted from https://jestjs.io/docs/asynchronous#asyncawait
        await expect(eventService.create(invalidData)).rejects.toThrow(ValidationError);
    })

    test('EventService create with invalid data (short title), should throw ValidationError', async () => {
        const invalidData = {
            title: 't',
            date: '2025-06-11',
            location: 'Oslo',
            eventTypeId: 1
        }
        // Adapted from https://jestjs.io/docs/asynchronous#asyncawait
        await expect(eventService.create(invalidData)).rejects.toThrow(ValidationError);
    })

    test('EventService create with invalid data (invalid event type), should throw ForeignKeyConstraintError error', async () => {
        const invalidData = {
            title: 'Test Event 4',
            date: '2025-06-11',
            location: 'Oslo',
            eventTypeId: 99
        }
        // Adapted from https://jestjs.io/docs/asynchronous#asyncawait
        await expect(eventService.create(invalidData)).rejects.toThrow(ForeignKeyConstraintError);
    })
})

describe('Event service PUT tests', () => {
    test('EventService update with valid data (title), should update', async () => {
        const eventId = 1
        const validData = {
            id: 1,
            title: 'Updated Test Event 1',
            date: '2025-05-01', 
            location: 'Oslo', 
            eventTypeId: 1
        }
        const expectedRowsAffected = 1

        const affectedRows = await eventService.update(eventId, validData)

        expect(affectedRows).toEqual(expectedRowsAffected)
    })

    test('EventService update with invalid data (id), should return null', async () => {
        const eventId = 99
        const invalidData = {
            id: 99,
            title: 'Updated Test Event 1',
            date: '2025-05-01', 
            location: 'Oslo', 
            eventTypeId: 1
        }

        const result = await eventService.update(eventId, invalidData)

        expect(result).toBe(null)
    })

    test('EventService update with invalid data (past date), should throw ValidationError', async () => {
        const eventId = 1
        const invalidData = {
            id: 1,
            title: 'Updated Test Event 1',
            date: '2024-05-01', 
            location: 'Oslo', 
            eventTypeId: 1
        }

        // Adapted from https://jestjs.io/docs/asynchronous#asyncawait
        await expect(eventService.update(eventId, invalidData)).rejects.toThrow(ValidationError);
    })

    test('EventService update with invalid data (invalid type), should throw ForeignKeyConstraintError', async () => {
        const eventId = 1
        const invalidData = {
            id: 1,
            title: 'Updated Test Event 1',
            date: '2025-05-01', 
            location: 'Oslo', 
            eventTypeId: 99
        }

        // Adapted from https://jestjs.io/docs/asynchronous#asyncawait
        await expect(eventService.update(eventId, invalidData)).rejects.toThrow(ForeignKeyConstraintError);
    })
})

afterAll(async () => {
    await db.sequelize.close()
})