import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../database/db.js";

export const registerUser = async (req, res) => {
  try {
    console.log(req.body);
    const { user_name, email, password } = req.body;
    if (!user_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [user_name, email, hashedPassword],
    );

    const token = jwt.sign(
      { id: result.insertId, email: email },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );

    return res.status(201).json({
      token: token,
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: {
          id: result.insertId,
          name: result.name,
          email: result.email,
          role: result.role,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (!rows || rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User not found, please register first",
      });
    }
    const passwordCheck = await bcrypt.compare(password, rows[0].password);
    if (!passwordCheck) {
      return res.status(402).json({
        success: false,
        message: "Incorrect Password",
      });
    }
    const accessToken = jwt.sign(
      { id: rows[0].id, email: rows[0].email, role: rows[0].role },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      },
    );

    return res.status(200).json({
      success: true,
      message: `Welcome back ${rows[0].name}`,
      data: {
        accessToken,
        user: {
          id: rows[0].id,
          name: rows[0].name,
          email: rows[0].email,
          role: rows[0].role,
        },
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
    const cookieOptions = {
      path: "/",
      httpOnly: true,
      secure: true,
      sameSite: "none",
    };

    res.clearCookie("token", cookieOptions);
    res.clearCookie("user_name", cookieOptions);
    res.clearCookie("email", cookieOptions);
    res.clearCookie("user_id", cookieOptions);
    res.clearCookie("role", cookieOptions);

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
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const [rows] = await pool.query("SELECT id, name,email,avatar_url FROM users WHERE id = ?", [
      userId,
    ]);

    if (!rows || rows.length === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const user = { ...rows[0] };

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};  







