import { onAuthStateChangedHandler, auth } from './auth.js'
import { setupSearch, setupDeleteConfirmation, setupTabsWithContent, setUpSidebar } from './handlers.js';
import { createPopUps } from './icons.js';

//*Guardado de estado de sesión
onAuthStateChangedHandler(auth);

//*Inicialización de eventos
document.addEventListener("DOMContentLoaded", () => {
    setUpSidebar();
    setupDeleteConfirmation();
    setupTabsWithContent();
    setupSearch();
    createPopUps();
});