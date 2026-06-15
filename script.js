// --- Seleção de Elementos do DOM ---
const mainTitle = document.getElementById('mainTitle'); // Novo elemento selecionado
const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');
const deletedList = document.getElementById('deletedList');

// --- Estado da Aplicação (Lendo dados salvos em JSON no LocalStorage) ---
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let deletedTasks = JSON.parse(localStorage.getItem('deletedTasks')) || [];

// --- Funções de Manipulação e Armazenamento ---

// Atualiza o título principal com a data de hoje formatada (DD/MM/AAAA)
function updateMainTitleDate() {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    mainTitle.textContent = `Tarefas do dia ${formattedDate}`;
}

// Converte os dados para JSON e armazena no navegador
function saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('deletedTasks', JSON.stringify(deletedTasks));
}

// Renderiza todas as listas da interface e atualiza o armazenamento
function renderAll() {
    renderActiveTasks();
    renderDeletedTasks();
    saveToLocalStorage();
}

// Renderiza a lista superior de tarefas ativas
function renderActiveTasks() {
    todoList.innerHTML = '';

    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = 'todo-item';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'todo-content';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.done;

        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'task-details';

        const spanText = document.createElement('span');
        spanText.className = 'todo-text';
        spanText.textContent = task.text;
        
        if (task.done) {
            spanText.classList.add('completed');
        }

        const spanMeta = document.createElement('span');
        spanMeta.className = 'task-meta';
        spanMeta.textContent = `Criada em: ${task.createdAt}`;

        detailsDiv.appendChild(spanText);
        detailsDiv.appendChild(spanMeta);

        contentDiv.appendChild(checkbox);
        contentDiv.appendChild(detailsDiv);

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.textContent = 'Deletar';

        li.appendChild(contentDiv);
        li.appendChild(deleteBtn);
        todoList.appendChild(li);
        
        contentDiv.addEventListener('click', () => {
            toggleTask(index);
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            archiveTask(index);
        });
    });
}

// Renderiza a lista inferior de tarefas arquivadas/excluídas
function renderDeletedTasks() {
    deletedList.innerHTML = '';

    deletedTasks.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = 'deleted-item';

        const infoDiv = document.createElement('div');
        infoDiv.className = 'task-details';

        const spanText = document.createElement('span');
        spanText.className = 'deleted-text';
        spanText.textContent = task.text;

        const spanTime = document.createElement('span');
        spanTime.className = 'deleted-time';
        spanTime.textContent = `Criada em: ${task.createdAt} | Concluída em: ${task.dateString}`;

        infoDiv.appendChild(spanText);
        infoDiv.appendChild(spanTime);

        const finalDeleteBtn = document.createElement('button');
        finalDeleteBtn.className = 'btn-delete';
        finalDeleteBtn.textContent = 'Deletar';

        li.appendChild(infoDiv);
        li.appendChild(finalDeleteBtn);
        deletedList.appendChild(li);

        finalDeleteBtn.addEventListener('click', () => {
            deletePermanently(index);
        });
    });
}

// Adiciona nova tarefa ativa
function addTask(text) {
    const now = new Date();
    const formattedCreatedDate = now.toLocaleString('pt-BR');

    const newTask = {
        text: text,
        done: false,
        createdAt: formattedCreatedDate
    };
    tasks.push(newTask);
    renderAll();
}

function toggleTask(index) {
    tasks[index].done = !tasks[index].done;
    renderAll();
}

// Move a tarefa para a lista inferior (Histórico)
function archiveTask(index) {
    const now = new Date();
    const formattedDate = now.toLocaleString('pt-BR');

    const [removedTask] = tasks.splice(index, 1);

    removedTask.done = true;
    removedTask.dateString = formattedDate;
    
    deletedTasks.push(removedTask);
    renderAll();
}

// Remove o item permanentemente do histórico de excluídos
function deletePermanently(index) {
    deletedTasks.splice(index, 1);
    renderAll();
}

// --- EventListeners Globais ---
todoForm.addEventListener('submit', (event) => {
    event.preventDefault();
    
    const taskText = todoInput.value.trim();
    if (taskText !== '') {
        addTask(taskText);
        todoInput.value = '';
        todoInput.focus();
    }
});

// --- Inicialização ---
updateMainTitleDate(); // Define a data do dia no cabeçalho
renderAll();          // Exibe os dados salvos do LocalStorage
