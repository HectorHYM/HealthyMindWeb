import { onAuthStateChangedHandler, auth } from './auth.js'
import { setupBackButton, setupSearch, setupDeleteConfirmation, setupTabsWithContent, setUpNewRegisterButton } from './handlers.js';
import { createPopUps } from './icons.js';

//*Guardado de estado de sesión
onAuthStateChangedHandler(auth);

//*Inicialización de eventos
document.addEventListener("DOMContentLoaded", () => {
    setupBackButton();
    setUpNewRegisterButton();
    //setupDarkMode();
    setupDeleteConfirmation();
    setupTabsWithContent();
    setupSearch();
    createPopUps();
});