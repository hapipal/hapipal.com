'use strict';

console.log('Hello, pals!');

const setActiveNavItems = () => {

    const list = document.getElementsByClassName('nav__item');
    const currentPage = window.location.href;

    for (let iterator = 0; iterator < list.length; ++iterator) {
        const item = list[iterator];
        if (item.href === currentPage) {
            item.classList.add('nav__item--active');
        }
    }
};

const newsletterSubmit = () => {

    const form = document.getElementById('newsletterForm');
    form.onsubmit = (e) => {

        e.preventDefault();
        const emailInput = document.getElementById('newsletterEmail');
        const message =  document.getElementById('newsletterMessage');

        if (emailInput.validity.valid){
            const payload = {
                email: emailInput.value,
                status: 'subscribed'
            };
            //TODO: have this hit an internal server call to mailchimp, with Authorization
            console.log('make api call here', payload, 'https://us17.api.mailchimp.com/3.0/lists/4123041e5d/members');
            emailInput.value = null;
            form.style.display = 'none';
            message.style.display = 'block';
        }
        // You must return false to prevent the default form behavior
        return false;
    };
};

setActiveNavItems();
newsletterSubmit();
