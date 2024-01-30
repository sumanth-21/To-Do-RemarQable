import express from "express";
import cors from "cors";

const app = express();

app.use(express.json());

const CLIENT_URL =
  process.env.NODE_ENV === "production"
    ? "https://to-do-client-8t9m.onrender.com"
    : "http://localhost:3000";

app.use(
  cors({
    origin: CLIENT_URL,
    methods: "GET,POST,PUT,DELETE,PATCH",
    credentials: true,
  })
);
app.use(express.urlencoded({ extended: true }));

app.use("/public", express.static("./public"));
app.use("/scripts", express.static("./public/scripts"));

// In-memory storage for tasks
const tasks = [];

function getTaskHTML(task) {
  return `
    <li data-task-id="${task.id}" id="taskId${task.id}" class="card">
      <h3 class="card-title">${task.task}</h3>
      <div class="task-action">
        <button
          type="button"
          class="btn btn-outline-secondary"
          data-bs-toggle="modal"
          data-bs-target="#updateTaskModal"
          hx-get="https://to-do-server-944t.onrender.com/api/tasks/${task.id}/update"
          hx-target="#updateTaskForm"
          hx-swap="innerHTML"
        >
          Edit
        </button>
        <button  
          class="btn btn-secondary"
          hx-delete="https://to-do-server-944t.onrender.com/api/tasks/${task.id}" 
          hx-confirm="Are you sure?" 
          hx-target="#taskId${task.id}" 
          hx-swap="outerHTML"
        >Delete</button>
      </div>
    </li>
  `;
}

// API endpoint to add a task
app.post("/api/tasks", (req, res) => {
  const { task } = req.body;
  const newTask = { id: tasks.length + 1, task, completed: false };
  tasks.push(newTask);

  // Returning HTML response with the newly added task
  res.status(201).send(getTaskHTML(newTask));
});

// API endpoint to get in-progress tasks
app.get("/api/tasks/todo", (req, res) => {
  const inProgressTasks = tasks.filter((task) => !task.completed);
  const inProgressTasksHTML = inProgressTasks
    .reverse()
    .map((task) => getTaskHTML(task))
    .join("");
  res.send(inProgressTasksHTML);
});

// API endpoint to get completed tasks
app.get("/api/tasks/completed", (req, res) => {
  const completedTasks = tasks.filter((task) => task.completed);
  const completedTasksHTML = completedTasks
    .reverse()
    .map((task) => getTaskHTML(task))
    .join("");
  res.send(completedTasksHTML);
});

// API endpoint to get task details for updating
app.get("/api/tasks/:id/update", (req, res) => {
  const taskId = parseInt(req.params.id);
  const task = tasks.find((t) => t.id === taskId);

  if (task) {
    res.send(`
      <input type="hidden" name="id" value="${task.id}" />
      <div class="mb-3">
        <label for="updateTaskInput" class="form-label">Task Description</label>
        <input type="text" class="form-control" id="updateTaskInput" name="task" value="${
          task.task
        }" required />
      </div>
      <div class="mb-3 form-check">
        <input type="checkbox" class="form-check-input" id="updateTaskCompleted" name="completed" ${
          task.completed ? "checked" : ""
        } />
        <label class="form-check-label" for="updateTaskCompleted">Completed</label>
      </div>
      <button type="submit" class="btn btn-primary" hx-put="https://to-do-server-944t.onrender.com/api/tasks/${taskId}" hx-target="#taskId${taskId}" hx-swap="outerHTML">Update Task</button>
    `);
  } else {
    res.status(404).json({ error: "Task not found" });
  }
});

// API endpoint to update a task
app.put("/api/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id, 10); // Convert to number explicitly
  const updatedTask = req.body;
  const taskIndex = tasks.findIndex((t) => t.id === taskId);

  if (taskIndex !== -1) {
    // Ensure id is a number and update completed property if missing
    const updatedTaskData = {
      ...tasks[taskIndex],
      ...updatedTask,
      id: taskId,
      completed: updatedTask.completed ? true : false,
    };

    tasks[taskIndex] = updatedTaskData;

    // Return the updated task HTML along with the script to close the modal
    const updatedTaskHTML = getTaskHTML(updatedTaskData);
    const closeScript = `
    document.getElementById("updateTaskModal").querySelector("[data-bs-dismiss='modal']").click();
    ${
      updatedTask.completed
        ? `document.getElementById("todo-tasks-tab").click()`
        : `document.getElementById("completed-tasks-tab").click()`
    }
  `;

    // Returning HTML response with the updated task
    res.send(`<div>${updatedTaskHTML}<script>${closeScript}</script></div>`);
  } else {
    res.status(404).json({ error: "Task not found" });
  }
});

// API endpoint to delete a task
app.delete("/api/tasks/:id", (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex((t) => t.id === taskId);

  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1)[0];

    res.send(``);
  } else {
    res.status(404).json({ error: "Task not found" });
  }
});

app.get("/", (req, res) => {
  res
    .status(200)
    .send('<h1 style="text-align: center; margin-top: 50px;">TO DO API</h1>');
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
