import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js'
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

const enableDarkMode = (publicationsTxt, appointmentsTxt, backIconBtn, moreInfo, infoButton, theadDates, cells, scheduleTheads, modalContent) => {
    const body = document.body;
    body.classList.add('dark-mode');
    publicationsTxt.classList.add('dark-mode');
    appointmentsTxt.classList.add('dark-mode');
    backIconBtn.classList.add('dark-mode');
    moreInfo.classList.add('dark-mode');
    infoButton.classList.add('dark-mode');
    theadDates.classList.add('dark-mode');
    cells.forEach(cell => cell.classList.add('dark-mode'));
    modalContent.classList.add('dark-mode');
    scheduleTheads.forEach(thead => thead.classList.add('dark-mode'));
    localStorage.setItem('darkMode', 'enabled');
};

const disableDarkMode = (publicationsTxt, appointmentsTxt, backIconBtn, moreInfo, infoButton, theadDates, cells, scheduleTheads, modalContent) => {
    const body = document.body;
    body.classList.remove('dark-mode');
    publicationsTxt.classList.remove('dark-mode');
    appointmentsTxt.classList.remove('dark-mode');
    backIconBtn.classList.remove('dark-mode');
    moreInfo.classList.remove('dark-mode');
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

    //* Se obtiene el número de publicaciones y se coloca en el div correspondiente
    getNumberOfPublications(registerId).then(size => {
        const div = document.querySelector('.publications');
        div.textContent = `${size}`;
    }).catch(error => {
        console.error("Error al obtener el número de publicaciones", error);
    });

    //* Se muestra el modal de la lista de publicaciones al presionar su elemento
    document.querySelector('.publications-txt').addEventListener('click', () => {
        showPublicationsModal(registerId);
    });

    //* Se muestra el modal de los detalles de la publicación previamente seleccionada
    document.getElementById('publicationsList').addEventListener('click', (e) => {
        if (e.target && e.target.matches('li.pub-element')) {
            const publicationId = e.target.getAttribute('data-id');
            showPublicationDetailsModal(registerId, publicationId);
        }
    });

    //* Se obtiene el número de pagos (citas realizadas) y se coloca en el div correspondiente
    getNumberOfPayments(registerId).then(size => {
        const div = document.querySelector('.appointments');
        div.textContent = `${size}`;
    }).catch(error => {
        console.error("Error al obtener el número de pagos", error);
    });

    //* Se muestra el modal de pagos al presionar su elemento
    document.querySelector('.appointments-txt').addEventListener('click', () => {
        showPaymentsModal(registerId);
    });

    //* Se muestra el modal de los detalles del pago/cita previamente seleccionada
    document.getElementById('paymentsList').addEventListener('click', (e) => {
        if (e.target && e.target.matches('li.pay-element')) {
            const paymentId = e.target.getAttribute('data-id');
            showPaymentDetailsModal(paymentId);
        }
    });

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
    const publicationsTxt = document.querySelector('.publications-txt');
    const appointmentsTxt = document.querySelector('.appointments-txt');
    const backIconBtn = document.querySelector('.back-icon-btn');
    const moreInfo = document.querySelector('.more-info');
    const infoButton = document.querySelector('.info-button');
    const theadDates = document.querySelector('.thead-dates');
    const cells = document.querySelectorAll('.date-cell');
    const modalContent = document.querySelector('.modal-content');
    const scheduleTheads = document.querySelectorAll('.schedule-thead');

    //*Se aplica el modo oscuro si está guardado en localStorage
    if(localStorage.getItem('darkMode') === 'enabled'){
        enableDarkMode(publicationsTxt, appointmentsTxt, backIconBtn, moreInfo, infoButton, theadDates, cells, scheduleTheads, modalContent);
    }else{
        disableDarkMode(publicationsTxt, appointmentsTxt, backIconBtn, moreInfo, infoButton, theadDates, cells, scheduleTheads, modalContent);
    }
    
});

