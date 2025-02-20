document.addEventListener('DOMContentLoaded', function () {
  const desktopIcons = document.querySelectorAll('.desktop-icon');
  const windows = document.querySelectorAll('.window');
  const closeButtons = document.querySelectorAll('.close-button');
  const pin = document.getElementById('pin');
  const pinInfo = document.querySelector('.pin-info');
  const taskList = document.getElementById('task-list');
  const newTaskInput = document.getElementById('new-task');
  const addTaskButton = document.getElementById('add-task-button');
  const taskFolder = document.getElementById('task-folder');
  const notification = document.querySelector('.notification');

  const homeWindow = document.getElementById('home');
  if (homeWindow) {
    homeWindow.style.display = 'block';
  }

  let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

  // Function to center the window
  function centerWindow(window) {
    const windowWidth = window.offsetWidth;
    const windowHeight = window.offsetHeight;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    window.style.left = (screenWidth - windowWidth) / 2 + 'px';
    window.style.top = (screenHeight - windowHeight) / 2 + 'px';
  }

  // Center all windows on load and resize
  windows.forEach(windowElement => {
    centerWindow(windowElement);
  });

  window.addEventListener('resize', () => {
    windows.forEach(windowElement => {
      centerWindow(windowElement);
    });
  });

  function renderTasks(taskListToRender = tasks) {
    taskList.innerHTML = '';
    taskListToRender.forEach(task => {
      const taskElement = document.createElement('div');
      taskElement.classList.add('task-item');

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.checked = task.completed;
      checkbox.addEventListener('change', () => toggleComplete(task.id));
      taskElement.appendChild(checkbox);

      const taskText = document.createElement('span');
      taskText.textContent = task.text;
      taskText.style.textDecoration = task.completed ? 'line-through' : 'none';
      taskElement.appendChild(taskText);

      const editButton = document.createElement('button');
      editButton.textContent = 'Editar';
      editButton.addEventListener('click', () => editTask(task.id));
      taskElement.appendChild(editButton);

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Eliminar';
      deleteButton.addEventListener('click', () => deleteTask(task.id));
      taskElement.appendChild(deleteButton);

      taskList.appendChild(taskElement);
    });
  }

  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }

  function addTask(text) {
    const newTask = {
      id: Date.now(),
      text: text,
      completed: false,
      category: 'todas'
    };
    tasks.push(newTask);
    saveTasks();
    showNotification('¡Échale un vistazo a la carpeta de tareas!');
  }

  function deleteTask(id) {
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderTasks();
  }

  function toggleComplete(id) {
    tasks = tasks.map(task =>
      task.id === id ? {
        ...task,
        completed: !task.completed
      } : task
    );
    saveTasks();
    renderTasks();
  }

  function editTask(id) {
    const taskToEdit = tasks.find(task => task.id === id);
    if (taskToEdit) {
      const newText = prompt('Editar tarea', taskToEdit.text);
      if (newText !== null) {
        tasks = tasks.map(task =>
          task.id === id ? {
            ...task,
            text: newText
          } : task
        );
        saveTasks();
        renderTasks();
      }
    }
  }

  function showNotification(message) {
    notification.textContent = message;
    notification.style.display = 'block';

    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }

  addTaskButton.addEventListener('click', () => {
    const taskText = newTaskInput.value.trim();
    if (taskText !== '') {
      addTask(taskText);
      newTaskInput.value = '';
    }
  });

  desktopIcons.forEach(icon => {
    icon.addEventListener('click', () => {
      const sectionId = icon.dataset.section;
      const window = document.getElementById(sectionId);
      if (window) {
        windows.forEach(win => win.style.display = 'none');
        window.style.display = 'block';
        centerWindow(window);
      }
    });
  });

  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      const window = button.closest('.window');
      if (window) {
        window.style.display = 'none';
      }
    });
  });

  pin.addEventListener('click', async () => {
    pinInfo.style.display = pinInfo.style.display === 'block' ? 'none' : 'block';
  });

  taskFolder.addEventListener('click', () => {
    const tasksWindow = document.getElementById('tasks-folder');
    if (tasksWindow) {
      windows.forEach(win => win.style.display = 'none');
      tasksWindow.style.display = 'block';
      centerWindow(tasksWindow);
      renderTasks();
    }
  });

  async function getFunFact() {
    try {
      const response = await fetch('/api/ai_completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          prompt: `Respond with an interesting and surprising fun fact. The response should be short, engaging, and suitable for a general audience.
          
          interface Response {
            fact: string;
          }
          
          {
            "fact": "Did you know that honey never spoils? Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible!"
          }
          `,
          data: ""
        }),
      });
      const data = await response.json();
      document.getElementById('fun-fact-text').textContent = data.fact;
    } catch (error) {
      console.error('Error fetching fun fact:', error);
      document.getElementById('fun-fact-text').textContent = "La Regla de los 2 minutos aumenta la productividad 🕒 Si una tarea toma menos de 2 minutos en completarse, es mejor hacerla de inmediato en lugar de agregarla a una lista. Este método, popularizado por Getting Things Done de David Allen, evita la acumulación de pequeñas tareas pendientes.";
    }
  }

  async function getCreatorInfo() {
    try {
      let creatorUsername = (await window.websim.getCreatedBy()).username;
      document.getElementById('creator-info').textContent = `This page was created by: ${creatorUsername}`;
      document.getElementById('creator-username').textContent = creatorUsername; // For pin info
    } catch (error) {
      console.error('Error fetching creator info:', error);
      document.getElementById('creator-info').textContent = "Soy una persona organizada y meticulosa, me gusta planificar mis tareas y optimizar mi tiempo para ser más eficiente. Disfruto enfrentar desafíos, aprender cosas nuevas y mejorar constantemente mis habilidades. Siempre busco el equilibrio entre creatividad y estructura para alcanzar mis objetivos de la mejor manera posible. 🚀";
    }
  }

  // Power On Functionality
  const loadingScreen = document.getElementById('loading-screen');
  const desktop = document.getElementById('desktop');
  const powerOnButton = document.getElementById('power-on');
  const powerOffButton = document.getElementById('power-off');

  powerOnButton.addEventListener('click', () => {
    loadingScreen.style.opacity = '0';
    desktop.style.display = 'block'; // Make sure desktop is set to block before fading in
    setTimeout(() => {
      desktop.style.opacity = '1';
      loadingScreen.style.display = 'none'; // Hide loading screen after transition
    }, 50); // Small delay to allow display: block to take effect

    getFunFact();
    getCreatorInfo();
  });

  powerOffButton.addEventListener('click', () => {
    desktop.style.opacity = '0';
    setTimeout(() => {
      desktop.style.display = 'none';
      loadingScreen.style.display = 'flex'; // Re-enable loading screen
      loadingScreen.style.opacity = '1';
    }, 1000); // Match the transition duration
  });

  // Initial state: Loading screen is visible, desktop is hidden
  desktop.style.display = 'none';
});