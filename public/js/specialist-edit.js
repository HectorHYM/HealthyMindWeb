import { getAuth, createUserWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js'
import { getFirestore, doc, getDoc, updateDoc, setDoc, collection } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { app } from './firebase-config.js';

const auth = getAuth(app);
const db = getFirestore(app);

//*Boton de regreso a tabla de administración
document.getElementById('logout-icon-btn').addEventListener('click', () => {
    window.location.href = "./list.html";
});

document.addEventListener("DOMContentLoaded", function() {
    //*Se crea un objeto URLSearchParams para manejar los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    //*Se obtiene el parametro del id de la URL
    const registerId = urlParams.get('id');

    if(registerId){
        //*Accede a firestore para obtener el documento del id correspondiente
        const docRef = doc(db, 'prueba', registerId);
        getDoc(docRef).then(docSnap => {
            if(docSnap.exists()){
                const data = docSnap.data();
                const form = document.getElementById('regSpecialistForm');
                ['nombres', 'apellido', 'email', 'especialidad', 'rfc', 'telefono'].forEach(field => {
                    if (data[field] !== undefined) {
                        form[field].value = data[field];
                        form['curp'].value = registerId;
                    } else {
                        console.error('No existe el campo: ' + field);
                    }
                });
            }else{
                console.error("No se encontro documento");
            }
        }).catch(error => {
            console.error("Error al obtener documento", error);
        });
    }else{
        console.error("No se proporciono el id en la URL.");
    }

    document.getElementById('regSpecialistForm').addEventListener('submit', event => {
        event.preventDefault(); //?Previene el envío del formulario
        const names = document.getElementById('nombres').value;
        const lastnames = document.getElementById('apellido').value;
        const email = document.getElementById('email').value;
        const specialty = document.getElementById('especialidad').value;
        const birthdate = document.getElementById('birthdateField').value;
        const rfc = document.getElementById('rfc').value;
        const phonenumber = document.getElementById('telefono').value;
        const curp = document.getElementById('curp').value;
        editSpecialist(registerId, names, lastnames, email, specialty, birthdate, rfc, phonenumber);
    });
});

const editSpecialist = (registerId, names, lastnames, email, specialty, birthdate, rfc, phonenumber) => {
    const docRef = doc(db, 'prueba', registerId);
    updateDoc(docRef, {
        nombres: names,
        apellido: lastnames,
        email: email,
        especialidad: specialty,
        fechanac: birthdate,
        rfc: rfc,
        telefono: phonenumber
    }).then(() => {
        console.log("Usuario editado con éxito!");
    }).catch((error) => {
        console.error("Error al actualizar el usuario: ", error);
    });
};