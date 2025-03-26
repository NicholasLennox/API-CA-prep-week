const express = require('express');
const router = express.Router();
const { hashPassword, comparePassword } = require('../util/passwordHelper')
const createError = require('http-errors')
const db = require('../models')
const UserService = require('../services/userService')
const userService = new UserService(db)
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../middleware/authenticationHelper')
require('dotenv').config()

router.post('/login', async (req, res, next) => {
    const { email, password } = req.body

    if (!email || !password) {
        return next(createError(400, 'Both email and password are required'))
    }

    try {
        const user = await userService.getByEmail(email)

        if (!user) {
            return next(createError(404, 'No user with that email found'))
        }

        if (!await comparePassword(password, user.encryptedPassword, user.salt)) {
            return next(createError(401, 'Invalid credentials'))
        }

        const token = jwt.sign({ sub: user.id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' })

        res.jsend.success({ token })

    } catch (error) {
        return next(error)
    }
})

router.post('/signup', async (req, res, next) => {
    const { email, password } = req.body

    if (!email || !password) {
        return next(createError(400, 'Both email and password are required'))
    }

    try {
        const { salt, encryptedPassword } = await hashPassword(password)

        const newUser = {
            email,
            encryptedPassword,
            salt
        }

        const retUser = await userService.create(newUser)

        res.status(201).jsend.success(retUser)

    } catch (error) {
        return next(error)
    }
})

router.get('/protected', authenticateToken, async (req, res) => {
    res.jsend.success('Access granted')
})

module.exports = router;