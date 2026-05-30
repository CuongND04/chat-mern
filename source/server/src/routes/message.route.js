import express from "express"
import { protectRoute } from "../middleware/auth.middleware.js"
import { getMessages, getUsersForSidebar, sendMessage ,markMessagesAsRead} from "../controllers/message.controller.js"
import { validate } from "../middleware/validate.middleware.js"
import { getMessagesSchema, sendMessageSchema, userIdParamSchema } from "../schemas/message.schema.js"

const router = express.Router()
router.get("/users", protectRoute, getUsersForSidebar)
router.get("/:id", protectRoute, validate(getMessagesSchema), getMessages)
router.put("/read/:id", protectRoute, validate(userIdParamSchema), markMessagesAsRead);

router.post("/send/:id", protectRoute, validate(sendMessageSchema), sendMessage)

export default router
