import { getAuth, signInWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js'
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { app } from './firebase-config.js';

//*Inicialización de Firebase Authentication y Firestore
const auth = getAuth(app);
const db = getFirestore(app);
const form = document.getElementById('adminLogin');

//?Mensajes de errores
const ERROR_MESSAGES = {
    PERSISTENCE: "Error al configurar la persistencia del usuario: ",
    LOGIN: "Credenciales incorrectas",
    ROLE_VERIFICATION: "Error al verificar el rol del usuario: ",
    USER_NOT_FOUND: "Usuario no encontrado",
    ROLE_MISMATCH: "Rol de usuario no correspondido",
    SIGN_OUT: "Error al cerrar sesión: "
}

//*Configuración de persistencia de usuario
const configurePersistence = async () => {
    try{
        await setPersistence(auth, browserSessionPersistence);
        console.log("Persistencia de sesión configurada correctamente");
    }catch(error){
        console.error(ERROR_MESSAGES.PERSISTENCE, error);
    }
};

//*Función para cerrar sesión
const logout = async() => {
    try{
        await signOut(auth);
        console.log("Sesión cerrada exitosamente");
    }catch(error){
        console.error(ERROR_MESSAGES.SIGN_OUT, error.message);
    }
};

//*Verificación de rol
const authRol = async (uid) => {
    try{
        const userRef = doc(db, 'administrador', uid);
        const docSnap = await getDoc(userRef);
        
        if(docSnap.exists()){
            const userData = docSnap.data();
            const rol = userData.rol;
            if(rol === 'admin'){
                window.location.href = "./list.html";
                console.log("Rol del usuario: ", rol);
            }else{
                console.error(ERROR_MESSAGES.ROLE_MISMATCH)
                document.getElementById('error-auth').textContent = ERROR_MESSAGES.ROLE_MISMATCH;
                await logout();
            }
        }else{
            console.error(ERROR_MESSAGES.USER_NOT_FOUND);
            document.getElementById("error-auth").textContent = ERROR_MESSAGES.USER_NOT_FOUND;
            await logout();
        }
    }catch(error){
        console.error(ERROR_MESSAGES.ROLE_VERIFICATION, error.message);
        document.getElementById('error-auth').textContent = ERROR_MESSAGES.ROLE_VERIFICATION;
    }
    
};

configurePersistence();

//*Inicio de sesión
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('emailField').value;
    const password = document.getElementById('passwordField').value;
    
    try{
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await authRol(user.uid);
        console.log("Administrador autenticado: ", user);
    }catch(error){
        console.error(ERROR_MESSAGES.LOGIN, error.message);
        document.getElementById('error-auth').textContent = ERROR_MESSAGES.LOGIN;
    }
});
