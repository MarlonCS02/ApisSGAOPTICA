// models/userEntity.model.js
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connect.db.js";

class UserEntity extends Model {}

UserEntity.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },

    user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true, 
    },

    first_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },

    last_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },

    phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
    },

    address: {
        type: DataTypes.STRING(200),
        allowNull: true,
    }
}, {
    sequelize,
    modelName: "UserEntity",
    tableName: "user_entity",
    freezeTableName: true,
    timestamps: false,
});

export default UserEntity;