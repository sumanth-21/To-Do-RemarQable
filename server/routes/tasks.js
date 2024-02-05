import express from "express";

import TasksController from "../controllers/tasks.js";

const router = express.Router();

router.post("/", TasksController.addTask);
router.get("/todo", TasksController.getInProgressTasks);
router.get("/completed", TasksController.getCompletedTasks);
router.get("/:id/update", TasksController.getTaskUpdate);
router.put("/:id", TasksController.updateTask);
router.delete("/:id", TasksController.deleteTask);

export default router;
