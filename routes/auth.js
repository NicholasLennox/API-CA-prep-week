const express = require('express');
const router = express.Router();
const { hashPassword, comparePassword } = require('../util/passwordHelper')
const db = require('../models')
const UserService = require('../services/userService')
const userService = new UserService(db)
const jwt = require('jsonwebtoken');
const { ValidationError } = require('sequelize');
const { authenticateToken } = require('../middleware/authenticationHelper')
require('dotenv').config()

router.post('/login', async (req, res) => {
    const { email, password } = req.body

    if(!email || !password) {
        return res.status(400).jsend.fail('Both email and password are required')
    }

    const user = await userService.getByEmail(email)

    if(!user) {
        return res.status(404).jsend.fail('No user with that email found')
    }
    
    if(!await comparePassword(password, user.encryptedPassword, user.salt)) {
        return res.status(401).jsend.fail('Invalid credentials')
    }

    const token = jwt.sign({ sub: user.id}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m'})

    res.jsend.success({token})
})

router.post('/signup', async (req, res) => {
    const {email, password} = req.body

    if(!email || !password) {
        return res.status(400).jsend.fail('Both email and password are required')
    }

    const { salt, encryptedPassword } = await hashPassword(password)

    const newUser = {
        email,
        encryptedPassword,
        salt
    }

    let retUser = null;

    try {
        retUser = await userService.create(newUser)
    } catch (error) {
        if(error instanceof ValidationError) {
            return res.status(400).jsend.fail(error.errors.map(error => error.message).join(','))
        }
        return res.status(500).jsend.error(error.message)
    }

    res.status(201).jsend.success(retUser)
})

router.get('/protected', authenticateToken, async (req,res) => {
    res.jsend.success('Access granted')
})

module.exports = router;