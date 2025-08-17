document.addEventListener("DOMContentLoaded", loadTasks);

function loadTasks() {
  fetch("/api/tasks")
    .then(res => res.json())
    .then(tasks => {
      tasks.forEach(task => {
        const li = createTaskItem(task.text, task.id, task.done);
        if (task.done) {
          document.getElementById("finishedList").appendChild(li);
          li.querySelector("input[type=checkbox]").checked = true;
        } else {
          document.getElementById("todoList").appendChild(li);
        }
      });
    });
}

function addTask() {
  const input = document.getElementById("taskInput");
  const taskText = input.value.trim();
  if (taskText === "") return;

  fetch("/api/tasks", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({text: taskText})
  })
    .then(res => res.json())
    .then(task => {
      const li = createTaskItem(task.text, task.id, task.done);
      document.getElementById("todoList").appendChild(li);
      input.value = "";
    });
}

function createTaskItem(text, id, done = false) {
  const li = document.createElement("li");
  li.className = "task-item";

  const span = document.createElement("span");
  span.textContent = text;

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = done;
  checkbox.onclick = () => {
    fetch(`/api/tasks/${id}`, {
      method: "PUT",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({done: checkbox.checked})
    }).then(() => {
      checkbox.checked
        ? document.getElementById("finishedList").appendChild(li)
        : document.getElementById("todoList").appendChild(li);
    });
  };

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.onclick = () => {
    const newText = prompt("Edit task:", span.textContent);
    if (newText !== null) {
      fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({text: newText})
      }).then(() => {
        span.textContent = newText;
      });
    }
  };

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.onclick = () => {
    fetch(`/api/tasks/${id}`, { method: "DELETE" })
      .then(() => li.remove());
  };

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(editBtn);
  li.appendChild(deleteBtn);

  return li;
}
