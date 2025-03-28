# API CA Prep week
This project aligns with the 4 daily tasks for the last week leading up to the API CA.

Each branch represents the solution to each days activity.

- `main` -> Day 1
- `day-2` -> Day 2
- `day-3` -> Day 3
- `final` -> Day 4

This readme will also update per each brach to reflect the changes.

## Day 2 alterations

I've cleaned up some starter files we won't need:

- Removed unused routes:
  - `routes/index.js`
  - `routes/users.js`

  *(You can keep these if you prefer, but my solution uses a dedicated `auth` route.)*

- Removed unused view files:
  - `views/index.ejs`

  *(Left `views/error.ejs` for now; we'll remove it tomorrow.)*

- Removed the entire `public` folder, as we’re making a REST API without static files.

Tests are organized into separate files:

- `event.service.test.js` for EventService unit tests (now includes `userId`)
- `auth.integration.test.js` for authentication endpoint tests (today's task)

I'll add another integration test suite tomorrow.

I've placed shared modules in the following folders:

- `util/`: contains `passwordHelper.js` and `testDbInit.js`
- `middleware/`: for auth middleware (will add error handling tomorrow)

I've updated my Jest test script to run tests sequentially (to avoid conflicts with DB state when having multiple suites each recreating it):

```json
"scripts": {
    "start": "node ./bin/www",
    "test": "jest --runInBand"
}
```

## Day 3 alterations

Deleted the `views` folder as we dont need it.

I moved all my `app` mocking for the tests into `util/testAppSetup` to just export an `app` that supertest can use.

I removed the `app` setup from my `auth.integration.test.js` file and replced it with const `app = require('../util/testAppSetup')`.

**NOTE**: We will alter `app.js` tomorrow to live test our server and make Swagger docs once it has passed all the tests using our fake app and database.

Refactored auth route to use error handling middleware:

```js
// Need to include next in all routes to be able to pass errors around
router.post('/signup', async (req, res, next) => {
    ...
})

// Thrown errors are changed from
if(error instanceof ValidationError) {
    return res.status(400).jsend.fail(err.errors.map(err => err.message).join(','))
}
// to
if(error instanceof ValidationError) {
    return next(error)
}

// And http errors are changed from
if(!email || !password) {
    return res.status(400).jsend.fail('Both email and password are required')
}
// to
if(!email || !password) {
    return next(createError(400,'Both email and password are required'))
}
```

Importantly, because of how Jest works, the `isHttpError` function we relied on in our error handler wont work. This has got to do with Jest creating isolated instances for each depedency (we require http-errors twice) and this causes problems with internal checkers. Somehow this affects `isHttpError`. The explanations I've seen for this aren't satisfying and I saw nothing in documentation about this. But to fix it we change the check to:

```js
if(err.status && err.expose !== undefined) {
    return res.status(err.status).jsend.fail(err.message)
}
```

We instead manually check if a property unique to errors created with http-errors exists (expose and status). For reference, [here](https://www.npmjs.com/package/http-errors#error-properties) is the http-error section on this.


## Day 4 alterations

Removed uneeded code form `app.js`.

Configured new routes with `/api/v1` prefix.

Configured error handling middleware.

Synced db and added event type only once.

Installed `swagger-autogen` and `swagger-ui-express`.

Added `swagger.js`, added a swagger run script `"swagger": "node swagger"` and added code in `swagger.js` to run the app after we run `npm swagger`:

```js
swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    require('./bin/www');
});
```

Added swagger-ui config to `app.js` and made it available at `/docs`.

Added [bearer authentication](https://swagger-autogen.github.io/docs/openapi-3/authentication/bearer-auth/) to our swagger config and enables it in our routes that require authentication.

Added `null` check for update event (forgot to do it in day 3) and added test for it.

Hid `/auth/proteced` from docs as its used for testing only.





