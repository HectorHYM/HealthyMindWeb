export const changeIcon = (cell) => {
    if(cell.textContent === 'check_box_outline_blank'){
        cell.textContent = 'check_box';
    }else{
        cell.textContent = 'check_box_outline_blank';
    }
};

export const createPopUps = () => {
    document.addEventListener('click', function(e) {
        const currentPopup = e.target.matches('.actions') ? e.target.nextElementSibling : null;
        let activePopup = false;
        document.querySelectorAll('.pop-up').forEach(popup => {
            if(currentPopup === popup){
                const isVisible = popup.style.display === 'block';
                popup.style.display = isVisible ? 'none' : 'block';
                if(!isVisible){
                    const popupWidth = popup.offsetWidth;
                    const popupHeight = popup.offsetHeight;
                    const windowWidth = window.innerWidth;
                    const windowHeight = window.innerHeight;
                    const left = e.pageX + popupWidth > windowWidth ? (windowWidth - popupWidth) : e.pageX;
                    popup.style.left = `${left}px`;
                    const top = e.pageY + popupHeight > windowHeight ? (windowHeight - popupHeight) : e.pageY;
                    popup.style.top = `${top}px`;
                }
                activePopup = true;
            }else{
                popup.style.display = 'none';
            }
        });
        
        if(!currentPopup && !e.target.closest('.pop-up') && !activePopup){
            document.querySelectorAll('.pop-up').forEach(popup => {
                popup.style.display = 'none';
            });
        }
    });
};