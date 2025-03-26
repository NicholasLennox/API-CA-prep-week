const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authenticationHelper')
const db = require('../models')
const EventService = require('../services/eventService');
const createError = require('http-errors');
const eventService = new EventService(db)

router.get('/', async (req, res) => {
    try {
        const events = await eventService.getAll() 
        res.jsend.success(events)
    } catch (error) {
        next(error)
    }
})

router.get('/mine', authenticateToken, async (req, res, next) => {
    const userId = req.user

    try {
        const events = await eventService.getEventsForUser(userId)
    
        res.jsend.success(events)
    } catch (error) {
        return next(error)
    }
})

router.post('/', authenticateToken, async (req, res, next) => {
    const userId = req.user
    // New event is linked to currently logged in user
    const event = {
        ...req.body,
        userId
    }

    try {
        const newEvent = await eventService.create(event)
    
        res.status(201).jsend.success(newEvent)
    } catch (error) {
        return next(error)
    }
})

router.put('/:id', authenticateToken, async (req, res, next) => {
    const pathId = Number(req.params.id);
    const payload = req.body;
    const userId = req.user;

    // Ensure path ID matches payload ID
    if (pathId !== payload.id) {
        return next(createError(400, 'Path ID does not match payload ID'));
    }

    // Ensure user is the owner of the event
    if (payload.userId !== userId) {
        return next(createError(403, 'You can only update your own events'));
    }

    try {
        // Dont need to know the rows affected
        await eventService.update(pathId, payload);

        return res.jsend.success('Event updated');
    } catch (error) {
        next(error);
    }
});


module.exports = router;