// Data penyimpanan tugas (gunakan Local Storage untuk persistensi)
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// Ambil elemen-elemen DOM
const todoForm = document.getElementById('todo-form');
const taskInput = document.getElementById('task-input');
const dateInput = document.getElementById('date-input');
const taskList = document.getElementById('task-list');
const filterButton = document.getElementById('filter-button');
const dropdownContent = document.querySelector('.dropdown-content');
const deleteAllButton = document.getElementById('delete-all-button');
const deleteAllModal = document.getElementById('delete-all-modal');
const confirmDeleteButton = document.getElementById('confirm-delete');
const cancelDeleteButton = document.getElementById('cancel-delete');
const closeModal = document.querySelector('.close-button');

// --- Fungsi Utama ---

/**
 * Menyimpan data todos ke Local Storage
 */
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

/**
 * Merender (menampilkan) daftar tugas ke tabel
 * @param {Array<Object>} tasksToRender - Daftar tugas yang akan ditampilkan
 */
function renderTodos(tasksToRender = todos) {
    taskList.innerHTML = ''; // Kosongkan daftar yang sudah ada

    if (tasksToRender.length === 0) {
        // Tampilkan pesan "NO TASK FOUND"
        const noTaskRow = document.createElement('tr');
        noTaskRow.innerHTML = `<td colspan="4" class="no-task-found">NO TASK FOUND</td>`;
        taskList.appendChild(noTaskRow);
        return;
    }

    tasksToRender.forEach((todo, index) => {
        const row = document.createElement('tr');

        // TASK
        const taskCell = document.createElement('td');
        taskCell.textContent = todo.task;
        if (todo.completed) {
            taskCell.classList.add('completed-task');
        }

        // DUE DATE
        const dateCell = document.createElement('td');
        dateCell.textContent = todo.dueDate; // Format MM/DD/YYYY dari input date

        // STATUS
        const statusCell = document.createElement('td');
        statusCell.classList.add('task-status');
        statusCell.textContent = todo.completed ? 'Completed' : 'Pending';
        statusCell.classList.add(todo.completed ? 'completed' : 'pending');

        // ACTION
        const actionCell = document.createElement('td');
        actionCell.classList.add('task-actions');

        // Tombol Complete/Incomplete
        const completeBtn = document.createElement('button');
        completeBtn.textContent = todo.completed ? 'Incomplete' : 'Complete';
        completeBtn.classList.add('action-button', 'complete-btn');
        completeBtn.addEventListener('click', () => toggleComplete(todo.id));

        // Tombol Delete
        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
        deleteBtn.classList.add('action-button', 'delete-btn');
        deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

        actionCell.appendChild(completeBtn);
        actionCell.appendChild(deleteBtn);

        row.appendChild(taskCell);
        row.appendChild(dateCell);
        row.appendChild(statusCell);
        row.appendChild(actionCell);

        taskList.appendChild(row);
    });
}

/**
 * Menambahkan tugas baru
 * @param {Event} e - Event submit formulir
 */
function addTodo(e) {
    e.preventDefault();

    // --- Validasi Formulir Masukan ---
    if (!taskInput.value.trim() || !dateInput.value) {
        alert("Kolom To-Do dan Tanggal harus diisi!");
        return;
    }

    // Ubah format tanggal dari YYYY-MM-DD (format input type="date") menjadi MM/DD/YYYY
    const [year, month, day] = dateInput.value.split('-');
    const formattedDate = `${month}/${day}/${year}`;

    const newTodo = {
        id: Date.now(), // ID unik
        task: taskInput.value.trim(),
        dueDate: formattedDate,
        rawDate: dateInput.value, // Simpan juga raw date untuk sorting
        completed: false
    };

    todos.push(newTodo);
    saveTodos();
    renderTodos();

    // Reset formulir
    taskInput.value = '';
    dateInput.value = '';
}

/**
 * Menghapus tugas berdasarkan ID
 * @param {number} id - ID tugas yang akan dihapus
 */
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    renderTodos();
}

/**
 * Mengubah status complete/incomplete tugas berdasarkan ID
 * @param {number} id - ID tugas yang akan diubah statusnya
 */
function toggleComplete(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    saveTodos();
    renderTodos();
}

/**
 * Mengurutkan daftar tugas
 * @param {string} sortType - Tipe pengurutan (e.g., 'date-asc', 'alpha-desc')
 */
function sortTodos(sortType) {
    let sortedTodos = [...todos]; // Buat salinan

    switch (sortType) {
        case 'date-asc':
            sortedTodos.sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));
            break;
        case 'date-desc':
            sortedTodos.sort((a, b) => new Date(b.rawDate) - new Date(a.rawDate));
            break;
        case 'alpha-asc':
            sortedTodos.sort((a, b) => a.task.localeCompare(b.task));
            break;
        case 'alpha-desc':
            sortedTodos.sort((a, b) => b.task.localeCompare(a.task));
            break;
        default:
            // Urutan default (tanpa sorting)
            sortedTodos = todos;
    }

    renderTodos(sortedTodos);
}

// --- Handler Events ---

// 1. Tambahkan Tugas
todoForm.addEventListener('submit', addTodo);

// 2. Filter dengan Responsive Dropdown
dropdownContent.addEventListener('click', (e) => {
    if (e.target.tagName === 'A' && e.target.dataset.sort) {
        e.preventDefault();
        sortTodos(e.target.dataset.sort);
    }
});

// 3. Tombol Delete All dengan Pop-up Konfirmasi
deleteAllButton.addEventListener('click', () => {
    if (todos.length === 0) {
        alert("Tidak ada tugas untuk dihapus.");
        return;
    }
    deleteAllModal.style.display = 'block';
});

// Konfirmasi penghapusan
confirmDeleteButton.addEventListener('click', () => {
    todos = [];
    saveTodos();
    renderTodos();
    deleteAllModal.style.display = 'none';
});

// Batalkan penghapusan
cancelDeleteButton.addEventListener('click', () => {
    deleteAllModal.style.display = 'none';
});

// Tutup modal jika klik di luar atau tombol 'x'
closeModal.addEventListener('click', () => {
    deleteAllModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === deleteAllModal) {
        deleteAllModal.style.display = 'none';
    }
});

// 4. Inisialisasi: Render tugas saat halaman dimuat
document.addEventListener('DOMContentLoaded', renderTodos);