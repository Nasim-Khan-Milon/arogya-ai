import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../database/db.js";

export const registerUser = async (req, res) => {
  try {
    const {
      email,
      password,
      full_name,
      role_title,
      center_location,
    } = req.body;

    if (!email || !password || !full_name || !role_title) {
      return res.status(400).json({
        success: false,
        message:
          "Email, password, full_name, and role_title are required.",
      });
    }

    const [existingUsers] = await pool.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "A user with this email already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      `
      INSERT INTO users (
        email,
        password_hash,
        full_name,
        role_title,
        center_location
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        email,
        passwordHash,
        full_name,
        role_title,
        center_location || null,
      ]
    );

    const [users] = await pool.query(
      `
      SELECT
        user_id,
        email,
        full_name,
        role_title,
        center_location,
        created_at
      FROM users
      WHERE user_id = ?
      `,
      [result.insertId]
    );

    const user = users[0];

    return res.status(201).json({
      success: true,
      message: "Staff account created successfully.",
      data: {
        user_id: user.user_id,
        email: user.email,
        name: user.full_name,
        role: user.role_title,
        center_id: user.center_location,
        created_at: user.created_at,
      },
    });
  } catch (error) {
    console.error("registerUser error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
};



export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const [users] = await pool.query(
      `
      SELECT
        user_id,
        email,
        password_hash,
        full_name,
        role_title,
        center_location
      FROM users
      WHERE email = ?
      `,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role_title,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "7d",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Authentication successful.",
      token,
      user: {
        name: user.full_name,
        role: user.role_title,
        center_id: user.center_location,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logoutUser = async (req, res) => {
  try {
    // Clear auth-related cookies set by the frontend/server
    // const cookieOptions = {
    //   path: "/",
    //   httpOnly: true,
    //   secure: true,
    //   sameSite: "none",
    // };

    // res.clearCookie("token", cookieOptions);
    // res.clearCookie("user_name", cookieOptions);
    // res.clearCookie("email", cookieOptions);
    // res.clearCookie("user_id", cookieOptions);
    // res.clearCookie("role", cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUsersList = async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, user_name, email, role FROM users",
    );
    return res.status(200).json({
      success: true,
      data: rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;

    const [users] = await pool.query(
      `
      SELECT
        user_id,
        email,
        full_name,
        role_title,
        center_location
      FROM users
      WHERE user_id = ?
      `,
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const user = users[0];

    return res.status(200).json({
      success: true,
      data: {
        user_id: user.user_id,
        email: user.email,
        name: user.full_name,
        role: user.role_title,
        center_id: user.center_location,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};







