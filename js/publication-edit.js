import { getAuth, signOut, onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js'
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";
import { app } from './firebase-config.js';

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

document.addEventListener('DOMContentLoaded', () => {
    //*Se crea un objeto URLSearchParams para manejar los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    //*Se obtiene el parametro del id de la URL
    const publicationId = urlParams.get('id');
    const defaultImgUrl = '../assets/img/logo.png';

    if(publicationId){
        //*Accede a firestore para obtener el documento del id correspondiente
        const docRef = doc(db, 'publicaciones', publicationId);
        getDoc(docRef).then(docSnap => {
            if(docSnap.exists()){
                const data = docSnap.data();
                const form = document.getElementById('publication-form');
                const newImg = document.getElementById('imagen');
                const previewImg = document.getElementById('img-preview');
                const btnRegister = document.getElementById('btn-register');
                const confirmModal = document.getElementById('confirm-modal');
                const confirmNo = document.getElementById('confirm-no');
                const confirmYes = document.getElementById('confirm-yes')

                //* Verificar que el formulario existe antes de proceder
                if(form){
                    //* Poblar los campos del formulario solo si existen
                    ['titulo', 'texto'].forEach(field => {
                        if(form[field] && data[field] !== undefined) {
                            form[field].value = data[field];
                        }else{
                            console.error(`No se encontró el campo ${field} en el formulario o en los datos`);
                        }
                    });
                }else{
                    console.error('Formulario no encontrado');
                }

                //* Mostrar el preview de la imagen actual
                if(data['imagen'] != 'null' && form.elements['imagen'].type === 'file'){
                    if(previewImg){
                        previewImg.src = data['imagen'];
                    }
                }else{
                    if(previewImg){
                        previewImg.src = defaultImgUrl;
                    }
                }

                btnRegister.addEventListener('click', () => {
                    confirmModal.classList.add('show');
                });

                confirmYes.addEventListener('click', async () => {
                    //* Envio de formulario para edición de datos
                    confirmModal.classList.remove('show');

                    try{
                        const titleField = form['titulo'].value;
                        const textField = form['texto'].value;
                        let downloadURL = previewImg.src; //? Inicialmente es la img por defecto de la publicación

                        if(newImg.files.length > 0){
                            const imgFile = newImg.files[0];
                            const storageRef = ref(storage, `publicaciones/${imgFile.name}`);
                            //?Se sube la img al storage de firebase
                            const snapshot = await uploadBytes(storageRef, imgFile);
                            //?Se obtiene la URL de la descarga de la img
                            downloadURL = await getDownloadURL(snapshot.ref);

                            await updateDoc(docRef, {
                                titulo: titleField,
                                texto: textField,
                                imagen: downloadURL
                            });
                        }else{
                            await updateDoc(docRef, {
                                titulo: titleField,
                                texto: textField
                            });
                        }
                        console.log('Documento actualizado correctamente');
                    }catch(error){
                        console.error('Error al actualizar el documento: ', error);
                    }

                    window.location.href = '../html/publications.html';
                });

                confirmNo.addEventListener('click', () => {
                    confirmModal.classList.remove('show');
                });

                window.addEventListener('click', (e) => {
                    if(e.target === confirmModal){
                        confirmModal.classList.remove('show');
                    }
                });

                //* Añadir el evento submit al formulario
                form.addEventListener('submit', (e) => {
                    e.preventDefault(); // Evita el comportamiento por defecto del envío del formulario
                    btnRegister.click(); // Simula el clic en el botón de registro para abrir el modal
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

    //*Lógica para el input de la nueva imagen
    const newImg = document.getElementById('imagen');
    const customImgBtn = document.getElementById('custom-img-btn');
    const customWarning = document.getElementById('custom-warning');
    const imgPreview = document.getElementById('img-preview');

    customImgBtn.addEventListener('click', () => {
        newImg.click();
    });

    newImg.addEventListener('change', (e) => {
        const file = e.target.files[0];

        if(newImg.value){
            const reader = new FileReader();
            reader.onload = (e) => {
                imgPreview.src = e.target.result;
            };
            reader.readAsDataURL(file);
            customWarning.textContent = newImg.files[0].name; //? Se muestra el nombre del archivo
            customWarning.classList.add('change');
        }else{
            customWarning.textContent = "No ha sido seleccionado ningún archivo";
            customWarning.classList.remove('change');
            imgPreview.src = defaultImgUrl;
        }
    });
});

//*Guardado de estado de sesión
onAuthStateChanged(auth, (user) => {
    console.log("Estado de autenticación cambiado:", user);
    if(!user){
        window.location.href = "./index.html";
    }
});