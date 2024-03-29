//!SIN USO
import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js'
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { app } from './firebase-config.js';

const auth = getAuth(app);
const db = getFirestore(app);
const rol = 'admin';

document.getElementById('firstForm').addEventListener('submit', event => {
    event.preventDefault(); //?Previene el envío del formulario
    const email = document.getElementById('fieldEmail').value;
    const password = document.getElementById('fieldPassword').value;
    registerAdmin(email, password);
});

//?Función para el registro de administrador temporal (Prueba 1)
window.registerAdmin = async(email, password) => {
    try{
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        const id = user.uid;
        console.log("Administrador registrado con éxito: ", id);
        adminDetails(id, email, rol);
    }catch(error){
        console.error("Error en el registro: ", error);
    }
}

window.adminDetails = async(id, email, rol) => {
    const userRef = doc(db, "administrador", id);
    setDoc(userRef, {
        email: email,
        rol: rol,
    }).then(() => {
        console.log("Detalles del administrador guardados exitosamente");
    }).catch((error) => {
        console.error("Error al guardar los detalles del administrador", error);
    });
}