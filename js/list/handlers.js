import { logoutHandler, auth } from "./auth.js";
import { loadUserData, deleteUser } from "./firestore.js";
import { changeIcon } from "./icons.js";

//*Boton para nuevos registros
export const setUpNewRegisterButton = () => {
    document.getElementById('new-btn').addEventListener('click', () =>{
        window.location.href = '../../html/specialist-register.html';
    });
};

//*Botones para cerrar sesión
export const setupLogoutButtons = () => {
    document.getElementById('logout-btn').addEventListener('click', logoutHandler);
    document.getElementById('logout-icon-btn').addEventListener('click', logoutHandler);
};

//*Función que añade eventos para la ejecución de la busqueda de usuarios
export const setupSearch = () => {
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-icon');
    searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', (e) => {
        if(e.key === "Enter"){
            handleSearch();
        }
    });
};

//*Manejador de la barra de busqueda
export const handleSearch = async () => {
    const searchInput = document.getElementById('search-input');
    const searchText = searchInput.value.toLowerCase().trim();
    if(!searchText){
        clearContainers();
        setupTabsWithContent();
        return; //?Detenemos la ejecución de la función debido a que no hay texto que buscar
    }

    const allData = await loadUserData();
    const filteredData = allData.filter(data => { //?Filtrado de datos para la busqueda de usuarios
        return Object.values(data).some(value => value.toString().toLowerCase().includes(searchText)); //?Regresa los datos que cumplan con las condiciones impuestas
    });

    if(filteredData.length > 0){
        displaySearchResults(filteredData);
    }else{
        noResults();
    }
};

//*Función para limpiar los contenedores
const clearContainers = () => {
    const contentContainer = document.querySelector('.tabs-content');
    let tabsContainer = document.querySelector('.tabs');
    contentContainer.innerHTML = ``;
    tabsContainer.innerHTML = ``; 
};

//*Muestra los resultados de la busqueda de usuarios
const displaySearchResults = (filteredData) => {
    const contentContainer = document.querySelector('.tabs-content');
    contentContainer.innerHTML = ``;
    const table = createTable(filteredData); //?Crea una nueva tabla con los datos de los usuarios filtrados y se añaden al contenedor
    contentContainer.appendChild(table);
};

//*Se manda un mensaje de falta de coincidencias en caso de no haber un dato con la busqueda ingresada
const noResults = () => {
    const contentContainer = document.querySelector('.tabs-content');
    let tabsContainer = document.querySelector('.tabs');
    contentContainer.innerHTML = `<div class="lexend-semibold noresults-div">No se encontraron coincidencias</div>`;
    tabsContainer.innerHTML = ``;
};

//*Función para colocar las pestañas y el contenido principal de estas
export const setupTabsWithContent = async () => {
    const registers = await loadUserData();
    let tabRegistration = 10;
    let tabsNumber = Math.ceil(registers.length / tabRegistration);
    for(let i = 0; i < tabsNumber; i++){
        createTab(i + 1);
        let tabContent = createTabContent(i, registers.slice(i * tabRegistration, (i + 1) * tabRegistration));
        document.querySelector('.tabs-content').appendChild(tabContent);
    }
    openTab(0);
};

//*Crea los botones para el páginado de las pestañas
function createTab(index){
    let tabsContainer = document.querySelector('.tabs');
    const tabButton = document.createElement('button');
    tabButton.classList.add('tab-button');
    //?console.log(index);
    tabButton.textContent = `${index}`;
    tabButton.dataset.tabIndex = index - 1;
    tabButton.addEventListener('click', function() {
        openTab(parseInt(this.dataset.tabIndex));
    });
    tabsContainer.appendChild(tabButton);
};

//*Selecciona y abre las pestaña que se haya solicitado abrir desde los botones
const openTab = (tabIndex) => {
    let tabs = document.querySelectorAll('.tab-content');
    let buttons = document.querySelectorAll('.tab-button');
    if(tabIndex >= 0 && tabIndex < tabs.length && tabIndex < buttons.length){
        for(let i = 0; i < tabs.length; i++){
            tabs[i].style.display = 'none';
            buttons[i].classList.remove('active');
        };
        tabs[tabIndex].style.display = 'block';
        buttons[tabIndex].classList.add('active'); 
    }else{
        console.error(`tabIndex ${tabIndex} fuera de rango o elementos no encontrados`);
    }
};

//*Crea el contenedor donde ira la tabla con los registros mostrando solo la primera de inicio
function createTabContent(tabIndex, registers){
    let tabContent = document.createElement('div');
    tabContent.className = 'tab-content';
    tabContent.id = `Tab${tabIndex + 1}`;
    tabContent.style.display = tabIndex === 0 ? 'block' : 'none';
    let table = createTable(registers);
    tabContent.appendChild(table);
    return tabContent;
};

//*Crea la tabla y el encabezado pasando todos los registros y el cuerpo de la tabla para rellenar los datos
function createTable(registers) {
    let table = document.createElement('table');
    table.className = 'specialist-table';
    table.innerHTML = 
    `
        <thead>
            <tr class="lexend-medium">
                <th class="check-icon material-symbols-outlined">checklist</th>
                <th class="headers">Nombre(s)</th>
                <th class="headers">Apellido</th>
                <th class="headers">Email</th>
                <th class="headers">Especialidad</th>
                <th class="headers">Telefono</th>
                <th class="headers">RFC</th>
                <th class="actions-head">Acciones</th>
            </tr>
        </thead>
        <tbody class="lexend-regular">
        </tbody>
    `;
    let tbody = table.querySelector('tbody');
    populateTable(registers, tbody);
    return table;
};

