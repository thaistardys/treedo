// --- Seleção de Elementos do DOM ---
const mainTitle = document.getElementById('mainTitle');
const todoForm = document.getElementById('todoForm');
const todoInput = document.getElementById('todoInput');
const todoList = document.getElementById('todoList');
const completedList = document.getElementById('completedList');
const deletedList = document.getElementById('deletedList');

// --- Estado da Aplicação (3 Arrays lidos do LocalStorage em JSON) ---
let pendingTasks = JSON.parse(localStorage.getItem('pendingTasks')) || [];
let completedTasks = JSON.parse(localStorage.getItem('completedTasks')) || [];
let deletedTasks = JSON.parse(localStorage.getItem('deletedTasks')) || [];

// --- Funções de Armazenamento e Inicialização ---

function updateMainTitleDate() {
    const now = new Date();
    const formattedDate = now.toLocaleDateString('pt-BR');
    mainTitle.textContent = `Tarefas do dia ${formattedDate}`;
}

function saveToLocalStorage() {
    localStorage.setItem('pendingTasks', JSON.stringify(pendingTasks));
    localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
    localStorage.setItem('deletedTasks', JSON.stringify(deletedTasks));
}

function renderAll() {
    renderPendingActive();
    renderCompletedActive();
    renderDeletedActive();
    saveToLocalStorage();
}

// --- Funções de Renderização Dinâmica ---

// 1. Renderiza Card de Pendentes
function renderPendingActive() {
    todoList.innerHTML = '';
    pendingTasks.forEach((task, index) => {
        const li = createBaseTaskElement(task, false);

        // Ações da direita
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.textContent = 'Deletar';

        actionsDiv.appendChild(deleteBtn);
        li.appendChild(actionsDiv);
        todoList.appendChild(li);

        // Cliques específicos de Pendentes
        li.querySelector('.todo-content').addEventListener('click', () => {
            moveToCompleted(index); // Move automático ao clicar para marcar
        });

        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            moveToDeleted(index, 'pending');
        });
    });
}

// 2. Renderiza Card de Concluídas
function renderCompletedActive() {
    completedList.innerHTML = '';
    completedTasks.forEach((task, index) => {
        const li = createBaseTaskElement(task, true);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

        const reloadBtn = document.createElement('button');
        reloadBtn.className = 'btn-reload';
        reloadBtn.textContent = '🔄'; // Símbolo de reload

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn-delete';
        deleteBtn.textContent = 'Deletar';

        actionsDiv.appendChild(reloadBtn);
        actionsDiv.appendChild(deleteBtn);
        li.appendChild(actionsDiv);
        completedList.appendChild(li);

        // Cliques específicos de Concluídas
        li.querySelector('.todo-content').addEventListener('click', () => {
            returnToPending(index, 'completed'); // Desmarcar joga de volta pra pendentes
        });

        reloadBtn.addEventListener('click', () => {
            returnToPending(index, 'completed');
        });

        deleteBtn.addEventListener('click', () => {
            moveToDeleted(index, 'completed');
        });
    });
}

// 3. Renderiza Card de Excluídas
function renderDeletedActive() {
    deletedList.innerHTML = '';
    deletedTasks.forEach((task, index) => {
        const li = createBaseTaskElement(task, true);

        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'task-actions';

        const reloadBtn = document.createElement('button');
        reloadBtn.className = 'btn-reload';
        reloadBtn.textContent = '🔄';

        const finalDeleteBtn = document.createElement('button');
        finalDeleteBtn.className = 'btn-delete';
        finalDeleteBtn.textContent = 'Deletar';

        actionsDiv.appendChild(reloadBtn);
        actionsDiv.appendChild(finalDeleteBtn);
        li.appendChild(actionsDiv);
        deletedList.appendChild(li);

        // Cliques específicos de Excluídas
        reloadBtn.addEventListener('click', () => {
            returnToPending(index, 'deleted'); // Resgata tarefa das excluídas
        });

        finalDeleteBtn.addEventListener('click', () => {
            deletePermanently(index); // Sone da tela para sempre
        });
    });
}

// Auxiliar para gerar a estrutura base repetitiva de texto e checkboxes
function createBaseTaskElement(task, isFinished) {
    const li = document.createElement('li');
    li.className = 'todo-item';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'todo-content';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = isFinished;

    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'task-details';

    const spanText = document.createElement('span');
    spanText.className = 'todo-text';
    spanText.textContent = task.text;

    if (isFinished) {
        spanText.classList.add('completed-text');
    }

    const spanMeta = document.createElement('span');
    spanMeta.className = 'task-meta';
    
    // Constrói o texto do rodapé dependendo dos carimbos que a tarefa possui
    let metaText = `Criada em: ${task.createdAt}`;
    if (task.dateString) {
        metaText += ` | Concluída em: ${task.dateString}`;
    }
    spanMeta.textContent = metaText;

    detailsDiv.appendChild(spanText);
    detailsDiv.appendChild(spanMeta);
    contentDiv.appendChild(checkbox);
    contentDiv.appendChild(detailsDiv);
    li.appendChild(contentDiv);

    return li;
}

// --- Funções de Fluxo de Mudança de Arrays ---

function addTask(text) {
    const now = new Date();
    const formattedCreatedDate = now.toLocaleString('pt-BR');

    const newTask = {
        text: text,
        createdAt: formattedCreatedDate,
        dateString: null
    };
    pendingTasks.push(newTask);
    renderAll();
}

function moveToCompleted(index) {
    const now = new Date();
    const [task] = pendingTasks.splice(index, 1);
    task.dateString = now.toLocaleString('pt-BR'); // Carimba conclusão
    completedTasks.push(task);
    renderAll();
}

function returnToPending(index, origin) {
    let task;
    if (origin === 'completed') {
        [task] = completedTasks.splice(index, 1);
    } else if (origin === 'deleted') {
        [task] = deletedTasks.splice(index, 1);
    }
    task.dateString = null; // Remove o carimbo de conclusão
    pendingTasks.push(task);
    renderAll();
}

function moveToDeleted(index, origin) {
    let task;
    if (origin === 'pending') {
        [task] = pendingTasks.splice(index, 1);
    } else if (origin === 'completed') {
        [task] = completedTasks.splice(index, 1);
    }
    
    // Se veio direto de pendentes sem hora de conclusão, coloca o momento atual
    if (!task.dateString) {
        const now = new Date();
        task.dateString = now.toLocaleString('pt-BR');
    }
    
    deletedTasks.push(task);
    renderAll();
}

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
updateMainTitleDate();
renderAll();
