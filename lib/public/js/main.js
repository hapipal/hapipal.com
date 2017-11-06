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

    if (!form) {
        return;
    }

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
                    message.innerHTML = 'Your email address: ' + emailInput.value + ', is now signed up. Thanks pal!';
                    emailInput.value = null;
                    form.style.display = 'none';
                    message.style.display = 'block';
                }
                else if (xhr.status === 400) {
                    message.innerHTML = 'The email address: ' + emailInput.value + ' is either invalid, or may already be subscribed.';
                    emailInput.value = null;
                    emailInput.classList.add('newsletter__input--invalid');
                    form.style.display = 'block';
                    message.style.display = 'block';
                }
                else {
                    message.innerHTML = 'The email address: ' + emailInput.value + ' may be invalid, or your network connection is inactive';
                    emailInput.value = null;
                    emailInput.classList.add('newsletter__input--invalid');
                    form.style.display = 'block';
                    message.style.display = 'block';
                }
            };
            xhr.send(payload);
        }
    };
};

const palToClipboard = () => {

    const element = document.getElementById('codeBox');
    if (!element){
        return;
    }
    element.onclick = () => {

        const codeElement = document.getElementById('code');
        document.getElementById('codeCopied').classList.add('code__copied--success');
        codeElement.select();
        document.execCommand('Copy');

    };
};

window.onhashchange = () => {

    document.querySelector('a[href="' + window.location.hash + '"]').scrollIntoView();
};

window.onload = () => {

    if (window.location.hash) {
        document.querySelector('a[href="' + window.location.hash + '"]').scrollIntoView();
    }
};

setActiveNavItems();
newsletterSubmit();
palToClipboard();
