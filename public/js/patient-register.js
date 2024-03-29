//TODO - DETALLADO
import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js'
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { app } from './firebase-config.js';

const auth = getAuth(app);
const db = getFirestore(app);
const rol = 'paciente';

document.getElementById('patientRegister').addEventListener('submit', (e) => {
    e.preventDefault();
    const names = document.getElementById('namesField').value;
    const lastnames = document.getElementById('lastnamesField').value;
    const email = document.getElementById('emailField').value;
    const birthdate = document.getElementById('birthdateField').value;
    const sex = document.getElementById('sexField').value;
    const phonenumber = document.getElementById('phonenumberField').value;
    const photo = document.getElementById('photoField').value;
    const password = document.getElementById('passwordField').value;
    const password_r = document.getElementById('password_rField').value;
    if(password === password_r){
        registerPatient(names, lastnames, email, birthdate, sex, phonenumber, photo, password);
    }else{
        console.log("Las contraseñas deberian coincidir");
    }
});

window.registerPatient = async(names, lastnames, email, birthdate, sex, phonenumber, photo, password) => {
    try{
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const id = user.uid;
        console.log("Paciente registrado con éxito: ", id);
        patientDetails(id, names, lastnames, email, birthdate, sex, phonenumber, photo, rol);
    }catch(error){
        console.error("Error en el registro: ", error);
    }
}

window.patientDetails = async(id, names, lastnames, email, birthdate, sex, phonenumber, photo, rol) => {
    const userRef = doc(db, "users-paciente", id);
    setDoc(userRef, {
        nombres: names,
        apellidos: lastnames,
        email: email,
        fechanacimiento: birthdate,
        sexo: sex,
        telefono: phonenumber,
        foto: photo,
        rol: rol
    }).then(() => {
        console.log("Datos del paciente registrados exitosamente");
    }).catch((error) => {
        console.error("Error al guardar los datos del paciente", error);
    });
}