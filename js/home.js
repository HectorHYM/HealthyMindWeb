import { getAuth, signOut, onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';
import { app } from './firebase-config.js';

const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', () => {

    loadTheme();
    loadFont();

    //* Eventos para cambio de tema
    document.getElementById('light-mode-toggle').addEventListener('click', () => {
        localStorage.setItem('darkMode', 'disabled');
        localStorage.setItem('neutralMode', 'disabled');
        localStorage.setItem('lightMode', 'enabled');
        loadTheme();
    });

    document.getElementById('dark-mode-toggle').addEventListener('click', () => {
        localStorage.setItem('darkMode', 'enabled');
        localStorage.setItem('neutralMode', 'disabled');
        localStorage.setItem('lightMode', 'disabled');
        loadTheme();
    });

    document.getElementById('neutral-mode-toggle').addEventListener('click', () => {
        localStorage.setItem('darkMode', 'disabled');
        localStorage.setItem('neutralMode', 'enabled');
        localStorage.setItem('lightMode', 'disabled');
        loadTheme();
    });

    //*Eventos para cambio de fuente
    document.getElementById('small-font-toggle').addEventListener('click', () => {
        localStorage.setItem('bigFont', 'disabled');
        localStorage.setItem('medFont', 'disabled');
        localStorage.setItem('smallFont', 'enabled');
        loadFont();
    });

    document.getElementById('big-font-toggle').addEventListener('click', () => {
        localStorage.setItem('bigFont', 'enabled');
        localStorage.setItem('smallFont', 'disabled');
        localStorage.setItem('medFont', 'disabled');
        loadFont();
    });

    document.getElementById('med-font-toggle').addEventListener('click', () => {
        localStorage.setItem('smallFont', 'disabled');
        localStorage.setItem('medFont', 'enabled');
        localStorage.setItem('bigFont', 'disabled');
        loadFont();
    });

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

const loadTheme = () => {
    const themeLink = document.getElementById('theme-link');
    const sidebarTheme = document.getElementById('sidebar-theme');

    if(localStorage.getItem('darkMode') === 'enabled'){
        themeLink.href = '../css/home-dm.css';
        sidebarTheme.href = '../css/sidebar.css';
    }else if(localStorage.getItem('neutralMode') === 'enabled'){
        themeLink.href = '../css/home-nm.css';
        sidebarTheme.href = '../css/sidebar-nm.css';
    }else{
        themeLink.href = '../css/home.css';
        sidebarTheme.href = '../css/sidebar.css';
    }
};

const loadFont = () => {
    const title = document.getElementById('title');
    const subtitle = document.getElementById('subtitle');
    const btnTxts = document.querySelectorAll('.btn-txt');
    const toggles = document.querySelectorAll('.toggle');
    const elements = [title, subtitle, btnTxts[0], btnTxts[1], btnTxts[2]];

    if(localStorage.getItem('smallFont') === 'enabled'){
        toggles[0].classList.add('color');
        toggles[1].classList.remove('color');
        toggles[2].classList.remove('color');
    }else if(localStorage.getItem('bigFont') === 'enabled'){
        toggles[0].classList.remove('color');
        toggles[1].classList.remove('color');
        toggles[2].classList.add('color');
    }else{
        toggles[0].classList.remove('color');
        toggles[1].classList.add('color');
        toggles[2].classList.remove('color');
    }

    elements.forEach(element => {
        if(element){
            if(localStorage.getItem('smallFont') === 'enabled'){
                element.classList.add('smallfont');
                element.classList.remove('bigfont');
            }else if(localStorage.getItem('bigFont') === 'enabled'){
                element.classList.add('bigfont');
                element.classList.remove('smallfont');
            }else{
                element.classList.remove('bigfont');
                element.classList.remove('smallfont');
            }
        }else{
            console.error('Elemento no encontrado');
        }
    });
};

//*Manejador de cerrado de sesión
const logoutHandler = async () => {
    try{
        await signOut(auth);
        console.log("Sesión cerrada exitosamente");
    }catch(error){
        console.error("Error al iniciar sesión: ", error);
    }
};