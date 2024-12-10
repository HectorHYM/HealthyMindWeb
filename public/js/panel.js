import { getAuth, signOut, onAuthStateChanged} from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js'
import { getFirestore, doc, getDoc, collection, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-firestore.js";
import { app } from './firebase-config.js';

const auth = getAuth(app);
const db = getFirestore(app);

//*Guardado de estado de sesión
onAuthStateChanged(auth, (user) => {
    console.log("Estado de autenticación cambiado:", user);
    if(!user){
        window.location.href = "../index.html";
    }
});

document.addEventListener("DOMContentLoaded", async () => {

    loadTheme();
    setTimeout(() => {
        console.log("Tabla lista, llamando a loadFont");
        loadFont();
    }, 0); //? Permite que el DOM se actualice

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

    const urlParams = new URLSearchParams(window.location.search);
    const registerId = urlParams.get('id');
    fillDetails(registerId);

    //* Se muestra el modal de pagos al presionar su elemento
    document.querySelector('.icon-citas').addEventListener('click', () => {
        showPaymentsModal(registerId);
    });

    //* Se muestra el modal de los detalles del pago/cita previamente seleccionada
    document.getElementById('paymentsList').addEventListener('click', (e) => {
        if (e.target && e.target.matches('li.pay-element')) {
            const paymentId = e.target.getAttribute('data-id');
            showPaymentDetailsModal(paymentId);
        }
    });

    //*Barra de busqueda para las fechas
    setupSearch(registerId);

    if(registerId){
        try{
            const dates = await getScheduleDates(registerId);
            fillDatesTable(dates, registerId);
        }catch(error){
            console.error("Error al obtener las fechas de la agenda", error);
        }
    }else{
        console.error("No se ha proporcionado ningún id desde la URL");
    }

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

const loadTheme = () => {
    const themeLink = document.getElementById('theme-link');
    const sidebarTheme = document.getElementById('sidebar-theme');

    if(localStorage.getItem('darkMode') === 'enabled'){
        themeLink.href = '../css/panel-dm.css';
        sidebarTheme.href = '../css/sidebar.css';
    }else if(localStorage.getItem('neutralMode') === 'enabled'){
        themeLink.href = '../css/panel-nm.css';
        sidebarTheme.href = '../css/sidebar-nm.css';
    }else{
        themeLink.href = '../css/panel.css';
        sidebarTheme.href = '../css/sidebar.css';
    }
};

const loadFont = () => {
    const txtDetails = document.getElementById('txtdetails');
    const txtWelcome = document.getElementById('txtwelcome');
    const txtWarning = document.getElementById('txtwarning');
    const detailsTxt = document.querySelectorAll('.details');
    const panelText = document.getElementById('panel-text');
    const ths = document.querySelectorAll('th');
    const tds = document.querySelectorAll('td');
    const titleDates = document.getElementById('title-dates');
    const toggles = document.querySelectorAll('.toggle');
    const elements = [txtDetails, txtWelcome, txtWarning, ...detailsTxt, panelText, ...ths, ...tds, titleDates];

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

//* Controlador para la barra de busqueda
const setupSearch = (registerId) => {
    const searchInput = document.querySelector('.search-input');
    searchInput.addEventListener('keyup', (e) => {
        if(e.key === "Enter"){
            handleSearch(registerId);
        }
    });
};


//* Logica para la busqueda de fechas
const handleSearch = async (registerId) => {
    const searchInput = document.getElementById('search-input');
    const searchText = searchInput.value.toLowerCase().trim();
    if(!searchText){
        clearContainers();
        setupTabsWithContent(registerId);
        return; //?Detenemos la ejecución de la función debido a que no hay texto que buscar
    }

    const allData = await getScheduleDates(registerId);
    console.log(allData);
    const dateFormat = allData.map(data => comparisonDateFormat(data));
    console.log(dateFormat);
    const filteredData = dateFormat.filter(data => { //?Filtrado de datos para la busqueda de usuarios
        return data.toLowerCase().includes(searchText.toLowerCase()); //?Regresa los datos que cumplan con las condiciones impuestas
    });
    console.log(filteredData);

    if(filteredData.length > 0){
        displaySearchResults(filteredData, registerId);
    }else{
        noResults();
    }
};

const comparisonDateFormat = (dateId) => {
    const normalizedDateId = dateId.padStart(8, '0');
    const formattedDate = formatDate(normalizedDateId);
    return formattedDate;
}


//*Función para limpiar los contenedores
const clearContainers = () => {
    const contentContainer = document.getElementById('dates-body');
    contentContainer.innerHTML = ``;
};

//*Función para colocar las pestañas y el contenido principal de estas
export const setupTabsWithContent = async (registerId) => {
    const dates = await getScheduleDates(registerId);
    fillDatesTable(dates, registerId);
};

//*Muestra los resultados de la busqueda de usuarios
const displaySearchResults = (filteredData, registerId) => {
    //*Se llena la tabla con las fechas
    const tableBody = document.querySelector('#dates-table tbody');
    clearContainers();
    filteredData.forEach(dateId => {
        console.log(dateId);
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.className = 'date-cell'; 
        cell.textContent = dateId;
        cell.classList.add('lexend-regular');
        row.appendChild(cell);
        const originalId = formatDateReverse(dateId);
        row.addEventListener('click', () => showModal(originalId, registerId));
        tableBody.appendChild(row);
    });
};

//* Función para convertir String a formato "16092024"
const formatDateReverse = (dateString) => {
    const parts = dateString.match(/(\d{2}) de (\w+) del año (\d{4})/);
    
    const meses = {
        enero: '01',
        febrero: '02',
        marzo: '03',
        abril: '04',
        mayo: '05',
        junio: '06',
        julio: '07',
        agosto: '08',
        septiembre: '09',
        octubre: '10',
        noviembre: '11',
        diciembre: '12'
    };

    const day = parts[1]; // Día
    const month = meses[parts[2].toLowerCase()]; // Mes en número
    const year = parts[3]; // Año

    // Retorna la fecha en formato "DDMMYYYY"
    return `${day}${month}${year}`;
};

//*Se manda un mensaje de falta de coincidencias en caso de no haber un dato con la busqueda ingresada
const noResults = () => {
    const contentContainer = document.getElementById('dates-body');
    contentContainer.innerHTML = `<div class="lexend-semibold noresults-div">No se encontraron coincidencias</div>`;
};

//*LLenado de datos de los detalles de especialista
const fillDetails = async (registerId) => {
    if(registerId){
        try{
            const docRef = doc(db, 'users-especialista', registerId);
            const docSnap = await getDoc(docRef);

            if(docSnap.exists()){
                const data = docSnap.data();
                const profileImage = document.getElementById('img-perfil');
                const methodsCont = document.getElementById('methods-data-cont');
                const formationsCont = document.getElementById('formations-data-cont');
                const languagesCont = document.getElementById('languages-data-cont');
                const bankingCont = document.getElementById('banking-data-cont');
                const methods = data.metodos;
                const formations = data.formacion;
                const languages = data.idiomas;
                const bankingData = data.banca;
                profileImage.src = data.foto_personal || '../assets/img/logo.png';

                document.querySelector('.detail-curp').textContent = registerId || 'N/A';
                document.querySelector('.detail-cash').textContent = `$${data.dineroDisponible}` || 'N/A';
                document.querySelector('.detail-nombre').textContent = data.nombres || 'N/A';
                document.querySelector('.detail-apellido').textContent = data.apellido_p + " " + data.apellido_m || 'N/A';
                document.querySelector('.detail-email').textContent = data.email || 'N/A';

                const methodsCode = {
                    'A1': "Trastornos de ansiedad",
                    'A2': "Depresión",
                    'A3': "Problemas familiares",
                    'A4': "Estrés postraumático",
                    'A5': "Trastornos de la alimentación",
                    'A6': "Problemas de pareja",
                    'A7': "Adicciones",
                    'A8': "Problemas de autoestima",
                    'A9': "Trastornos del sueño",
                    'A10': "Trastorno obsesivo-compulsivo (TOC)",
                    'A11': "Trastornos del desarrollo",
                    'A12': "Dificultades de aprendizaje",
                    'A13': "Problemas de manejo de la ira",
                    'A14': "Duelos y perdidas",
                    'A15': "Bienestar psicológico"
                };

                methods.forEach(method => {
                    const methodText = document.createElement('p');
                    methodText.className = 'lexend-semibold detail-especialidad details';
                    methodText.textContent = methodsCode[method] || 'N/A';
                    methodsCont.appendChild(methodText);
                    setTimeout(() => {
                        console.log("Tabla lista, llamando a loadFont");
                        loadFont();
                    }, 0); //? Permite que el DOM se actualice
                
                });

                document.querySelector('.detail-cedula').textContent = data.cedula || 'N/A';
                document.querySelector('.detail-typecedula').textContent = data.tipoCedula || 'N/A';

                bankingData.forEach(banking => {
                    const bankingText = document.createElement('p');
                    bankingText.className = 'lexend-semibold detail-banking details';
                    bankingText.textContent = banking || 'N/A';
                    bankingCont.appendChild(bankingText);
                    setTimeout(() => {
                        console.log("Tabla lista, llamando a loadFont");
                        loadFont();
                    }, 0); //? Permite que el DOM se actualice
                
                });

                document.querySelector('.detail-telefono').textContent = data.telefono || 'N/A';
                document.querySelector('.detail-fechanac').textContent = data.fecha_nacimiento || 'N/A';
                document.querySelector('.detail-account').textContent = data.estado_cuenta || 'N/A';

                formations.forEach(formation => {
                    const formationText = document.createElement('p');
                    formationText.className = 'lexend-semibold detail-formation details';
                    formationText.textContent = formation || 'N/A';
                    formationsCont.appendChild(formationText);
                    setTimeout(() => {
                        console.log("Tabla lista, llamando a loadFont");
                        loadFont();
                    }, 0); //? Permite que el DOM se actualice
                
                });

                const languagesCode = {
                    'I1': 'Español',
                    'I2': 'Ingles',
                    'I3': 'Francés'
                };

                languages.forEach(language => {
                    const languageText = document.createElement('p');
                    languageText.className = 'lexend-semibold detail-language details';
                    languageText.textContent = languagesCode[language] || 'N/A';
                    languagesCont.appendChild(languageText);
                    setTimeout(() => {
                        console.log("Tabla lista, llamando a loadFont");
                        loadFont();
                    }, 0); //? Permite que el DOM se actualice
                
                });

            }else{
                console.error("No se encontro registro con ese ID");
            }
        }catch(error){
            console.error("Error al obtener el documento", error);
        }
    }else{
        console.error("No se proporciono el ID desde la URL");
    }
};

//* Función para obtener la lista de los pagos (citas realizadas)
const getPayments = async (registerId) => {
    const paymentsRef = collection(db, 'transacciones');
    const querySnapshot = await getDocs(paymentsRef); //? Se obtienen los documentos de transacciones

    const paymentsList = [];
    querySnapshot.forEach((doc) => {
        const specialistId = doc.data().id_especialista;
        if(specialistId === registerId){
            paymentsList.push({
                ...doc.data(),
                docId: doc.id
            });
        }
    });

    return paymentsList;
};

//* Función para abrir el modal y llenar la lista de los pagos realizados
const showPaymentsModal = async (registerId) => {
    const modalTitle = document.getElementById('modal-title');
    const paymentsList = document.getElementById('paymentsList');
    const modal = document.getElementById('paylist-modal');
    modal.classList.add('show');

    //* Añade el evento de cerrar al botón de cierre
    document.querySelector('.pay-close').addEventListener('click', () => closeModal(modal));

    window.onclick = function(event){
        if(event.target == modal){
            closeModal(modal);
        }
    };
    
    //* Se obtiene la lista de los pagos referentes al especialista actual
    const payments = await getPayments(registerId);
    
    //* Se llena la lista en el modal y se ocultan los modales no utilizados
    paymentsList.innerHTML = payments.map(pay => {
        const formattedDate = formatDateString(pay.fecha_cita);
        return `<li class="lexend-regular pay-element" data-id="${pay.docId}">${formattedDate}</li>`;
    }).join('');

    modalTitle.textContent = 'Lista de citas realizadas'; //? Se cambia el titulo del modal si es necesario
};

//* Función para abrir el modal con los detalles del pago/cita
const showPaymentDetailsModal = async (paymentId) => {
    const modal = document.getElementById('paydetail-modal');
    const preModal = document.getElementById('paylist-modal');
    const backModalBtn = document.getElementById('back-modal-btn');
    modal.classList.add('show');
    preModal.classList.remove('show');

    //*Boton de retorno al modal anterior
    backModalBtn.addEventListener('click', () => {
        modal.classList.remove('show');
        preModal.classList.add('show');
    });

    //* Añade el evento de cerrar al botón de cierre
    document.querySelector('.paydetail-close').addEventListener('click', () => closeModal(modal));

    window.onclick = function(event){
        if(event.target == modal){
            closeModal(modal);
        }

        if(event.target == preModal){
            closeModal(preModal);
        }
    };

    const dateText = document.getElementById('date-text');
    const payStateText = document.getElementById('pay-state-text');
    const payDateText = document.getElementById('pay-date-text');
    const scheduleText = document.getElementById('schedule-text');
    const namePacientText = document.getElementById('name-pacient-text');
    const meetCodeText = document.getElementById('meet-code-text');
    const totalPaymentText = document.getElementById('total-payment-text');
    const typePaymentText = document.getElementById('type-payment-text');

    //* Se obtiene el pago/cita seleccionada
    const paymentRef = doc(db, 'transacciones', paymentId);
    const paymentDoc = await getDoc(paymentRef);
    const payment = paymentDoc.data();

    dateText.textContent = payment.fecha_cita;
    payStateText.textContent = payment.estado_pago;
    payDateText.textContent = payment.pago_cita;
    scheduleText.textContent = payment.horario_cita;

    const pacientRef = doc(db, 'users-paciente', payment.id_paciente);
    const pacientDoc = await getDoc(pacientRef);
    const pacient = pacientDoc.data();
    namePacientText.textContent = pacient.nombres + " " + pacient.apellidos; //? Accedemos a la colección de los pacientes para obtener el nombre

    meetCodeText.textContent = payment.id_meet;
    totalPaymentText.textContent = payment.total;
    typePaymentText.textContent = payment.tipo_transaccion;
};

//*Se obtienen las fechas de la agenda
const getScheduleDates = async (registerId) => {
    const scheduleRef = collection(db, 'users-especialista', registerId, 'agenda');
    const snapshot = await getDocs(scheduleRef);
    const dates = snapshot.docs.map(doc => doc.id);
    return dates;
};

//*Se llena la tabla con las fechas
const fillDatesTable = (dates, registerId) => {
    const tableBody = document.querySelector('#dates-table tbody');
    dates.forEach(dateId => {
        const normalizedDateId = dateId.padStart(8, '0');
        const formattedDate = formatDate(normalizedDateId);
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.className = 'date-cell'; 
        cell.textContent = formattedDate;
        cell.classList.add('lexend-regular');
        row.appendChild(cell);
        row.addEventListener('click', () => showModal(dateId, registerId));
        tableBody.appendChild(row);
    });
};

//*Se convierte el id de las fechas a un formato legible
const formatDate = (dateId) => {
    const day = dateId.slice(0, -6);
    const month = dateId.slice(-6, -4);
    const year = dateId.slice(-4);

    const monthNames = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto",
    "septiembre", "octubre", "noviembre", "diciembre"];
    
    const monthName = monthNames[parseInt(month, 10) -1];

    return `Día ${day} de ${monthName} del año ${year}`;
};

const formatDateString = (dateString) => {
    const [day, month, year] = dateString.split('/'); //? Separa la fecha por "/"

    const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    
    const formattedDate = `Día ${day} de ${months[parseInt(month) - 1]} del año ${year}`;
    
    return formattedDate;
};

//* Se muestra el modal con la tabla de horarios y se muestran los datos
const showModal = async (dateId, registerId) => {
    document.getElementById('modal-title').textContent = 'Horarios'; //? Cambia el título al de horarios
    const modal = document.getElementById('modal');
    modal.classList.add('show');

    //* Añade el evento de cerrar al botón de cierre
    document.querySelector('.close').addEventListener('click', () => closeModal(modal));

    window.onclick = function(event){
        if(event.target == modal){
            closeModal(modal);
        }
    };

    const modalTableBody = document.querySelector('#modal-table tbody');
    modalTableBody.innerHTML = ``;
    const horariosRef = collection(db, 'users-especialista', registerId, 'agenda', dateId, 'horarios');
    const snapshot = await getDocs(horariosRef);

    snapshot.forEach(doc => {
        const data = doc.data();
        const row = document.createElement('tr');
        row.className = 'schedule-row';
        const stateCell = document.createElement('td');
        stateCell.className = 'data-schedule-cell';
        stateCell.classList.add('lexend-regular');
        stateCell.textContent = data.estado || 'No disponible';
        const startTimeCell = document.createElement('td');
        startTimeCell.className = 'data-schedule-cell';
        startTimeCell.classList.add('lexend-regular');
        startTimeCell.textContent = data.hora_inicial || 'N/A'; 
        const finalTimeCell = document.createElement('td');
        finalTimeCell.className = 'data-schedule-cell';
        finalTimeCell.classList.add('lexend-regular');
        finalTimeCell.textContent = data.hora_final || 'N/A'; 
        const priceCell = document.createElement('td');
        priceCell.className = 'data-schedule-cell';
        priceCell.classList.add('lexend-regular');
        priceCell.textContent = `$${data.precio}` || 'N/A';

        row.appendChild(stateCell);
        row.appendChild(startTimeCell);
        row.appendChild(finalTimeCell);
        row.appendChild(priceCell);
        modalTableBody.appendChild(row);
    });
};

const closeModal = (modal) => {
    modal.classList.remove('show');
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