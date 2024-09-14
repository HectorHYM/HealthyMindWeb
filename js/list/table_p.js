import { onAuthStateChangedHandler, auth } from './auth.js'
import { setupBackButton, setupSearch, setupTabsWithContent, setupDeleteConfirmation } from './handlers_p.js';
import { createPopUps } from './icons.js';

//*Guardado de estado de sesión
onAuthStateChangedHandler(auth);

document.addEventListener('DOMContentLoaded', () => {
    setupBackButton();
    setupSearch();
    setupTabsWithContent();
    setupDeleteConfirmation();
    createPopUps();
});