import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js'
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
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

//*Boton de regreso a tabla de administración
document.getElementById('logout-icon-btn').addEventListener('click', () => {
    window.location.href = "./list.html";
});

//*Cerrar el modal cuando se hace clic en el botón de cierre
document.querySelectorAll('.close-button').forEach(button => {
    button.addEventListener('click', () => {
        button.parentElement.parentElement.style.display = 'none'; //?El modal
    });
});

//*Cerrar el modal cuando se hace click fuera de el
window.addEventListener('click', (event) => {
    if(event.target.classList.contains('modal')){
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

document.getElementById('regSpecialistForm').addEventListener('submit', async event => {
    event.preventDefault(); //?Previene el envío del formulario
    const names = document.getElementById('namesField').value;
    const lastnames = document.getElementById('lastnamesField').value;
    const email = document.getElementById('emailField').value;
    const specialty = document.getElementById('specialtyField').value;
    const birthdate = document.getElementById('birthdateField').value;
    const rfc = document.getElementById('rfcField').value;
    const phonenumber = document.getElementById('phonenumberField').value;
    const curp = document.getElementById('curpField').value;

    const currentUser = auth.currentUser;
    if (!currentUser) {
        showFeedBack("No se encontró un usuario autenticado. Por favor, inicia sesión nuevamente.", 'error');
        return;
    }

    const currentEmail = currentUser.email;
    const getPassword = async () => {
        return new Promise((resolve) => {
            showPrompt("Por favor ingrese su contraseña actual para continuar: ", resolve);
        });
    };
    let currentPassword = await getPassword();

    while(true){
        if(!currentPassword){
            showFeedBack("Contraseña requerida para continuar.", 'error');
            return;
        }

        try{
             //*Se intenta re-autenticar al usuario actual con las credenciales proporcionadas
            await signInWithEmailAndPassword(auth, currentEmail, currentPassword);
            break; //*Si la autenticación es exitosa salir del bucle
            //?alert('Registro exitoso! Se ha enviado un correo electrónico para establecer la contraseña');
        }catch(error){
            if(error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found'){
                currentPassword = await getPassword("Contraseña incorrecta. Por favor, inténtelo de nuevo:");
            }else{
                console.error('Error al re-autenticar al usuario', error);
                showFeedBack('Error al re-autenticar usuario: ', 'error');
                return;
            }
        }
    }

    try{
        await registerSpecialist(names, lastnames, email, specialty, birthdate, rfc, phonenumber, curp);
        //*Se intenta re-autenticar al usuario actual con las credenciales proporcionadas
        await signInWithEmailAndPassword(auth, currentEmail, currentPassword);
        showFeedBack('Registro exitoso! Se ha enviado un correo electrónico para establecer la contraseña.', 'success');
    }catch(error){
        console.error('Error al registrar usuario:', error);
        showFeedBack('Error al registrar usuario:', 'error');
    }
});

//*Función para el registro de especialista tanto en auth como en la colección
const registerSpecialist = async(names, lastnames, email, specialty, birthdate, rfc, phonenumber, curp) => {
    try{
        //*Se crea un usuario en Auth con contraseña temporal
        const userCredential = await createUserWithEmailAndPassword(auth, email, 'temporaryPassword');
        const user = userCredential.user;
        const id = user.uid;
        console.log("Especialista registrado con éxito: ", id);

        //*Guardar la información adicional en firestore
        await specialistDetails(names, lastnames, email, specialty, birthdate, rfc, phonenumber, curp);
        //*Se envia correo electrónico para establecer la contraseña
        await sendPasswordResetEmail(auth, email);
    }catch(error){
        throw error;
    }
};

//*Registro en el doc
const specialistDetails = async(names, lastnames, email, specialty, birthdate, rfc, phonenumber, curp) => {
    const userRef = doc(db, "users-especialista", curp);
    setDoc(userRef, {
        nombres: names,
        apellido: lastnames,
        email: email,
        especialidad: specialty,
        fechanac: birthdate,
        rfc: rfc,
        telefono: phonenumber,
    }).then(() => {
        console.log("Detalles del administrador guardados exitosamente");
    }).catch((error) => {
        console.error("Error al guardar los detalles del administrador");
    });
};


//*Mostrar modal del feedback
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

const showPrompt = (message, callback) => {
    const modal = document.getElementById('prompt-modal');
    const promptMessage = document.getElementById('prompt-message');
    const promptInput = document.getElementById('prompt-input');
    const promptSubmitBtn = document.getElementById('prompt-submit');
    const promptCancelBtn = document.getElementById('prompt-cancel');

    promptMessage.textContent = message;

    promptSubmitBtn.onclick = () => {
        const value = promptInput.value;
        modal.style.display = 'none';
        callback(value);
    };

    promptCancelBtn.onclick = () => {
        modal.style.display = 'none';
        callback(null);
    };

    modal.style.display = 'block';
};

