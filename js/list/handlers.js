import { logoutHandler, auth } from "./auth.js";
import { loadUserData, deleteUser } from "./firestore.js";

export const setUpSidebar = () => {
    document.getElementById('settings-btn').addEventListener('click', () => {
        let sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        let sidebar = document.getElementById('sidebar');
        let settingsButton = document.getElementById('settings-btn');
        
        if(!sidebar.contains(e.target) && !settingsButton.contains(e.target)){
            sidebar.classList.remove('active');
        }
    });

    const loadTheme = () => {
        const themeLink = document.getElementById('theme-link');
        const sidebarTheme = document.getElementById('sidebar-theme');
    
        if(localStorage.getItem('darkMode') === 'enabled'){
            themeLink.href = '../css/list-dm.css';
            sidebarTheme.href = '../css/sidebar.css';
        }else if(localStorage.getItem('neutralMode') === 'enabled'){
            themeLink.href = '../css/list-nm.css';
            sidebarTheme.href = '../css/sidebar-nm.css';
        }else{
            themeLink.href = '../css/list.css';
            sidebarTheme.href = '../css/sidebar.css';
        }
    };

    const loadFont = () => {
        const title = document.getElementById('title');
        const ths = document.querySelectorAll('th');
        const tds = document.querySelectorAll('td');
        const toggles = document.querySelectorAll('.toggle');
        const elements = [title, tds[0], tds[1], tds[2], tds[3], tds[4], tds[5], ths[0], ths[1], ths[2], ths[3], ths[4], ths[5]];
    
        if(localStorage.getItem('smallFont') === 'enabled'){
            toggles[0].classList.add('color');
            toggles[1].classList.remove('color');
            toggles[2].classList.remove('color');
        }else if(localStorage.getItem('bigFont') === 'enabled'){
            toggles[0].classList.remove('color');
            toggles[1].classList.remove('color');
            toggles[2].classList.add('color');
        }else{
            toggles[0].classList.remove('color');
            toggles[1].classList.add('color');
            toggles[2].classList.remove('color');
        }
    
        elements.forEach(element => {
            if(element){
                if(localStorage.getItem('smallFont') === 'enabled'){
                    element.classList.add('smallfont');
                    element.classList.remove('bigfont');
                }else if(localStorage.getItem('bigFont') === 'enabled'){
                    element.classList.add('bigfont');
                    element.classList.remove('smallfont');
                }else{
                    element.classList.remove('bigfont');
                    element.classList.remove('smallfont');
                }
            }
        });
    };

    loadTheme();
    loadFont();

    //*Eventos para cambio de tema
    document.getElementById('light-mode-toggle').addEventListener('click', () => {
        localStorage.setItem('darkMode', 'disabled');
        localStorage.setItem('neutralMode', 'disabled');
        localStorage.setItem('lightMode', 'enabled');
        loadTheme();
    });

    document.getElementById('dark-mode-toggle').addEventListener('click', () => {
        localStorage.setItem('darkMode', 'enabled');
        localStorage.setItem('neutralMode', 'disabled');
        localStorage.setItem('lightMode', 'disabled');
        loadTheme();
    });

    document.getElementById('neutral-mode-toggle').addEventListener('click', () => {
        localStorage.setItem('darkMode', 'disabled');
        localStorage.setItem('neutralMode', 'enabled');
        localStorage.setItem('lightMode', 'disabled');
        loadTheme();
    });

    //*Eventos para cambio de fuente
    document.getElementById('small-font-toggle').addEventListener('click', () => {
        localStorage.setItem('bigFont', 'disabled');
        localStorage.setItem('medFont', 'disabled');
        localStorage.setItem('smallFont', 'enabled');
        loadFont();
    });

    document.getElementById('big-font-toggle').addEventListener('click', () => {
        localStorage.setItem('bigFont', 'enabled');
        localStorage.setItem('smallFont', 'disabled');
        localStorage.setItem('medFont', 'disabled');
        loadFont();
    });

    document.getElementById('med-font-toggle').addEventListener('click', () => {
        localStorage.setItem('smallFont', 'disabled');
        localStorage.setItem('medFont', 'enabled');
        localStorage.setItem('bigFont', 'disabled');
        loadFont();
    });

    document.getElementById('pac-btn').addEventListener('click', () => {
        window.location.href = '../html/list_p.html';
    });

    document.getElementById('pub-btn').addEventListener('click', () => {
        window.location.href = '../html/publications.html';
    });

    document.getElementById('logout-btn').addEventListener('click', logoutHandler);
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
    tabButton.classList.add('lexend-semibold');
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
        if(tabs.length > 1 && buttons.length > 1){
            buttons[tabIndex].classList.add('active'); 
        }
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
                <th class="headers">Nombre(s)</th>
                <th class="headers">Apellidos</th>
                <th class="headers">Email</th>
                <th class="headers">Telefono</th>
                <th class="headers">CURP</th>
                <th class="headers">Cedula</th>
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
    //*Se definen los encabezados que servirán como `data-label`
    const headers = ["Nombre(s)", "Apellidos", "Email", "Telefono", "CURP", "Cedula"];

    registers.forEach(register => {
        const tr = document.createElement('tr');
        tr.innerHTML = 
        `
            <td data-label="${headers[0]}">${register.nombres}</td>
            <td data-label="${headers[1]}">${register.apellido_p} ${register.apellido_m}</td>
            <td data-label="${headers[2]}">${register.email}</td>
            <td data-label="${headers[3]}">${register.telefono}</td>
            <td data-label="${headers[4]}">${register.curp}</td>
            <td data-label="${headers[5]}">${register.cedula}</td>
        `;

        tr.addEventListener('click', (e) => {
            if(!e.target.closest('.action')){
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

//*Inicializa los elementos y asigna los eventos
export const setupDeleteConfirmation = () => {
    const deleteBtn = document.getElementById('delete-btn');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmYesBtn = document.getElementById('confirm-yes');
    const confirmNoBtn = document.getElementById('confirm-no');

    if(deleteBtn){
        deleteBtn.addEventListener('click', () => {
            confirmModal.classList.add('show');
        });

        confirmYesBtn.addEventListener('click', () => {
            deleteUsers();
            confirmModal.classList.remove('show');
        });

        confirmNoBtn.addEventListener('click', () => {
            confirmModal.classList.remove('show');
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
    modal.classList.add('show');
    setTimeout(() => {
        modal.classList.remove('show');
    }, 2000);
};