// controllers/userEntity.controller.js
import UserEntity from "../models/userEntity.model.js";
import User from "../models/user.model.js";

// 📌 Crear UserEntity (generalmente no se usa porque se crea desde createUser)
export const createUserEntity = async (req, res) => {
  try {
    const data = req.body;

    // Validar si existe el usuario
    const userExists = await User.findByPk(data.user_id);
    if (!userExists) {
      return res.status(400).json({
        ok: false,
        message: "El usuario no existe",
      });
    }

    const newEntity = await UserEntity.create({
      user_id: data.user_id,
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      address: data.address,
    });

    return res.status(201).json({
      ok: true,
      message: "UserEntity created",
      body: newEntity,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      ok: false,
      message: "Error creating user entity",
      error: error.message,
    });
  }
};

// 📌 Obtener todas las entidades
export const getAllUserEntities = async (req, res) => {
  try {
    const entities = await UserEntity.findAll({
      include: [
        {
          model: User,
          as: "user",
        }
      ]
    });

    return res.status(200).json({
      ok: true,
      message: "List of all UserEntities",
      body: entities,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error", error: error.message });
  }
};

// 📌 Obtener por ID
export const getUserEntityById = async (req, res) => {
  try {
    const id = req.params.id;

    const entity = await UserEntity.findByPk(id, {
      include: [{ model: User, as: "user" }]
    });

    if (!entity) {
      return res.status(404).json({
        ok: false,
        message: "UserEntity not found",
      });
    }

    return res.status(200).json({
      ok: true,
      message: "UserEntity found",
      body: entity,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error", error: error.message });
  }
};

// 📌 Actualizar
export const updateUserEntity = async (req, res) => {
  try {
    const id = req.params.id;
    const data = req.body;

    const entity = await UserEntity.findByPk(id);

    if (!entity) {
      return res.status(404).json({
        ok: false,
        message: "UserEntity not found",
      });
    }

    await entity.update({
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      address: data.address,
    });

    return res.status(200).json({
      ok: true,
      message: "UserEntity updated",
      body: entity,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error", error: error.message });
  }
};

// 📌 Eliminar
export const deleteUserEntity = async (req, res) => {
  try {
    const id = req.params.id;

    const entity = await UserEntity.findByPk(id);

    if (!entity) {
      return res.status(404).json({
        ok: false,
        message: "UserEntity not found",
      });
    }

    await entity.destroy();

    return res.status(200).json({
      ok: true,
      message: "UserEntity deleted",
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ ok: false, message: "Error", error: error.message });
  }
};
