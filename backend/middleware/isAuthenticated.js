import jwt from "jsonwebtoken";
import { pool } from "../database/db.js";

export const isAuthenticated = async (req, res, next) => {
  try {
    //jwt scret check
  
    const authHeader = req.headers.authorization;
    console.log("Authorization header:", authHeader);
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
     
      return res.status(401).json({
        success: false,
        message: "Access token is missing or invalid",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("Extracted token:", token);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded token:", decoded);
    
    } catch (err) {
     
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          message: "Access Token has expired.",
        });
      }
      return res.status(401).json({
        success: false,
        message: "Access token is missing or invalid",
      });
    }

    const [rows] = await pool.query("SELECT * FROM users WHERE id = ?", [
      decoded.id,
    ]);
    if (!rows || rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = rows[0];
    req.userId = rows[0].id;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
