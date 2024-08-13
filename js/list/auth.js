import { getAuth, signOut, onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';
import { app } from '../firebase-config.js';

export const auth = getAuth(app);

//*Función para el estado de autenticación con el método correspondiente
export const onAuthStateChangedHandler = (auth) => {
    onAuthStateChanged(auth, (user) => {
        console.log("Estado de autenticación cambiado: ", user);
        if(!user){
            window.location.href = '../html/index.html';
        }
    });
};

//*Manejador de cerrado de sesión
export const logoutHandler = async () => {
    try{
        await signOut(auth);
        console.log("Sesión cerrada exitosamente");
    }catch(error){
        console.error("Error al iniciar sesión: ", error);
    }
};