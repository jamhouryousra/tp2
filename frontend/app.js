const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/api'
  : '/api';

let currentFilter = 'all';

async function fetchTasks() {
  try {
    const res = await fetch(`${API_URL}/tasks`);
    const tasks = await res.json();
    renderTasks(tasks);
  } catch (err) {
    console.error('Failed to fetch tasks:', err);
  }
}

function renderTasks(tasks) {
  const list = document.getElementById('tasks-list');

  const filtered = currentFilter === 'all'
    ? tasks
    : tasks.filter(t => t.status === currentFilter);

  if (filtered.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:#555;padding:40px;">No tasks found</p>';
    return;
  }

  list.innerHTML = filtered.map(task => `
    <div class="task-card ${task.status === 'done' ? 'done' : ''}">
      <div class="task-check ${task.status === 'done' ? 'checked' : ''}"
           onclick="toggleTask(${task.id}, '${task.status}')"></div>
      <div class="task-info">
        <div class="task-title">${escapeHtml(task.title)}</div>
        ${task.description ? `<div class="task-desc">${escapeHtml(task.description)}</div>` : ''}
      </div>
      <button class="task-delete" onclick="deleteTask(${task.id})">&#x2715;</button>
    </div>
  `).join('');
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function addTask(title, description) {
  try {
    await fetch(`${API_URL}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description }),
    });
    fetchTasks();
  } catch (err) {
    console.error('Failed to add task:', err);
  }
}

async function toggleTask(id, currentStatus) {
  const newStatus = currentStatus === 'done' ? 'pending' : 'done';
  try {
    await fetch(`${API_URL}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    fetchTasks();
  } catch (err) {
    console.error('Failed to update task:', err);
  }
}

async function deleteTask(id) {
  try {
    await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
    fetchTasks();
  } catch (err) {
    console.error('Failed to delete task:', err);
  }
}

// Form submit
document.getElementById('task-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const title = document.getElementById('task-title').value.trim();
  const desc = document.getElementById('task-desc').value.trim();
  if (title) {
    addTask(title, desc);
    document.getElementById('task-title').value = '';
    document.getElementById('task-desc').value = '';
  }
});

// Filters
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelector('.filter-btn.active').classList.remove('active');
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    fetchTasks();
  });
});

// Initial load
fetchTasks();
