// Data penyimpanan tugas
let todos = JSON.parse(localStorage.getItem('todos')) || [];

// Elemen-elemen DOM
const todoForm = document.getElementById('todo-form');
const taskInput = document.getElementById('task-input');
const dateInput = document.getElementById('date-input');
const taskList = document.getElementById('task-list'); // <tbody>
const filterButton = document.getElementById('filter-button');
const dropdownContent = document.querySelector('.dropdown-content');
const deleteAllButton = document.getElementById('delete-all-button');

// Elemen modal dari HTML
const deleteAllModal = document.getElementById('delete-all-modal');
const confirmDeleteButton = document.getElementById('confirm-delete');
const cancelDeleteButton = document.getElementById('cancel-delete');
const closeModal = document.querySelector('.close-button');

// Elemen pesan "NO TASK FOUND" 
const noTaskMessage = document.getElementById('no-task-message'); 

// --- Fungsi Utama ---

/**
 * Menyimpan data todos ke Local Storage
 */
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

/**
 * Memperbarui tampilan pesan "NO TASK FOUND".
 * Memenuhi Test Case: Tampilkan jika daftar kosong, Sembunyikan jika terisi.
 */
function updateNoTaskMessage() {
    // Keluar jika elemen pesan tidak ditemukan di HTML
    if (!noTaskMessage) return; 
    
    if (todos.length === 0) {
        // Test Case 1: Daftar Kosong -> Tampilkan
        noTaskMessage.style.display = 'block';
    } else {
        // Test Case 2: Daftar Terisi -> Sembunyikan
        noTaskMessage.style.display = 'none';
    }
}


/**
 * Menampilkan daftar tugas ke tabel
 * @param {Array<Object>} tasksToRender - Daftar tugas yang akan ditampilkan
 */
function renderTodos(tasksToRender = todos) {
    taskList.innerHTML = '';

    // Panggil fungsi ini di awal untuk memperbarui status pesan di luar tabel
    updateNoTaskMessage(); 

    // Jika daftar tugas kosong, keluar dari fungsi
    // Karena pesan "NO TASK FOUND", sudah diurus oleh updateNoTaskMessage()

    if (tasksToRender.length === 0) {
        return;
    }
    
    tasksToRender.forEach((todo) => {
        const row = document.createElement('tr');

        // TASK
        const taskCell = document.createElement('td');
        taskCell.textContent = todo.task;
        if (todo.completed) {
            taskCell.classList.add('completed-task');
        }

        // DUE DATE
        const dateCell = document.createElement('td');
        dateCell.textContent = todo.dueDate; 

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
 */
function addTodo(e) {
    e.preventDefault();

    if (!taskInput.value.trim() || !dateInput.value) {
        alert("Kolom To-Do dan Tanggal harus diisi!");
        return;
    }

    const [year, month, day] = dateInput.value.split('-');
    const formattedDate = `${month}/${day}/${year}`;

    const newTodo = {
        id: Date.now(), 
        task: taskInput.value.trim(),
        dueDate: formattedDate,
        rawDate: dateInput.value, 
        completed: false
    };

    todos.push(newTodo);
    saveTodos();
    // Panggil renderTodos untuk update tampilan dan pesan
    renderTodos(); 

    taskInput.value = '';
    dateInput.value = '';
}

/**
 * Menghapus tugas berdasarkan ID
 */
function deleteTodo(id) {
    // Konfirmasi (opsional)
    // if (!confirm("Are you sure you want to delete all tasks?")) return;
    
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    // Panggil renderTodos untuk update tampilan dan pesan
    renderTodos();
}

/**
 * Mengubah status complete/incomplete tugas berdasarkan ID
 */
function toggleComplete(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    saveTodos();
    // Panggil renderTodos untuk update tampilan
    renderTodos();
}

/**
 * Mengurutkan daftar tugas
 */
function sortTodos(sortType) {
    if (sortType === 'default' || !sortType) {
         renderTodos(todos);
         return;
    }
    
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
    }

    // Render hasil sorting
    renderTodos(sortedTodos);
}

// --- Handler Events ---

// 1. Tambahkan Tugas
// Pastikan elemen todoForm ada
if (todoForm) {
    todoForm.addEventListener('submit', addTodo);
} else {
    // Jika tidak menggunakan form, gunakan tombol Add langsung
    document.getElementById('add-button')?.addEventListener('click', addTodo);
}

// 2. Filter dengan Responsive Dropdown
if (filterButton && dropdownContent) {
    filterButton.addEventListener('click', (e) => {
        e.stopPropagation(); 
        if (dropdownContent.style.display === 'block') {
            dropdownContent.style.display = 'none';
        } else {
            dropdownContent.style.display = 'block';
        }
    });

    dropdownContent.addEventListener('click', (e) => {
        if (e.target.tagName === 'A' && e.target.dataset.sort) {
            e.preventDefault();
            sortTodos(e.target.dataset.sort);
            dropdownContent.style.display = 'none'; 
        }
    });
}


// 4. Tombol Delete All dengan Pop-up Konfirmasi
if (deleteAllButton && deleteAllModal) {
    deleteAllButton.addEventListener('click', () => {
        if (todos.length === 0) {
            alert("No tasks to delete");
            return;
        }
        deleteAllModal.style.display = 'block';
    });

    confirmDeleteButton.addEventListener('click', () => {
        todos = [];
        saveTodos();
        renderTodos();
        deleteAllModal.style.display = 'none';
    });

    cancelDeleteButton.addEventListener('click', () => {
        deleteAllModal.style.display = 'none';
    });

    closeModal.addEventListener('click', () => {
        deleteAllModal.style.display = 'none';
    });
}

// Global Event Listener untuk menutup modal/dropdown
window.addEventListener('click', (event) => {
    if (!event.target.closest('.dropdown-filter')) {
        dropdownContent.style.display = 'none';
    }
    
    if (event.target === deleteAllModal) {
        deleteAllModal.style.display = 'none';
    }
});

// 5. Inisialisasi: Render tugas saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    renderTodos();
});