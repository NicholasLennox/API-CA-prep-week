class UserService {
    constructor(db) {
        this.db = db
        this.users = db.User
    }

    async create(data) {
        return this.users.create(data)
    }

    async getByEmail(email) {
        const user = await this.users.findOne({where: {email}})
        return user ? user.toJSON() : null
    }
}

module.exports = UserService