// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
let nextId = JSON.parse(localStorage.getItem("nextId"));

// Todo: create a function to generate a unique task id
function generateTaskId() {
  let currentId = parseInt(localStorage.getItem("nextId"), 10) || 0;

  localStorage.setItem("nextId", JSON.stringify(currentId + 1));
  return currentId;
};

function readTasksFromStorage() {
  let tasks = JSON.parse(localStorage.getItem("tasks"));
  if (!tasks) {
    tasks = [];
  }
  return tasks;
};

function saveTasksToStorage(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
};

// Todo: create a function to create a task card
function createTaskCard(task) {
  const taskCard = $("<div>")
    .addClass("card draggable my-3")
    .attr("task-id", task.id);
  const cardHeader = $("<div>").addClass("card-header h4").text(task.name);
  const cardBody = $("<div>").addClass("card-body");
  const taskDueDate = $("<p>").addClass("card-text").text(task.dueDate);
  const taskDescription = $("<p>").addClass("card-text").text(task.description);
  const cardDeleteBtn = $("<button>")
    .addClass("btn btn-danger delete")
    .text("Delete")
    .attr("task-id", task.id);
  cardDeleteBtn.on("click", handleDeleteTask);

  if (task.dueDate && task.status !== "done") {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate, "DD/MM/YYYY");

    if (now.isSame(taskDueDate, "day")) {
      taskCard.addClass("bg-warning text-white");
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass("bg-danger text-white");
      cardDeleteBtn.addClass("border-light");
    }
  }

  cardBody.append(taskDueDate, taskDescription, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);

  return taskCard;
};

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {
  const tasks = readTasksFromStorage();

  const todoList = $("#todo-cards");
  todoList.empty();

  const inProgressList = $("#in-progress-cards");
  inProgressList.empty();

  const doneList = $("#done-cards");
  doneList.empty();

  for (let task of tasks) {
    if (task.status === "to-do") {
      todoList.append(createTaskCard(task));
    } else if (task.status === "in-progress") {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === "done") {
      doneList.append(createTaskCard(task));
    }
  }

  $(".draggable").draggable({
    opacity: 0.7,
    zIndex: 100,

    helper: function (e) {
      const original = $(e.target).hasClass("ui-draggable")
        ? $(e.target)
        : $(e.target).closest(".ui-draggable");

      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });
};

// Todo: create a function to handle adding a new task
function handleAddTask(event) {
  event.preventDefault();

  const taskNameInput = $("#task-title").val().trim();
  const taskDueInput = $("#datepicker").val();
  const taskDescInput = $("#task-desc-input").val().trim();

  console.log(taskNameInput, taskDueInput, taskDescInput);

  let nextId = generateTaskId();

  const newTask = {
    id: nextId,
    name: taskNameInput,
    dueDate: taskDueInput,
    description: taskDescInput,
    status: "to-do",
  };

  const tasks = readTasksFromStorage();
  tasks.push(newTask);

  localStorage.setItem("tasks", JSON.stringify(tasks));

  renderTaskList();

  $("#formModal").modal("hide");
};

// Todo: create a function to handle deleting a task
function handleDeleteTask() {
  const taskID = $(this).attr("task-id");

  const tasks = readTasksFromStorage();

  tasks.forEach((task) => {
    if (task.id == taskID) {
      tasks.splice(tasks.indexOf(task), 1);
    }
  });

  saveTasksToStorage(tasks);

  renderTaskList();
};

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
  let tasks = readTasksFromStorage();
  const droppedItemId = ui.draggable.attr("task-id");

  const taskID = ui.draggable.attr("task-id");
  console.log(taskID);

  const newStatus = $(event.target).attr("id");

  for (let task of tasks) {
    if (task.id == taskID) {
      task.status = newStatus;
      console.log(`Task ${taskID} is ${newStatus}`);
    }
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));
  renderTaskList();
};

$("#add-task").click(handleAddTask);

$(document).ready(function () {
  renderTaskList();

  $("#datepicker").datepicker({
    changeMonth: true,
    changeYear: true,
  });

  $(".lane").droppable({
    accept: ".draggable",
    drop: handleDrop,
  });
});
