'use strict';
/* global document, window, XMLHttpRequest */

const DocsNav = require('./docs-nav');

DocsNav.init(
    document.querySelector('.docs-detail .wrapper'),
    document.querySelector('.docs-detail .nav-target')
);

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

const scrollToElement = (selector) => {

    const top = {
        box: document.querySelector(selector).getBoundingClientRect().top,
        scroll: window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop,
        client: document.documentElement.clientTop || document.body.clientTop || 0
    };
    window.scrollTo(0, Math.round(top.box + top.scroll - top.client));
};

window.onhashchange = () => {

    scrollToElement('a[href="' + window.location.hash + '"]');
};

window.onload = () => {

    if (window.location.hash) {
        scrollToElement('a[href="' + window.location.hash + '"]');
    }
};

setActiveNavItems();
newsletterSubmit();
