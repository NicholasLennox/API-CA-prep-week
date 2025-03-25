# API CA Prep week
This project aligns with the 4 daily tasks for the last week leading up to the API CA.

Each branch represents the solution to each days activity.

- `main` -> Day 1
- `day-2` -> Day 2
- `day-3` -> Day 3
- `final` -> Day 4

This readme will also update per each brach to reflect the changes.

Here's your README additions cleaned up to be simpler, clearer, and less formal:

---

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




