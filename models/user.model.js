module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                validate: {
                    isEmail: {
                        args: true,
                        msg: 'Invalid email format'
                    }
                }
            },
            encryptedPassword: {
                type: DataTypes.BLOB,
				allowNull: false
            },
            salt: {
                type: DataTypes.BLOB,
				allowNull: false
            }
        }
    )
    User.associate = (db) => {
        db.User.hasMany(db.Event, { foreignKey: 'userId' })
    }
    return User;
}