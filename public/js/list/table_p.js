import { onAuthStateChangedHandler, auth } from './auth.js'
import { setupSearch, setupTabsWithContent, setupDeleteConfirmation, setUpSidebar } from './handlers_p.js';
import { createPopUps } from './icons.js';

//*Guardado de estado de sesión
onAuthStateChangedHandler(auth);

document.addEventListener('DOMContentLoaded', () => {
    setUpSidebar();
    setupSearch();
    setupTabsWithContent();
    setupDeleteConfirmation();
    createPopUps();
});