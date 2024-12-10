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

    loadTheme();
    loadFont();

    document.getElementById('light-mode-toggle').addEventListener('click', () => {
        localStorage.setItem('darkMode', 'disabled');
        localStorage.setItem('neutralMode', 'disabled');
        localStorage.setItem('lightMode', 'enabled');
        loadTheme();
    });

    document.getElementById('dark-mode-toggle').addEventListener('click', () => {
        localStorage.setItem('darkMode', 'enabled');
        localStorage.setItem('neutralMode', 'disabled');
        localStorage.setItem('lightMode', 'disabled');
        loadTheme();
    });

    document.getElementById('neutral-mode-toggle').addEventListener('click', () => {
        localStorage.setItem('darkMode', 'disabled');
        localStorage.setItem('neutralMode', 'enabled');
        localStorage.setItem('lightMode', 'disabled');
        loadTheme();
    });

    //*Eventos para cambio de fuente
    document.getElementById('small-font-toggle').addEventListener('click', () => {
        localStorage.setItem('bigFont', 'disabled');
        localStorage.setItem('medFont', 'disabled');
        localStorage.setItem('smallFont', 'enabled');
        loadFont();
    });

    document.getElementById('big-font-toggle').addEventListener('click', () => {
        localStorage.setItem('bigFont', 'enabled');
        localStorage.setItem('smallFont', 'disabled');
        localStorage.setItem('medFont', 'disabled');
        loadFont();
    });

    document.getElementById('med-font-toggle').addEventListener('click', () => {
        localStorage.setItem('smallFont', 'disabled');
        localStorage.setItem('medFont', 'enabled');
        localStorage.setItem('bigFont', 'disabled');
        loadFont();
    });

    document.getElementById('settings-icon-btn').addEventListener('click', () => {
        let sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        let sidebar = document.getElementById('sidebar');
        let settingsButton = document.getElementById('settings-icon-btn');
        
        if(!sidebar.contains(e.target) && !settingsButton.contains(e.target)){
            sidebar.classList.remove('active');
        }
    });

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

    document.getElementById('esp-btn').addEventListener('click', () => {
        window.location.href = '../html/list.html';
    })

    document.getElementById('pac-btn').addEventListener('click', () => {
        window.location.href = '../html/list_p.html';
    });

    document.getElementById('pub-btn').addEventListener('click', () => {
        window.location.href = '../html/publications.html';
    });

    document.getElementById('logout-btn').addEventListener('click', logoutHandler);
});

//*Guardado de estado de sesión
onAuthStateChanged(auth, (user) => {
    console.log("Estado de autenticación cambiado:", user);
    if(!user){
        window.location.href = "../index.html";
    }
});

const loadTheme = () => {
    const themeLink = document.getElementById('theme-link');
    const sidebarTheme = document.getElementById('sidebar-theme');

    if(localStorage.getItem('darkMode') === 'enabled'){
        themeLink.href = '../css/publication-edit-dm.css';
        sidebarTheme.href = '../css/sidebar.css';
    }else if(localStorage.getItem('neutralMode') === 'enabled'){
        themeLink.href = '../css/publication-edit-nm.css';
        sidebarTheme.href = '../css/sidebar-nm.css';
    }else{
        themeLink.href = '../css/publication-edit.css';
        sidebarTheme.href = '../css/sidebar.css';
    }
};

const loadFont = () => {
    const title = document.getElementById('title');
    const description = document.getElementById('description');
    const initFormTitle = document.getElementById('init-form-title');
    const h4s = document.querySelectorAll('h4');
    const customWarning = document.getElementById('custom-warning');
    const customImgBtn = document.getElementById('custom-img-btn');
    const input = document.querySelector('input');
    const textarea = document.querySelector('textarea');
    const btnRegister = document.getElementById('btn-register');
    const toggles = document.querySelectorAll('.toggle');
    const elements = [title, description, initFormTitle, ...h4s, customWarning, customImgBtn, input, textarea, btnRegister];

    //*Se actualizan los estilos de los toggles según el estado del almacenamiento.
    if(localStorage.getItem('smallFont') === 'enabled'){
        toggles[0]?.classList.add('color');
        toggles[1]?.classList.remove('color');
        toggles[2]?.classList.remove('color');
    }else if(localStorage.getItem('bigFont') === 'enabled'){
        toggles[0]?.classList.remove('color');
        toggles[1]?.classList.remove('color');
        toggles[2]?.classList.add('color');
    }else{
        toggles[0]?.classList.remove('color');
        toggles[1]?.classList.add('color');
        toggles[2]?.classList.remove('color');
    }

    //* Se itera sobre todos los elementos seleccionados y actualiza las clases de fuente.
    elements.forEach(element => {
        if(element){
            if(localStorage.getItem('smallFont') === 'enabled'){
                element.classList.add('smallfont');
                element.classList.remove('bigfont');
            }else if(localStorage.getItem('bigFont') === 'enabled'){
                element.classList.add('bigfont');
                element.classList.remove('smallfont');
            }else{
                element.classList.remove('bigfont');
                element.classList.remove('smallfont');
            }
        }
    });
};

//*Manejador de cerrado de sesión
const logoutHandler = async () => {
    try{
        await signOut(auth);
        console.log("Sesión cerrada exitosamente");
    }catch(error){
        console.error("Error al iniciar sesión: ", error);
    }
};