//*Rellena la tabla con todos los datos y asigna los eventos tanto de la tabla como de los pop-up
const populateTable = (registers, tbody) => {
    tbody.innerHTML = ``;
    registers.forEach(register => {
        const tr = document.createElement('tr');
        tr.innerHTML = 
        `
            <td class="check-void-icon material-symbols-outlined">check_box_outline_blank</td>
            <td>${register.nombres}</td>
            <td>${register.apellido}</td>
            <td>${register.email}</td>
            <td>${register.especialidad}</td>
            <td>${register.telefono}</td>
            <td>${register.rfc}</td>
            <td class="action">
                <span class="actions">...</span>
                <div class="pop-up lexend-medium">
                    <a href="./panel.html?id=${register.id}">Detalles</a>
                    <a href="./specialist-edit.html?id=${register.id}">Editar</a>
                    <a href="#" class="single-delete" data-id="${register.id}">Eliminar</a>
                </div>
            </td>
        `;
        tr.querySelector('.check-void-icon').addEventListener('click', function() {
            changeIcon(this);
        });

        tr.addEventListener('click', (e) => {
            if(!e.target.closest('.action') && !e.target.closest('.check-void-icon')){
                window.location.href = `../../html/panel.html?id=${register.id}`;
            }
        });
        tbody.appendChild(tr);
    });

    tbody.addEventListener('click', function(e){
        if(e.target && e.target.matches('a.single-delete')){
            e.preventDefault();
            const id = e.target.getAttribute('data-id');
            deleteUser(id).then(() => {
                clearContainers();
                setupTabsWithContent();
            });
        }
    });
};

//*Inicializa los elementos los cuales seran cambiados y llama a las funciones correspondientes
export const setupDarkMode = () => {
    const toggleButton = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const modalContents = document.querySelectorAll('.modal-content');
    const confirmButtons = document.querySelectorAll('.confirm-btn');
    const logoutBtn = document.querySelector('.logout-btn');
    const logoutIconBtn = document.querySelector('.logout-icon-btn');

    if(localStorage.getItem('darkMode') === 'enabled'){
        enableDarkMode(toggleButton, body, modalContents, confirmButtons, logoutBtn, logoutIconBtn);
    };

    toggleButton.addEventListener('click', () => {
        if(localStorage.getItem('darkMode') != 'enabled'){
            enableDarkMode(toggleButton, body, modalContents, confirmButtons, logoutBtn, logoutIconBtn);
        }else{
            disableDarkMode(toggleButton, body, modalContents, confirmButtons, logoutBtn, logoutIconBtn);
        }
    });
};

//*Activa el modo oscuro
const enableDarkMode = (toggleButton, body, modalContents, confirmButtons, logoutBtn, logoutIconBtn) => {
    toggleButton.classList.add('dark-mode');
    body.classList.add('dark-mode');
    modalContents.forEach(modal => modal.classList.add('dark-mode'));
    confirmButtons.forEach(button => button.classList.add('dark-mode'));
    logoutBtn.classList.add('dark-mode');
    logoutIconBtn.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
};

//*Desactiva el modo oscuro
const disableDarkMode = (toggleButton, body, modalContents, confirmButtons, logoutBtn, logoutIconBtn) => {
    toggleButton.classList.remove('dark-mode');
    body.classList.remove('dark-mode');
    modalContents.forEach(modal => modal.classList.remove('dark-mode'));
    confirmButtons.forEach(button => button.classList.remove('dark-mode'));
    logoutBtn.classList.remove('dark-mode');
    logoutIconBtn.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
};

//*Inicializa los elementos y asigna los eventos
export const setupDeleteConfirmation = () => {
    const deleteBtn = document.getElementById('delete-btn');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmYesBtn = document.getElementById('confirm-yes');
    const confirmNoBtn = document.getElementById('confirm-no');

    if(deleteBtn){
        deleteBtn.addEventListener('click', () => {
            confirmModal.style.display = 'block';
        });

        confirmYesBtn.addEventListener('click', () => {
            deleteUsers();
            confirmModal.style.display = 'none';
        });

        confirmNoBtn.addEventListener('click', () => {
            confirmModal.style.display = 'none';
        });
    }
};

const deleteUsers = async () => {
    const selectedRows = getSelectedRows();
    if(selectedRows.length === 0){
        showFeedBack('No hay usuarios seleccionados para eliminar', 'error');
        return;
    }

    try{
        const deletePromises = selectedRows.map(async index => {
            const user = await getIdUser(index);
            if(user && user.id){
                return deleteUser(user.id);
            }
        });
        await Promise.all(deletePromises);
        console.log('Todos los usuarios seleccionados han sido eliminados correctamente');
        showFeedBack('Todos los usuarios seleccionados han sido eliminados correctamente', 'success');
        clearContainers();
        setupTabsWithContent();
    }catch(error){
        console.error('Error al eliminar los usuarios: ', error);
        showFeedBack('Hubo un error al eliminar los usuarios. Inténtalo nuevamente.', 'error');
    }
};

const getSelectedRows = () => {
    const rows = document.querySelectorAll('table tbody tr');
    const selectedRows = [];
    rows.forEach((row, index) => {
        const box = row.querySelector('.check-void-icon');
        if(box.textContent === 'check_box'){
            selectedRows.push(index);
        }
    });
    return selectedRows;
};

const getIdUser = async (index) => {
    try{
        const users = await loadUserData();
        return users[index];
    }catch(error){
        console.error('Error al obtener el id del usuario: ', error);
        return null;
    }
};

const showFeedBack = (message, type) => {
    const modal = document.getElementById('feedback-modal');
    const feedBackMessage = document.getElementById('feedback-message');
    feedBackMessage.textContent = message;
    modal.style.display = 'block';
    setTimeout(() => {
        modal.style.display = 'none';
    }, 5000);
};