//*LLenado de datos de los detalles de especialista
const fillDetails = async (registerId) => {
    if(registerId){
        try{
            const docRef = doc(db, 'users-especialista', registerId);
            const docSnap = await getDoc(docRef);

            if(docSnap.exists()){
                const data = docSnap.data();
                const profileImage = document.getElementById('img-perfil');
                profileImage.src = data.foto || '../assets/img/logo.png';

                document.querySelector('.detail-curp').textContent = registerId || 'N/A';
                document.querySelector('.detail-nombre').textContent = data.nombres || 'N/A';
                document.querySelector('.detail-apellido').textContent = data.apellido || 'N/A';
                document.querySelector('.detail-email').textContent = data.email || 'N/A';
                document.querySelector('.detail-especialidad').textContent = data.especialidad || 'N/A';
                document.querySelector('.detail-rfc').textContent = data.rfc || 'N/A';
                document.querySelector('.detail-telefono').textContent = data.telefono || 'N/A';

                //* Elementos y lógica para el botón y el modal de información
                const infoButton = document.getElementById('info-button');
                const modal = document.getElementById('modal');
                const modalTitle = document.getElementById('modal-title');
                const modalInfo = document.getElementById('modal-info');
                const modalTable = document.getElementById('modal-table');
                const publicationsModal = document.getElementById('publicationsModal');
                const publicationsDetailsModal = document.getElementById('publicationDetailsModal');
                const paymentsModal = document.getElementById('paymentsModal');
                const paymentsDetailsModal = document.getElementById('paymentDetailsModal');
                const modalInfoContent = document.getElementById('modal-info-content');

                //*Evento de boton de información
                infoButton.addEventListener('click', () => {
                    modalTitle.textContent = 'Información'; //? Se cambia el titulo del modal si es necesario
                    modalInfoContent.textContent = data.informacion || "No hay información disponible";
                    modalInfo.style.display = 'block';
                    modalTable.style.display = 'none';
                    publicationsModal.style.display = 'none';
                    publicationsDetailsModal.style.display = 'none';
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

//*Lógica para obtener el número total de publicaciones
const getNumberOfPublications = async (registerId) => {
    const publicationsRef = collection(db, 'users-especialista', registerId, 'publicaciones');
    const snapshot = await getDocs(publicationsRef);
    return snapshot.size; //?Se retorna el número de documentos de la colección
};

//* Función para obtener la lista las publicaciones
const getPublications = async (registerId) => {
    const publicationsRef = collection(db, 'users-especialista', registerId, 'publicaciones');
    const snapshot = await getDocs(publicationsRef);
    return snapshot.docs.map(doc => ({
        ...doc.data(),
        docId: doc.id
    })); //? Se hace un mapeo de todas las publicaciones
};

//* Función para abrir el modal y llenar la lista de publicaciones
const showPublicationsModal = async (registerId) => {
    const publicationsModal = document.getElementById('publicationsModal');
    const paymentsModal = document.getElementById('paymentsModal');
    const paymentsDetailsModal = document.getElementById('paymentDetailsModal');
    const modalTitle = document.getElementById('modal-title');
    const publicationsList = document.getElementById('publicationsList');
    const modalInfo = document.getElementById('modal-info');
    const modalTable = document.getElementById('modal-table');
    const publicationsDetailsModal = document.getElementById('publicationDetailsModal');
    
    //* Se obtiene la lista de las publicaciones
    const publications = await getPublications(registerId);
    
    //* Se llena la lista en el modal y se ocultan los modales no utilizados
    publicationsList.innerHTML = publications.map(pub => `<li class="lexend-regular pub-element" data-id="${pub.docId}">${pub.titulo}</li>`).join('');
    modal.style.display = 'block';
    modalInfo.style.display = 'none';
    modalTable.style.display = 'none';
    publicationsDetailsModal.style.display = 'none';
    publicationsModal.style.display = 'block';
    paymentsModal.style.display = 'none';
    paymentsDetailsModal.style.display = 'none';
    modalTitle.textContent = 'Lista de publicaciones'; //? Se cambia el titulo del modal si es necesario
};

//* Función para abrir el modal con los detalles de la publicación
const showPublicationDetailsModal = async (registerId, publicationId) => {
    console.log('registerId:', registerId);
    console.log('publicationId:', publicationId);
    const publicationsDetailsModal = document.getElementById('publicationDetailsModal');
    const publicationsModal = document.getElementById('publicationsModal');
    const paymentsModal = document.getElementById('paymentsModal');
    const paymentsDetailsModal = document.getElementById('paymentDetailsModal');
    const modalInfo = document.getElementById('modal-info');
    const modalTable = document.getElementById('modal-table');
    const titleElement = document.getElementById('modal-title');
    const imageElement = document.getElementById('modalImage');
    const textElement = document.getElementById('modalText');

    publicationsDetailsModal.style.display = 'block';
    publicationsModal.style.display = 'none';
    paymentsModal.style.display = 'none';
    paymentsDetailsModal.style.display = 'none';
    modalInfo.style.display = 'none';
    modalTable.style.display = 'none';

    //* Se obtiene la publicación seleccionada
    const publicationRef = doc(db, 'users-especialista', registerId, 'publicaciones', publicationId);
    const publicationDoc = await getDoc(publicationRef);
    const publication = publicationDoc.data();

    //* Se actualiza el contenido del modal con los datos de la publicación
    titleElement.textContent = publication.titulo;
    imageElement.src = publication.imagen;
    textElement.textContent = publication.texto;
};

//*Lógica para obtener el número de pagos (citas realizadas)
const getNumberOfPayments = async (registerId) => {
    try{
        const paymentsRef = collection(db, 'transacciones');
        const querySnapshot = await getDocs(paymentsRef); //? Se obtienen los documentos de transacciones

        let size = 0; //? Contador para contar el número de citas realizadas por el especialista correspondiente

        querySnapshot.forEach((doc) => {
            const specialistId = doc.data().id_especialista;
            //? Si el campo id_especialista coincide con el id del especialista correspondiente se añade al contador
            if(specialistId === registerId){
                size++;
            }
        });
    return size;
    }catch(error){
        console.error("Error al obtener los documentos: ", error);
        return 0;
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
    const publicationsModal = document.getElementById('publicationsModal');
    const modalTitle = document.getElementById('modal-title');
    const paymentsList = document.getElementById('paymentsList');
    const modalInfo = document.getElementById('modal-info');
    const modalTable = document.getElementById('modal-table');
    const publicationsDetailsModal = document.getElementById('publicationDetailsModal');
    
    //* Se obtiene la lista de los pagos referentes al especialista actual
    const payments = await getPayments(registerId);
    
    //* Se llena la lista en el modal y se ocultan los modales no utilizados
    paymentsList.innerHTML = payments.map(pay => `<li class="lexend-regular pay-element" data-id="${pay.docId}">${pay.fecha_cita}</li>`).join('');
    modal.style.display = 'block';
    paymentsModal.style.display = 'block';
    paymentsDetailsModal.style.display = 'none';
    modalInfo.style.display = 'none';
    modalTable.style.display = 'none';
    publicationsDetailsModal.style.display = 'none';
    publicationsModal.style.display = 'none';
    modalTitle.textContent = 'Lista de citas realizadas'; //? Se cambia el titulo del modal si es necesario
};

//* Función para abrir el modal con los detalles del pago/cita
const showPaymentDetailsModal = async (paymentId) => {
    const publicationsDetailsModal = document.getElementById('publicationDetailsModal');
    const publicationsModal = document.getElementById('publicationsModal');
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

    publicationsDetailsModal.style.display = 'none';
    publicationsModal.style.display = 'none';
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

//* Se muestra el modal con la tabla de horarios y se muestran los datos
const showModal = async (dateId, registerId) => {
    document.getElementById('modal-info').style.display = 'none'; //? Ocultar modal de información
    document.getElementById('publicationsModal').style.display = 'none'; //? Ocultar modal de publicaciones
    document.getElementById('publicationDetailsModal').style.display = 'none' //? Ocultar modal de detalles de publicaciones
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