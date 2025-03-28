class EventService {
    constructor(db) {
        this.db = db
        this.events = db.Event
    }

    async getById(id) {
        const event = await this.events.findOne({
            where: {
                id
            },
            include: {
                model: this.db.EventType,
                attributes: ['name']
            }
        })
        if (!event) return null

        const plainEvent = event.toJSON()

        // Sequelize doesn't support transforming included models' fields inline to plain values.

        // Flatten EventType.name to eventType
        plainEvent.eventType = plainEvent.EventType.name
        delete plainEvent.EventType
        delete plainEvent.eventTypeId

        return plainEvent
    }

    async getAll() {
        return await this.events.findAll()
    }

    async create(data) {
        const newEvent = await this.events.create(data)
        return newEvent ? newEvent.toJSON() : null
    }

    async update(id, data) {
        const [rowsAffected] = await this.events.update({...data}, {where: {id}}) // Returns the number of rows affected as an array [1]
        // Extract just the first element out an return that, or null if no rows are affected
        return rowsAffected !== 0 ? rowsAffected : null 
    }
}

module.exports = EventService