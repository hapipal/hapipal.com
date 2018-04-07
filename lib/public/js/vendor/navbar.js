'use strict';
/* global document, window */

/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2017 Mark S. Everitt
 * Copyright (c) 2018 Devin Ivy [modified from https://github.com/qubyte/navbar]
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

let supportsPassive = false;

try {

    const opts = Object.defineProperty({}, 'passive', {
        get() {

            supportsPassive = true;
        }
    });

    window.addEventListener('test', null, opts);
}
catch (e) {}

const createAndAppendListItems = (navList, elementList, makeNavListItem) => {

    const pairs = [];

    // Create list elements
    for (let i = 0; i < elementList.length; ++i) {
        const element = elementList[i];
        const li = makeNavListItem(element);

        navList.appendChild(li);

        pairs.push({ element, navElement: li });
    }

    return pairs;
};

const makeHandleScroll = (pairs, onScrollHook, debounceTime) => {

    const handleScroll = () => {

        let frontRunnerIndex;
        let closestDist = Infinity;

        for (let i = 0; i < pairs.length; ++i) {
            const pair = pairs[i];
            const absDist = Math.abs(pair.element.getBoundingClientRect().top);

            // If this element is not the front runner for top, deactivate it.
            if (absDist > closestDist) {
                continue;
            }

            frontRunnerIndex = i;
            closestDist = absDist;
        }

        if (onScrollHook) {
            onScrollHook(pairs[frontRunnerIndex].navElement);
        }
    };

    // The default behaviour is no debounce.
    if (typeof debounceTime !== 'number' || isNaN(debounceTime)) {
        return handleScroll;
    }

    let timeout;

    const nullifyTimeout = () => {

        timeout = null;
    };

    return () => {

        if (timeout) {
            return;
        }

        // Immediately use handleScroll to calculate.
        handleScroll();

        // No further calls to handleScroll until debounceTime has elapsed.
        timeout = setTimeout(nullifyTimeout, debounceTime);
    };
};

const addScrollListener = (target, handleScroll) => {

    const scrollHandleWrapper = (evt) => {

        if (evt.target === target) {
            handleScroll();
        }
    };

    if (target.addEventListener) {
        target.addEventListener('scroll', scrollHandleWrapper, supportsPassive ? { passive: true } : false);
    }
    else if (target.attachEvent) {
        target.attachEvent('onscroll', scrollHandleWrapper);
    }
    else {
        throw new Error('This browser does not support addEventListener or attachEvent.');
    }

    // To calculate the initial active list element.
    handleScroll();
};

module.exports = (options) => {

    if (!options || !options.elementList || !options.makeNavListItem) {
        throw new Error('Options object with elementList and makeNavListItem must be provided.');
    }

    const navbar = document.createElement(options.tagName || 'nav');
    const navList = document.createElement('ul');

    // The target defaults to window.
    const target = options.target || document;

    // Create list elements
    const pairs = createAndAppendListItems(navList, options.elementList, options.makeNavListItem);

    // Whenever the window is scrolled, recalculate the active list element. Compatible with older
    // versions of IE.
    addScrollListener(target, makeHandleScroll(pairs, options.onScroll, options.debounceTime));

    navbar.appendChild(navList);

    return navbar;
};
