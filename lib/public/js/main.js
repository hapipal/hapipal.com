'use strict';
/* global document, window, XMLHttpRequest */

const DocsNav = require('./docs-nav');
const Hammer = require('hammerjs');

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

    const menuButton = document.querySelector('.l-navigablecontent__control-item--left');
    const topButton = document.querySelector('.l-navigablecontent__control-item--right');
    const docsNav = document.querySelector('.l-navigablecontent__nav');

    console.log(menuButton,
topButton,
docsNav);
    if (!menuButton || !topButton || !docsNav) {
        return;
    }

    const docsNavLinks = docsNav.querySelectorAll('.nav-item');

    const isMobile = () => window.getComputedStyle(menuButton.parentNode).getPropertyValue('display') !== 'none';
    const docsNavIsOpen = () => docsNav.classList.contains('l-navigablecontent__nav--open');
    const toggleDocsNav = () => {

        if (!isMobile()) {
            return;
        }

        if (docsNavIsOpen()) {
            document.body.classList.remove('body--noscroll');
            docsNav.classList.remove('l-navigablecontent__nav--open');
            return;
        }

        document.body.classList.add('body--noscroll');
        docsNav.classList.add('l-navigablecontent__nav--open');
    };

    menuButton.addEventListener('click', toggleDocsNav);

    Array.from(docsNavLinks).forEach(
        (link) => link.addEventListener('click', toggleDocsNav)
    );

    topButton.addEventListener('click', () => {

        if (docsNavIsOpen()) {
            toggleDocsNav();
        }

        return window.scrollTo(0, 0);
    });

    new Hammer(docsNav).on('swipeleft', toggleDocsNav);
};

const changePackageVersion = () => {

    const select = document.getElementById('version');

    if (!select){
        return;
    }

    select.addEventListener('change', (option) => {

        window.location.search = 'v=' + option.srcElement.value;
    });
};

setActiveNavItems();
newsletterSubmit();
docsNavMobileActions();
changePackageVersion();
