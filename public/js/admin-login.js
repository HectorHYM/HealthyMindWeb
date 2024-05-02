import { getAuth, signInWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js'
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { app } from './firebase-config.js';

const auth = getAuth(app);
const db = getFirestore(app);

const form = document.getElementById('adminLogin');

setPersistence(auth, browserSessionPersistence).then(() => {
    console.log("Persistencia de sesión configurada correctamenre");
}).catch((error) => {
    console.error("Error al configurar la persistencia del usuario", error);
});

//*Inicio de sesión
form.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('emailField').value;
    const password = document.getElementById('passwordField').value;
    
    signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
        const user = userCredential.user;
        authRol(user.uid);
        console.log("Administrador autenticado: ", user);
    }).catch((error) => {
        //const errorCode = error.code;
        const errorMessage = error.message;
        console.error("Error de inicio de sesión: ", errorMessage);
        document.getElementById("error-auth").textContent = "Error en la autenticación de usuario";
    });
});

//*Verificación de rol
window.authRol = async(uid) => {
    const userRef = doc(db, 'administrador', uid);
    const docSnap = await getDoc(userRef);
    
    if(docSnap.exists()){
        const userData = docSnap.data();
        const rol = userData.rol;
        if(rol === 'admin'){
            //TODO - Redirigir a página principal de administrador.
            window.location.href = "./list.html";
            console.log("Rol del usuario: ", rol);
        }else{
            console.log("Rol de usuario no correspondido")
            document.getElementById("error-auth").textContent = "Rol de usuario no correspondido";
            logout();
        }
    }
    
}

//*Función para cerrar sesión
window.logout = async() => {
    signOut(auth).then(() => {
        console.log("Sesión cerrada exitosamente");
    }).catch((error) => {
        console.error("Error al cerrar sesión: ", error);
    });
}
