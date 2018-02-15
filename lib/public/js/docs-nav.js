'use strict';
/* global document */

const Navbar = require('navbar');

const internals = {};

exports.init = (contentEl, navEl) => {

    if (!contentEl) {
        return;
    }

    if (!navEl) {
        throw new Error('Docs navigation content element exists, but not the nav element.');
    }

    const navbar = Navbar({
        elementList: contentEl.querySelectorAll('h1, h2, h3, h4, h5, h6'),
        makeNavListItem: (el) => {

            const text = el.textContent.trim();

            const item = internals.render(
                internals.item(text, el.tagName.replace('H', 'indent-'))
            );

            item.addEventListener('click', () => el.scrollIntoView({ block: 'start', behavior: 'smooth' }));

            return item;
        }
    });

    return navEl.appendChild(navbar);
};

internals.item = (text, indent) => `<div class="nav-item ${indent}">${text}</div>`;

internals.render = (html) => {

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;

    return wrapper.firstChild;
};
