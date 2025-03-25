module.exports = (sequelize, DataTypes) => {
    const Event = sequelize.define('Event',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            title: {
                type: DataTypes.STRING(255),
                allowNull: false,
                validate: {
                    len: {
                        args: [3, 255], // Minimum 3 chars, max 255
                        msg: 'Title must be at least 3 characters long'
                    }
                }
            },
            date: {
                type: DataTypes.DATEONLY,
                allowNull: false,
                validate: {
                    isDate: true,
                    isFuture(value) {
                        if (new Date(value) <= new Date()) {
                            throw new Error('Date must be in the future')
                        }
                    }
                }
            },
            location: {
                type: DataTypes.STRING,
                allowNull: true
            },
            eventTypeId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false
            }
        }
    )
    Event.associate = (db) => {
        db.Event.belongsTo(db.EventType, { foreignKey: 'eventTypeId' })
        db.Event.belongsTo(db.User, { foreignKey: 'userId' })
    }
    return Event;
}