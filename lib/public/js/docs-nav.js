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
        tagName: navEl.tagName,
        elementList: contentEl.querySelectorAll('h1, h2, h3, h4, h5, h6'),
        makeNavListItem: (el) => {

            el = el.cloneNode(true);

            const anchor = el.removeChild(el.querySelector('a'));
            const indent = Number(el.tagName.replace('H', ''));

            return internals.render(
                internals.item(el.innerHTML, anchor.href, indent)
            );
        }
    });

    navbar.classList.add('markdown-body');

    return navEl.parentNode.replaceChild(navbar, navEl);
};

internals.item = (innerHTML, href, indent) => (
    `<a href="${href}" class="nav-item indent-${indent}">
        ${innerHTML}
    </a>`
);

internals.render = (html) => {

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;

    return wrapper.firstChild;
};
