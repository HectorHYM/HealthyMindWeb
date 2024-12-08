import { getFirestore, doc, getDocs, collection, deleteDoc } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js';
import { app } from '../firebase-config.js';

export const db = getFirestore(app);

//*Obtiene los documentos y datos de los registros de la colección de especialistas
export const loadUserData = async () => {
    try{
        const querySnapshot = await getDocs(collection(db, 'users-especialista'));
        const registers = [];
        querySnapshot.forEach(doc => {
            const data = doc.data();
            data.id = doc.id;
            registers.push(data);
        });
        return registers;
    }catch(error){
        console.error("Error al obtener los datos de los documentos: ", error);
        return [];
    }
};

//*Elimina registros de la colección
export const deleteUser = async (id) => {
    try{
        await deleteDoc(doc(db, "users-especialista", id));
        console.log("Usuario eliminado correctamente");
    }catch(error){
        console.error("Error al eliminar al usuario: ", error);
    }
};

