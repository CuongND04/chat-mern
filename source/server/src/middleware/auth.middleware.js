import jwt from "jsonwebtoken"
import { env } from "../config/env.js"
import User from "../models/user.model.js"

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies[env.JWT_COOKIE_NAME]
    if (!token) return res.status(401).json({ message: "Unauthorized - No Token Provided" })
    if (!env.JWT_SECRET) return res.status(500).json({ message: "Server auth is not configured" })

    const decoded = jwt.verify(token, env.JWT_SECRET)
    if (!decoded) return res.status(401).json({ message: "Unauthorized - Invalid Token" })

    const user = await User.findById(decoded.userId).select("-password")
    if (!user) return res.status(404).json({ message: "User not found" })

    req.user = user
    next()
  } catch (error) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Unauthorized - Invalid Token" })
    }

    console.log("Error in protectRoute middleware", error.message)
    next(error)
  }
}
