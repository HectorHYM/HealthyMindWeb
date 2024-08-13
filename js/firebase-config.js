import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js'; //*Importación para la inicialización de la app

const firebaseConfig = {
    apiKey: "AIzaSyC3TnAyOz5_FSp6c7CXq3HdOlXcD0Sl9Ck",
    authDomain: "healthymind-f2fcb.firebaseapp.com",
    projectId: "healthymind-f2fcb",
    storageBucket: "healthymind-f2fcb.appspot.com",
    messagingSenderId: "596369488817",
    appId: "1:596369488817:web:b21566d429de36ffc21b90",
    measurementId: "G-V3V7Y30FCM"
};

//*Se inicializa la aplicación de Firebase
const app = initializeApp(firebaseConfig);

export {app}; //*Se exporta la configuración