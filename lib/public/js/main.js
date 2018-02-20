'use strict';
/* global document, window, XMLHttpRequest */

const DocsNav = require('./docs-nav');

DocsNav.init(
    document.querySelector('.docs-detail .wrapper'),
    document.querySelector('.docs-detail .nav-target')
);

const setActiveNavItems = () => {

    const list = document.getElementsByClassName('nav__item');
    const currentPage = window.location.pathname.split('/')[1];

    for (let i = 0; i < list.length; ++i) {
        const item = list[i];
        if (item.pathname.split('/')[1] === currentPage) {
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

const docsNavMobileActions = () => {

    const menuButton = document.querySelector('.nav-item__left');
    const topButton = document.querySelector('.nav-item__right');
    const docsNav = document.querySelector('.docs-nav');

    const docsNavIsOpen = () => docsNav.classList.contains('docs-nav--open');
    const toggleDocsNav = () => {

        if (docsNavIsOpen()) {
            document.body.classList.remove('body--noscroll');
            docsNav.classList.remove('docs-nav--open');
            return;
        }

        document.body.classList.add('body--noscroll');
        docsNav.classList.add('docs-nav--open');
    };

    menuButton.addEventListener('click', toggleDocsNav);
    topButton.addEventListener('click', () => {

        if (docsNavIsOpen()) {
            toggleDocsNav();
        }

        return window.scrollTo(0,0);
    });
};

setActiveNavItems();
newsletterSubmit();
docsNavMobileActions();
