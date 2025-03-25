const { hashPassword } = require('./passwordHelper')

async function initTestDb(db) {
  await db.sequelize.sync({ force: true })

  // Seed EventTypes
  await db.EventType.bulkCreate([
    { id: 1, name: 'Conference' },
    { id: 2, name: 'Meetup' },
    { id: 3, name: 'Workshop' },
    { id: 4, name: 'Seminar' }
  ])

  // Seed Users with hashed passwords
  const user1Password = await hashPassword('Password123')
  const user2Password = await hashPassword('Secret456')

  await db.User.bulkCreate([
    {
      id: 1,
      email: 'user1@example.com',
      encryptedPassword: user1Password.encryptedPassword,
      salt: user1Password.salt
    },
    {
      id: 2,
      email: 'user2@example.com',
      encryptedPassword: user2Password.encryptedPassword,
      salt: user2Password.salt
    }
  ])

  // Seed Events linked to users
  await db.Event.bulkCreate([
    { id: 1, title: 'Test Event 1', date: '2025-05-01', location: 'Oslo', eventTypeId: 1, userId: 1 },
    { id: 2, title: 'Test Event 2', date: '2025-06-10', location: 'Bergen', eventTypeId: 2, userId: 2 }
  ])
}

module.exports = { initTestDb }
