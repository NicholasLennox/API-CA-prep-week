const swaggerAutogen = require('swagger-autogen')()

// Reusable JSend base responses
const JSendSuccess = {
    status: 'success',
    data: {} // override this per use
}

const JSendFail = {
    status: 'fail',
    data: 'Fail message'
}

const JSendError = {
    status: 'error',
    message: 'Error message'
}

const doc = {
    info: {
        version: '1.0.0',
        title: 'Events API',
        description: 'An API that allowed logged in users to create, edit, and view their events. Unauthenticated users can view all events'
    },
    host: 'localhost:3000',
    basePath: '/',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
        {
            name: 'dev',
            description: 'This version of the document is for development purposes'
        }
    ],
    definitions: {
        Event: {
            id: 1,
            title: 'Example event',
            date: 'yyyy-mm-dd',
            location: 'Example location',
            userId: 1,
            eventTypeId: 1
        },

        EventArray: {
            ...JSendSuccess,
            data: [{
                $ref: '#/definitions/Event'
            }]
        },

        AddEventSuccess: {
            ...JSendSuccess,
            data: {
                $ref: '#/definitions/Event'
            }
        },

        AccessToken: {
            ...JSendSuccess,
            data: 'Access token'
        },

        AddEvent: {
            $title: 'Example coffee',
            $date: 'yyyy-mm-dd',
            location: 'Example details',
            $eventTypeId: 1
        },

        UpdateEvent: {
            $id: 1,
            $title: 'Example coffee',
            $date: 'yyyy-mm-dd',
            location: 'Example details',
            $eventTypeId: 1,
            $userId: 1
        },

        UpdateEventSuccess: {
            ...JSendSuccess,
            data: 'Success message'
        },

        LoginSignup: {
            $email: 'Email in correct format',
            $password: 'Password'
        },

        User: {
            id: 1,
            email: 'Example email'
        },

        SignUpSuccessful: {
            ...JSendSuccess,
            data: {
                $ref: '#/definitions/User'
            }
        },

        FailMessage: JSendFail,
        ErrorMessage: JSendError
    },
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer'
            }
        }
    }
}


const outputFile = './swagger-output.json';
const endpointsFiles = ['./app.js'];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    require('./bin/www');
});