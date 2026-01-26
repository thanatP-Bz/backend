"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.getTaskById = exports.getTask = exports.createTask = void 0;
const taskModel_1 = require("../models/taskModel");
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiError_1 = require("../utils/ApiError");
const mongoose_1 = __importDefault(require("mongoose"));
const createTask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { title, description, isCompleted } = req.body;
    const user = req.user;
    const task = await taskModel_1.Task.create({
        title,
        description,
        isCompleted: isCompleted,
        user: user._id,
    });
    res.status(201).json(task);
});
exports.createTask = createTask;
// ✅ Added asyncHandler
const getTask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const user = req.user;
    const tasks = await taskModel_1.Task.find({ user: user._id });
    res.status(200).json(tasks);
});
exports.getTask = getTask;
// ✅ Added asyncHandler
const getTaskById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const task = await taskModel_1.Task.findById(id);
    res.status(200).json(task);
});
exports.getTaskById = getTaskById;
// ✅ Added asyncHandler
const updateTask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    const user = req.user;
    const task = await taskModel_1.Task.findOne({ _id: id, user: user._id }); // ✅ Fixed: user!.id → user!._id
    if (!task)
        throw new ApiError_1.ApiError("task not found", 400);
    const { title, description, isCompleted } = req.body;
    if (title !== undefined)
        task.title = title;
    if (description !== undefined)
        task.description = description;
    if (isCompleted !== undefined)
        task.isCompleted = isCompleted;
    const updatedTask = await task.save(); // ✅ Fixed variable name
    res.status(200).json(updatedTask);
});
exports.updateTask = updateTask;
// ✅ Added asyncHandler
const deleteTask = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id } = req.params;
    if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
        throw new ApiError_1.ApiError("task not found", 404);
    }
    const task = await taskModel_1.Task.findOneAndDelete({ _id: id });
    if (!task) {
        throw new ApiError_1.ApiError("task not found", 400);
    }
    res.status(200).json(task);
});
exports.deleteTask = deleteTask;
//# sourceMappingURL=taskController.js.map