'use strict';

console.log('Hello, pals!');

const setActiveNavItems = () => {

    const list = document.getElementsByClassName('nav__item');
    const length = list.length;
    const currentPage = window.location.href;

    let iterator;
    for (iterator = 0; iterator < length; ++iterator) {
        const item = list[iterator];
        if (item.href === currentPage) {
            item.classList.add('nav__item--active');
        }
    }
};

setActiveNavItems();
