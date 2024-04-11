import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js'
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { app } from './firebase-config.js';

const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, (user) => {
    console.log("Estado de autenticación cambiado:", user);
    if(!user){
        window.location.href = "./index.html";
    }
});