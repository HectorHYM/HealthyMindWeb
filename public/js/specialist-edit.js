import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js'
import { getFirestore, doc, getDoc, updateDoc, setDoc, collection } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { app } from './firebase-config.js';

const auth = getAuth(app);
const db = getFirestore(app);

//*Boton de regreso a tabla de administración
document.getElementById('logout-icon-btn').addEventListener('click', () => {
    window.location.href = "./list.html";
});

//*Cerrar el modal cuando se hace clic en el botón de cierre
document.querySelectorAll('.close-button').forEach(button => {
    button.addEventListener('click', () => {
        button.parentElement.parentElement.style.display = 'none';
    });
});

//*Cerrar el modal cuando se hace clic fuera de él
window.addEventListener('click', (event) => {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
});

const enableDarkMode = () => {
    const body = document.body;
    const modalContents = document.querySelectorAll('.modal-content');
    const confirmButtons = document.querySelectorAll('.confirm-btn');
    const regForm = document.querySelector('.regSpecialistForm');
    body.classList.add('dark-mode');
    modalContents.forEach(modal => modal.classList.add('dark-mode'));
    confirmButtons.forEach(button => button.classList.add('dark-mode'));
    regForm.classList.add('dark-mode');
    localStorage.setItem('darkMode', 'enabled');
};

const disableDarkMode = () => {
    const body = document.body;
    const modalContents = document.querySelectorAll('.modal-content');
    const confirmButtons = document.querySelectorAll('.confirm-btn');
    const regForm = document.querySelector('.regSpecialistForm');
    body.classList.remove('dark-mode');
    modalContents.forEach(modal => modal.classList.remove('dark-mode'));
    confirmButtons.forEach(button => button.classList.remove('dark-mode'));
    regForm.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
};

//*Se aplica el modo oscuro si está guardado en localStorage
if(localStorage.getItem('darkMode') === 'enabled'){
    enableDarkMode();
}else{
    disableDarkMode();
}

document.addEventListener("DOMContentLoaded", function() {
    //*Se crea un objeto URLSearchParams para manejar los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    //*Se obtiene el parametro del id de la URL
    const registerId = urlParams.get('id');

    if(registerId){
        //*Accede a firestore para obtener el documento del id correspondiente
        const docRef = doc(db, 'users-especialista', registerId);
        getDoc(docRef).then(docSnap => {
            if(docSnap.exists()){
                const data = docSnap.data();
                const form = document.getElementById('regSpecialistForm');
                ['nombres', 'apellido', 'email', 'especialidad', 'rfc', 'telefono'].forEach(field => {
                    if (data[field] !== undefined) {
                        form[field].value = data[field];
                        form['curp'].value = registerId;
                    } else {
                        console.error('No existe el campo: ' + field);
                    }
                });
            }else{
                console.error("No se encontro documento");
            }
        }).catch(error => {
            console.error("Error al obtener documento", error);
        });
    }else{
        console.error("No se proporciono el id en la URL.");
    }

    document.getElementById('regSpecialistForm').addEventListener('submit', event => {
        event.preventDefault(); //?Previene el envío del formulario
        const names = document.getElementById('nombres').value;
        const lastnames = document.getElementById('apellido').value;
        const email = document.getElementById('email').value;
        const specialty = document.getElementById('especialidad').value;
        const birthdate = document.getElementById('birthdateField').value;
        const rfc = document.getElementById('rfc').value;
        const phonenumber = document.getElementById('telefono').value;
        const curp = document.getElementById('curp').value;
        showConfirm('Esta seguro de que desea editar este registro?', (confirmed) => {
            if(confirmed){
                editSpecialist(registerId, names, lastnames, email, specialty, birthdate, rfc, phonenumber);
            }
        });
    });
});

const editSpecialist = (registerId, names, lastnames, email, specialty, birthdate, rfc, phonenumber) => {
    const docRef = doc(db, 'prueba', registerId);
    updateDoc(docRef, {
        nombres: names,
        apellido: lastnames,
        email: email,
        especialidad: specialty,
        fechanac: birthdate,
        rfc: rfc,
        telefono: phonenumber
    }).then(() => {
        console.log("Usuario editado con éxito!");
        showFeedback("Usuario editado con éxito", 'success');
    }).catch((error) => {
        console.error("Error al actualizar el usuario: ", error);
        showFeedback("Error al actualizar el usuario: " + error.message, 'error');
    });
};

//*Mostrar el modal de feedback
const showFeedback = (message, type) => {
    const modal = document.getElementById('feedback-modal');
    const feedbackMessage = document.getElementById('feedback-message');
    feedbackMessage.textContent = message;
    feedbackMessage.className = type;

    modal.style.display = 'block';

    setTimeout(() => {
        modal.style.display = 'none';
    }, 5000);
};

//*Mostrar el modal de confirmación
const showConfirm = (message, callback) => {
    const modal = document.getElementById('confirm-modal');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmYesBtn = document.getElementById('confirm-yes');
    const confirmNoBtn = document.getElementById('confirm-no');

    confirmMessage.textContent = message;

    confirmYesBtn.onclick = () => {
        modal.style.display = 'none';
        callback(true);
    };

    confirmNoBtn.onclick = () => {
        modal.style.display = 'none';
        callback(false);
    };

    modal.style.display = 'block';
};
