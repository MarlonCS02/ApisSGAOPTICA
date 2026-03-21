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
