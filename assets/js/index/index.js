function showContentView (content_id){
    const contentViews = document.querySelectorAll('.content-panel');

    contentViews.forEach(view => {view.classList.remove('active');});
    document.getElementById(content_id).classList.add('active');
}

function setupAboutSection(){
    const aboutOptions = document.querySelectorAll('.about-option');
    aboutOptions.forEach(option => {
        option.addEventListener('click', () => {
            aboutOptions.forEach(option => {option.classList.remove('active');});
            option.classList.add('active');

            const selectedOption = option.dataset.option;
            showContentView(selectedOption);
        });
    });
}

function setupOtherInfoSection(){
    const otherInfoOptions = document.querySelectorAll('.other-info-item');
    otherInfoOptions.forEach(option => {
        option.addEventListener('click', () => {
            const allOptionHeaders = document.querySelectorAll('.other-info-header');
            const allOptionBodies = document.querySelectorAll('.other-info-body');

            const activeOptionHeader = document.querySelector('.other-info-header.active');

            allOptionHeaders.forEach(header => {header.classList.remove('active');});
            allOptionBodies.forEach(body => {body.classList.remove('active');});

            const selectedOptionHeader = option.querySelector('.other-info-header');
            const selectedOptionBody = option.querySelector('.other-info-body');

            if (selectedOptionHeader !== activeOptionHeader) {
                selectedOptionHeader.classList.add('active');
                selectedOptionBody.classList.add('active');
            }
        });
    });
}

function innit(){
    setupAboutSection();
    setupOtherInfoSection();
}

document.addEventListener('DOMContentLoaded', innit);