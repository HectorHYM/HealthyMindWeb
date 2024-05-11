import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js'
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { app } from './firebase-config.js';

const auth = getAuth(app);
const db = getFirestore(app);
const rol = 'especialista';

//*Boton de regreso a tabla de administración
document.getElementById('logout-icon-btn').addEventListener('click', () => {
    window.location.href = "./list.html";
});

document.getElementById('regSpecialistForm').addEventListener('submit', event => {
    event.preventDefault(); //?Previene el envío del formulario
    const names = document.getElementById('namesField').value;
    const lastnames = document.getElementById('lastnamesField').value;
    const email = document.getElementById('emailField').value;
    const specialty = document.getElementById('specialtyField').value;
    const birthdate = document.getElementById('birthdateField').value;
    const rfc = document.getElementById('rfcField').value;
    const phonenumber = document.getElementById('phonenumberField').value;
    const curp = document.getElementById('curpField').value;
    const password = document.getElementById('passwordField').value;
    const password_r = document.getElementById('password_rField').value;
    if(password === password_r){ //?Las contraseñas deben ser iguales
        registerSpecialist(names, lastnames, email, specialty, birthdate, rfc, phonenumber, curp, password);
    }else{
        console.log("Las contraseñas deberian coincidir.")
    }
});

//?Función para el registro de administrador temporal (Prueba 1)
window.registerSpecialist = async(names, lastnames, email, specialty, birthdate, rfc, phonenumber, curp, password) => {
    try{
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const id = user.uid;
        console.log("Especialista registrado con éxito: ", id);
        specialistDetails(names, lastnames, email, specialty, birthdate, rfc, phonenumber, curp);
    }catch(error){
        console.error("Error en el registro: ", error);
    }
};

window.specialistDetails = async(names, lastnames, email, specialty, birthdate, rfc, phonenumber, curp) => {
    const userRef = doc(db, "prueba", curp);
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