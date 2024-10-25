import { getAuth, signOut, onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js'
import { getFirestore, doc, getDoc, collection, getDocs, deleteDoc, addDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-storage.js";
import { app } from './firebase-config.js';

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

document.addEventListener('DOMContentLoaded', async () => {

    //* Cargar y renderizar publicaciones
    await loadAndRenderPublications();

    loadTheme();

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

    document.getElementById('settings-btn').addEventListener('click', () => {
        let sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        let sidebar = document.getElementById('sidebar');
        let settingsButton = document.getElementById('settings-btn');
        
        if(!sidebar.contains(e.target) && !settingsButton.contains(e.target)){
            sidebar.classList.remove('active');
        }
    });

    document.getElementById('logout-btn').addEventListener('click', logoutHandler);

    //* Escucha de la barra de busqueda
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', () => {
        const searchText = searchInput.value.toLowerCase();
        filterPublications(searchText);
    });

    //* Modal confirm para eliminar multiples publicaciones
    const deletePubBtn = document.getElementById('deletepub-btn');
    const confirmModal = document.getElementById('confirm-modal');
    const confirmMessage = document.getElementById('confirm-message');
    const confirmBtn = document.getElementById('confirm-yes');
    const confirmBtnAlt = document.getElementById('confirm-yes-alt');

    deletePubBtn.addEventListener('click', () => {
        confirmModal.classList.add('show');
        confirmMessage.textContent = "¿Está seguro que desea eliminar estas publicaciones?";
        confirmBtn.style.display = 'none';
        confirmBtnAlt.style.display = 'block';
    });

    document.getElementById('confirm-yes-alt').addEventListener('click', async () => {
        await deletePublications();
        confirmModal.classList.remove('show');
        loadAndRenderPublications();
    });

    document.getElementById('confirm-no').addEventListener('click', () => {
        confirmModal.classList.remove('show');
    });

    window.addEventListener('click', (e) => {
        if(e.target === confirmModal){
            confirmModal.classList.remove('show');
        }
    });

    //* Aparición de modal para añadir publicaciones
    const modal = document.getElementById('modal');
    const newpubBtn = document.querySelector('.newpub-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const idField = document.getElementById('idField');

    newpubBtn.addEventListener('click', () => {
        modal.classList.add('show');
        idField.value = generateRandomID();
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    window.addEventListener('click', (e) => {
        if(e.target === modal){
            modal.classList.remove('show');
        }
    });

    //* Envio de datos desde el formulario para crear una nueva publicación
    const form = document.getElementById('publications-form');
    const imgInput = document.getElementById('imgField');

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); //? Evita que el formulario se envié de manera tradicional

        const idField = document.getElementById('idField').value;
        const titleField = document.getElementById('titleField').value;
        const textField = document.getElementById('textField').value;
        const file = imgInput.files[0]; //? Archivo de imagen seleccionado
        const feedBackText = document.getElementById('feedback-text');
        feedBackText.textContent = "Publicación creada con éxito!";

        try{
            let downloadURL = "null";

            if(file){
                //? Se sube la imagen a Firebase Storage
                const storageRef = ref(storage, `publicaciones/${file.name}`);
                await uploadBytes(storageRef, file);
                downloadURL = await getDownloadURL(storageRef);
            }

            //?Se guardan los datos en Firestore
            await setDoc(doc(db, 'publicaciones', idField), {
                id_generado: idField,
                titulo: titleField,
                texto: textField,
                imagen: downloadURL
            });

            loadAndRenderPublications();
            showFeedbackModal();
            form.reset();

        }catch(error){
            console.error("Error al subir la imagen o guardar los datos: ", error);
            alert("Error al crear la publicación.");
        }
    });
});

onAuthStateChanged(auth, (user) => {
    console.log("Estado de autenticación cambiado:", user);
    if(!user){
        window.location.href = "./index.html";
    }
});

//*Manejador de cerrado de sesión
const logoutHandler = async () => {
    try{
        await signOut(auth);
        console.log("Sesión cerrada exitosamente");
    }catch(error){
        console.error("Error al iniciar sesión: ", error);
    }
};

