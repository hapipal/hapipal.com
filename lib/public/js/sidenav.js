'use strict';
/* global document */

const ScrollIntoViewIfNeeded = require('scroll-into-view-if-needed');
const Navbar = require('./vendor/navbar');

const internals = {};

const FIXED_HEADER_HEIGHT = 60;
const TOP_PADDING = 10;

exports.init = (contentEl, navEl) => {

    if (!contentEl) {
        return;
    }

    if (!navEl) {
        throw new Error('Sidenav content element exists, but not the nav element.');
    }

    const hashState = new internals.HashState();

    const navbar = Navbar({
        tagName: navEl.tagName,
        elementList: contentEl.querySelectorAll('h1, h2, h3, h4, h5, h6'),
        makeNavListItem: (el) => {

            el = el.cloneNode(true);

            const anchor = el.removeChild(el.querySelector('a'));
            const indent = Number(el.tagName.replace('H', ''));

            return internals.render(
                internals.item(el.innerHTML, anchor.hash, indent)
            );
        },
        onScroll: (navItem) => {

            if (window.location.hash !== navItem.hash && !hashState.autoScrolling && !hashState.firstScroll) {
                hashState.hashChangeFromScroll();
                window.location = navItem.href;
            }

            hashState.scrolled();
        }
    });

    navbar.classList.add('markdown-body');
    navbar.classList.add('sidenav__sections');

    const handleHash = () => {

        internals.maybeScrollToHash(window.location.hash, navbar, hashState);
    };

    window.addEventListener('hashchange', handleHash);
    window.addEventListener('load', handleHash);

    return navEl.parentNode.replaceChild(navbar, navEl);
};

internals.HashState = class HashState {

    constructor() {

        this.autoScrolling = 0;
        this.fromScroll = false;
        this.firstScroll = true;
    }

    scrolled() {

        this.firstScroll = false;
    }

    hashChangeFromScroll() {

        this.fromScroll = true;
    }

    handledChange() {

        this.fromScroll = false;
    }

    startAutoScrolling() {

        this.autoScrolling++;
    }

    stopAutoScrolling() {

        this.autoScrolling--;
    }
};

internals.maybeScrollToHash = (hash, navbar, hashState) => {

    const anchor = hash && document.querySelector(`a.anchor[href="${hash}"]`);
    const navItem = (hash && navbar.querySelector(`a.sidenav__section-item[href="${hash}"]`)) || navbar.querySelector('.sidenav__section-item');

    if (navItem) {
        internals.selectNavItem(navItem);

        // Don't jump the nav scroll when the user is using the nav
        if (!navbar.parentNode.matches(':hover')) {
            ScrollIntoViewIfNeeded(navItem, { boundary: navbar.parentNode });
        }
    }

    if (anchor && !hashState.fromScroll) {
        hashState.startAutoScrolling();
        anchor.scrollIntoView();

        // Ensure element is visible
        if (anchor.getBoundingClientRect().top < (FIXED_HEADER_HEIGHT + TOP_PADDING)) {
            window.scrollBy(0, -(FIXED_HEADER_HEIGHT + TOP_PADDING));
        }

        setTimeout(() => hashState.stopAutoScrolling(), 50);
    }

    hashState.handledChange();
};

internals.selectNavItem = (navItem) => {

    const lastNavItem = navItem.parentNode.querySelector(':scope > .sidenav__section-item--active');

    if (lastNavItem) {
        lastNavItem.classList.remove('sidenav__section-item--active');
    }

    navItem.classList.add('sidenav__section-item--active');
};

internals.item = (innerHTML, href, indent) => (
    `<a href="${href}" class="sidenav__section-item sidenav__section-item--indent-${indent}">
        ${innerHTML}
    </a>`
);

internals.render = (html) => {

    const wrapper = document.createElement('div');
    wrapper.innerHTML = html;

    return wrapper.firstChild;
};
