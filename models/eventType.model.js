module.exports = (sequelize, DataTypes) => {
    const EventType = sequelize.define('EventType',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            }
        }
    )
    EventType.associate = (db) => {
        db.EventType.hasMany(db.Event, { foreignKey: 'eventTypeId' })
    }
    return EventType;
}