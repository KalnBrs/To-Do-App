task = 1;
tasks = [];
currentTask = null;

window.addEventListener('load', loadTasks)

function saveTasks() {
  localStorage.setItem('taskList', JSON.stringify(tasks));
}

function loadTasks() {
  let loaded = localStorage.getItem('taskList');
  if (loaded) {
    tasks = JSON.parse(loaded)
    tasks.forEach(t => createTaskRow(t));
    task = tasks.reduce((max, obj) => Math.max(max, obj.id), 0) + 1;
  }
}

function createTaskRow(taskObj) {
  let elem = document.createElement("tr")
  elem.classList.add("loop")
  elem.innerHTML = `
    <td>${taskObj.id}</td>
    <td class="task">${taskObj.name}</td>
    <td class="status"><span id="${getStatusId(taskObj.status)}">${taskObj.status}</span></td>
    <td class="edit"><input type="image" src="icons/pencil.png" /></td>
    <td class="remove"><input type="image" src="icons/delete.png" /></td>
  `

  let last = document.querySelector(".last");
  if (last) last.classList.remove("last");
  elem.classList.add("last");

  let tbody = document.querySelector("table tbody");
  tbody.appendChild(elem);

  elem.querySelector(".remove input").addEventListener('click', function () {
    let row = this.closest('tr')
    let id = parseInt(row.children[0].textContent);
    tasks = tasks.filter(t => t.id !== id);
    row.remove();
    saveTasks();

    let rows = document.querySelectorAll("table tbody tr");
    if (rows.length > 0) {
      rows[rows.length - 1].classList.add("last");
    }
  })

  elem.querySelector(".edit input").addEventListener('click', function () {
    let overlay = document.getElementById('overlay')
    overlay.classList.remove('hidden')
    let editForm = document.getElementById('editForm');
    editForm.classList.remove('hidden')

    currentRow = elem;
    document.getElementById('newTask').value = taskObj.name;
    let statusMap = {
      "To Do": "statusToDO",
      "In Progress": "statusInProgress",
      "Completed": "statusCompleted"
    }
    document.getElementById(statusMap[taskObj.status]).checked = true;
  })
}

function popUpAdd() {
  let taskObj = {
    id: task,
    name: "Task",
    status: "To Do"
  }

  tasks.push(taskObj);
  saveTasks();
  createTaskRow(taskObj);
  task++;
}

function getStatusId(status) {
  return status === "To Do" ? "toDo" : status === "In Progress" ? "inProgress" : "completed"
}

function filterQuery(query) {
  let rows = document.querySelectorAll("table tbody tr.loop");
  rows.forEach(row => {
    console.log(row)
    console.log(row.querySelector(".status"))
    let taskText = row.querySelector(".task").textContent.toLowerCase();
    let statusText = row.querySelector(".status span").textContent.toLowerCase();
    let match = taskText.match(query) || statusText.match(query);

    row.style.display = match ? "" : "none";
  })
}

document.getElementById('search').addEventListener('input', function () {
  let query = this.value.toLowerCase();
  filterQuery(query)
})

document.getElementById('editForm').addEventListener('submit', function (event) {
  event.preventDefault();
  if (!currentRow) return;

  let id = parseInt(currentRow.children[0].textContent);
  let task = document.getElementById("newTask").value;
  let status = document.querySelector('input[name="status"]:checked').value;

  currentRow.children[1].textContent = task;

  let spanElem = currentRow.children[2].querySelector("span");
  spanElem.textContent = status;
  spanElem.id = getStatusId(status);

  let taskToUpdate = tasks.find(t => t.id === id);
  if (taskToUpdate) {
    taskToUpdate.name = task;
    taskToUpdate.status = status;
    saveTasks();
  }

  document.getElementById('overlay').classList.add("hidden");
  document.getElementById('editForm').classList.add("hidden");
  currentRow = null;
})