const loadTheme = () => {
    const themeLink = document.getElementById('theme-link');
    const sidebarTheme = document.getElementById('sidebar-theme');

    if(localStorage.getItem('darkMode') === 'enabled'){
        themeLink.href = '../css/publications-dm.css';
        sidebarTheme.href = '../css/sidebar.css';
    }else if(localStorage.getItem('neutralMode') === 'enabled'){
        themeLink.href = '../css/publications-nm.css';
        sidebarTheme.href = '../css/sidebar-nm.css';
    }else{
        themeLink.href = '../css/publications.css';
        sidebarTheme.href = '../css/sidebar.css';
    }
};

let currentPage = 1;
const publicationsPerPage = 6;

//* Filtrar publicaciones por coincidencia de texto de la barra de busqueda
const filterPublications = async (searchText) => {
    const allPublications = await loadPublicationsData();
    const filteredPublications = allPublications.filter(publication => {
        const title = publication.titulo ? publication.titulo.toLowerCase() : '';
        const body = publication.texto ? publication.texto.toLowerCase() : '';
        const id = publication.id_generado ? publication.id_generado.toLowerCase() : '';

        return title.includes(searchText) || body.includes(searchText) || id.includes(searchText)
    });

    currentPage = 1;

    // Si no hay resultados filtrados, asegúrate de no intentar hacer la paginación
    if (filteredPublications.length === 0) {
        renderPublications([]);
        return; // No hay resultados, detener la ejecución aquí
    }

    paginatePublications(filteredPublications);
};

const loadAndRenderPublications = async () => {
    const publications = await loadPublicationsData();
    paginatePublications(publications);
}

