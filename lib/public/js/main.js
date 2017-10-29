'use strict';
/* global document, window */

console.log('Hello, pals!');

const setActiveNavItems = () => {

    const list = document.getElementsByClassName('nav__item');
    const currentPage = window.location.href;

    for (let i = 0; i < list.length; ++i) {
        const item = list[i];
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
        const message = document.getElementById('newsletterMessage');

        if (emailInput.validity.valid) {
            const payload = JSON.stringify({
                email: emailInput.value
            });
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/mailchimp');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = () => {

                if (xhr.status === 200) {
                    message.innerHTML = 'You are now signed up, pal!';
                    emailInput.value = null;
                    form.style.display = 'none';
                    message.style.display = 'block';
                }
                if (xhr.status === 400) {
                    message.innerHTML = 'The email is invalid, or you must already be subscribed, pal! ', +xhr.responseText;
                    form.style.display = 'block';
                    message.style.display = 'block';
                }
            };
            xhr.send(payload);
        }
    };
};

setActiveNavItems();
newsletterSubmit();
