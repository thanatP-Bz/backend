"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const taskController_1 = require("../controllers/taskController");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.requireAuth);
router.post("/", taskController_1.createTask);
router.get("/", taskController_1.getTask);
router.get("/:id", taskController_1.getTaskById);
router.patch("/:id", taskController_1.updateTask);
router.delete("/:id", taskController_1.deleteTask);
exports.default = router;
//# sourceMappingURL=taskRoutes.js.map