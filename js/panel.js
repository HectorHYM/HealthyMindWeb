import { getAuth, signOut, onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js'
import { getFirestore, doc, getDoc, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
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

const enableDarkMode = (backIconBtn, infoButton, theadDates, cells, scheduleTheads, modalContent) => {
    const body = document.body;
    body.classList.add('dark-mode');
    backIconBtn.classList.add('dark-mode');
    infoButton.classList.add('dark-mode');
    theadDates.classList.add('dark-mode');
    cells.forEach(cell => cell.classList.add('dark-mode'));
    modalContent.classList.add('dark-mode');
    scheduleTheads.forEach(thead => thead.classList.add('dark-mode'));
    localStorage.setItem('darkMode', 'enabled');
};

const disableDarkMode = (backIconBtn, infoButton, theadDates, cells, scheduleTheads, modalContent) => {
    const body = document.body;
    body.classList.remove('dark-mode');
    backIconBtn.classList.remove('dark-mode');
    infoButton.classList.remove('dark-mode');
    theadDates.classList.remove('dark-mode');
    cells.forEach(cell => cell.classList.remove('dark-mode'));
    modalContent.classList.remove('dark-mode');
    scheduleTheads.forEach(thead => thead.classList.remove('dark-mode'));
    localStorage.setItem('darkMode', 'disabled');
};

document.addEventListener("DOMContentLoaded", async () => {

    const urlParams = new URLSearchParams(window.location.search);
    const registerId = urlParams.get('id');
    fillDetails(registerId);

    //* Se muestra el modal de pagos al presionar su elemento
    document.querySelector('.icon-citas').addEventListener('click', () => {
        showPaymentsModal(registerId);
    });

    //* Se muestra el modal de los detalles del pago/cita previamente seleccionada
    document.getElementById('paymentsList').addEventListener('click', (e) => {
        if (e.target && e.target.matches('li.pay-element')) {
            const paymentId = e.target.getAttribute('data-id');
            showPaymentDetailsModal(paymentId);
        }
    });

    //*Barra de busqueda para las fechas
    setupSearch(registerId);

    if(registerId){
        try{
            const dates = await getScheduleDates(registerId);
            fillDatesTable(dates, registerId);
        }catch(error){
            console.error("Error al obtener las fechas de la agenda", error);
        }
    }else{
        console.error("No se ha proporcionado ningún id desde la URL");
    }

    document.querySelector('.close').addEventListener('click', closeModal);

    window.onclick = function(event){
        const modal = document.getElementById('modal');
        if(event.target == modal){
            modal.style.display = "none";
        }
    };

    document.getElementById('back-icon-btn').addEventListener('click', () => {
        window.history.back();
    });

    //*Elementos para el dark mode
    const backIconBtn = document.querySelector('.back-icon-btn');
    const infoButton = document.querySelector('.info-button');
    const theadDates = document.querySelector('.thead-dates');
    const cells = document.querySelectorAll('.date-cell');
    const modalContent = document.querySelector('.modal-content');
    const scheduleTheads = document.querySelectorAll('.schedule-thead');

    //*Se aplica el modo oscuro si está guardado en localStorage
    if(localStorage.getItem('darkMode') === 'enabled'){
        enableDarkMode(backIconBtn, infoButton, theadDates, cells, scheduleTheads, modalContent);
    }else{
        disableDarkMode(backIconBtn, infoButton, theadDates, cells, scheduleTheads, modalContent);
    }
    
});

//* Controlador para la barra de busqueda
const setupSearch = (registerId) => {
    const searchInput = document.querySelector('.search-input');
    //const searchButton = document.querySelector('.search-icon');
    //searchButton.addEventListener('click', handleSearch);
    searchInput.addEventListener('keyup', (e) => {
        if(e.key === "Enter"){
            handleSearch(registerId);
        }
    });
};


//* Logica para la busqueda de fechas
const handleSearch = async (registerId) => {
    const searchInput = document.getElementById('search-input');
    const searchText = searchInput.value.toLowerCase().trim();
    if(!searchText){
        clearContainers();
        setupTabsWithContent(registerId);
        return; //?Detenemos la ejecución de la función debido a que no hay texto que buscar
    }

    const allData = await getScheduleDates(registerId);
    console.log(allData);
    const dateFormat = allData.map(data => comparisonDateFormat(data));
    console.log(dateFormat);
    const filteredData = dateFormat.filter(data => { //?Filtrado de datos para la busqueda de usuarios
        return data.toLowerCase().includes(searchText.toLowerCase()); //?Regresa los datos que cumplan con las condiciones impuestas
    });
    console.log(filteredData);

    if(filteredData.length > 0){
        displaySearchResults(filteredData, registerId);
    }else{
        noResults();
    }
};

const comparisonDateFormat = (dateId) => {
    const normalizedDateId = dateId.padStart(8, '0');
    const formattedDate = formatDate(normalizedDateId);
    return formattedDate;
}


//*Función para limpiar los contenedores
const clearContainers = () => {
    const contentContainer = document.getElementById('dates-body');
    //let tabsContainer = document.querySelector('.tabs');
    contentContainer.innerHTML = ``;
    //tabsContainer.innerHTML = ``; 
};

//*Función para colocar las pestañas y el contenido principal de estas
export const setupTabsWithContent = async (registerId) => {
    const dates = await getScheduleDates(registerId);
    fillDatesTable(dates, registerId);
};

//*Muestra los resultados de la busqueda de usuarios
const displaySearchResults = (filteredData, registerId) => {
    //*Se llena la tabla con las fechas
    const tableBody = document.querySelector('#dates-table tbody');
    clearContainers();
    filteredData.forEach(dateId => {
        console.log(dateId);
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.className = 'date-cell'; 
        cell.textContent = dateId;
        cell.classList.add('lexend-regular');
        row.appendChild(cell);
        const originalId = formatDateReverse(dateId);
        row.addEventListener('click', () => showModal(originalId, registerId));
        tableBody.appendChild(row);
    });
};

//* Función para convertir String a formato "16092024"
const formatDateReverse = (dateString) => {
    const parts = dateString.match(/(\d{2}) de (\w+) del año (\d{4})/);
    
    const meses = {
        enero: '01',
        febrero: '02',
        marzo: '03',
        abril: '04',
        mayo: '05',
        junio: '06',
        julio: '07',
        agosto: '08',
        septiembre: '09',
        octubre: '10',
        noviembre: '11',
        diciembre: '12'
    };

    const day = parts[1]; // Día
    const month = meses[parts[2].toLowerCase()]; // Mes en número
    const year = parts[3]; // Año

    // Retorna la fecha en formato "DDMMYYYY"
    return `${day}${month}${year}`;
};

//*Se manda un mensaje de falta de coincidencias en caso de no haber un dato con la busqueda ingresada
const noResults = () => {
    const contentContainer = document.getElementById('dates-body');
    //let tabsContainer = document.querySelector('.tabs');
    contentContainer.innerHTML = `<div class="lexend-semibold noresults-div">No se encontraron coincidencias</div>`;
    //tabsContainer.innerHTML = ``;
};

//*LLenado de datos de los detalles de especialista
const fillDetails = async (registerId) => {
    if(registerId){
        try{
            const docRef = doc(db, 'users-especialista', registerId);
            const docSnap = await getDoc(docRef);

            if(docSnap.exists()){
                const data = docSnap.data();
                const profileImage = document.getElementById('img-perfil');
                profileImage.src = data.foto_personal || '../assets/img/logo.png';

                document.querySelector('.detail-curp').textContent = registerId || 'N/A';
                document.querySelector('.detail-nombre').textContent = data.nombres || 'N/A';
                document.querySelector('.detail-apellido').textContent = data.apellido_p + " " + data.apellido_m || 'N/A';
                document.querySelector('.detail-email').textContent = data.email || 'N/A';
                document.querySelector('.detail-especialidad').textContent = data.especialidad || 'N/A';
                document.querySelector('.detail-especialidad1').textContent = data.metodos[0] || 'N/A';
                document.querySelector('.detail-especialidad2').textContent = data.metodos[1] || 'N/A';
                document.querySelector('.detail-rfc').textContent = data.rfc || 'N/A';
                document.querySelector('.detail-cedula').textContent = data.cedula || 'N/A';
                document.querySelector('.detail-telefono').textContent = data.telefono || 'N/A';
                document.querySelector('.detail-fechanac').textContent = data.fechanac || 'N/A';
                document.querySelector('.detail-formacion').textContent = data.formacion[0] || 'N/A';
                document.querySelector('.detail-formacion1').textContent = data.formacion[3] || 'N/A';
                document.querySelector('.detail-idioma').textContent = data.idiomas[0] || 'N/A';
                document.querySelector('.detail-idioma1').textContent = data.idiomas[1] || 'N/A';

                //* Elementos y lógica para el botón y el modal de información
                const infoButton = document.getElementById('info-button');
                const modal = document.getElementById('modal');
                const modalTitle = document.getElementById('modal-title');
                const modalInfo = document.getElementById('modal-info');
                const modalTable = document.getElementById('modal-table');
                const paymentsModal = document.getElementById('paymentsModal');
                const paymentsDetailsModal = document.getElementById('paymentDetailsModal');
                const modalInfoContent = document.getElementById('modal-info-content');

                //*Evento de boton de información
                infoButton.addEventListener('click', () => {
                    modalTitle.textContent = 'Información'; //? Se cambia el titulo del modal si es necesario
                    modalInfoContent.textContent = data.informacion || "No hay información disponible";
                    modalInfo.style.display = 'block';
                    modalTable.style.display = 'none';
                    paymentsModal.style.display = 'none';
                    paymentsDetailsModal.style.display = 'none';
                    modal.style.display = 'block'; 
                });

            }else{
                console.error("No se encontro registro con ese ID");
            }
        }catch(error){
            console.error("Error al obtener el documento", error);
        }
    }else{
        console.error("No se proporciono el ID desde la URL");
    }
};

//* Función para obtener la lista de los pagos (citas realizadas)
const getPayments = async (registerId) => {
    const paymentsRef = collection(db, 'transacciones');
    const querySnapshot = await getDocs(paymentsRef); //? Se obtienen los documentos de transacciones

    const paymentsList = [];
    querySnapshot.forEach((doc) => {
        const specialistId = doc.data().id_especialista;
        if(specialistId === registerId){
            paymentsList.push({
                ...doc.data(),
                docId: doc.id
            });
        }
    });

    return paymentsList;
};

//* Función para abrir el modal y llenar la lista de los pagos realizados
const showPaymentsModal = async (registerId) => {
    const paymentsModal = document.getElementById('paymentsModal');
    const paymentsDetailsModal = document.getElementById('paymentDetailsModal');
    const modalTitle = document.getElementById('modal-title');
    const paymentsList = document.getElementById('paymentsList');
    const modalInfo = document.getElementById('modal-info');
    const modalTable = document.getElementById('modal-table');
    
    //* Se obtiene la lista de los pagos referentes al especialista actual
    const payments = await getPayments(registerId);
    
    //* Se llena la lista en el modal y se ocultan los modales no utilizados
    paymentsList.innerHTML = payments.map(pay => {
        const formattedDate = formatDateString(pay.fecha_cita);
        return `<li class="lexend-regular pay-element" data-id="${pay.docId}">${formattedDate}</li>`;
    }).join('');

    modal.style.display = 'block';
    paymentsModal.style.display = 'block';
    paymentsDetailsModal.style.display = 'none';
    modalInfo.style.display = 'none';
    modalTable.style.display = 'none';
    modalTitle.textContent = 'Lista de citas realizadas'; //? Se cambia el titulo del modal si es necesario
};

//* Función para abrir el modal con los detalles del pago/cita
const showPaymentDetailsModal = async (paymentId) => {
    const paymentsModal = document.getElementById('paymentsModal');
    const paymentsDetailsModal = document.getElementById('paymentDetailsModal');
    const modalInfo = document.getElementById('modal-info');
    const modalTable = document.getElementById('modal-table');

    const titleElement = document.getElementById('modal-title');

    const dateText = document.getElementById('date-text');
    const payStateText = document.getElementById('pay-state-text');
    const payDateText = document.getElementById('pay-date-text');
    const scheduleText = document.getElementById('schedule-text');
    const namePacientText = document.getElementById('name-pacient-text');
    const meetCodeText = document.getElementById('meet-code-text');
    const totalPaymentText = document.getElementById('total-payment-text');

    paymentsModal.style.display = 'none';
    paymentsDetailsModal.style.display = 'block';
    modalInfo.style.display = 'none';
    modalTable.style.display = 'none';

    //* Se obtiene el pago/cita seleccionada
    const paymentRef = doc(db, 'transacciones', paymentId);
    const paymentDoc = await getDoc(paymentRef);
    const payment = paymentDoc.data();

    //* Se actualiza el contenido del modal con los datos del pago/cita
    titleElement.textContent = "Detalles de cita";

    dateText.textContent = payment.fecha_cita;
    payStateText.textContent = payment.estado_pago;
    payDateText.textContent = payment.pago_cita;
    scheduleText.textContent = payment.horario_cita;

    const pacientRef = doc(db, 'users-paciente', payment.id_paciente);
    const pacientDoc = await getDoc(pacientRef);
    const pacient = pacientDoc.data();
    namePacientText.textContent = pacient.nombres + " " + pacient.apellidos; //? Accedemos a la colección de los pacientes para obtener el nombre

    meetCodeText.textContent = payment.id_meet;
    totalPaymentText.textContent = payment.total;
};

//*Se obtienen las fechas de la agenda
const getScheduleDates = async (registerId) => {
    const scheduleRef = collection(db, 'users-especialista', registerId, 'agenda');
    const snapshot = await getDocs(scheduleRef);
    const dates = snapshot.docs.map(doc => doc.id);
    return dates;
};

//*Se llena la tabla con las fechas
const fillDatesTable = (dates, registerId) => {
    const tableBody = document.querySelector('#dates-table tbody');
    dates.forEach(dateId => {
        const normalizedDateId = dateId.padStart(8, '0');
        const formattedDate = formatDate(normalizedDateId);
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.className = 'date-cell'; 
        cell.textContent = formattedDate;
        cell.classList.add('lexend-regular');
        row.appendChild(cell);
        row.addEventListener('click', () => showModal(dateId, registerId));
        tableBody.appendChild(row);
    });
};

//*Se convierte el id de las fechas a un formato legible
const formatDate = (dateId) => {
    const day = dateId.slice(0, -6);
    const month = dateId.slice(-6, -4);
    const year = dateId.slice(-4);

    const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
    "septiembre", "octubre", "noviembre", "diciembre"];
    
    const monthName = monthNames[parseInt(month, 10) -1];

    return `Día ${day} de ${monthName} del año ${year}`;
};

const formatDateString = (dateString) => {
    const [day, month, year] = dateString.split('/'); //? Separa la fecha por "/"

    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    const formattedDate = `Día ${day} de ${months[parseInt(month) - 1]} del año ${year}`;
    
    return formattedDate;
};

//* Se muestra el modal con la tabla de horarios y se muestran los datos
const showModal = async (dateId, registerId) => {
    document.getElementById('modal-info').style.display = 'none'; //? Ocultar modal de información
    document.getElementById('paymentsModal').style.display = 'none'; //? Ocultar modal de lista de pagos
    document.getElementById('paymentDetailsModal').style.display = 'none'; //? Ocultar modal de detalles de pagos/citas
    document.getElementById('modal-title').textContent = 'Horarios'; //? Cambia el título al de horarios
    document.getElementById('modal-table').style.display = 'table'; //? Mostrar modal de la tabla
    document.getElementById('modal').style.display = 'block';

    const modal = document.getElementById('modal');
    const modalTableBody = document.querySelector('#modal-table tbody');
    modalTableBody.innerHTML = ``;
    const horariosRef = collection(db, 'users-especialista', registerId, 'agenda', dateId, 'horarios');
    const snapshot = await getDocs(horariosRef);

    snapshot.forEach(doc => {
        const data = doc.data();
        const row = document.createElement('tr');
        row.className = 'schedule-row';
        const stateCell = document.createElement('td');
        stateCell.className = 'data-schedule-cell';
        stateCell.classList.add('lexend-regular');
        stateCell.textContent = data.estado || 'No disponible';
        const startTimeCell = document.createElement('td');
        startTimeCell.className = 'data-schedule-cell';
        startTimeCell.classList.add('lexend-regular');
        startTimeCell.textContent = data.hora_inicial || 'N/A'; 
        const finalTimeCell = document.createElement('td');
        finalTimeCell.className = 'data-schedule-cell';
        finalTimeCell.classList.add('lexend-regular');
        finalTimeCell.textContent = data.hora_final || 'N/A'; 

        row.appendChild(stateCell);
        row.appendChild(startTimeCell);
        row.appendChild(finalTimeCell);
        modalTableBody.appendChild(row);
    });
    modal.style.display = 'block';

    const dataScheduleCells = document.querySelectorAll('.data-schedule-cell');
    if (localStorage.getItem('darkMode') === 'enabled') {
        dataScheduleCells.forEach(cell => cell.classList.add('dark-mode'));
    } else {
        dataScheduleCells.forEach(cell => cell.classList.remove('dark-mode'));
    }
};

const closeModal = () => {
    const modal = document.getElementById('modal');
    modal.style.display = "none";
};