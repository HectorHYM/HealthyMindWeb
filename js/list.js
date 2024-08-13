import { getAuth, signOut, onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js'
import { getFirestore, doc, getDocs, collection, deleteDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { app } from './firebase-config.js';

const auth = getAuth(app);
const db = getFirestore(app);

//*Guardado de estado de sesión
onAuthStateChanged(auth, (user) => {
    console.log("Estado de autenticación cambiado:", user);
    if(!user){
        window.location.href = "./index.html";
    }
});

//*Función para cerrar sesión
window.logout = async() => {
    signOut(auth).then(() => {
        console.log("Sesión cerrada exitosamente");
    }).catch((error) => {
        console.error("Error al cerrar sesión: ", error);
    });
};

//*Botones superiores
document.getElementById('logout-btn').addEventListener('click', () => {
    logout();
});

document.getElementById('logout-icon-btn').addEventListener('click', () => {
    logout();
});

document.getElementById('new-btn').addEventListener('click', () => {
    window.location.href = "./specialist-register.html";
});

//*Icono check
window.changeIcon = async(cell) => {
    if(cell.textContent === 'check_box_outline_blank'){
        cell.textContent = 'check_box';
    }else{
        cell.textContent = 'check_box_outline_blank';
    }
};

//*Función para obtener los registros de la base de datos
const loadUserData = async ()  => {
    try {
        const querySnapshot = await getDocs(collection(db, 'users-especialista')); //?Se obtiene cada doc de la colleción
        const registers = []; //?Array vacio de registros
        querySnapshot.forEach(doc => {
            const data = doc.data(); //?Devuelve un objeto JavaScript con los campos del documento como propiedades
            data.id = doc.id;
            registers.push(data);
        });
        return registers;
    } catch (error){
        console.error("Error al obtener los datos de los docummentos", error);
        return [];
    }
};

//*Eliminar los registros seleccionados
export const deleteUsers = async () => {
    //*Se obtienen los indices de las filas seleccionadas
    const selectedRows = getSelectedRows();
    if(selectedRows.length === 0){
        showFeedBack('No hay usuarios seleccionados para eliminar.', 'error');
        return;
    }

    try{
        //*Se eliminan los registros seleccionados de la base de datos
        const deletePromises = selectedRows.map(async index => {
            //*Se obtiene el id de la base de datos correspondiente al indice del registro
            const user = await getIdUser(index);
            if(user && user.id ){
                //*Se elimina cada registro de la base de datos
                return deleteUser(user.id);
            }
        });
        await Promise.all(deletePromises);
        console.log('Todos los usuarios seleccionados han sido eliminados correctamente');
        showFeedBack('Todos los usuarios seleccionados han sido eliminados correctamente', 'success');
        clearContainers();
        setupTabsWithContent(); //?Recarga de los datos para reflejar el cambio
    }catch(error){
        console.error('Error al eliminar usuarios:', error);
        showFeedBack('Hubo un error al eliminar los usuarios. Inténtalo nuevamente.', 'error');
    }
};

//*Se obtienen las filas seleccionadas (Las que cuentan con casilla marcada)
const getSelectedRows = () => {
    const rows = document.querySelectorAll('table tbody tr'); //?Se obtienen cada una de las filas
    const selectedRows = [];

    //*Se itera sobre todas las filas de la tabla
    rows.forEach((row, index) => {
        //*Se obtiene la casilla de verificación de la fila marcada
        const box = row.querySelector('.check-void-icon');

        //*Se verifica si la casilla esta marcada (check_box)
        if(box.textContent === 'check_box'){
            //*Si esta marcada se agrega el indice de la fila a la lista de las filas seleccionadas
            selectedRows.push(index);
        }
    });

    return selectedRows;
};

const getIdUser = async (index) => {
    try{
        const users = await loadUserData();
        return users[index];
    } catch (error){
        console.error("Error al obtener el id del usuario", error);
        return null;
    }
};

const deleteUser = async (id) => {
    try{
        await deleteDoc(doc(db, "users-especialista", id));
        console.log("Usuario(s) eliminado(s) correctamente");
    } catch (error) {
        console.error("Error al eliminar el usuario: ", error);
    }
};

//*Se puebla la tabla con los nuevos datos
const populateTable = (registers, tbody) => {
    tbody.innerHTML = ``; //*Se limpia el contenido actual del tbody
    registers.forEach(register => {
        const tr = document.createElement('tr');
        tr.innerHTML = 
        `
            <td class="check-void-icon material-symbols-outlined" onclick="changeIcon(this)">check_box_outline_blank</td>
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

        //*Se agrega el listener al <tr> para redirigir excepto el ultimo <td> 
        tr.addEventListener('click', (event) => {
            if(!event.target.closest('.action') && !event.target.closest('.check-void-icon')){
                window.location.href = `./panel.html?id=${register.id}`;
            }
        });

        tbody.appendChild(tr);
    });

    tbody.addEventListener('click', function(event){
        if(event.target && event.target.matches('a.single-delete')){
            event.preventDefault();
            const id = event.target.getAttribute('data-id');
            deleteUser(id).then(() => {
                clearContainers();
                setupTabsWithContent(); //?Recarga de los datos para reflejar el cambio
            });
        }
    });
};

//*Función para crear y mostrar pestañas con registros
const setupTabsWithContent = async () => {
    const registers = await loadUserData(); //?Se obtienen los registros
    //*Distribución de registros entre las pestañas
    let tabRegistration = 10; //?Número de registros por pestaña
    let tabsNumber = Math.ceil(registers.length / tabRegistration); //?Número de pestañas
    console.log(tabsNumber);
    //*Crear pestañas y contenido
    for(let i=0; i<tabsNumber; i++){
        createTab(i+1); //?Los número de las pestañas empiezan en 1
        let tabContent = createTabContent(i, registers.slice(i * tabRegistration, (i + 1) * tabRegistration));
        document.querySelector('.tabs-content').appendChild(tabContent);
    }
    //?Asegurando que la primera pestaña sea la activa
    openTab(0);
};

function createTab(index){
    let tabsContainer = document.querySelector('.tabs');
    const tabButton = document.createElement('button');
    tabButton.classList.add('tab-button'); //?Se crea una clase al botón
    tabButton.textContent = `${index}`; //?Se coloca el contenido de texto al botón
    tabButton.dataset.tabIndex = index - 1;
    tabButton.addEventListener('click', function() {
        openTab(parseInt(this.dataset.tabIndex));
    });
    tabsContainer.appendChild(tabButton);
};

//*Controlamiento de apertura de las pestañas
const openTab = (tabIndex) => {
    let tabs = document.querySelectorAll('.tab-content');
    let buttons = document.querySelectorAll('.tab-button');

    //*Se ocultan todas las pestañas
    for(let i = 0; i < tabs.length; i++){
        console.log(tabs.length);
        tabs[i].style.display = 'none';
        buttons[i].classList.remove('active');
    }
    //*Se muestra la pestaña seleccionada
    tabs[tabIndex].style.display = 'block';
    buttons[tabIndex].classList.add('active');
};

//*Se crea el contenido para cada pestaña
function createTabContent(tabIndex, registers){
    let tabContent = document.createElement('div');
    tabContent.className = 'tab-content';
    tabContent.id = `Tab${tabIndex + 1}`;
    tabContent.style.display = tabIndex === 0 ? 'block' : 'none'; //?Se asegura de solo mostrar la primera pestaña
    //tabContent.style.visibility = 'hidden';
    //tabContent.style.position = "absolute";
    let table = createTable(registers);
    tabContent.appendChild(table);
    return tabContent;
};

//*Se crea el contenido de la tabla para cada pestaña
function createTable(registers){
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

//*Filtrar los registros mediante la barra de busqueda
export const handleSearch = async () => {
    const searchInput = document.getElementById('search-input'); //*Barra de busqueda (Input)
    const searchText = searchInput.value.toLowerCase().trim(); //*Texto ingregado en searchInput convertido a minusculas e ignorando espacios iniciales y finales
    if(!searchText){
        clearContainers();
        setupTabsWithContent(); //?Se recargan las pestañas originales si no existe texto de búsqueda
        return;
    }

    const allData = await loadUserData(); //?Se cargan todos los datos
    const filteredData = allData.filter(data => {
        return Object.values(data).some(value => value.toString().toLowerCase().includes(searchText));
    });

    if(filteredData.length > 0){
        displaySearchResults(filteredData);
    }else{
        noResults();
    }
};

//*Se muestran los resultados de la busqueda en una unica tabla
const displaySearchResults = (filteredData) => {
    const resultsContainer = document.querySelector('.tabs-content');
    resultsContainer.innerHTML = ``; //?Se limpia el contenido actual
    const table = createTable(filteredData);
    resultsContainer.appendChild(table);
};

//*Se limpia todo resultado de busqueda y se señala que no se han encontrado resultados
const clearContainers = () => {
    const resultsContainer = document.querySelector('.tabs-content');
    let tabsContainer = document.querySelector('.tabs');
    tabsContainer.innerHTML = ``;
    resultsContainer.innerHTML = ``;
};

const noResults = () => {
    const resultsContainer = document.querySelector('.tabs-content');
    let tabsContainer = document.querySelector('.tabs');
    tabsContainer.innerHTML = ``;
    resultsContainer.innerHTML = `<div class="lexend-semibold noresults-div">No se encontraron coicidencias</div>
                                  `;
}

const createPopUps = () => {
    //*Manejo de pop-ups con delegación de eventos
    document.addEventListener('click', function(e) {
        const currentPopup = e.target.matches('.actions') ? e.target.nextElementSibling : null;
        console.log("currentPopup: ", currentPopup);
        let activePopup = false;

        //*Se itera sobre todos los pop-up para controlar su visibilidad
        document.querySelectorAll('.pop-up').forEach(popup => {
            if(currentPopup === popup){
                const isVisible = popup.style.display === 'block'; //*false
                console.log("isVisible: ", isVisible);
                popup.style.display = isVisible ? 'none' : 'block';
                console.log("display: ", popup.style.display);
                if(!isVisible){
                    const popupWidth = popup.offsetWidth;
                    const popupHeight = popup.offsetHeight;
                    const windowWidth = window.innerWidth;
                    const windowHeight = window.innerHeight;

                    //?Se ajusta la posición horizontal
                    const left = e.pageX + popupWidth > windowWidth ? (windowWidth - popupWidth) : e.pageX;
                    popup.style.left = `${left}px`;
                    //?Se ajusta la posición vertical
                    const top = e.pageY + popupHeight > windowHeight ? (windowHeight - popupHeight) : e.pageY;
                    popup.style.top = `${top}px`;
                }
                activePopup = true;
            }else{
                popup.style.display = 'none';
            }
        });

        if(!currentPopup && !e.target.closest('.pop-up') && !activePopup){
            document.querySelectorAll('.pop-up').forEach(popup => {
                popup.style.display = 'none';
            })
        }
    });
};

const showFeedBack = (message, type) => {
    const modal = document.getElementById('feedback-modal');
    const feedBackMessage = document.getElementById('feedback-message');
    feedBackMessage.textContent = message;
    feedBackMessage.className = type;
    modal.style.display = 'block';

    setTimeout(() => {
        modal.style.display = 'none';
    }, 5000);
};

const enableDarkMode = (toggleButton, body, modalContents, confirmButtons, logoutBtn, logoutIconBtn) => {
    toggleButton.classList.add('dark-mode');
    body.classList.add('dark-mode');
    modalContents.forEach(modal => modal.classList.add('dark-mode'));
    confirmButtons.forEach(button => button.classList.add('dark-mode'));
    logoutBtn.classList.add('dark-mode');
    logoutIconBtn.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
};

const disableDarkMode = (toggleButton, body, modalContents, confirmButtons, logoutBtn, logoutIconBtn) => {
    toggleButton.classList.remove('dark-mode');
    body.classList.remove('dark-mode');
    modalContents.forEach(modal => modal.classList.remove('dark-mode'));
    confirmButtons.forEach(button => button.classList.remove('dark-mode'));
    logoutBtn.classList.remove('dark-mode');
    logoutIconBtn.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
};

//*Contenido de la tabla con apartado de pestañas
document.addEventListener("DOMContentLoaded", async () => {

    //*Barra de busqueda
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-icon');

    //?Evento click en el boton de busqueda
    searchButton.addEventListener('click', handleSearch);

    //?Evento keyup en el campo de entrada para detectar la tecla Enter
    searchInput.addEventListener('keyup', (e) => {
        if(e.key === "Enter"){
            handleSearch();
        }
    });

    //*Boton de eliminación para varios usuarios y modo oscuro
    const toggleButton = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const modalContents = document.querySelectorAll('.modal-content');
    const confirmButtons = document.querySelectorAll('.confirm-btn');
    const logoutBtn = document.querySelector('.logout-btn');
    const logoutIconBtn = document.querySelector('.logout-icon-btn');

    //*Se aplica el modo oscuro si está guardado en localStorage
    if(localStorage.getItem('darkMode') === 'enabled'){
        enableDarkMode(toggleButton, body, modalContents, confirmButtons, logoutBtn, logoutIconBtn);
    }

    //*Toggle para el Dark Mode
    toggleButton.addEventListener('click', () => {
        if(localStorage.getItem('darkMode') !== 'enabled'){
            enableDarkMode(toggleButton, body, modalContents, confirmButtons, logoutBtn, logoutIconBtn);
        }else{
            disableDarkMode(toggleButton, body, modalContents, confirmButtons, logoutBtn, logoutIconBtn);
        }
    });
    
    //*Modales de confirmación
    const deleteBtn = document.getElementById('delete-btn');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmYesBtn = document.getElementById('confirm-yes');
    const confirmNoBtn = document.getElementById('confirm-no');

    if(deleteBtn){
        deleteBtn.addEventListener('click', () => {
            //?Mostrar modal de confirmación
            confirmModal.style.display = 'block';
        });

        confirmYesBtn.addEventListener('click', () => {
            //?Borrar usuarios y ocultar modal
            deleteUsers();
            confirmModal.style.display = 'none';
        });

        confirmNoBtn.addEventListener('click', () => {
            //?Ocultar modal
            confirmModal.style.display = 'none';
        });
    }

    document.querySelector('.close-button').addEventListener('click', () => {
        const modal = document.getElementById('feedback-modal');
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        const modal = document.getElementById('feedback-modal');
        if(event.target === modal){
            modal.style.display = 'none';
        }
    });

    setupTabsWithContent();
    createPopUps();
});