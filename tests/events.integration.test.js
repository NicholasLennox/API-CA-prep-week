const request = require('supertest')
const app = require('../util/testAppSetup')
require('dotenv').config()

// Mock dbConfig
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

// Init test db
const db = require('../models')
const { initTestDb } = require('../util/testDbInit')

// Variables for tests
let accessToken = null
let createdEvent = null

beforeAll(async () => {
    await initTestDb(db)

    // Need access token to pass to routes
    const userCreds = {
        email: 'user1@example.com',
        password: 'Password123'
    }
    const response = await request(app)
        .post('/auth/login')
        .send(userCreds)

    accessToken = response.body.data.token
})

describe('Event integration tests', () => {
    test('GET /events, should return all events', async () => {
        const response = await request(app)
            .get('/events')

        // Verify status code
        expect(response.status).toBe(200)
        // Verifying structure of response body
        expect(response.body).toHaveProperty('status', 'success')
        expect(response.body).toHaveProperty('data')
        expect(response.body.data).toBeInstanceOf(Array)
        expect(response.body.data.length).toEqual(2)
    })

    test('GET /events/mine with valid token, should return events for user', async () => {
        const response = await request(app)
            .get('/events/mine')
            .set('Authorization', `Bearer ${accessToken}`)

        // Verify status code
        expect(response.status).toBe(200)
        // Verifying structure of response body
        expect(response.body).toHaveProperty('status', 'success')
        expect(response.body).toHaveProperty('data')
        expect(response.body.data).toBeInstanceOf(Array)
        expect(response.body.data.length).toEqual(1)
    })

    test('POST /events with valid payload, should return 201 with created event', async () => {
        const newEvent = {
            title: 'Test Event 3',
            date: '2025-05-01',
            location: 'Oslo',
            eventTypeId: 1
        }
        const response = await request(app)
            .post('/events')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(newEvent)

        // Verify status code
        expect(response.status).toBe(201)
        // Verifying structure of response body
        expect(response.body).toHaveProperty('status', 'success')
        expect(response.body).toHaveProperty('data', {
            id: 3,
            title: 'Test Event 3',
            date: '2025-05-01',
            location: 'Oslo',
            eventTypeId: 1,
            userId: 1
        })
        createdEvent = response.body.data
    })

    test('POST /events with invalid payload (past date), should return 400 with message', async () => {
        const invalidDateEvent = {
            title: 'Test Event 3',
            date: '2024-05-01',
            location: 'Oslo',
            eventTypeId: 1
        }
        const response = await request(app)
            .post('/events')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidDateEvent)

        // Verify status code
        expect(response.status).toBe(400)
        // Verifying structure of response body
        expect(response.body).toHaveProperty('status', 'fail')
        expect(response.body).toHaveProperty('data', 'Date must be in the future')
    })

    test('POST /events with invalid payload (invalid event type), should return 400 with message', async () => {
        const invalidTypeEvent = {
            title: 'Test Event 3',
            date: '2025-05-01',
            location: 'Oslo',
            eventTypeId: 99
        }
        const response = await request(app)
            .post('/events')
            .set('Authorization', `Bearer ${accessToken}`)
            .send(invalidTypeEvent)

        // Verify status code
        expect(response.status).toBe(400)
        // Verifying structure of response body
        expect(response.body).toHaveProperty('status', 'fail')
        expect(response.body).toHaveProperty('data', 'Invalid foreign key')       
    })

    test('PUT /events/:id with valid payload, should return 200 with message', async () => {
        const updatedEvent = {
            ...createdEvent,
            title: 'Updated Event 3'
        }
        
        const response = await request(app)
            .put(`/events/${createdEvent.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(updatedEvent)
        

        // Verify status code
        expect(response.status).toBe(200)
        // Verifying structure of response body
        expect(response.body).toHaveProperty('status', 'success')
        expect(response.body).toHaveProperty('data', 'Event updated')       
    })

    test('PUT /events/:id with incorrect path, should return 400 with message', async () => {
        const updatedEvent = {
            ...createdEvent,
            title: 'Updated Event 3'
        }
        const invalidPath = 99
        
        const response = await request(app)
            .put(`/events/${invalidPath}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(updatedEvent)
        

        // Verify status code
        expect(response.status).toBe(400)
        // Verifying structure of response body
        expect(response.body).toHaveProperty('status', 'fail')
        expect(response.body).toHaveProperty('data', 'Path ID does not match payload ID')       
    })

    test('PUT /events/:id with incorrect userId, should return 403 with message', async () => {
        const changedUserId = {
            ...createdEvent,
            userId: 99
        }
        
        const response = await request(app)
            .put(`/events/${changedUserId.id}`)
            .set('Authorization', `Bearer ${accessToken}`)
            .send(changedUserId)
        

        // Verify status code
        expect(response.status).toBe(403)
        // Verifying structure of response body
        expect(response.body).toHaveProperty('status', 'fail')
        expect(response.body).toHaveProperty('data', 'You can only update your own events')       
    })
})  

afterAll(async () => {
    await db.sequelize.close()
})