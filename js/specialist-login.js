//!SIN USO
import { getAuth, signInWithEmailAndPassword, signOut } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js'
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { app } from './firebase-config.js';

const auth = getAuth(app);
const db = getFirestore(app);

const form = document.getElementById('specialistLogin');
const curpInput = document.getElementById('curpField');
const emailInput = document.getElementById('emailField');
const passwordInput = document.getElementById('passwordField');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const curp = curpInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    signInWithCurpAndPassword(curp, email, password);
});

window.signInWithCurpAndPassword = async(curp, email, password) => {
    const userRef = doc(db, 'users-especialista', curp);
    const docSnap = await getDoc(userRef);

    if(docSnap.exists()){
        const userData = docSnap.data();
        const storedEmail = userData.email;

        if(storedEmail === email){
            signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
                authRol(curp);
                const user = userCredential.user;
                console.log("Usuario autenticado: ", user);
            }).catch((error) => {
                const errorMessage = error.message;
                console.error("Error de inicio de sesión: ", errorMessage);
            });
        }else{
            console.log("Correo electrónico incorrecto");
        }
    }else{
        console.log("Usuario no encontrado");
    }
}

window.authRol = async(curp) => {
    const userRef = doc(db, 'users-especialista', curp);
    const docSnap = await getDoc(userRef);

    if(docSnap.exists()){
        const userData = docSnap.data();
        const rol = userData.rol;
        console.log("Rol del usuario: ", rol);
        if(rol === 'especialista'){
            //TODO - Redirigir a página principal de administrador.
        }else{
            console.log("Rol de usuario no correspondido")
            logout();
        }
    }
}

window.logout = async() => {
    signOut(auth).then(() => {
        console.log("Sesión cerrada exitosamente");
    }).catch((error) => {
        console.error("Error al cerrar sesión: ", error);
    });
}

