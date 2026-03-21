// src/models/notification.model.js
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connect.db.js";

class Notification extends Model {}

Notification.init(
  {
    notification_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "notification_id",
    },

    type: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: "type",
    },

    subject: {
      type: DataTypes.STRING(150),
      allowNull: false,
      field: "subject",
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "message",
    },

    sent_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "sent_at",
    },

    status: {
      type: DataTypes.STRING(40),
      allowNull: false,
      defaultValue: "SENT",
      field: "status",
    },

    // -----------------------
    // FK: Customer
    // -----------------------
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "customer_id",
    },

    // -----------------------
    // FK: Appointment (Permite nulos y la acción SET NULL es lógica)
    // -----------------------
    appointment_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // Debe ser true para aceptar SET NULL
      field: "appointment_id",
    },
  },
  {
    sequelize,
    modelName: "Notification",
    tableName: "notification",
    freezeTableName: true,
    timestamps: false,
  }
);

export default Notification;