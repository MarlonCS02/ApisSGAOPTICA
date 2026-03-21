// src/models/appointment.model.js
import { Model, DataTypes } from "sequelize";
import sequelize from "../config/connect.db.js";

class Appointment extends Model {}

Appointment.init(
  {
    appointment_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "appointment_id",
    },

    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "date",
    },

    time: {
      type: DataTypes.TIME,
      allowNull: false,
      field: "time",
    },

    status: {
      type: DataTypes.STRING(40),
      allowNull: false,
      defaultValue: "PENDING",
      field: "status",
    },

    // ----------------------
    // FK: Customer (Limpiado: la asociación va en model.app.js)
    // ----------------------
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "customer_id",
    },

    // ----------------------
    // FK: ExamType (Limpiado: la asociación va en model.app.js)
    // ----------------------
    exam_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "exam_type_id",
    },
  },
  {
    sequelize,
    modelName: "Appointment",
    tableName: "appointment",
    freezeTableName: true,
    timestamps: true, 
  }
);

export default Appointment;