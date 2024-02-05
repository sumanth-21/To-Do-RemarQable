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

const addTask = (req, res) => {
  const { task } = req.body;
  const newTask = { id: tasks.length + 1, task, completed: false };
  tasks.push(newTask);

  // Returning HTML response with the newly added task
  res.status(201).send(getTaskHTML(newTask));
};

const getInProgressTasks = (req, res) => {
  const inProgressTasks = tasks.filter((task) => !task.completed);
  const inProgressTasksHTML = inProgressTasks
    .reverse()
    .map((task) => getTaskHTML(task))
    .join("");
  res.send(inProgressTasksHTML);
};

const getCompletedTasks = (req, res) => {
  const completedTasks = tasks.filter((task) => task.completed);
  const completedTasksHTML = completedTasks
    .reverse()
    .map((task) => getTaskHTML(task))
    .join("");
  res.send(completedTasksHTML);
};

const getTaskUpdate = (req, res) => {
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
};

const updateTask = (req, res) => {
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

    const closeScript = `
      document.getElementById("updateTaskModal").querySelector("[data-bs-dismiss='modal']").click();
      ${
        updatedTask.completed !== "on"
          ? `document.getElementById("todo-tasks-tab").click()`
          : `document.getElementById("completed-tasks-tab").click()`
      }
    `;

    res.send(`<script>${closeScript}</script>`);
  } else {
    res.status(404).json({ error: "Task not found" });
  }
};

const deleteTask = (req, res) => {
  const taskId = parseInt(req.params.id);
  const taskIndex = tasks.findIndex((t) => t.id === taskId);

  if (taskIndex !== -1) {
    tasks.splice(taskIndex, 1)[0];

    res.send(``);
  } else {
    res.status(404).json({ error: "Task not found" });
  }
};

export default {
  addTask,
  getInProgressTasks,
  getCompletedTasks,
  getTaskUpdate,
  updateTask,
  deleteTask,
};
