const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authenticationHelper')
const db = require('../models')
const EventService = require('../services/eventService');
const createError = require('http-errors');
const eventService = new EventService(db)

router.get('/', async (req, res) => {
    //  #swagger.tags = ['Event']
    //  #swagger.description = 'Get all events'
    /* #swagger.responses[200] = {
             description: 'Events for user',
             schema: { $ref: '#/definitions/EventArray'}
    } */
    /* #swagger.responses[500] = {
             description: 'Internal server error',
             schema: { $ref: '#/definitions/ErrorMessage' }
     } */
    try {
        const events = await eventService.getAll()
        res.jsend.success(events)
    } catch (error) {
        next(error)
    }
})

router.get('/mine', authenticateToken, async (req, res, next) => {
    /* #swagger.security = [{
            "bearerAuth": []
    }] */
    //  #swagger.tags = ['Event']
    //  #swagger.description = 'Get all events for logged in user'
    /* #swagger.responses[200] = {
             description: 'Events for user',
             schema: { $ref: '#/definitions/EventArray'}
    } */
    /* #swagger.responses[401] = {
              description: 'User failed to provide valid authentication',
              schema: { $ref: '#/definitions/FailMessage' }
    } */
    /* #swagger.responses[500] = {
             description: 'Internal server error',
             schema: { $ref: '#/definitions/ErrorMessage' }
     } */
    const userId = req.user

    try {
        const events = await eventService.getEventsForUser(userId)

        res.jsend.success(events)
    } catch (error) {
        return next(error)
    }
})

router.post('/', authenticateToken, async (req, res, next) => {
    /* #swagger.security = [{
            "bearerAuth": []
    }] */
    //  #swagger.tags = ['Event']
    //  #swagger.description = 'Add a new event for logged in user'
    /* #swagger.responses[201] = {
             description: 'Event created successfully',
             schema: { $ref: '#/definitions/AddEventSuccess'}
    } */
    /* #swagger.responses[400] = {
             description: 'Invalid payload',
             schema: { $ref: '#/definitions/FailMessage' }
    } */
    /* #swagger.responses[401] = {
              description: 'User failed to provide valid authentication',
              schema: { $ref: '#/definitions/FailMessage' }
    } */
    /* #swagger.responses[500] = {
             description: 'Internal server error',
             schema: { $ref: '#/definitions/ErrorMessage' }
     } */
    /*  #swagger.parameters['body'] = {
              in: 'body',
              description: 'New event',
              schema: { $ref: '#/definitions/AddEvent' }
    } */
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
    /* #swagger.security = [{
            "bearerAuth": []
    }] */
    //  #swagger.tags = ['Event']
    //  #swagger.description = 'Update logged in user's event'
    /* #swagger.responses[200] = {
             description: 'Update successful message',
             schema: { $ref: '#/definitions/UpdateEventSuccess'}
    } */
    /* #swagger.responses[400] = {
             description: 'ID in path does not match ID in payload',
             schema: { $ref: '#/definitions/FailMessage' }
    } */
    /* #swagger.responses[401] = {
              description: 'User failed to provide valid authentication',
              schema: { $ref: '#/definitions/FailMessage' }
    } */
    /* #swagger.responses[403] = {
             description: 'User tried to update an event they did not create',
             schema: { $ref: '#/definitions/FailMessage' }
     } */
    /* #swagger.responses[404] = {
             description: 'No event with that ID exists',
             schema: { $ref: '#/definitions/FailMessage' }
     } */
    /* #swagger.responses[500] = {
             description: 'Internal server error',
             schema: { $ref: '#/definitions/ErrorMessage' }
     } */
    /*  #swagger.parameters['id'] = {
            in: 'path',
            description: 'ID of event',
            type: 'integer'
    } */
    /*  #swagger.parameters['body'] = {
              in: 'body',
              description: 'Updated event',
              schema: { $ref: '#/definitions/UpdateEvent' }
    } */
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
        const result = await eventService.update(pathId, payload);
        // If result is null, no event with that ID exists
        if (!result) {
            return next(createError(404, 'No event with that ID exists'))
        }
        return res.jsend.success('Event updated');
    } catch (error) {
        next(error);
    }
});


module.exports = router;