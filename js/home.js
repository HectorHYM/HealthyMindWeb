import { getAuth, signOut, onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';
import { app } from './firebase-config.js';

const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {

    setupLightMode();
    setupDarkMode();

    document.getElementById('settings-btn').addEventListener('click', () => {
        let sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        let sidebar = document.getElementById('sidebar');
        let settingsButton = document.getElementById('settings-btn');
        
        if(!sidebar.contains(e.target) && !settingsButton.contains(e.target)){
            sidebar.classList.remove('active');
        }
    });

    document.getElementById('logout-btn').addEventListener('click', logoutHandler);

    document.getElementById('esp-btn').addEventListener('click', () =>{
        window.location.href = '../html/list.html';
    });
});

//*Función para el estado de autenticación con el método correspondiente
onAuthStateChanged(auth, (user) => {
    console.log("Estado de autenticación cambiado: ", user);
    if(!user){
        window.location.href = '../html/index.html';
    }
});

//*Manejador de cerrado de sesión
const logoutHandler = async () => {
    try{
        await signOut(auth);
        console.log("Sesión cerrada exitosamente");
    }catch(error){
        console.error("Error al iniciar sesión: ", error);
    }
};

//*Inicializa los elementos los cuales seran cambiados y llama a la función correspondiente para activar el light mode
const setupLightMode = () => {
    const lightButton = document.getElementById('light-mode-toggle');
    const body = document.body;
    const settingsBtn = document.querySelector('.settings-btn');
    const title = document.querySelector('.title');
    const subtitle = document.querySelector('.subtitle');
    const espBtn = document.querySelector('.esp-btn');
    const pacBtn = document.querySelector('.pac-btn');
    const handsImg = document.querySelector('.hands-img');

    if(localStorage.getItem('lightMode') === 'enabled'){
        enableLightMode(body, settingsBtn, title, subtitle, espBtn, pacBtn, handsImg);
    };

    lightButton.addEventListener('click', () => {
        if(localStorage.getItem('lightMode') != 'enabled'){
            enableLightMode(body, settingsBtn, title, subtitle, espBtn, pacBtn, handsImg);
        }
    });
};

//*Activa el modo luminoso
const enableLightMode = (body, settingsBtn, title, subtitle, espBtn, pacBtn, handsImg) => {
    body.classList.remove('dark-mode');
    settingsBtn.classList.remove('dark-mode');
    title.classList.remove('dark-mode');
    subtitle.classList.remove('dark-mode');
    espBtn.classList.remove('dark-mode');
    pacBtn.classList.remove('dark-mode');
    handsImg.classList.remove('dark-mode');
    localStorage.setItem('darkMode', 'disabled');
    localStorage.setItem('lightMode', 'enabled');
};

//*Inicializa los elementos los cuales seran cambiados y llama a la función correspondiente para activar el dark mode
const setupDarkMode = () => {
    const darkButton = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const settingsBtn = document.querySelector('.settings-btn');
    const title = document.querySelector('.title');
    const subtitle = document.querySelector('.subtitle');
    const espBtn = document.querySelector('.esp-btn');
    const pacBtn = document.querySelector('.pac-btn');
    const handsImg = document.querySelector('.hands-img');

    if(localStorage.getItem('darkMode') === 'enabled'){
        enableDarkMode(body, settingsBtn, title, subtitle, espBtn, pacBtn, handsImg);
    };

    darkButton.addEventListener('click', () => {
        if(localStorage.getItem('darkMode') != 'enabled'){
            enableDarkMode(body, settingsBtn, title, subtitle, espBtn, pacBtn, handsImg);
        }
    });
};

//*Activa el modo oscuro
const enableDarkMode = (body, settingsBtn, title, subtitle, espBtn, pacBtn, handsImg) => {
    body.classList.add('dark-mode');
    settingsBtn.classList.add('dark-mode');
    title.classList.add('dark-mode');
    subtitle.classList.add('dark-mode');
    espBtn.classList.add('dark-mode');
    pacBtn.classList.add('dark-mode');
    handsImg.classList.add('dark-mode');
    localStorage.setItem('lightMode', 'disabled');
    localStorage.setItem('darkMode', 'enabled');
};