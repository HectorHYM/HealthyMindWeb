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

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const registerId = urlParams.get('id');

    fillDetails(registerId);

    getNumberOfPublications(registerId).then(size => {
        const div = document.querySelector('.publications');
        div.textContent = `${size}`;
    }).catch(error => {
        console.error("Error al obtener el número de publicaciones", error);
    });

    getNumberOfPayments(registerId).then(size => {
        const div = document.querySelector('.appointments');
        div.textContent = `${size}`;
    }).catch(error => {
        console.error("Error al obtener el número de pagos", error);
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
    
});

//*LLenado de datos delos detalles de especialista
const fillDetails = async (registerId) => {
    if(registerId){
        try{
            const docRef = doc(db, 'users-especialista', registerId);
            const docSnap = await getDoc(docRef);

            if(docSnap.exists()){
                const data = docSnap.data();
                const profileImage = document.getElementById('img-perfil');
                profileImage.src = data.foto || 'N/A';
                document.querySelector('.detail-curp').textContent = registerId || 'N/A';
                document.querySelector('.detail-nombre').textContent = data.nombres || 'N/A';
                document.querySelector('.detail-apellido').textContent = data.apellido || 'N/A';
                document.querySelector('.detail-email').textContent = data.email || 'N/A';
                document.querySelector('.detail-especialidad').textContent = data.especialidad || 'N/A';
                document.querySelector('.detail-rfc').textContent = data.rfc || 'N/A';
                document.querySelector('.detail-telefono').textContent = data.telefono || 'N/A';
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


//*Número de publicaciones
const getNumberOfPublications = async (registerId) => {
    const publicationsRef = collection(db, 'users-especialista', registerId, 'publicaciones');
    const snapshot = await getDocs(publicationsRef);
    return snapshot.size; //?Se retorna el número de documentos de la colección
};

//*Número de pagos
const getNumberOfPayments = async (registerId) => {
    const publicationsRef = collection(db, 'users-especialista', registerId, 'pago');
    const snapshot = await getDocs(publicationsRef);
    return snapshot.size;
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

const showModal = async (dateId, registerId) => {
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
        stateCell.textContent = data.estado || 'N/A';
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
};

const closeModal = () => {
    const modal = document.getElementById('modal');
    modal.style.display = "none";
};