const loadPublicationsData = async () => {
    try{
        const querySnapshot = await getDocs(collection(db, 'publicaciones'));
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

//* Paginación para las publicaciones
const paginatePublications = (publications) => {
    const totalPages = Math.ceil(publications.length / publicationsPerPage);
    const start = (currentPage - 1) * publicationsPerPage;
    const end = start + publicationsPerPage;

    //? Se renderizan solo las publicaciones de la página actual
    renderPublications(publications.slice(start, end));

    //? Se actualiza el sistema de paginación
    renderPagination(totalPages, publications);
};

const renderPagination = async (totalPages, publications) => {
    let paginationCont = document.querySelector('.pagination-cont');

    if(!paginationCont){
        paginationCont = document.createElement('div');
        paginationCont.className = 'pagination-cont';

        const pubsContainer = document.querySelector('.pubs-container');
        if(pubsContainer){
            pubsContainer.appendChild(paginationCont);
        }else{
            console.error('No se encontro el contenedor de publicaciones');
            return;
        }
    }

    paginationCont.innerHTML = ``;

    for(let i = 1; i <= totalPages; i++){
        const pageButton = document.createElement('button');
        pageButton.className = 'lexend-regular page-btn';
        pageButton.textContent = i;

        if(i === currentPage){
            pageButton.classList.add('active');
        }

        pageButton.addEventListener('click', () => {
            currentPage = i;

            const allPageBtns = document.querySelectorAll('.page-btn');
            allPageBtns.forEach(btn => {
                btn.classList.remove('active');
            });

            pageButton.classList.add('active');
            paginatePublications(publications);
        });

        paginationCont.appendChild(pageButton);
    }
};

const renderPublications = (publications) => {
    const pubsContainer = document.querySelector('.pubs-container');
    const mainPubsCont = document.createElement('div');
    mainPubsCont.className = 'main-pubs-cont';
    pubsContainer.innerHTML = ``;
    mainPubsCont.innerHTML = ``;

    if(publications.length === 0){
        const emptyMessage = document.createElement('h2');
        emptyMessage.className = 'empty-message';
        emptyMessage.textContent = 'No se han encontrado publicaciones';
        mainPubsCont.appendChild(emptyMessage);
        pubsContainer.appendChild(mainPubsCont);
        return;
    }

    publications.forEach(publication => {
        //? Se crea el contenedor de cada publicación
        const pubCont = document.createElement('div');
        pubCont.className = 'pub-cont';

        //?Modal para detalles de cada publicación
        const pubModal = document.getElementById('pub-modal');
        const detailImgBg = document.getElementById('detail-img-bg');
        const detailPubImg = document.getElementById('detail-pub-img');
        const detailPubTitle = document.getElementById('detail-pub-title');    
        const detailPubBody = document.getElementById('detail-pub-body');
        const detailPubId = document.getElementById('detail-pub-id');    
        
        pubCont.addEventListener('click', () => {
            if(publication.imagen == "null" || publication.imagen == ''){
                detailPubImg.src = '../assets/img/logo.png';
                detailImgBg.style.backgroundImage = `url('../assets/img/logo.png')`;
            }else{
                detailPubImg.src = publication.imagen;
                detailImgBg.style.backgroundImage = `url(${publication.imagen})`;
            }
            detailPubTitle.textContent = publication.titulo;
            detailPubBody.textContent = publication.texto;
            detailPubId.textContent = publication.id_generado;

            pubModal.classList.add('show');
        });

        window.addEventListener('click', (e) => {
            if (e.target === pubModal || e.target  === directDeleteBtn || e.target === editPubBtn || e.target === selectDeleteBtn) {
                pubModal.classList.remove('show');
            }
        });

        //? Se crea el contenedor de los botones para eliminar junto con ellos
        const buttonsCont = document.createElement('div');
        buttonsCont.className = 'buttons-cont';
        const directDeleteBtn = document.createElement('button');
        directDeleteBtn.className = 'material-symbols-outlined direct-delete-btn';
        directDeleteBtn.textContent = 'delete_forever';

        const editPubBtn = document.createElement('button');
        editPubBtn.className = 'material-symbols-outlined edit-pub-btn'
        editPubBtn.textContent = 'edit_note';

        editPubBtn.addEventListener('click', () => {
            window.location.href = `../../html/publication-edit.html?id=${publication.id}`;
        });

        //? Muestra de modal de confirmación
        directDeleteBtn.addEventListener('click', () => {
            const confirmModal = document.getElementById('confirm-modal');
            const confirmMessage = document.getElementById('confirm-message');
            const confirmBtn = document.getElementById('confirm-yes');
            const confirmBtnAlt = document.getElementById('confirm-yes-alt');

            confirmModal.classList.add('show');
            confirmMessage.textContent = "¿Está seguro que desea eliminar esta publicación?";
            confirmBtn.style.display = 'block';
            confirmBtnAlt.style.display = 'none';

            document.getElementById('confirm-no').addEventListener('click', () => {
                confirmModal.classList.remove('show');
            });
    
            document.getElementById('confirm-yes').addEventListener('click', async () => {
                try{
                    //? Se elimina la publicación de Firestore
                    await deleteDoc(doc(db, "publicaciones", publication.id));
                    console.log(`Publicación eliminada: ${publication.id}`);
                    confirmModal.classList.remove('show');
                    loadAndRenderPublications();
                }catch(error){
                    console.error("Error al eliminar la publicación: ", error);
                }
            });

            window.addEventListener('click', (e) => {
                if (e.target === confirmModal) {
                    confirmModal.classList.remove('show');
                }
            });
        });

        const selectDeleteBtn = document.createElement('button');
        selectDeleteBtn.className = 'material-symbols-outlined select-delete-btn';
        selectDeleteBtn.textContent = 'check_box_outline_blank';

        selectDeleteBtn.addEventListener('click', () => {
            if(selectDeleteBtn.textContent === 'check_box_outline_blank'){
                selectDeleteBtn.textContent = 'check_box';
                selectDeleteBtn.classList.add('selected');
            }else if(selectDeleteBtn.textContent === 'check_box'){
                selectDeleteBtn.textContent = 'check_box_outline_blank';
                selectDeleteBtn.classList.remove('selected');
            }
        });

        buttonsCont.appendChild(selectDeleteBtn);
        buttonsCont.appendChild(editPubBtn);
        buttonsCont.appendChild(directDeleteBtn);

        //? Se crea sub-contenedor para el titulo y el ID
        const textCont = document.createElement('div');
        textCont.className = 'text-cont';

        //? Se crea y carga la imagen
        const imgCont = document.createElement('div');
        imgCont.className = 'img-cont';
        const pubImg = document.createElement('img');
        pubImg.className = 'pub-img';
        if(publication.imagen == "null" || publication.imagen == ''){
            pubImg.src = '../assets/img/logo.png';
        }else{
            pubImg.src = publication.imagen;
        }
        imgCont.appendChild(pubImg);

        //? Se crea el titulo
        const labelTitle = document.createElement('h2');
        labelTitle.className = 'pubLabels';
        labelTitle.textContent = 'Título';
        const titleIcon = document.createElement('span');
        titleIcon.className = 'material-symbols-outlined title-icon';
        titleIcon.textContent = 'titlecase';
        labelTitle.appendChild(titleIcon);
        const pubTitle = document.createElement('p');
        pubTitle.className = 'pub-title';
        pubTitle.textContent = publication.titulo || 'N/A';

        //?Se crea el texto con el ID
        const labelId = document.createElement('h2');
        labelId.className = 'pubLabels';
        labelId.textContent = 'ID';
        const idIcon = document.createElement('span');
        idIcon.className = 'material-symbols-outlined id-icon';
        idIcon.textContent = 'verified';
        labelId.appendChild(idIcon);
        const pubId = document.createElement('p');
        pubId.className = 'pub-id';
        pubId.textContent = `${publication.id_generado}`;

        //? Se agregan los elementos de texto a su contenedor
        textCont.appendChild(imgCont);
        textCont.appendChild(labelTitle);
        textCont.appendChild(pubTitle);
        textCont.appendChild(labelId);
        textCont.appendChild(pubId);

        //?Se agregan los elementos al contenedor de cada publicación
        pubCont.appendChild(textCont);
        pubCont.appendChild(buttonsCont);

        //? Se agrega el contenedor de la publicación al contenedor principal
        mainPubsCont.appendChild(pubCont);

    });

    pubsContainer.appendChild(mainPubsCont);

    let paginationCont = document.querySelector('.pagination-cont');
    if(!paginationCont){
        paginationCont = document.createElement('div');
        paginationCont.className = 'pagination-cont';
        pubsContainer.appendChild(paginationCont);
    }
}

//* Se generá un random ID para la publicación a crear
const generateRandomID = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const lenght = 20;
    for(let i = 0; i < lenght; i++){
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

const deletePublications =  async () => {
    const selectedRows = getSelectedRows();
    if(selectedRows.length === 0){
        const feedBackText = document.getElementById('feedback-text');
        showFeedbackModal();
        feedBackText.textContent = "No hay publicaciones seleccionadas";
        return;
    }

    try{
        const deletePromises = selectedRows.map(async index => {
            const publication = await getIdPublication(index);
            if(publication && publication.id){
                return await deleteDoc(doc(db, "publicaciones", publication.id));
            }
        });
        await Promise.all(deletePromises);
        console.log('Todos las publicaciones seleccionadass han sido eliminadas correctamente');
    }catch(error){
        console.error('Ocurrio un error al intentar eliminar las publicaciones: ', error);
    }
};

const getSelectedRows = () => {
    const divs = document.querySelectorAll('.pubs-container .pub-cont');
    const selectedRows = [];
    divs.forEach((div, index) => {
        const box = div.querySelector('.select-delete-btn');
        if(box.textContent === 'check_box'){
            selectedRows.push(index);
        }
    });
    return selectedRows;
};

const getIdPublication = async (index) => {
    try{
        const publications = await loadPublicationsData();
        return publications[index];
    }catch(error){
        console.error('Error al obtener el id de la publicación: ', error);
        return null;
    }
};

//* Función para mostrar el Feedback modal
const showFeedbackModal = () => {
    const feedbackModal = document.getElementById('feedback-modal');
    const modal = document.getElementById('modal');
    feedbackModal.classList.add('show');
    setTimeout(() => {
        feedbackModal.classList.remove('show');
        modal.classList.remove('show');
    }, 3000);
};