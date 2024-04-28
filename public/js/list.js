import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js'
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
}

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
}

//*Función para obtener los registros de la base de datos
const loadUserData = async ()  => {
    try {
        const querySnapshot = await getDocs(collection(db, 'prueba'));
        const registers = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            data.id = doc.id;
            registers.push(data);
        });
        return registers;
    } catch (error){
        console.error("Error al obtener los datos de los docummentos", error);
        return [];
    }
};

//*Filtrar los registros mediante la barra de busqueda
export const handleSearch = () => {
    const searchInput = document.getElementById('search-input');
    const searchText = searchInput.value.toLowerCase().trim();
    const tables = document.querySelectorAll('.specialist-table');

    tables.forEach(table => {
        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            console.log("Busqueda realizada con:", searchText);
            row.style.display = text.includes(searchText) ? '' : 'none';
        })
    })
}

//*Eliminar los registros seleccionados
export const deleteUsers = async () => {
    //*Se obtienen los indices de las filas seleccionadas
    const selectedRows = getSelectedRows();
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
    reloadTable(); //*Recarga de los datos para reflejar el cambio
}

//*Se obtienen las filas seleccionadas (Las que cuentan con casilla marcada)
const getSelectedRows = () => {
    const rows = document.querySelectorAll('table tbody tr');
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
}

const getIdUser = async (index) => {
    try{
        const users = await loadUserData();
        return users[index];
    } catch (error){
        console.error("Error al obtener el id del usuario", error);
        return null;
    }
}

const deleteUser = async (id) => {
    try{
        await deleteDoc(doc(db, "prueba", id));
        console.log("Usuario(s) eliminado(s) correctamente");
    } catch (error) {
        console.error("Error al eliminar el usuario: ", error);
    }
}

//*Recarga y limpieza de tabla al actualizar los registros
const reloadTable = async () => {
    const tbody = document.querySelector('table tbody');
    tbody.innerHTML = ``; //*Se limpia el contenido actual del tbody
    try{
        const registers = await loadUserData();
        populateTable(tbody, registers);
    } catch (error){
        console.log("Error al recargar los datos de la tabla", error);
    }
}

//*Se puebla la tabla con los nuevos datos
const populateTable = (tbody, registers) => {
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
                    <a href="#">Detalles</a>
                    <a href="#">Editar</a>
                    <a href="#">Eliminar</a>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

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

    //*Boton de eliminación para varios usuarios
    const deleteBtn = document.getElementById('delete-btn');
    if(deleteBtn){
        deleteBtn.addEventListener('click', deleteUsers);
    }

    //*Contenedores
    let tabsContainer = document.querySelector('.tabs');
    let contentContainer = document.querySelector('.tabs-content');

    if(!tabsContainer || !contentContainer){
        console.error('Contenedores de pestañas no encontrados');
    }

    //*Se obtienen los registros desde la base de datos y se agregan a un array
    const registers = await loadUserData();
    console.log(registers);

    //*Distribución de registros entre las pestañas
    let tabRegistration = 10; //*Número de registros por pestaña
    let tabsNumber = Math.ceil(registers.length / tabRegistration);

    for(let i=0; i<tabsNumber; i++){
        console.log(i);
        //*Creación de pestañas
        let tabButton = document.createElement('button'); //?Se crea un botón por cada iteración
        tabButton.classList.add('tab-button'); //?Se crea una clase al botón
        tabButton.textContent = `${i + 1}`; //?Se coloca el contenido de texto al botón
        tabButton.onclick = () => { openTab(i); };
        tabsContainer.appendChild(tabButton);

        //*Creación y añadimiento del contenido de las pestañas
        let tabContent = document.createElement('div'); //?Se crea un div
        tabContent.classList.add('tab-content'); //?Se crea una clase para el div
        tabContent.id = `Tab${ i + 1 }`; //?Se asigna un id junto a un Template Literal
        if(i > 0) tabContent.style.display = 'none'; //?Se asegura que solo la primera pestaña sea mostrada inicialmente
        
        //*Creación de la tabla como parte del contenido
        let table = document.createElement('table'); //?Se crea una tabla
        table.classList.add('specialist-table'); //?Se le asigna una clase
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
        `; //?Se agrega el contenido de la tabla (Cabecera y contenedor del cuerpo) para cada pestaña
        tabContent.appendChild(table);

        let tbody = table.querySelector('tbody');
        //*Se añaden las filas con los registros dentro del tbody
        for(let j = i*tabRegistration; j < Math.min((i+1) * tabRegistration, registers.length); j++){
            let tr = document.createElement('tr');
            tr.innerHTML = 
            `
                <td class="check-void-icon material-symbols-outlined" onclick="changeIcon(this)">check_box_outline_blank</td>
                <td>${registers[j].nombres}</td>
                <td>${registers[j].apellido}</td>
                <td>${registers[j].email}</td>
                <td>${registers[j].especialidad}</td>
                <td>${registers[j].telefono}</td>
                <td>${registers[j].rfc}</td>
                <td class="action">
                    <span class="actions">...</span>
                    <div class="pop-up lexend-medium">
                        <a href="#">Detalles</a>
                        <a href="#">Editar</a>
                        <a href="#">Eliminar</a>
                    </div>
                </td>
            `;
            tbody.appendChild(tr);
        }
        contentContainer.appendChild(tabContent);
    }

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

    //*Controlamiento de apertura de las pestañas
    window.openTab = async (tabIndex) => {
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
    }
    //*Se activa solo la primera pestaña
    if(tabsNumber > 0){
        tabsContainer.firstChild.click();
    }
});