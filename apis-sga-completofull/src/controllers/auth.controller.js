import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../models/user.model.js";
import UserEntity from "../models/userEntity.model.js";
import Role from "../models/role.model.js";

export const loginUser = async (req, res) => {
    try {
        const { user_user, user_password } = req.body;

        if (!user_user || !user_password) {
            return res.status(400).json({
                message: "Missing credentials (user_user, user_password)"
            });
        }

        // Buscar usuario por username
        const user = await User.findOne({
            where: { user_user },
            include: [
                { model: UserEntity, as: "UserEntityInfo" },
                { model: Role }
            ]
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Comparar contraseñas
        const isMatch = bcrypt.compareSync(user_password, user.user_password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // Crear token
        const token = jwt.sign(
            {
                user_id: user.user_id,
                role_id: user.role_id,
                role_name: user.Role.role_name
            },
            process.env.JWT_SECRET || "SUPER_SECRET_KEY",
            { expiresIn: "7d" }
        );

        return res.json({
            message: "Login successful",
            token,
            user: {
                user_id: user.user_id,
                username: user.user_user,
                role: user.Role.role_name,
                entity: user.UserEntityInfo
            }
        });

    } catch (error) {
        return res.status(500).json({
            message: "Error logging in",
            error: error.message
        });
    }
};

export const updateUserProfile = async (req, res) => {
    try {
        const { user_id } = req.user; // Asumiendo que tienes middleware de autenticación
        const { first_name, last_name, email, phone, address } = req.body;

        // Buscar el usuario
        const user = await User.findByPk(user_id, {
            include: [{ model: UserEntity, as: "UserEntityInfo" }]
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Actualizar email si se proporciona y es diferente
        if (email && email !== user.user_user) {
            const existingUser = await User.findOne({ where: { user_user: email } });
            if (existingUser && existingUser.user_id !== user_id) {
                return res.status(409).json({ message: "Email already in use" });
            }
            user.user_user = email;
        }

        // Actualizar UserEntity
        if (user.UserEntityInfo) {
            if (first_name !== undefined) user.UserEntityInfo.first_name = first_name;
            if (last_name !== undefined) user.UserEntityInfo.last_name = last_name;
            if (phone !== undefined) user.UserEntityInfo.phone = phone;
            if (address !== undefined) user.UserEntityInfo.address = address;
            
            await user.UserEntityInfo.save();
        }

        await user.save();

        return res.json({
            message: "Profile updated successfully",
            user: {
                user_id: user.user_id,
                username: user.user_user,
                role: user.Role?.role_name,
                entity: user.UserEntityInfo
            }
        });

    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({
            message: "Error updating profile",
            error: error.message
        });
    }
};