import { onAuthStateChangedHandler, auth } from './auth.js'
import { setupLogoutButtons, setupSearch, setupDarkMode, setupDeleteConfirmation, setupTabsWithContent, setUpNewRegisterButton } from './handlers.js';
import { createPopUps } from './icons.js';

//*Guardado de estado de sesión
onAuthStateChangedHandler(auth);

//*Inicialización de eventos
document.addEventListener("DOMContentLoaded", () => {
    setUpNewRegisterButton();
    setupLogoutButtons();
    setupDarkMode();
    setupDeleteConfirmation();
    setupTabsWithContent();
    setupSearch();
    createPopUps();
});