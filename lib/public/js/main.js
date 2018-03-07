'use strict';
/* global document, window, XMLHttpRequest */

const Sidenav = require('./sidenav');
const Hammer = require('hammerjs');

Sidenav.init(
    document.querySelector('.docs-detail-page .main .wrapper'),
    document.querySelector('.docs-detail-page .main .sidenav__target')
);

Sidenav.init(
    document.querySelector('.best-practices-detail-page .main .wrapper'),
    document.querySelector('.best-practices-detail-page .main .sidenav__target')
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

                switch (xhr.status) {

                    case 200:
                        message.innerHTML = 'Your email address: ' + emailInput.value + ', is now signed up. Thanks pal!';
                        emailInput.value = null;
                        form.style.display = 'none';
                        message.style.display = 'block';
                        break;
                    case 400:
                        message.innerHTML = 'The email address: ' + emailInput.value + ' is either invalid, or may already be subscribed.';
                        emailInput.value = null;
                        emailInput.classList.add('newsletter__input--invalid');
                        form.style.display = 'block';
                        message.style.display = 'block';
                        break;
                    default:
                        message.innerHTML = 'The email address: ' + emailInput.value + ' may be invalid, or your network connection is inactive';
                        emailInput.value = null;
                        emailInput.classList.add('newsletter__input--invalid');
                        form.style.display = 'block';
                        message.style.display = 'block';
                        break;
                };
            };
            xhr.send(payload);
        }
    };
};

const docsNavMobileActions = () => {

    const menuButton = document.querySelector('.l-navigablecontent__control-item--left');
    const topButton = document.querySelector('.l-navigablecontent__control-item--right');
    const docsNav = document.querySelector('.l-navigablecontent__nav');

    if (!menuButton || !topButton || !docsNav) {
        return;
    }

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

    const docsNavLinks = docsNav.querySelectorAll('.sidenav__section-item');

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

const palToClipboard = () => {

    const element = document.getElementById('codeBox');
    const button = document.getElementById('codeBoxButton');
    const input = document.getElementById('code');

    if (!element || !button || !input){
        return;
    }

    element.onclick = () => {

        input.select();
    };

    button.onclick = () => {

        const tooltip = document.getElementsByClassName('tooltip__text')[0];
        input.select();
        document.execCommand('Copy');
        tooltip.innerHTML = 'Code copied';

        button.onmouseleave = () => {

            tooltip.innerHTML = 'Copy to clipboard';
        };
    };
};

setActiveNavItems();
newsletterSubmit();
docsNavMobileActions();
changePackageVersion();
palToClipboard();
