import { onAuthStateChangedHandler, auth } from './auth.js'
import { setupSearch, setupTabsWithContent, setupDeleteConfirmation } from './handlers_p.js';
import { createPopUps } from './icons.js';

//*Guardado de estado de sesión
onAuthStateChangedHandler(auth);

document.addEventListener('DOMContentLoaded', () => {
    setupSearch();
    setupTabsWithContent();
    setupDeleteConfirmation();
    createPopUps();
});