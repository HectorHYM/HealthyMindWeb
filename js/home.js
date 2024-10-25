import { getAuth, signOut, onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';
import { app } from './firebase-config.js';

const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {

    setupLightMode();
    setupDarkMode();
    setupNeutralMode();

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

    document.getElementById('pac-btn').addEventListener('click', () =>{
        window.location.href = '../html/list_p.html';
    });

    document.getElementById('pub-btn').addEventListener('click', () =>{
        window.location.href = '../html/publications.html';
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
    const darkButton = document.getElementById('dark-mode-toggle');
    const neutralButton = document.getElementById('neutral-mode-toggle');
    const body = document.body;
    const settingsBtn = document.querySelector('.settings-btn');
    const sidebar = document.querySelector('.sidebar');
    const logoutBtn = document.querySelector('.logout-btn');
    const title = document.querySelector('.title');
    const subtitle = document.querySelector('.subtitle');
    const espBtn = document.querySelector('.esp-btn');
    const pacBtn = document.querySelector('.pac-btn');
    const pubBtn = document.querySelector('.pub-btn');
    const handsImg = document.querySelector('.hands-img');

    if(localStorage.getItem('lightMode') === 'enabled'){
        enableLightMode(lightButton, darkButton, neutralButton, body, settingsBtn, sidebar, logoutBtn, title, subtitle, espBtn, pacBtn, pubBtn, handsImg);
    };

    lightButton.addEventListener('click', () => {
        if(localStorage.getItem('lightMode') != 'enabled'){
            enableLightMode(lightButton, darkButton, neutralButton, body, settingsBtn, sidebar, logoutBtn, title, subtitle, espBtn, pacBtn, pubBtn, handsImg);
        }
    });
};

//*Activa el light mode
const enableLightMode = (lightButton, darkButton, neutralButton, body, settingsBtn, sidebar, logoutBtn, title, subtitle, espBtn, pacBtn, pubBtn, handsImg) => {
    body.classList.remove('dark-mode');
    settingsBtn.classList.remove('dark-mode');
    subtitle.classList.remove('dark-mode');
    espBtn.classList.remove('dark-mode');
    pacBtn.classList.remove('dark-mode');
    handsImg.classList.remove('dark-mode');

    body.classList.remove('neutral-mode');
    settingsBtn.classList.remove('neutral-mode');
    sidebar.classList.remove('neutral-mode');
    lightButton.classList.remove('neutral-mode');
    darkButton.classList.remove('neutral-mode');
    neutralButton.classList.remove('neutral-mode');
    logoutBtn.classList.remove('neutral-mode');
    title.classList.remove('neutral-mode');
    subtitle.classList.remove('neutral-mode');
    espBtn.classList.remove('neutral-mode');
    pacBtn.classList.remove('neutral-mode');
    pubBtn.classList.remove('neutral-mode');
    handsImg.classList.remove('neutral-mode');

    localStorage.setItem('darkMode', 'disabled');
    localStorage.setItem('neutralMode', 'disabled');
    localStorage.setItem('lightMode', 'enabled');
};

//*Inicializa los elementos los cuales seran cambiados y llama a la función correspondiente para activar el dark mode
const setupDarkMode = () => {
    const darkButton = document.getElementById('dark-mode-toggle');
    const lightButton = document.getElementById('light-mode-toggle');
    const neutralButton = document.getElementById('neutral-mode-toggle');
    const body = document.body;
    const settingsBtn = document.querySelector('.settings-btn');
    const sidebar = document.querySelector('.sidebar');
    const logoutBtn = document.querySelector('.logout-btn');
    const title = document.querySelector('.title');
    const subtitle = document.querySelector('.subtitle');
    const espBtn = document.querySelector('.esp-btn');
    const pacBtn = document.querySelector('.pac-btn');
    const pubBtn = document.querySelector('.pub-btn');
    const handsImg = document.querySelector('.hands-img');

    if(localStorage.getItem('darkMode') === 'enabled'){
        enableDarkMode(darkButton, lightButton, neutralButton, body, settingsBtn, sidebar, logoutBtn, title, subtitle, espBtn, pacBtn, pubBtn, handsImg);
    };

    darkButton.addEventListener('click', () => {
        if(localStorage.getItem('darkMode') != 'enabled'){
            enableDarkMode(darkButton, lightButton, neutralButton, body, settingsBtn, sidebar, logoutBtn, title, subtitle, espBtn, pacBtn, pubBtn, handsImg);
        }
    });
};

//*Activa el dark mode
const enableDarkMode = (darkButton, lightButton, neutralButton, body, settingsBtn, sidebar, logoutBtn, title, subtitle, espBtn, pacBtn, pubBtn, handsImg) => {
    body.classList.add('dark-mode');
    settingsBtn.classList.add('dark-mode');
    subtitle.classList.add('dark-mode');
    handsImg.classList.add('dark-mode');

    body.classList.remove('neutral-mode');
    settingsBtn.classList.remove('neutral-mode');
    sidebar.classList.remove('neutral-mode');
    lightButton.classList.remove('neutral-mode');
    darkButton.classList.remove('neutral-mode');
    neutralButton.classList.remove('neutral-mode');
    logoutBtn.classList.remove('neutral-mode');
    title.classList.remove('neutral-mode');
    subtitle.classList.remove('neutral-mode');
    espBtn.classList.remove('neutral-mode');
    pacBtn.classList.remove('neutral-mode');
    pubBtn.classList.remove('neutral-mode');
    handsImg.classList.remove('neutral-mode');

    localStorage.setItem('lightMode', 'disabled');
    localStorage.setItem('neutralMode', 'disabled');
    localStorage.setItem('darkMode', 'enabled');
};

//*Inicializa los elementos los cuales seran cambiados y llama a la función correspondiente para activar el neutral mode
const setupNeutralMode = () => {
    const neutralButton = document.getElementById('neutral-mode-toggle');
    const lightButton = document.getElementById('light-mode-toggle');
    const darkButton = document.getElementById('dark-mode-toggle');
    const body = document.body;
    const settingsBtn = document.querySelector('.settings-btn');
    const sidebar = document.querySelector('.sidebar');
    const logoutBtn = document.querySelector('.logout-btn');
    const title = document.querySelector('.title');
    const subtitle = document.querySelector('.subtitle');
    const espBtn = document.querySelector('.esp-btn');
    const pacBtn = document.querySelector('.pac-btn');
    const pubBtn = document.querySelector('.pub-btn');
    const handsImg = document.querySelector('.hands-img');

    if(localStorage.getItem('neutralMode') === 'enabled'){
        enableNeutralMode(neutralButton, lightButton, darkButton, body, settingsBtn, sidebar, logoutBtn, title, subtitle, espBtn, pacBtn, pubBtn, handsImg);
    };

    neutralButton.addEventListener('click', () => {
        if(localStorage.getItem('neutralMode') != 'enabled'){
            enableNeutralMode(neutralButton, lightButton, darkButton, body, settingsBtn, sidebar, logoutBtn, title, subtitle, espBtn, pacBtn, pubBtn,  handsImg);
        }
    });
};

//*Activa el neutral mode
const enableNeutralMode = (neutralButton, lightButton, darkButton, body, settingsBtn, sidebar, logoutBtn, title, subtitle, espBtn, pacBtn, pubBtn, handsImg) => {
    body.classList.add('neutral-mode');
    settingsBtn.classList.add('neutral-mode');
    sidebar.classList.add('neutral-mode');
    lightButton.classList.add('neutral-mode');
    darkButton.classList.add('neutral-mode');
    neutralButton.classList.add('neutral-mode');
    logoutBtn.classList.add('neutral-mode');
    title.classList.add('neutral-mode');
    subtitle.classList.add('neutral-mode');
    espBtn.classList.add('neutral-mode');
    pacBtn.classList.add('neutral-mode');
    pubBtn.classList.add('neutral-mode');
    handsImg.classList.add('neutral-mode');

    body.classList.remove('dark-mode');
    settingsBtn.classList.remove('dark-mode');
    subtitle.classList.remove('dark-mode');
    handsImg.classList.remove('dark-mode');

    localStorage.setItem('lightMode', 'disabled');
    localStorage.setItem('darkMode', 'disabled');
    localStorage.setItem('neutralMode', 'enabled');
};