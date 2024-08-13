import { onAuthStateChangedHandler, auth } from './auth.js'
import { setupLogoutButtons, setupSearch, setupDarkMode, setupDeleteConfirmation, setupTabsWithContent } from './handlers.js';
import { createPopUps } from './icons.js';

//*Guardado de estado de sesión
onAuthStateChangedHandler(auth);

//*Inicialización de eventos
document.addEventListener("DOMContentLoaded", () => {
    setupLogoutButtons();
    setupDarkMode();
    setupDeleteConfirmation();
    setupTabsWithContent();
    setupSearch();
    createPopUps();
});