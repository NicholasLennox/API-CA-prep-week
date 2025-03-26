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

beforeAll(async () => {
    await initTestDb(db)
})

// Integration tests
describe('Authentication integration tests', () => {
    // Dependencies needed
    const jwt = require('jsonwebtoken')

    // Setup variables needed
    const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET
    let accessToken = null;

    describe('Login tests', () => {
        test('POST /auth/login with valid credentials, should return 200 with token', async () => {
            const validCredentials = {
                email: 'user1@example.com',
                password: 'Password123'
            }

            const response = await request(app)
                .post('/auth/login')
                .send(validCredentials)

            // Verify status code
            expect(response.status).toBe(200)
            // Verifying structure of response body
            expect(response.body).toHaveProperty('status', 'success')
            expect(response.body).toHaveProperty('data')
            expect(response.body.data).toHaveProperty('token')
            expect(response.body.data.token).toBeDefined()
            // Once we have confirmed we have a token, assign it to our variable
            accessToken = response.body.data.token
        })

        test('POST /auth/login with invalid credentials (missing email), should return 400 with message', async () => {
            const missingEmail = {
                password: 'Password123'
            }

            const response = await request(app)
                .post('/auth/login')
                .send(missingEmail)

            // Verify status code
            expect(response.status).toBe(400)
            // Verifying structure of response body
            expect(response.body).toHaveProperty('status', 'fail')
            expect(response.body).toHaveProperty('data', 'Both email and password are required')
        })

        test('POST /auth/login with invalid credentials (wrong email), should return 404 with message', async () => {
            const incorrectEmail = {
                email: 'user1@examples.com',
                password: 'Password123'
            }

            const response = await request(app)
                .post('/auth/login')
                .send(incorrectEmail)

            // Verify status code
            expect(response.status).toBe(404)
            // Verifying structure of response body
            expect(response.body).toHaveProperty('status', 'fail')
            expect(response.body).toHaveProperty('data', 'No user with that email found')
        })

        test('POST /auth/login with invalid credentials (wrong password), should return 401 with message', async () => {
            const incorrectPassword = {
                email: 'user1@example.com',
                password: 'Password1234'
            }

            const response = await request(app)
                .post('/auth/login')
                .send(incorrectPassword)

            // Verify status code
            expect(response.status).toBe(401)
            // Verifying structure of response body
            expect(response.body).toHaveProperty('status', 'fail')
            expect(response.body).toHaveProperty('data', 'Invalid credentials')
        })
    })

    describe('Signup tests', () => {
        test('POST /auth/signup with valid payload, should return 201 with new user', async () => {
            const validCredentials = {
                email: 'user3@example.com',
                password: 'Pass123'
            }

            const response = await request(app)
                .post('/auth/signup')
                .send(validCredentials)

            // Verify status code
            expect(response.status).toBe(201)
            // Verifying structure of response body
            expect(response.body).toHaveProperty('status', 'success')
            expect(response.body).toHaveProperty('data')
            expect(response.body.data).toHaveProperty('id', 3)
            expect(response.body.data).toHaveProperty('email', validCredentials.email)
        })

        test('POST /auth/signup with invalid payload (missing email), should return 400 with message', async () => {
            const missingEmail = {
                password: 'Pass123'
            }

            const response = await request(app)
                .post('/auth/signup')
                .send(missingEmail)

            // Verify status code
            expect(response.status).toBe(400)
            // Verifying structure of response body
            expect(response.body).toHaveProperty('status', 'fail')
            expect(response.body).toHaveProperty('data', 'Both email and password are required')
        })

        test('POST /auth/signup with invalid payload (invalid email), should return 400 with message', async () => {
            const invalidEmail = {
                email: 'user3',
                password: 'Pass123'
            }

            const response = await request(app)
                .post('/auth/signup')
                .send(invalidEmail)

            // Verify status code
            expect(response.status).toBe(400)
            // Verifying structure of response body
            expect(response.body).toHaveProperty('status', 'fail')
            expect(response.body).toHaveProperty('data', 'Invalid email format')
        })
    })

    describe('Protected endpoint tests', () => {
        test('GET /auth/protected with valid token, should get access', async () => {
            const response = await request(app)
                .get('/auth/protected')
                .set('Authorization', `Bearer ${accessToken}`)

            // Verify status code
            expect(response.status).toBe(200)
            // Verifying structure of response body
            expect(response.body).toHaveProperty('status', 'success')
            expect(response.body).toHaveProperty('data', 'Access granted')
        })

        test('GET /auth/protected with no token, should return 401 with message', async () => {
            // Request using supertest
            const response = await request(app)
                .get('/auth/protected')
    
            // Verify status code
            expect(response.status).toBe(401)
            // Verifying structure of response body
            expect(response.body).toHaveProperty('status', 'fail')
            expect(response.body).toHaveProperty('data', 'No token attached')
        })
    
        test('GET /auth/protected with expired token, should return 401 with message', async () => {
            // Create an expired token
            const expiredToken = jwt.sign(
                {
                    sub: 123
                },
                accessTokenSecret,
                {
                    expiresIn: '-10s'
                }
            )
            // Request using supertest
            const response = await request(app)
                .get('/auth/protected')
                .set('Authorization', `Bearer ${expiredToken}`)
    
            // Verify status code
            expect(response.status).toBe(401)
            // Verifying structure of response body
            expect(response.body).toHaveProperty('status', 'fail')
            expect(response.body).toHaveProperty('data', 'Token has expired')
        })

        test('GET /auth/protected with invalid secret, should return 401 with message', async () => {
            // Create an expired token
            const invalidToken = jwt.sign(
                {
                    sub: 123
                },
                'poiqwembzxc',
                {
                    expiresIn: '15m'
                }
            )
            // Request using supertest
            const response = await request(app)
                .get('/auth/protected')
                .set('Authorization', `Bearer ${invalidToken}`)
    
            // Verify status code
            expect(response.status).toBe(401)
            // Verifying structure of response body
            expect(response.body).toHaveProperty('status', 'fail')
            expect(response.body).toHaveProperty('data', 'Invalid signature')
        })
    
        test('GET /auth/protected with malformed token, should return 401 with message', async () => {
            // Request using supertest
            const response = await request(app)
                .get('/auth/protected')
                .set('Authorization', `Bearer sdhfshdfjdh`)
    
            // Verify status code
            expect(response.status).toBe(401)
            // Verifying structure of response body
            expect(response.body).toHaveProperty('status', 'fail')
            expect(response.body).toHaveProperty('data', 'Malformed token')
        })
    })
})

afterAll(async () => {
    await db.sequelize.close()
})