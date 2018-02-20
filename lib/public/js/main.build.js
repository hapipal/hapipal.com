(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
/* global document */

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ScrollIntoViewIfNeeded = require('scroll-into-view-if-needed');
var Navbar = require('./vendor/navbar');

var internals = {};

var FIXED_HEADER_HEIGHT = 80;
var TOP_PADDING = 35;

exports.init = function (contentEl, navEl) {

    if (!contentEl) {
        return;
    }

    if (!navEl) {
        throw new Error('Docs navigation content element exists, but not the nav element.');
    }

    var hashState = new internals.HashState();

    var navbar = Navbar({
        tagName: navEl.tagName,
        elementList: contentEl.querySelectorAll('h1, h2, h3, h4, h5, h6'),
        makeNavListItem: function makeNavListItem(el) {

            el = el.cloneNode(true);

            var anchor = el.removeChild(el.querySelector('a'));
            var indent = Number(el.tagName.replace('H', ''));

            return internals.render(internals.item(el.innerHTML, anchor.hash, indent));
        },
        onScroll: function onScroll(navItem) {

            if (window.location.hash !== navItem.hash && !hashState.autoScrolling && !hashState.firstScroll) {
                hashState.hashChangeFromScroll();
                window.location = navItem.href;
            }

            hashState.scrolled();
        }
    });

    navbar.classList.add('markdown-body');

    var handleHash = function handleHash() {

        internals.maybeScrollToHash(window.location.hash, navbar, hashState);
    };

    window.addEventListener('hashchange', handleHash);
    window.addEventListener('load', handleHash);

    return navEl.parentNode.replaceChild(navbar, navEl);
};

internals.HashState = function () {
    function HashState() {
        _classCallCheck(this, HashState);

        this.autoScrolling = 0;
        this.fromScroll = false;
        this.firstScroll = true;
    }

    _createClass(HashState, [{
        key: 'scrolled',
        value: function scrolled() {

            this.firstScroll = false;
        }
    }, {
        key: 'hashChangeFromScroll',
        value: function hashChangeFromScroll() {

            this.fromScroll = true;
        }
    }, {
        key: 'handledChange',
        value: function handledChange() {

            this.fromScroll = false;
        }
    }, {
        key: 'startAutoScrolling',
        value: function startAutoScrolling() {

            this.autoScrolling++;
        }
    }, {
        key: 'stopAutoScrolling',
        value: function stopAutoScrolling() {

            this.autoScrolling--;
        }
    }]);

    return HashState;
}();

internals.maybeScrollToHash = function (hash, navbar, hashState) {

    var anchor = hash && document.querySelector('a.anchor[href="' + hash + '"]');
    var navItem = hash && navbar.querySelector('a.nav-item[href="' + hash + '"]') || navbar.querySelector('.nav-item');

    if (navItem) {
        internals.selectNavItem(navItem);
        ScrollIntoViewIfNeeded(navItem, { boundary: navbar.parentNode });
    }

    if (anchor && !hashState.fromScroll) {
        hashState.startAutoScrolling();
        anchor.scrollIntoView();

        // Ensure element is visible
        if (anchor.getBoundingClientRect().top < FIXED_HEADER_HEIGHT + TOP_PADDING) {
            window.scrollBy(0, -(FIXED_HEADER_HEIGHT + TOP_PADDING));
        }

        setTimeout(function () {
            return hashState.stopAutoScrolling();
        }, 50);
    }

    hashState.handledChange();
};

internals.selectNavItem = function (navItem) {

    var lastNavItem = navItem.parentNode.querySelector(':scope > .navbar-active');

    if (lastNavItem) {
        lastNavItem.classList.remove('navbar-active');
    }

    navItem.classList.add('navbar-active');
};

internals.item = function (innerHTML, href, indent) {
    return '<a href="' + href + '" class="nav-item indent-' + indent + '">\n        ' + innerHTML + '\n    </a>';
};

internals.render = function (html) {

    var wrapper = document.createElement('div');
    wrapper.innerHTML = html;

    return wrapper.firstChild;
};

},{"./vendor/navbar":3,"scroll-into-view-if-needed":4}],2:[function(require,module,exports){
'use strict';
/* global document, window, XMLHttpRequest */

var DocsNav = require('./docs-nav');

DocsNav.init(document.querySelector('.docs-detail .wrapper'), document.querySelector('.docs-detail .nav-target'));

var setActiveNavItems = function setActiveNavItems() {

    var list = document.getElementsByClassName('nav__item');
    var currentPage = window.location.pathname.split('/')[1];

    for (var i = 0; i < list.length; ++i) {
        var item = list[i];
        if (item.pathname.split('/')[1] === currentPage) {
            item.classList.add('nav__item--active');
        }
    }
};

var newsletterSubmit = function newsletterSubmit() {

    var form = document.getElementById('newsletterForm');

    if (!form) {
        return;
    }

    form.onsubmit = function (e) {

        e.preventDefault();

        var emailInput = document.getElementById('newsletterEmail');
        var message = document.getElementById('newsletterMessage');

        if (emailInput.validity.valid) {
            var payload = JSON.stringify({
                email: emailInput.value
            });
            var xhr = new XMLHttpRequest();
            xhr.open('POST', '/mailchimp');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.onload = function () {

                if (xhr.status === 200) {
                    message.innerHTML = 'Your email address: ' + emailInput.value + ', is now signed up. Thanks pal!';
                    emailInput.value = null;
                    form.style.display = 'none';
                    message.style.display = 'block';
                } else if (xhr.status === 400) {
                    message.innerHTML = 'The email address: ' + emailInput.value + ' is either invalid, or may already be subscribed.';
                    emailInput.value = null;
                    emailInput.classList.add('newsletter__input--invalid');
                    form.style.display = 'block';
                    message.style.display = 'block';
                } else {
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

var docsNavMobileActions = function docsNavMobileActions() {

    var menuButton = document.querySelector('.nav-item__left');
    var topButton = document.querySelector('.nav-item__right');
    var docsNav = document.querySelector('.docs-nav');

    if (!menuButton || !topButton || !docsNav) {
        return;
    }

    var docsNavLinks = docsNav.getElementsByClassName('nav-item');

    var isMobile = function isMobile() {
        return window.getComputedStyle(menuButton.parentNode).getPropertyValue('display') !== 'none';
    };
    var docsNavIsOpen = function docsNavIsOpen() {
        return docsNav.classList.contains('docs-nav--open');
    };
    var toggleDocsNav = function toggleDocsNav() {

        if (!isMobile()) {
            return;
        }

        if (docsNavIsOpen()) {
            document.body.classList.remove('body--noscroll');
            docsNav.classList.remove('docs-nav--open');
            return;
        }

        document.body.classList.add('body--noscroll');
        docsNav.classList.add('docs-nav--open');
    };

    menuButton.addEventListener('click', toggleDocsNav);

    Array.from(docsNavLinks).forEach(function (link) {
        return link.addEventListener('click', toggleDocsNav);
    });

    topButton.addEventListener('click', function () {

        if (docsNavIsOpen()) {
            toggleDocsNav();
        }

        return window.scrollTo(0, 0);
    });
};

var changePackageVersion = function changePackageVersion() {

    var select = document.getElementById('version');

    if (!select) {
        return;
    }

    select.addEventListener('change', function (option) {

        window.location.search = 'v=' + option.srcElement.value;
    });
};

setActiveNavItems();
newsletterSubmit();
docsNavMobileActions();
changePackageVersion();

},{"./docs-nav":1}],3:[function(require,module,exports){
'use strict';

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

var selectedClass = 'navbar-active';
var supportsPassive = false;

try {
  var opts = Object.defineProperty({}, 'passive', {
    get: function get() {
      supportsPassive = true;
    }
  });

  window.addEventListener('test', null, opts);
} catch (e) {}

// It'd be nicer to use the classList API, but I prefer to support more browsers. Remove a class
// if it's found on the element.
function removeClassIfNeeded(el) {
  // If the element has no classes then we can take a shortcut.
  if (!el.className) {
    return;
  }

  var splitClassName = el.className.split(' ');
  var replacementClassName = '';

  // Assemble a string of other class names.
  for (var i = 0, len = splitClassName.length; i < len; i++) {
    var className = splitClassName[i];

    if (className !== selectedClass) {
      replacementClassName += replacementClassName === '' ? className : ' ' + className;
    }
  }

  // If the length of the className differs, then it had an selected class in and needs to be
  // updated.
  if (replacementClassName.length !== el.className.length) {
    el.className = replacementClassName;
  }
}

// Add a class to an element if it is not found.
function addClassIfNeeded(el) {
  // If the element has no classes then we can take a shortcut.
  if (!el.className) {
    el.className = selectedClass;
    return;
  }

  var splitClassName = el.className.split(' ');

  // If any of the class names match the selected class then return.
  for (var i = 0, len = splitClassName.length; i < len; i++) {
    if (splitClassName[i] === selectedClass) {
      return;
    }
  }

  // If we got here then the selected class needs to be added to an existing className.
  el.className += ' ' + selectedClass;
}

function createAndAppendListItems(navList, elementList, makeNavListItem) {
  var pairs = [];
  var element;
  var li;

  // Create list elements
  for (var i = 0, len = elementList.length; i < len; i++) {
    element = elementList[i];
    li = makeNavListItem(element);

    navList.appendChild(li);

    pairs.push({ element: element, navElement: li });
  }

  return pairs;
}

function makeHandleScroll(pairs, onScrollHook, debounceTime) {
  function handleScroll() {
    var frontRunnerIndex;
    var closestDist = Infinity;
    var pair;
    var absDist;

    for (var i = 0, len = pairs.length; i < len; i++) {
      pair = pairs[i];
      absDist = Math.abs(pair.element.getBoundingClientRect().top);

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
  }

  // The default behaviour is no debounce.
  if (typeof debounceTime !== 'number' || isNaN(debounceTime)) {
    return handleScroll;
  }

  var timeout;

  function nullifyTimeout() {
    timeout = null;
  }

  return function debouncedHandleScroll() {
    if (timeout) {
      return;
    }

    // Immediately use handleScroll to calculate.
    handleScroll();

    // No further calls to handleScroll until debounceTime has elapsed.
    timeout = setTimeout(nullifyTimeout, debounceTime);
  };
}

function addScrollListener(target, handleScroll) {
  function scrollHandleWrapper(evt) {
    if (evt.target === target) {
      handleScroll();
    }
  }

  if (target.addEventListener) {
    target.addEventListener('scroll', scrollHandleWrapper, supportsPassive ? { passive: true } : false);
  } else if (target.attachEvent) {
    target.attachEvent('onscroll', scrollHandleWrapper);
  } else {
    throw new Error('This browser does not support addEventListener or attachEvent.');
  }

  // To calculate the initial active list element.
  handleScroll();
}

module.exports = function makeNav(options) {
  if (!options || !options.elementList || !options.makeNavListItem) {
    throw new Error('Options object with elementList and makeNavListItem must be provided.');
  }

  var navbar = document.createElement(options.tagName || 'nav');
  var navList = document.createElement('ul');

  // The target defaults to window.
  var target = options.target || document;

  // Create list elements
  var pairs = createAndAppendListItems(navList, options.elementList, options.makeNavListItem);

  // Whenever the window is scrolled, recalculate the active list element. Compatible with older
  // versions of IE.
  addScrollListener(target, makeHandleScroll(pairs, options.onScroll, options.debounceTime));

  navbar.appendChild(navList);

  return navbar;
};

},{}],4:[function(require,module,exports){
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.scrollIntoViewIfNeeded = factory());
}(this, (function () { 'use strict';

/**
 * https://github.com/gre/bezier-easing
 * BezierEasing - use bezier curve for transition easing function
 * by Gaëtan Renaudeau 2014 - 2015 – MIT License
 */

// These values are established by empiricism with tests (tradeoff: performance VS precision)
var NEWTON_ITERATIONS = 4;
var NEWTON_MIN_SLOPE = 0.001;
var SUBDIVISION_PRECISION = 0.0000001;
var SUBDIVISION_MAX_ITERATIONS = 10;

var kSplineTableSize = 11;
var kSampleStepSize = 1.0 / (kSplineTableSize - 1.0);

var float32ArraySupported = typeof Float32Array === 'function';

function A (aA1, aA2) { return 1.0 - 3.0 * aA2 + 3.0 * aA1; }
function B (aA1, aA2) { return 3.0 * aA2 - 6.0 * aA1; }
function C (aA1)      { return 3.0 * aA1; }

// Returns x(t) given t, x1, and x2, or y(t) given t, y1, and y2.
function calcBezier (aT, aA1, aA2) { return ((A(aA1, aA2) * aT + B(aA1, aA2)) * aT + C(aA1)) * aT; }

// Returns dx/dt given t, x1, and x2, or dy/dt given t, y1, and y2.
function getSlope (aT, aA1, aA2) { return 3.0 * A(aA1, aA2) * aT * aT + 2.0 * B(aA1, aA2) * aT + C(aA1); }

function binarySubdivide (aX, aA, aB, mX1, mX2) {
  var currentX, currentT, i = 0;
  do {
    currentT = aA + (aB - aA) / 2.0;
    currentX = calcBezier(currentT, mX1, mX2) - aX;
    if (currentX > 0.0) {
      aB = currentT;
    } else {
      aA = currentT;
    }
  } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
  return currentT;
}

function newtonRaphsonIterate (aX, aGuessT, mX1, mX2) {
 for (var i = 0; i < NEWTON_ITERATIONS; ++i) {
   var currentSlope = getSlope(aGuessT, mX1, mX2);
   if (currentSlope === 0.0) {
     return aGuessT;
   }
   var currentX = calcBezier(aGuessT, mX1, mX2) - aX;
   aGuessT -= currentX / currentSlope;
 }
 return aGuessT;
}

var src = function bezier (mX1, mY1, mX2, mY2) {
  if (!(0 <= mX1 && mX1 <= 1 && 0 <= mX2 && mX2 <= 1)) {
    throw new Error('bezier x values must be in [0, 1] range');
  }

  // Precompute samples table
  var sampleValues = float32ArraySupported ? new Float32Array(kSplineTableSize) : new Array(kSplineTableSize);
  if (mX1 !== mY1 || mX2 !== mY2) {
    for (var i = 0; i < kSplineTableSize; ++i) {
      sampleValues[i] = calcBezier(i * kSampleStepSize, mX1, mX2);
    }
  }

  function getTForX (aX) {
    var intervalStart = 0.0;
    var currentSample = 1;
    var lastSample = kSplineTableSize - 1;

    for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
      intervalStart += kSampleStepSize;
    }
    --currentSample;

    // Interpolate to provide an initial guess for t
    var dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    var guessForT = intervalStart + dist * kSampleStepSize;

    var initialSlope = getSlope(guessForT, mX1, mX2);
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(aX, guessForT, mX1, mX2);
    } else if (initialSlope === 0.0) {
      return guessForT;
    } else {
      return binarySubdivide(aX, intervalStart, intervalStart + kSampleStepSize, mX1, mX2);
    }
  }

  return function BezierEasing (x) {
    if (mX1 === mY1 && mX2 === mY2) {
      return x; // linear
    }
    // Because JavaScript number are imprecise, we should guarantee the extremes are right.
    if (x === 0) {
      return 0;
    }
    if (x === 1) {
      return 1;
    }
    return calcBezier(getTForX(x), mY1, mY2);
  };
};

// Predefined set of animations. Similar to CSS easing functions
var animations = {
  ease:  src(0.25, 0.1, 0.25, 1),
  easeIn: src(0.42, 0, 1, 1),
  easeOut: src(0, 0, 0.58, 1),
  easeInOut: src(0.42, 0, 0.58, 1),
  linear: src(0, 0, 1, 1)
};


var amator = animate;

function animate(source, target, options) {
  var start= Object.create(null);
  var diff = Object.create(null);
  options = options || {};
  // We let clients specify their own easing function
  var easing = (typeof options.easing === 'function') ? options.easing : animations[options.easing];

  // if nothing is specified, default to ease (similar to CSS animations)
  if (!easing) {
    if (options.easing) {
      console.warn('Unknown easing function in amator: ' + options.easing);
    }
    easing = animations.ease;
  }

  var step = typeof options.step === 'function' ? options.step : noop;
  var done = typeof options.done === 'function' ? options.done : noop;

  var scheduler = getScheduler(options.scheduler);

  var keys = Object.keys(target);
  keys.forEach(function(key) {
    start[key] = source[key];
    diff[key] = target[key] - source[key];
  });

  var durationInMs = options.duration || 400;
  var durationInFrames = Math.max(1, durationInMs * 0.06); // 0.06 because 60 frames pers 1,000 ms
  var previousAnimationId;
  var frame = 0;

  previousAnimationId = scheduler.next(loop);

  return {
    cancel: cancel
  }

  function cancel() {
    scheduler.cancel(previousAnimationId);
    previousAnimationId = 0;
  }

  function loop() {
    var t = easing(frame/durationInFrames);
    frame += 1;
    setValues(t);
    if (frame <= durationInFrames) {
      previousAnimationId = scheduler.next(loop);
      step(source);
    } else {
      previousAnimationId = 0;
      setTimeout(function() { done(source); }, 0);
    }
  }

  function setValues(t) {
    keys.forEach(function(key) {
      source[key] = diff[key] * t + start[key];
    });
  }
}

function noop() { }

function getScheduler(scheduler) {
  if (!scheduler) {
    var canRaf = typeof window !== 'undefined' && window.requestAnimationFrame;
    return canRaf ? rafScheduler() : timeoutScheduler()
  }
  if (typeof scheduler.next !== 'function') throw new Error('Scheduler is supposed to have next(cb) function')
  if (typeof scheduler.cancel !== 'function') throw new Error('Scheduler is supposed to have cancel(handle) function')

  return scheduler
}

function rafScheduler() {
  return {
    next: window.requestAnimationFrame.bind(window),
    cancel: window.cancelAnimationFrame.bind(window)
  }
}

function timeoutScheduler() {
  return {
    next: function(cb) {
      return setTimeout(cb, 1000/60)
    },
    cancel: function (id) {
      return clearTimeout(id)
    }
  }
}

var __assign$1 = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var handleScroll$1 = function (parent, _a) {
    var scrollLeft = _a.scrollLeft, scrollTop = _a.scrollTop;
    parent.scrollLeft = scrollLeft;
    parent.scrollTop = scrollTop;
};
function calculate(target, options) {
    if (!target || !(target instanceof HTMLElement))
        throw new Error('Element is required in scrollIntoViewIfNeeded');
    var config = __assign$1({ handleScroll: handleScroll$1 }, options);
    var defaultOffset = { top: 0, right: 0, bottom: 0, left: 0 };
    config.offset = config.offset
        ? __assign$1({}, defaultOffset, config.offset) : defaultOffset;
    function withinBounds(value, min, max, extent) {
        if (config.centerIfNeeded === false ||
            (max <= value + extent && value <= min + extent)) {
            return Math.min(max, Math.max(min, value));
        }
        else {
            return (min + max) / 2;
        }
    }
    var offset = config.offset;
    var offsetTop = offset.top;
    var offsetLeft = offset.left;
    var offsetBottom = offset.bottom;
    var offsetRight = offset.right;
    function makeArea(left, top, width, height) {
        return {
            left: left + offsetLeft,
            top: top + offsetTop,
            width: width,
            height: height,
            right: left + offsetLeft + width + offsetRight,
            bottom: top + offsetTop + height + offsetBottom,
            translate: function (x, y) {
                return makeArea(x + left + offsetLeft, y + top + offsetTop, width, height);
            },
            relativeFromTo: function (lhs, rhs) {
                var newLeft = left + offsetLeft, newTop = top + offsetTop;
                lhs = lhs.offsetParent;
                rhs = rhs.offsetParent;
                if (lhs === rhs) {
                    return area;
                }
                for (; lhs; lhs = lhs.offsetParent) {
                    newLeft += lhs.offsetLeft + lhs.clientLeft;
                    newTop += lhs.offsetTop + lhs.clientTop;
                }
                for (; rhs; rhs = rhs.offsetParent) {
                    newLeft -= rhs.offsetLeft + rhs.clientLeft;
                    newTop -= rhs.offsetTop + rhs.clientTop;
                }
                return makeArea(newLeft, newTop, width, height);
            },
        };
    }
    var parent, area = makeArea(target.offsetLeft, target.offsetTop, target.offsetWidth, target.offsetHeight);
    while ((parent = target.parentNode) instanceof HTMLElement &&
        target !== config.boundary) {
        var clientLeft = parent.offsetLeft + parent.clientLeft;
        var clientTop = parent.offsetTop + parent.clientTop;
        // Make area relative to parent's client area.
        area = area
            .relativeFromTo(target, parent)
            .translate(-clientLeft, -clientTop);
        var scrollLeft = withinBounds(parent.scrollLeft, area.right - parent.clientWidth, area.left, parent.clientWidth);
        var scrollTop = withinBounds(parent.scrollTop, area.bottom - parent.clientHeight, area.top, parent.clientHeight);
        // Pass the new coordinates to the handleScroll callback
        config.handleScroll(parent, { scrollLeft: scrollLeft, scrollTop: scrollTop }, config);
        // Determine actual scroll amount by reading back scroll properties.
        area = area.translate(clientLeft - parent.scrollLeft, clientTop - parent.scrollTop);
        target = parent;
    }
}

var __assign = (undefined && undefined.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var handleScroll = function (parent, _a, config) {
    var scrollLeft = _a.scrollLeft, scrollTop = _a.scrollTop;
    if (config.duration) {
        amator(parent, {
            scrollLeft: scrollLeft,
            scrollTop: scrollTop,
        }, { duration: config.duration, easing: config.easing });
    }
    else {
        parent.scrollLeft = scrollLeft;
        parent.scrollTop = scrollTop;
    }
};
function isBoolean(options) {
    return typeof options === 'boolean';
}
function scrollIntoViewIfNeeded(target, options, animateOptions, finalElement, offsetOptions) {
    if (offsetOptions === void 0) { offsetOptions = {}; }
    if (!target || !(target instanceof HTMLElement))
        throw new Error('Element is required in scrollIntoViewIfNeeded');
    var config = { centerIfNeeded: false, handleScroll: handleScroll };
    if (isBoolean(options)) {
        config.centerIfNeeded = options;
    }
    else {
        config = __assign({}, config, options);
    }
    var defaultOffset = { top: 0, right: 0, bottom: 0, left: 0 };
    config.offset = config.offset
        ? __assign({}, defaultOffset, config.offset) : defaultOffset;
    if (animateOptions) {
        config.duration = animateOptions.duration;
        config.easing = animateOptions.easing;
    }
    if (finalElement) {
        config.boundary = finalElement;
    }
    if (offsetOptions.offsetTop) {
        config.offset.top = offsetOptions.offsetTop;
    }
    if (offsetOptions.offsetRight) {
        config.offset.right = offsetOptions.offsetRight;
    }
    if (offsetOptions.offsetBottom) {
        config.offset.bottom = offsetOptions.offsetBottom;
    }
    if (offsetOptions.offsetLeft) {
        config.offset.left = offsetOptions.offsetLeft;
    }
    return calculate(target, config);
}

return scrollIntoViewIfNeeded;

})));

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvcHVibGljL2pzL2RvY3MtbmF2LmpzIiwibGliL3B1YmxpYy9qcy9tYWluLmpzIiwibGliL3B1YmxpYy9qcy92ZW5kb3IvbmF2YmFyLmpzIiwibm9kZV9tb2R1bGVzL3Njcm9sbC1pbnRvLXZpZXctaWYtbmVlZGVkL2Rpc3QvYnVuZGxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7Ozs7O0FBRUEsSUFBTSx5QkFBeUIsUUFBUSw0QkFBUixDQUEvQjtBQUNBLElBQU0sU0FBUyxRQUFRLGlCQUFSLENBQWY7O0FBRUEsSUFBTSxZQUFZLEVBQWxCOztBQUVBLElBQU0sc0JBQXNCLEVBQTVCO0FBQ0EsSUFBTSxjQUFjLEVBQXBCOztBQUVBLFFBQVEsSUFBUixHQUFlLFVBQUMsU0FBRCxFQUFZLEtBQVosRUFBc0I7O0FBRWpDLFFBQUksQ0FBQyxTQUFMLEVBQWdCO0FBQ1o7QUFDSDs7QUFFRCxRQUFJLENBQUMsS0FBTCxFQUFZO0FBQ1IsY0FBTSxJQUFJLEtBQUosQ0FBVSxrRUFBVixDQUFOO0FBQ0g7O0FBRUQsUUFBTSxZQUFZLElBQUksVUFBVSxTQUFkLEVBQWxCOztBQUVBLFFBQU0sU0FBUyxPQUFPO0FBQ2xCLGlCQUFTLE1BQU0sT0FERztBQUVsQixxQkFBYSxVQUFVLGdCQUFWLENBQTJCLHdCQUEzQixDQUZLO0FBR2xCLHlCQUFpQix5QkFBQyxFQUFELEVBQVE7O0FBRXJCLGlCQUFLLEdBQUcsU0FBSCxDQUFhLElBQWIsQ0FBTDs7QUFFQSxnQkFBTSxTQUFTLEdBQUcsV0FBSCxDQUFlLEdBQUcsYUFBSCxDQUFpQixHQUFqQixDQUFmLENBQWY7QUFDQSxnQkFBTSxTQUFTLE9BQU8sR0FBRyxPQUFILENBQVcsT0FBWCxDQUFtQixHQUFuQixFQUF3QixFQUF4QixDQUFQLENBQWY7O0FBRUEsbUJBQU8sVUFBVSxNQUFWLENBQ0gsVUFBVSxJQUFWLENB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgZG9jdW1lbnQgKi9cblxuY29uc3QgU2Nyb2xsSW50b1ZpZXdJZk5lZWRlZCA9IHJlcXVpcmUoJ3Njcm9sbC1pbnRvLXZpZXctaWYtbmVlZGVkJyk7XG5jb25zdCBOYXZiYXIgPSByZXF1aXJlKCcuL3ZlbmRvci9uYXZiYXInKTtcblxuY29uc3QgaW50ZXJuYWxzID0ge307XG5cbmNvbnN0IEZJWEVEX0hFQURFUl9IRUlHSFQgPSA4MDtcbmNvbnN0IFRPUF9QQURESU5HID0gMzU7XG5cbmV4cG9ydHMuaW5pdCA9IChjb250ZW50RWwsIG5hdkVsKSA9PiB7XG5cbiAgICBpZiAoIWNvbnRlbnRFbCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFuYXZFbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RvY3MgbmF2aWdhdGlvbiBjb250ZW50IGVsZW1lbnQgZXhpc3RzLCBidXQgbm90IHRoZSBuYXYgZWxlbWVudC4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBoYXNoU3RhdGUgPSBuZXcgaW50ZXJuYWxzLkhhc2hTdGF0ZSgpO1xuXG4gICAgY29uc3QgbmF2YmFyID0gTmF2YmFyKHtcbiAgICAgICAgdGFnTmFtZTogbmF2RWwudGFnTmFtZSxcbiAgICAgICAgZWxlbWVudExpc3Q6IGNvbnRlbnRFbC5xdWVyeVNlbGVjdG9yQWxsKCdoMSwgaDIsIGgzLCBoNCwgaDUsIGg2JyksXG4gICAgICAgIG1ha2VOYXZMaXN0SXRlbTogKGVsKSA9PiB7XG5cbiAgICAgICAgICAgIGVsID0gZWwuY2xvbmVOb2RlKHRydWUpO1xuXG4gICAgICAgICAgICBjb25zdCBhbmNob3IgPSBlbC5yZW1vdmVDaGlsZChlbC5xdWVyeVNlbGVjdG9yKCdhJykpO1xuICAgICAgICAgICAgY29uc3QgaW5kZW50ID0gTnVtYmVyKGVsLnRhZ05hbWUucmVwbGFjZSgnSCcsICcnKSk7XG5cbiAgICAgICAgICAgIHJldHVybiBpbnRlcm5hbHMucmVuZGVyKFxuICAgICAgICAgICAgICAgIGludGVybmFscy5pdGVtKGVsLmlubmVySFRNTCwgYW5jaG9yLmhhc2gsIGluZGVudClcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG4gICAgICAgIG9uU2Nyb2xsOiAobmF2SXRlbSkgPT4ge1xuXG4gICAgICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2ggIT09IG5hdkl0ZW0uaGFzaCAmJiAhaGFzaFN0YXRlLmF1dG9TY3JvbGxpbmcgJiYgIWhhc2hTdGF0ZS5maXJzdFNjcm9sbCkge1xuICAgICAgICAgICAgICAgIGhhc2hTdGF0ZS5oYXNoQ2hhbmdlRnJvbVNjcm9sbCgpO1xuICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IG5hdkl0ZW0uaHJlZjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaGFzaFN0YXRlLnNjcm9sbGVkKCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIG5hdmJhci5jbGFzc0xpc3QuYWRkKCdtYXJrZG93bi1ib2R5Jyk7XG5cbiAgICBjb25zdCBoYW5kbGVIYXNoID0gKCkgPT4ge1xuXG4gICAgICAgIGludGVybmFscy5tYXliZVNjcm9sbFRvSGFzaCh3aW5kb3cubG9jYXRpb24uaGFzaCwgbmF2YmFyLCBoYXNoU3RhdGUpO1xuICAgIH07XG5cbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignaGFzaGNoYW5nZScsIGhhbmRsZUhhc2gpO1xuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgaGFuZGxlSGFzaCk7XG5cbiAgICByZXR1cm4gbmF2RWwucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQobmF2YmFyLCBuYXZFbCk7XG59O1xuXG5pbnRlcm5hbHMuSGFzaFN0YXRlID0gY2xhc3MgSGFzaFN0YXRlIHtcblxuICAgIGNvbnN0cnVjdG9yKCkge1xuXG4gICAgICAgIHRoaXMuYXV0b1Njcm9sbGluZyA9IDA7XG4gICAgICAgIHRoaXMuZnJvbVNjcm9sbCA9IGZhbHNlO1xuICAgICAgICB0aGlzLmZpcnN0U2Nyb2xsID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBzY3JvbGxlZCgpIHtcblxuICAgICAgICB0aGlzLmZpcnN0U2Nyb2xsID0gZmFsc2U7XG4gICAgfVxuXG4gICAgaGFzaENoYW5nZUZyb21TY3JvbGwoKSB7XG5cbiAgICAgICAgdGhpcy5mcm9tU2Nyb2xsID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBoYW5kbGVkQ2hhbmdlKCkge1xuXG4gICAgICAgIHRoaXMuZnJvbVNjcm9sbCA9IGZhbHNlO1xuICAgIH1cblxuICAgIHN0YXJ0QXV0b1Njcm9sbGluZygpIHtcblxuICAgICAgICB0aGlzLmF1dG9TY3JvbGxpbmcrKztcbiAgICB9XG5cbiAgICBzdG9wQXV0b1Njcm9sbGluZygpIHtcblxuICAgICAgICB0aGlzLmF1dG9TY3JvbGxpbmctLTtcbiAgICB9XG59O1xuXG5pbnRlcm5hbHMubWF5YmVTY3JvbGxUb0hhc2ggPSAoaGFzaCwgbmF2YmFyLCBoYXNoU3RhdGUpID0+IHtcblxuICAgIGNvbnN0IGFuY2hvciA9IGhhc2ggJiYgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihgYS5hbmNob3JbaHJlZj1cIiR7aGFzaH1cIl1gKTtcbiAgICBjb25zdCBuYXZJdGVtID0gKGhhc2ggJiYgbmF2YmFyLnF1ZXJ5U2VsZWN0b3IoYGEubmF2LWl0ZW1baHJlZj1cIiR7aGFzaH1cIl1gKSkgfHwgbmF2YmFyLnF1ZXJ5U2VsZWN0b3IoJy5uYXYtaXRlbScpO1xuXG4gICAgaWYgKG5hdkl0ZW0pIHtcbiAgICAgICAgaW50ZXJuYWxzLnNlbGVjdE5hdkl0ZW0obmF2SXRlbSk7XG4gICAgICAgIFNjcm9sbEludG9WaWV3SWZOZWVkZWQobmF2SXRlbSwgeyBib3VuZGFyeTogbmF2YmFyLnBhcmVudE5vZGUgfSk7XG4gICAgfVxuXG4gICAgaWYgKGFuY2hvciAmJiAhaGFzaFN0YXRlLmZyb21TY3JvbGwpIHtcbiAgICAgICAgaGFzaFN0YXRlLnN0YXJ0QXV0b1Njcm9sbGluZygpO1xuICAgICAgICBhbmNob3Iuc2Nyb2xsSW50b1ZpZXcoKTtcblxuICAgICAgICAvLyBFbnN1cmUgZWxlbWVudCBpcyB2aXNpYmxlXG4gICAgICAgIGlmIChhbmNob3IuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wIDwgKEZJWEVEX0hFQURFUl9IRUlHSFQgKyBUT1BfUEFERElORykpIHtcbiAgICAgICAgICAgIHdpbmRvdy5zY3JvbGxCeSgwLCAtKEZJWEVEX0hFQURFUl9IRUlHSFQgKyBUT1BfUEFERElORykpO1xuICAgICAgICB9XG5cbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiBoYXNoU3RhdGUuc3RvcEF1dG9TY3JvbGxpbmcoKSwgNTApO1xuICAgIH1cblxuICAgIGhhc2hTdGF0ZS5oYW5kbGVkQ2hhbmdlKCk7XG59O1xuXG5pbnRlcm5hbHMuc2VsZWN0TmF2SXRlbSA9IChuYXZJdGVtKSA9PiB7XG5cbiAgICBjb25zdCBsYXN0TmF2SXRlbSA9IG5hdkl0ZW0ucGFyZW50Tm9kZS5xdWVyeVNlbGVjdG9yKCc6c2NvcGUgPiAubmF2YmFyLWFjdGl2ZScpO1xuXG4gICAgaWYgKGxhc3ROYXZJdGVtKSB7XG4gICAgICAgIGxhc3ROYXZJdGVtLmNsYXNzTGlzdC5yZW1vdmUoJ25hdmJhci1hY3RpdmUnKTtcbiAgICB9XG5cbiAgICBuYXZJdGVtLmNsYXNzTGlzdC5hZGQoJ25hdmJhci1hY3RpdmUnKTtcbn07XG5cbmludGVybmFscy5pdGVtID0gKGlubmVySFRNTCwgaHJlZiwgaW5kZW50KSA9PiAoXG4gICAgYDxhIGhyZWY9XCIke2hyZWZ9XCIgY2xhc3M9XCJuYXYtaXRlbSBpbmRlbnQtJHtpbmRlbnR9XCI+XG4gICAgICAgICR7aW5uZXJIVE1MfVxuICAgIDwvYT5gXG4pO1xuXG5pbnRlcm5hbHMucmVuZGVyID0gKGh0bWwpID0+IHtcblxuICAgIGNvbnN0IHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB3cmFwcGVyLmlubmVySFRNTCA9IGh0bWw7XG5cbiAgICByZXR1cm4gd3JhcHBlci5maXJzdENoaWxkO1xufTtcbiIsIid1c2Ugc3RyaWN0Jztcbi8qIGdsb2JhbCBkb2N1bWVudCwgd2luZG93LCBYTUxIdHRwUmVxdWVzdCAqL1xuXG5jb25zdCBEb2NzTmF2ID0gcmVxdWlyZSgnLi9kb2NzLW5hdicpO1xuXG5Eb2NzTmF2LmluaXQoXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmRvY3MtZGV0YWlsIC53cmFwcGVyJyksXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmRvY3MtZGV0YWlsIC5uYXYtdGFyZ2V0Jylcbik7XG5cbmNvbnN0IHNldEFjdGl2ZU5hdkl0ZW1zID0gKCkgPT4ge1xuXG4gICAgY29uc3QgbGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ25hdl9faXRlbScpO1xuICAgIGNvbnN0IGN1cnJlbnRQYWdlID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLnNwbGl0KCcvJylbMV07XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGxpc3RbaV07XG4gICAgICAgIGlmIChpdGVtLnBhdGhuYW1lLnNwbGl0KCcvJylbMV0gPT09IGN1cnJlbnRQYWdlKSB7XG4gICAgICAgICAgICBpdGVtLmNsYXNzTGlzdC5hZGQoJ25hdl9faXRlbS0tYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5jb25zdCBuZXdzbGV0dGVyU3VibWl0ID0gKCkgPT4ge1xuXG4gICAgY29uc3QgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXdzbGV0dGVyRm9ybScpO1xuXG4gICAgaWYgKCFmb3JtKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3JtLm9uc3VibWl0ID0gKGUpID0+IHtcblxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgY29uc3QgZW1haWxJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXdzbGV0dGVyRW1haWwnKTtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXdzbGV0dGVyTWVzc2FnZScpO1xuXG4gICAgICAgIGlmIChlbWFpbElucHV0LnZhbGlkaXR5LnZhbGlkKSB7XG4gICAgICAgICAgICBjb25zdCBwYXlsb2FkID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIGVtYWlsOiBlbWFpbElucHV0LnZhbHVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgeGhyLm9wZW4oJ1BPU1QnLCAnL21haWxjaGltcCcpO1xuICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICB4aHIub25sb2FkID0gKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLmlubmVySFRNTCA9ICdZb3VyIGVtYWlsIGFkZHJlc3M6ICcgKyBlbWFpbElucHV0LnZhbHVlICsgJywgaXMgbm93IHNpZ25lZCB1cC4gVGhhbmtzIHBhbCEnO1xuICAgICAgICAgICAgICAgICAgICBlbWFpbElucHV0LnZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgZm9ybS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh4aHIuc3RhdHVzID09PSA0MDApIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSAnVGhlIGVtYWlsIGFkZHJlc3M6ICcgKyBlbWFpbElucHV0LnZhbHVlICsgJyBpcyBlaXRoZXIgaW52YWxpZCwgb3IgbWF5IGFscmVhZHkgYmUgc3Vic2NyaWJlZC4nO1xuICAgICAgICAgICAgICAgICAgICBlbWFpbElucHV0LnZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgZW1haWxJbnB1dC5jbGFzc0xpc3QuYWRkKCduZXdzbGV0dGVyX19pbnB1dC0taW52YWxpZCcpO1xuICAgICAgICAgICAgICAgICAgICBmb3JtLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSAnVGhlIGVtYWlsIGFkZHJlc3M6ICcgKyBlbWFpbElucHV0LnZhbHVlICsgJyBtYXkgYmUgaW52YWxpZCwgb3IgeW91ciBuZXR3b3JrIGNvbm5lY3Rpb24gaXMgaW5hY3RpdmUnO1xuICAgICAgICAgICAgICAgICAgICBlbWFpbElucHV0LnZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgZW1haWxJbnB1dC5jbGFzc0xpc3QuYWRkKCduZXdzbGV0dGVyX19pbnB1dC0taW52YWxpZCcpO1xuICAgICAgICAgICAgICAgICAgICBmb3JtLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB4aHIuc2VuZChwYXlsb2FkKTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuXG5jb25zdCBkb2NzTmF2TW9iaWxlQWN0aW9ucyA9ICgpID0+IHtcblxuICAgIGNvbnN0IG1lbnVCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubmF2LWl0ZW1fX2xlZnQnKTtcbiAgICBjb25zdCB0b3BCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubmF2LWl0ZW1fX3JpZ2h0Jyk7XG4gICAgY29uc3QgZG9jc05hdiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5kb2NzLW5hdicpO1xuXG4gICAgaWYgKCFtZW51QnV0dG9uIHx8ICF0b3BCdXR0b24gfHwgIWRvY3NOYXYpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGRvY3NOYXZMaW5rcyA9IGRvY3NOYXYuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbmF2LWl0ZW0nKTtcblxuICAgIGNvbnN0IGlzTW9iaWxlID0gKCkgPT4gd2luZG93LmdldENvbXB1dGVkU3R5bGUobWVudUJ1dHRvbi5wYXJlbnROb2RlKS5nZXRQcm9wZXJ0eVZhbHVlKCdkaXNwbGF5JykgIT09ICdub25lJztcbiAgICBjb25zdCBkb2NzTmF2SXNPcGVuID0gKCkgPT4gZG9jc05hdi5jbGFzc0xpc3QuY29udGFpbnMoJ2RvY3MtbmF2LS1vcGVuJyk7XG4gICAgY29uc3QgdG9nZ2xlRG9jc05hdiA9ICgpID0+IHtcblxuICAgICAgICBpZiAoIWlzTW9iaWxlKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkb2NzTmF2SXNPcGVuKCkpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnYm9keS0tbm9zY3JvbGwnKTtcbiAgICAgICAgICAgIGRvY3NOYXYuY2xhc3NMaXN0LnJlbW92ZSgnZG9jcy1uYXYtLW9wZW4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnYm9keS0tbm9zY3JvbGwnKTtcbiAgICAgICAgZG9jc05hdi5jbGFzc0xpc3QuYWRkKCdkb2NzLW5hdi0tb3BlbicpO1xuICAgIH07XG5cbiAgICBtZW51QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdG9nZ2xlRG9jc05hdik7XG5cbiAgICBBcnJheS5mcm9tKGRvY3NOYXZMaW5rcykuZm9yRWFjaChcbiAgICAgICAgKGxpbmspID0+IGxpbmsuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0b2dnbGVEb2NzTmF2KVxuICAgICk7XG5cbiAgICB0b3BCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB7XG5cbiAgICAgICAgaWYgKGRvY3NOYXZJc09wZW4oKSkge1xuICAgICAgICAgICAgdG9nZ2xlRG9jc05hdigpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHdpbmRvdy5zY3JvbGxUbygwLCAwKTtcbiAgICB9KTtcbn07XG5cbmNvbnN0IGNoYW5nZVBhY2thZ2VWZXJzaW9uID0gKCkgPT4ge1xuXG4gICAgY29uc3Qgc2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3ZlcnNpb24nKTtcblxuICAgIGlmICghc2VsZWN0KXtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNlbGVjdC5hZGRFdmVudExpc3RlbmVyKCdjaGFuZ2UnLCAob3B0aW9uKSA9PiB7XG5cbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnNlYXJjaCA9ICd2PScgKyBvcHRpb24uc3JjRWxlbWVudC52YWx1ZTtcbiAgICB9KTtcbn07XG5cbnNldEFjdGl2ZU5hdkl0ZW1zKCk7XG5uZXdzbGV0dGVyU3VibWl0KCk7XG5kb2NzTmF2TW9iaWxlQWN0aW9ucygpO1xuY2hhbmdlUGFja2FnZVZlcnNpb24oKTtcbiIsIi8qXG4gKiBUaGUgTUlUIExpY2Vuc2UgKE1JVClcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgTWFyayBTLiBFdmVyaXR0XG4gKiBDb3B5cmlnaHQgKGMpIDIwMTggRGV2aW4gSXZ5IFttb2RpZmllZCBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9xdWJ5dGUvbmF2YmFyXVxuICpcbiAqIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uIG9idGFpbmluZyBhIGNvcHlcbiAqIG9mIHRoaXMgc29mdHdhcmUgYW5kIGFzc29jaWF0ZWQgZG9jdW1lbnRhdGlvbiBmaWxlcyAodGhlIFwiU29mdHdhcmVcIiksIHRvIGRlYWxcbiAqIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHNcbiAqIHRvIHVzZSwgY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiAqIGNvcGllcyBvZiB0aGUgU29mdHdhcmUsIGFuZCB0byBwZXJtaXQgcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpc1xuICogZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZCBpbiBhbGxcbiAqIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUlxuICogSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFksXG4gKiBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEVcbiAqIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVJcbiAqIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1IgT1RIRVJXSVNFLCBBUklTSU5HIEZST00sXG4gKiBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SIE9USEVSIERFQUxJTkdTIElOIFRIRVxuICogU09GVFdBUkUuXG4gKi9cblxudmFyIHNlbGVjdGVkQ2xhc3MgPSAnbmF2YmFyLWFjdGl2ZSc7XG52YXIgc3VwcG9ydHNQYXNzaXZlID0gZmFsc2U7XG5cbnRyeSB7XG4gIHZhciBvcHRzID0gT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAncGFzc2l2ZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHN1cHBvcnRzUGFzc2l2ZSA9IHRydWU7XG4gICAgfVxuICB9KTtcblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndGVzdCcsIG51bGwsIG9wdHMpO1xufSBjYXRjaCAoZSkge31cblxuLy8gSXQnZCBiZSBuaWNlciB0byB1c2UgdGhlIGNsYXNzTGlzdCBBUEksIGJ1dCBJIHByZWZlciB0byBzdXBwb3J0IG1vcmUgYnJvd3NlcnMuIFJlbW92ZSBhIGNsYXNzXG4vLyBpZiBpdCdzIGZvdW5kIG9uIHRoZSBlbGVtZW50LlxuZnVuY3Rpb24gcmVtb3ZlQ2xhc3NJZk5lZWRlZChlbCkge1xuICAvLyBJZiB0aGUgZWxlbWVudCBoYXMgbm8gY2xhc3NlcyB0aGVuIHdlIGNhbiB0YWtlIGEgc2hvcnRjdXQuXG4gIGlmICghZWwuY2xhc3NOYW1lKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIHNwbGl0Q2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lLnNwbGl0KCcgJyk7XG4gIHZhciByZXBsYWNlbWVudENsYXNzTmFtZSA9ICcnO1xuXG4gIC8vIEFzc2VtYmxlIGEgc3RyaW5nIG9mIG90aGVyIGNsYXNzIG5hbWVzLlxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gc3BsaXRDbGFzc05hbWUubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICB2YXIgY2xhc3NOYW1lID0gc3BsaXRDbGFzc05hbWVbaV07XG5cbiAgICBpZiAoY2xhc3NOYW1lICE9PSBzZWxlY3RlZENsYXNzKSB7XG4gICAgICByZXBsYWNlbWVudENsYXNzTmFtZSArPSByZXBsYWNlbWVudENsYXNzTmFtZSA9PT0gJycgPyBjbGFzc05hbWUgOiAnICcgKyBjbGFzc05hbWU7XG4gICAgfVxuICB9XG5cbiAgLy8gSWYgdGhlIGxlbmd0aCBvZiB0aGUgY2xhc3NOYW1lIGRpZmZlcnMsIHRoZW4gaXQgaGFkIGFuIHNlbGVjdGVkIGNsYXNzIGluIGFuZCBuZWVkcyB0byBiZVxuICAvLyB1cGRhdGVkLlxuICBpZiAocmVwbGFjZW1lbnRDbGFzc05hbWUubGVuZ3RoICE9PSBlbC5jbGFzc05hbWUubGVuZ3RoKSB7XG4gICAgZWwuY2xhc3NOYW1lID0gcmVwbGFjZW1lbnRDbGFzc05hbWU7XG4gIH1cbn1cblxuLy8gQWRkIGEgY2xhc3MgdG8gYW4gZWxlbWVudCBpZiBpdCBpcyBub3QgZm91bmQuXG5mdW5jdGlvbiBhZGRDbGFzc0lmTmVlZGVkKGVsKSB7XG4gIC8vIElmIHRoZSBlbGVtZW50IGhhcyBubyBjbGFzc2VzIHRoZW4gd2UgY2FuIHRha2UgYSBzaG9ydGN1dC5cbiAgaWYgKCFlbC5jbGFzc05hbWUpIHtcbiAgICBlbC5jbGFzc05hbWUgPSBzZWxlY3RlZENsYXNzO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBzcGxpdENsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZS5zcGxpdCgnICcpO1xuXG4gIC8vIElmIGFueSBvZiB0aGUgY2xhc3MgbmFtZXMgbWF0Y2ggdGhlIHNlbGVjdGVkIGNsYXNzIHRoZW4gcmV0dXJuLlxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gc3BsaXRDbGFzc05hbWUubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoc3BsaXRDbGFzc05hbWVbaV0gPT09IHNlbGVjdGVkQ2xhc3MpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICAvLyBJZiB3ZSBnb3QgaGVyZSB0aGVuIHRoZSBzZWxlY3RlZCBjbGFzcyBuZWVkcyB0byBiZSBhZGRlZCB0byBhbiBleGlzdGluZyBjbGFzc05hbWUuXG4gIGVsLmNsYXNzTmFtZSArPSAnICcgKyBzZWxlY3RlZENsYXNzO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVBbmRBcHBlbmRMaXN0SXRlbXMobmF2TGlzdCwgZWxlbWVudExpc3QsIG1ha2VOYXZMaXN0SXRlbSkge1xuICB2YXIgcGFpcnMgPSBbXTtcbiAgdmFyIGVsZW1lbnQ7XG4gIHZhciBsaTtcblxuICAvLyBDcmVhdGUgbGlzdCBlbGVtZW50c1xuICBmb3IgKHZhciBpID0gMCwgbGVuID0gZWxlbWVudExpc3QubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBlbGVtZW50ID0gZWxlbWVudExpc3RbaV07XG4gICAgbGkgPSBtYWtlTmF2TGlzdEl0ZW0oZWxlbWVudCk7XG5cbiAgICBuYXZMaXN0LmFwcGVuZENoaWxkKGxpKTtcblxuICAgIHBhaXJzLnB1c2goeyBlbGVtZW50OiBlbGVtZW50LCBuYXZFbGVtZW50OiBsaSB9KTtcbiAgfVxuXG4gIHJldHVybiBwYWlycztcbn1cblxuZnVuY3Rpb24gbWFrZUhhbmRsZVNjcm9sbChwYWlycywgb25TY3JvbGxIb29rLCBkZWJvdW5jZVRpbWUpIHtcbiAgZnVuY3Rpb24gaGFuZGxlU2Nyb2xsKCkge1xuICAgIHZhciBmcm9udFJ1bm5lckluZGV4O1xuICAgIHZhciBjbG9zZXN0RGlzdCA9IEluZmluaXR5O1xuICAgIHZhciBwYWlyO1xuICAgIHZhciBhYnNEaXN0O1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHBhaXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBwYWlyID0gcGFpcnNbaV07XG4gICAgICBhYnNEaXN0ID0gTWF0aC5hYnMocGFpci5lbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCk7XG5cbiAgICAgIC8vIElmIHRoaXMgZWxlbWVudCBpcyBub3QgdGhlIGZyb250IHJ1bm5lciBmb3IgdG9wLCBkZWFjdGl2YXRlIGl0LlxuICAgICAgaWYgKGFic0Rpc3QgPiBjbG9zZXN0RGlzdCkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgZnJvbnRSdW5uZXJJbmRleCA9IGk7XG4gICAgICBjbG9zZXN0RGlzdCA9IGFic0Rpc3Q7XG4gICAgfVxuXG4gICAgaWYgKG9uU2Nyb2xsSG9vaykge1xuICAgICAgICBvblNjcm9sbEhvb2socGFpcnNbZnJvbnRSdW5uZXJJbmRleF0ubmF2RWxlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgLy8gVGhlIGRlZmF1bHQgYmVoYXZpb3VyIGlzIG5vIGRlYm91bmNlLlxuICBpZiAodHlwZW9mIGRlYm91bmNlVGltZSAhPT0gJ251bWJlcicgfHwgaXNOYU4oZGVib3VuY2VUaW1lKSkge1xuICAgIHJldHVybiBoYW5kbGVTY3JvbGw7XG4gIH1cblxuICB2YXIgdGltZW91dDtcblxuICBmdW5jdGlvbiBudWxsaWZ5VGltZW91dCgpIHtcbiAgICB0aW1lb3V0ID0gbnVsbDtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiBkZWJvdW5jZWRIYW5kbGVTY3JvbGwoKSB7XG4gICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJbW1lZGlhdGVseSB1c2UgaGFuZGxlU2Nyb2xsIHRvIGNhbGN1bGF0ZS5cbiAgICBoYW5kbGVTY3JvbGwoKTtcblxuICAgIC8vIE5vIGZ1cnRoZXIgY2FsbHMgdG8gaGFuZGxlU2Nyb2xsIHVudGlsIGRlYm91bmNlVGltZSBoYXMgZWxhcHNlZC5cbiAgICB0aW1lb3V0ID0gc2V0VGltZW91dChudWxsaWZ5VGltZW91dCwgZGVib3VuY2VUaW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYWRkU2Nyb2xsTGlzdGVuZXIodGFyZ2V0LCBoYW5kbGVTY3JvbGwpIHtcbiAgZnVuY3Rpb24gc2Nyb2xsSGFuZGxlV3JhcHBlcihldnQpIHtcbiAgICBpZiAoZXZ0LnRhcmdldCA9PT0gdGFyZ2V0KSB7XG4gICAgICBoYW5kbGVTY3JvbGwoKTtcbiAgICB9XG4gIH1cblxuICBpZiAodGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgc2Nyb2xsSGFuZGxlV3JhcHBlciwgc3VwcG9ydHNQYXNzaXZlID8geyBwYXNzaXZlOiB0cnVlIH0gOiBmYWxzZSk7XG4gIH0gZWxzZSBpZiAodGFyZ2V0LmF0dGFjaEV2ZW50KSB7XG4gICAgdGFyZ2V0LmF0dGFjaEV2ZW50KCdvbnNjcm9sbCcsIHNjcm9sbEhhbmRsZVdyYXBwZXIpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignVGhpcyBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgYWRkRXZlbnRMaXN0ZW5lciBvciBhdHRhY2hFdmVudC4nKTtcbiAgfVxuXG4gIC8vIFRvIGNhbGN1bGF0ZSB0aGUgaW5pdGlhbCBhY3RpdmUgbGlzdCBlbGVtZW50LlxuICBoYW5kbGVTY3JvbGwoKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBtYWtlTmF2KG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLmVsZW1lbnRMaXN0IHx8ICFvcHRpb25zLm1ha2VOYXZMaXN0SXRlbSkge1xuICAgIHRocm93IG5ldyBFcnJvcignT3B0aW9ucyBvYmplY3Qgd2l0aCBlbGVtZW50TGlzdCBhbmQgbWFrZU5hdkxpc3RJdGVtIG11c3QgYmUgcHJvdmlkZWQuJyk7XG4gIH1cblxuICB2YXIgbmF2YmFyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChvcHRpb25zLnRhZ05hbWUgfHwgJ25hdicpO1xuICB2YXIgbmF2TGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XG5cbiAgLy8gVGhlIHRhcmdldCBkZWZhdWx0cyB0byB3aW5kb3cuXG4gIHZhciB0YXJnZXQgPSBvcHRpb25zLnRhcmdldCB8fCBkb2N1bWVudDtcblxuICAvLyBDcmVhdGUgbGlzdCBlbGVtZW50c1xuICB2YXIgcGFpcnMgPSBjcmVhdGVBbmRBcHBlbmRMaXN0SXRlbXMobmF2TGlzdCwgb3B0aW9ucy5lbGVtZW50TGlzdCwgb3B0aW9ucy5tYWtlTmF2TGlzdEl0ZW0pO1xuXG4gIC8vIFdoZW5ldmVyIHRoZSB3aW5kb3cgaXMgc2Nyb2xsZWQsIHJlY2FsY3VsYXRlIHRoZSBhY3RpdmUgbGlzdCBlbGVtZW50LiBDb21wYXRpYmxlIHdpdGggb2xkZXJcbiAgLy8gdmVyc2lvbnMgb2YgSUUuXG4gIGFkZFNjcm9sbExpc3RlbmVyKHRhcmdldCwgbWFrZUhhbmRsZVNjcm9sbChwYWlycywgb3B0aW9ucy5vblNjcm9sbCwgb3B0aW9ucy5kZWJvdW5jZVRpbWUpKTtcblxuICBuYXZiYXIuYXBwZW5kQ2hpbGQobmF2TGlzdCk7XG5cbiAgcmV0dXJuIG5hdmJhcjtcbn1cbiIsIihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG5cdHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcblx0dHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcblx0KGdsb2JhbC5zY3JvbGxJbnRvVmlld0lmTmVlZGVkID0gZmFjdG9yeSgpKTtcbn0odGhpcywgKGZ1bmN0aW9uICgpIHsgJ3VzZSBzdHJpY3QnO1xuXG4vKipcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9ncmUvYmV6aWVyLWVhc2luZ1xuICogQmV6aWVyRWFzaW5nIC0gdXNlIGJlemllciBjdXJ2ZSBmb3IgdHJhbnNpdGlvbiBlYXNpbmcgZnVuY3Rpb25cbiAqIGJ5IEdhw6t0YW4gUmVuYXVkZWF1IDIwMTQgLSAyMDE1IOKAkyBNSVQgTGljZW5zZVxuICovXG5cbi8vIFRoZXNlIHZhbHVlcyBhcmUgZXN0YWJsaXNoZWQgYnkgZW1waXJpY2lzbSB3aXRoIHRlc3RzICh0cmFkZW9mZjogcGVyZm9ybWFuY2UgVlMgcHJlY2lzaW9uKVxudmFyIE5FV1RPTl9JVEVSQVRJT05TID0gNDtcbnZhciBORVdUT05fTUlOX1NMT1BFID0gMC4wMDE7XG52YXIgU1VCRElWSVNJT05fUFJFQ0lTSU9OID0gMC4wMDAwMDAxO1xudmFyIFNVQkRJVklTSU9OX01BWF9JVEVSQVRJT05TID0gMTA7XG5cbnZhciBrU3BsaW5lVGFibGVTaXplID0gMTE7XG52YXIga1NhbXBsZVN0ZXBTaXplID0gMS4wIC8gKGtTcGxpbmVUYWJsZVNpemUgLSAxLjApO1xuXG52YXIgZmxvYXQzMkFycmF5U3VwcG9ydGVkID0gdHlwZW9mIEZsb2F0MzJBcnJheSA9PT0gJ2Z1bmN0aW9uJztcblxuZnVuY3Rpb24gQSAoYUExLCBhQTIpIHsgcmV0dXJuIDEuMCAtIDMuMCAqIGFBMiArIDMuMCAqIGFBMTsgfVxuZnVuY3Rpb24gQiAoYUExLCBhQTIpIHsgcmV0dXJuIDMuMCAqIGFBMiAtIDYuMCAqIGFBMTsgfVxuZnVuY3Rpb24gQyAoYUExKSAgICAgIHsgcmV0dXJuIDMuMCAqIGFBMTsgfVxuXG4vLyBSZXR1cm5zIHgodCkgZ2l2ZW4gdCwgeDEsIGFuZCB4Miwgb3IgeSh0KSBnaXZlbiB0LCB5MSwgYW5kIHkyLlxuZnVuY3Rpb24gY2FsY0JlemllciAoYVQsIGFBMSwgYUEyKSB7IHJldHVybiAoKEEoYUExLCBhQTIpICogYVQgKyBCKGFBMSwgYUEyKSkgKiBhVCArIEMoYUExKSkgKiBhVDsgfVxuXG4vLyBSZXR1cm5zIGR4L2R0IGdpdmVuIHQsIHgxLCBhbmQgeDIsIG9yIGR5L2R0IGdpdmVuIHQsIHkxLCBhbmQgeTIuXG5mdW5jdGlvbiBnZXRTbG9wZSAoYVQsIGFBMSwgYUEyKSB7IHJldHVybiAzLjAgKiBBKGFBMSwgYUEyKSAqIGFUICogYVQgKyAyLjAgKiBCKGFBMSwgYUEyKSAqIGFUICsgQyhhQTEpOyB9XG5cbmZ1bmN0aW9uIGJpbmFyeVN1YmRpdmlkZSAoYVgsIGFBLCBhQiwgbVgxLCBtWDIpIHtcbiAgdmFyIGN1cnJlbnRYLCBjdXJyZW50VCwgaSA9IDA7XG4gIGRvIHtcbiAgICBjdXJyZW50VCA9IGFBICsgKGFCIC0gYUEpIC8gMi4wO1xuICAgIGN1cnJlbnRYID0gY2FsY0JlemllcihjdXJyZW50VCwgbVgxLCBtWDIpIC0gYVg7XG4gICAgaWYgKGN1cnJlbnRYID4gMC4wKSB7XG4gICAgICBhQiA9IGN1cnJlbnRUO1xuICAgIH0gZWxzZSB7XG4gICAgICBhQSA9IGN1cnJlbnRUO1xuICAgIH1cbiAgfSB3aGlsZSAoTWF0aC5hYnMoY3VycmVudFgpID4gU1VCRElWSVNJT05fUFJFQ0lTSU9OICYmICsraSA8IFNVQkRJVklTSU9OX01BWF9JVEVSQVRJT05TKTtcbiAgcmV0dXJuIGN1cnJlbnRUO1xufVxuXG5mdW5jdGlvbiBuZXd0b25SYXBoc29uSXRlcmF0ZSAoYVgsIGFHdWVzc1QsIG1YMSwgbVgyKSB7XG4gZm9yICh2YXIgaSA9IDA7IGkgPCBORVdUT05fSVRFUkFUSU9OUzsgKytpKSB7XG4gICB2YXIgY3VycmVudFNsb3BlID0gZ2V0U2xvcGUoYUd1ZXNzVCwgbVgxLCBtWDIpO1xuICAgaWYgKGN1cnJlbnRTbG9wZSA9PT0gMC4wKSB7XG4gICAgIHJldHVybiBhR3Vlc3NUO1xuICAgfVxuICAgdmFyIGN1cnJlbnRYID0gY2FsY0JlemllcihhR3Vlc3NULCBtWDEsIG1YMikgLSBhWDtcbiAgIGFHdWVzc1QgLT0gY3VycmVudFggLyBjdXJyZW50U2xvcGU7XG4gfVxuIHJldHVybiBhR3Vlc3NUO1xufVxuXG52YXIgc3JjID0gZnVuY3Rpb24gYmV6aWVyIChtWDEsIG1ZMSwgbVgyLCBtWTIpIHtcbiAgaWYgKCEoMCA8PSBtWDEgJiYgbVgxIDw9IDEgJiYgMCA8PSBtWDIgJiYgbVgyIDw9IDEpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdiZXppZXIgeCB2YWx1ZXMgbXVzdCBiZSBpbiBbMCwgMV0gcmFuZ2UnKTtcbiAgfVxuXG4gIC8vIFByZWNvbXB1dGUgc2FtcGxlcyB0YWJsZVxuICB2YXIgc2FtcGxlVmFsdWVzID0gZmxvYXQzMkFycmF5U3VwcG9ydGVkID8gbmV3IEZsb2F0MzJBcnJheShrU3BsaW5lVGFibGVTaXplKSA6IG5ldyBBcnJheShrU3BsaW5lVGFibGVTaXplKTtcbiAgaWYgKG1YMSAhPT0gbVkxIHx8IG1YMiAhPT0gbVkyKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrU3BsaW5lVGFibGVTaXplOyArK2kpIHtcbiAgICAgIHNhbXBsZVZhbHVlc1tpXSA9IGNhbGNCZXppZXIoaSAqIGtTYW1wbGVTdGVwU2l6ZSwgbVgxLCBtWDIpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFRGb3JYIChhWCkge1xuICAgIHZhciBpbnRlcnZhbFN0YXJ0ID0gMC4wO1xuICAgIHZhciBjdXJyZW50U2FtcGxlID0gMTtcbiAgICB2YXIgbGFzdFNhbXBsZSA9IGtTcGxpbmVUYWJsZVNpemUgLSAxO1xuXG4gICAgZm9yICg7IGN1cnJlbnRTYW1wbGUgIT09IGxhc3RTYW1wbGUgJiYgc2FtcGxlVmFsdWVzW2N1cnJlbnRTYW1wbGVdIDw9IGFYOyArK2N1cnJlbnRTYW1wbGUpIHtcbiAgICAgIGludGVydmFsU3RhcnQgKz0ga1NhbXBsZVN0ZXBTaXplO1xuICAgIH1cbiAgICAtLWN1cnJlbnRTYW1wbGU7XG5cbiAgICAvLyBJbnRlcnBvbGF0ZSB0byBwcm92aWRlIGFuIGluaXRpYWwgZ3Vlc3MgZm9yIHRcbiAgICB2YXIgZGlzdCA9IChhWCAtIHNhbXBsZVZhbHVlc1tjdXJyZW50U2FtcGxlXSkgLyAoc2FtcGxlVmFsdWVzW2N1cnJlbnRTYW1wbGUgKyAxXSAtIHNhbXBsZVZhbHVlc1tjdXJyZW50U2FtcGxlXSk7XG4gICAgdmFyIGd1ZXNzRm9yVCA9IGludGVydmFsU3RhcnQgKyBkaXN0ICoga1NhbXBsZVN0ZXBTaXplO1xuXG4gICAgdmFyIGluaXRpYWxTbG9wZSA9IGdldFNsb3BlKGd1ZXNzRm9yVCwgbVgxLCBtWDIpO1xuICAgIGlmIChpbml0aWFsU2xvcGUgPj0gTkVXVE9OX01JTl9TTE9QRSkge1xuICAgICAgcmV0dXJuIG5ld3RvblJhcGhzb25JdGVyYXRlKGFYLCBndWVzc0ZvclQsIG1YMSwgbVgyKTtcbiAgICB9IGVsc2UgaWYgKGluaXRpYWxTbG9wZSA9PT0gMC4wKSB7XG4gICAgICByZXR1cm4gZ3Vlc3NGb3JUO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gYmluYXJ5U3ViZGl2aWRlKGFYLCBpbnRlcnZhbFN0YXJ0LCBpbnRlcnZhbFN0YXJ0ICsga1NhbXBsZVN0ZXBTaXplLCBtWDEsIG1YMik7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIEJlemllckVhc2luZyAoeCkge1xuICAgIGlmIChtWDEgPT09IG1ZMSAmJiBtWDIgPT09IG1ZMikge1xuICAgICAgcmV0dXJuIHg7IC8vIGxpbmVhclxuICAgIH1cbiAgICAvLyBCZWNhdXNlIEphdmFTY3JpcHQgbnVtYmVyIGFyZSBpbXByZWNpc2UsIHdlIHNob3VsZCBndWFyYW50ZWUgdGhlIGV4dHJlbWVzIGFyZSByaWdodC5cbiAgICBpZiAoeCA9PT0gMCkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIGlmICh4ID09PSAxKSB7XG4gICAgICByZXR1cm4gMTtcbiAgICB9XG4gICAgcmV0dXJuIGNhbGNCZXppZXIoZ2V0VEZvclgoeCksIG1ZMSwgbVkyKTtcbiAgfTtcbn07XG5cbi8vIFByZWRlZmluZWQgc2V0IG9mIGFuaW1hdGlvbnMuIFNpbWlsYXIgdG8gQ1NTIGVhc2luZyBmdW5jdGlvbnNcbnZhciBhbmltYXRpb25zID0ge1xuICBlYXNlOiAgc3JjKDAuMjUsIDAuMSwgMC4yNSwgMSksXG4gIGVhc2VJbjogc3JjKDAuNDIsIDAsIDEsIDEpLFxuICBlYXNlT3V0OiBzcmMoMCwgMCwgMC41OCwgMSksXG4gIGVhc2VJbk91dDogc3JjKDAuNDIsIDAsIDAuNTgsIDEpLFxuICBsaW5lYXI6IHNyYygwLCAwLCAxLCAxKVxufTtcblxuXG52YXIgYW1hdG9yID0gYW5pbWF0ZTtcblxuZnVuY3Rpb24gYW5pbWF0ZShzb3VyY2UsIHRhcmdldCwgb3B0aW9ucykge1xuICB2YXIgc3RhcnQ9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIHZhciBkaWZmID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gIC8vIFdlIGxldCBjbGllbnRzIHNwZWNpZnkgdGhlaXIgb3duIGVhc2luZyBmdW5jdGlvblxuICB2YXIgZWFzaW5nID0gKHR5cGVvZiBvcHRpb25zLmVhc2luZyA9PT0gJ2Z1bmN0aW9uJykgPyBvcHRpb25zLmVhc2luZyA6IGFuaW1hdGlvbnNbb3B0aW9ucy5lYXNpbmddO1xuXG4gIC8vIGlmIG5vdGhpbmcgaXMgc3BlY2lmaWVkLCBkZWZhdWx0IHRvIGVhc2UgKHNpbWlsYXIgdG8gQ1NTIGFuaW1hdGlvbnMpXG4gIGlmICghZWFzaW5nKSB7XG4gICAgaWYgKG9wdGlvbnMuZWFzaW5nKSB7XG4gICAgICBjb25zb2xlLndhcm4oJ1Vua25vd24gZWFzaW5nIGZ1bmN0aW9uIGluIGFtYXRvcjogJyArIG9wdGlvbnMuZWFzaW5nKTtcbiAgICB9XG4gICAgZWFzaW5nID0gYW5pbWF0aW9ucy5lYXNlO1xuICB9XG5cbiAgdmFyIHN0ZXAgPSB0eXBlb2Ygb3B0aW9ucy5zdGVwID09PSAnZnVuY3Rpb24nID8gb3B0aW9ucy5zdGVwIDogbm9vcDtcbiAgdmFyIGRvbmUgPSB0eXBlb2Ygb3B0aW9ucy5kb25lID09PSAnZnVuY3Rpb24nID8gb3B0aW9ucy5kb25lIDogbm9vcDtcblxuICB2YXIgc2NoZWR1bGVyID0gZ2V0U2NoZWR1bGVyKG9wdGlvbnMuc2NoZWR1bGVyKTtcblxuICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRhcmdldCk7XG4gIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICBzdGFydFtrZXldID0gc291cmNlW2tleV07XG4gICAgZGlmZltrZXldID0gdGFyZ2V0W2tleV0gLSBzb3VyY2Vba2V5XTtcbiAgfSk7XG5cbiAgdmFyIGR1cmF0aW9uSW5NcyA9IG9wdGlvbnMuZHVyYXRpb24gfHwgNDAwO1xuICB2YXIgZHVyYXRpb25JbkZyYW1lcyA9IE1hdGgubWF4KDEsIGR1cmF0aW9uSW5NcyAqIDAuMDYpOyAvLyAwLjA2IGJlY2F1c2UgNjAgZnJhbWVzIHBlcnMgMSwwMDAgbXNcbiAgdmFyIHByZXZpb3VzQW5pbWF0aW9uSWQ7XG4gIHZhciBmcmFtZSA9IDA7XG5cbiAgcHJldmlvdXNBbmltYXRpb25JZCA9IHNjaGVkdWxlci5uZXh0KGxvb3ApO1xuXG4gIHJldHVybiB7XG4gICAgY2FuY2VsOiBjYW5jZWxcbiAgfVxuXG4gIGZ1bmN0aW9uIGNhbmNlbCgpIHtcbiAgICBzY2hlZHVsZXIuY2FuY2VsKHByZXZpb3VzQW5pbWF0aW9uSWQpO1xuICAgIHByZXZpb3VzQW5pbWF0aW9uSWQgPSAwO1xuICB9XG5cbiAgZnVuY3Rpb24gbG9vcCgpIHtcbiAgICB2YXIgdCA9IGVhc2luZyhmcmFtZS9kdXJhdGlvbkluRnJhbWVzKTtcbiAgICBmcmFtZSArPSAxO1xuICAgIHNldFZhbHVlcyh0KTtcbiAgICBpZiAoZnJhbWUgPD0gZHVyYXRpb25JbkZyYW1lcykge1xuICAgICAgcHJldmlvdXNBbmltYXRpb25JZCA9IHNjaGVkdWxlci5uZXh0KGxvb3ApO1xuICAgICAgc3RlcChzb3VyY2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwcmV2aW91c0FuaW1hdGlvbklkID0gMDtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IGRvbmUoc291cmNlKTsgfSwgMCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gc2V0VmFsdWVzKHQpIHtcbiAgICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgICBzb3VyY2Vba2V5XSA9IGRpZmZba2V5XSAqIHQgKyBzdGFydFtrZXldO1xuICAgIH0pO1xuICB9XG59XG5cbmZ1bmN0aW9uIG5vb3AoKSB7IH1cblxuZnVuY3Rpb24gZ2V0U2NoZWR1bGVyKHNjaGVkdWxlcikge1xuICBpZiAoIXNjaGVkdWxlcikge1xuICAgIHZhciBjYW5SYWYgPSB0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJyAmJiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lO1xuICAgIHJldHVybiBjYW5SYWYgPyByYWZTY2hlZHVsZXIoKSA6IHRpbWVvdXRTY2hlZHVsZXIoKVxuICB9XG4gIGlmICh0eXBlb2Ygc2NoZWR1bGVyLm5leHQgIT09ICdmdW5jdGlvbicpIHRocm93IG5ldyBFcnJvcignU2NoZWR1bGVyIGlzIHN1cHBvc2VkIHRvIGhhdmUgbmV4dChjYikgZnVuY3Rpb24nKVxuICBpZiAodHlwZW9mIHNjaGVkdWxlci5jYW5jZWwgIT09ICdmdW5jdGlvbicpIHRocm93IG5ldyBFcnJvcignU2NoZWR1bGVyIGlzIHN1cHBvc2VkIHRvIGhhdmUgY2FuY2VsKGhhbmRsZSkgZnVuY3Rpb24nKVxuXG4gIHJldHVybiBzY2hlZHVsZXJcbn1cblxuZnVuY3Rpb24gcmFmU2NoZWR1bGVyKCkge1xuICByZXR1cm4ge1xuICAgIG5leHQ6IHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUuYmluZCh3aW5kb3cpLFxuICAgIGNhbmNlbDogd2luZG93LmNhbmNlbEFuaW1hdGlvbkZyYW1lLmJpbmQod2luZG93KVxuICB9XG59XG5cbmZ1bmN0aW9uIHRpbWVvdXRTY2hlZHVsZXIoKSB7XG4gIHJldHVybiB7XG4gICAgbmV4dDogZnVuY3Rpb24oY2IpIHtcbiAgICAgIHJldHVybiBzZXRUaW1lb3V0KGNiLCAxMDAwLzYwKVxuICAgIH0sXG4gICAgY2FuY2VsOiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIHJldHVybiBjbGVhclRpbWVvdXQoaWQpXG4gICAgfVxuICB9XG59XG5cbnZhciBfX2Fzc2lnbiQxID0gKHVuZGVmaW5lZCAmJiB1bmRlZmluZWQuX19hc3NpZ24pIHx8IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24odCkge1xuICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpXG4gICAgICAgICAgICB0W3BdID0gc1twXTtcbiAgICB9XG4gICAgcmV0dXJuIHQ7XG59O1xudmFyIGhhbmRsZVNjcm9sbCQxID0gZnVuY3Rpb24gKHBhcmVudCwgX2EpIHtcbiAgICB2YXIgc2Nyb2xsTGVmdCA9IF9hLnNjcm9sbExlZnQsIHNjcm9sbFRvcCA9IF9hLnNjcm9sbFRvcDtcbiAgICBwYXJlbnQuc2Nyb2xsTGVmdCA9IHNjcm9sbExlZnQ7XG4gICAgcGFyZW50LnNjcm9sbFRvcCA9IHNjcm9sbFRvcDtcbn07XG5mdW5jdGlvbiBjYWxjdWxhdGUodGFyZ2V0LCBvcHRpb25zKSB7XG4gICAgaWYgKCF0YXJnZXQgfHwgISh0YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRWxlbWVudCBpcyByZXF1aXJlZCBpbiBzY3JvbGxJbnRvVmlld0lmTmVlZGVkJyk7XG4gICAgdmFyIGNvbmZpZyA9IF9fYXNzaWduJDEoeyBoYW5kbGVTY3JvbGw6IGhhbmRsZVNjcm9sbCQxIH0sIG9wdGlvbnMpO1xuICAgIHZhciBkZWZhdWx0T2Zmc2V0ID0geyB0b3A6IDAsIHJpZ2h0OiAwLCBib3R0b206IDAsIGxlZnQ6IDAgfTtcbiAgICBjb25maWcub2Zmc2V0ID0gY29uZmlnLm9mZnNldFxuICAgICAgICA/IF9fYXNzaWduJDEoe30sIGRlZmF1bHRPZmZzZXQsIGNvbmZpZy5vZmZzZXQpIDogZGVmYXVsdE9mZnNldDtcbiAgICBmdW5jdGlvbiB3aXRoaW5Cb3VuZHModmFsdWUsIG1pbiwgbWF4LCBleHRlbnQpIHtcbiAgICAgICAgaWYgKGNvbmZpZy5jZW50ZXJJZk5lZWRlZCA9PT0gZmFsc2UgfHxcbiAgICAgICAgICAgIChtYXggPD0gdmFsdWUgKyBleHRlbnQgJiYgdmFsdWUgPD0gbWluICsgZXh0ZW50KSkge1xuICAgICAgICAgICAgcmV0dXJuIE1hdGgubWluKG1heCwgTWF0aC5tYXgobWluLCB2YWx1ZSkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIChtaW4gKyBtYXgpIC8gMjtcbiAgICAgICAgfVxuICAgIH1cbiAgICB2YXIgb2Zmc2V0ID0gY29uZmlnLm9mZnNldDtcbiAgICB2YXIgb2Zmc2V0VG9wID0gb2Zmc2V0LnRvcDtcbiAgICB2YXIgb2Zmc2V0TGVmdCA9IG9mZnNldC5sZWZ0O1xuICAgIHZhciBvZmZzZXRCb3R0b20gPSBvZmZzZXQuYm90dG9tO1xuICAgIHZhciBvZmZzZXRSaWdodCA9IG9mZnNldC5yaWdodDtcbiAgICBmdW5jdGlvbiBtYWtlQXJlYShsZWZ0LCB0b3AsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGxlZnQ6IGxlZnQgKyBvZmZzZXRMZWZ0LFxuICAgICAgICAgICAgdG9wOiB0b3AgKyBvZmZzZXRUb3AsXG4gICAgICAgICAgICB3aWR0aDogd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHQ6IGhlaWdodCxcbiAgICAgICAgICAgIHJpZ2h0OiBsZWZ0ICsgb2Zmc2V0TGVmdCArIHdpZHRoICsgb2Zmc2V0UmlnaHQsXG4gICAgICAgICAgICBib3R0b206IHRvcCArIG9mZnNldFRvcCArIGhlaWdodCArIG9mZnNldEJvdHRvbSxcbiAgICAgICAgICAgIHRyYW5zbGF0ZTogZnVuY3Rpb24gKHgsIHkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbWFrZUFyZWEoeCArIGxlZnQgKyBvZmZzZXRMZWZ0LCB5ICsgdG9wICsgb2Zmc2V0VG9wLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZWxhdGl2ZUZyb21UbzogZnVuY3Rpb24gKGxocywgcmhzKSB7XG4gICAgICAgICAgICAgICAgdmFyIG5ld0xlZnQgPSBsZWZ0ICsgb2Zmc2V0TGVmdCwgbmV3VG9wID0gdG9wICsgb2Zmc2V0VG9wO1xuICAgICAgICAgICAgICAgIGxocyA9IGxocy5vZmZzZXRQYXJlbnQ7XG4gICAgICAgICAgICAgICAgcmhzID0gcmhzLm9mZnNldFBhcmVudDtcbiAgICAgICAgICAgICAgICBpZiAobGhzID09PSByaHMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFyZWE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAoOyBsaHM7IGxocyA9IGxocy5vZmZzZXRQYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3TGVmdCArPSBsaHMub2Zmc2V0TGVmdCArIGxocy5jbGllbnRMZWZ0O1xuICAgICAgICAgICAgICAgICAgICBuZXdUb3AgKz0gbGhzLm9mZnNldFRvcCArIGxocy5jbGllbnRUb3A7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAoOyByaHM7IHJocyA9IHJocy5vZmZzZXRQYXJlbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgbmV3TGVmdCAtPSByaHMub2Zmc2V0TGVmdCArIHJocy5jbGllbnRMZWZ0O1xuICAgICAgICAgICAgICAgICAgICBuZXdUb3AgLT0gcmhzLm9mZnNldFRvcCArIHJocy5jbGllbnRUb3A7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBtYWtlQXJlYShuZXdMZWZ0LCBuZXdUb3AsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgfTtcbiAgICB9XG4gICAgdmFyIHBhcmVudCwgYXJlYSA9IG1ha2VBcmVhKHRhcmdldC5vZmZzZXRMZWZ0LCB0YXJnZXQub2Zmc2V0VG9wLCB0YXJnZXQub2Zmc2V0V2lkdGgsIHRhcmdldC5vZmZzZXRIZWlnaHQpO1xuICAgIHdoaWxlICgocGFyZW50ID0gdGFyZ2V0LnBhcmVudE5vZGUpIGluc3RhbmNlb2YgSFRNTEVsZW1lbnQgJiZcbiAgICAgICAgdGFyZ2V0ICE9PSBjb25maWcuYm91bmRhcnkpIHtcbiAgICAgICAgdmFyIGNsaWVudExlZnQgPSBwYXJlbnQub2Zmc2V0TGVmdCArIHBhcmVudC5jbGllbnRMZWZ0O1xuICAgICAgICB2YXIgY2xpZW50VG9wID0gcGFyZW50Lm9mZnNldFRvcCArIHBhcmVudC5jbGllbnRUb3A7XG4gICAgICAgIC8vIE1ha2UgYXJlYSByZWxhdGl2ZSB0byBwYXJlbnQncyBjbGllbnQgYXJlYS5cbiAgICAgICAgYXJlYSA9IGFyZWFcbiAgICAgICAgICAgIC5yZWxhdGl2ZUZyb21Ubyh0YXJnZXQsIHBhcmVudClcbiAgICAgICAgICAgIC50cmFuc2xhdGUoLWNsaWVudExlZnQsIC1jbGllbnRUb3ApO1xuICAgICAgICB2YXIgc2Nyb2xsTGVmdCA9IHdpdGhpbkJvdW5kcyhwYXJlbnQuc2Nyb2xsTGVmdCwgYXJlYS5yaWdodCAtIHBhcmVudC5jbGllbnRXaWR0aCwgYXJlYS5sZWZ0LCBwYXJlbnQuY2xpZW50V2lkdGgpO1xuICAgICAgICB2YXIgc2Nyb2xsVG9wID0gd2l0aGluQm91bmRzKHBhcmVudC5zY3JvbGxUb3AsIGFyZWEuYm90dG9tIC0gcGFyZW50LmNsaWVudEhlaWdodCwgYXJlYS50b3AsIHBhcmVudC5jbGllbnRIZWlnaHQpO1xuICAgICAgICAvLyBQYXNzIHRoZSBuZXcgY29vcmRpbmF0ZXMgdG8gdGhlIGhhbmRsZVNjcm9sbCBjYWxsYmFja1xuICAgICAgICBjb25maWcuaGFuZGxlU2Nyb2xsKHBhcmVudCwgeyBzY3JvbGxMZWZ0OiBzY3JvbGxMZWZ0LCBzY3JvbGxUb3A6IHNjcm9sbFRvcCB9LCBjb25maWcpO1xuICAgICAgICAvLyBEZXRlcm1pbmUgYWN0dWFsIHNjcm9sbCBhbW91bnQgYnkgcmVhZGluZyBiYWNrIHNjcm9sbCBwcm9wZXJ0aWVzLlxuICAgICAgICBhcmVhID0gYXJlYS50cmFuc2xhdGUoY2xpZW50TGVmdCAtIHBhcmVudC5zY3JvbGxMZWZ0LCBjbGllbnRUb3AgLSBwYXJlbnQuc2Nyb2xsVG9wKTtcbiAgICAgICAgdGFyZ2V0ID0gcGFyZW50O1xuICAgIH1cbn1cblxudmFyIF9fYXNzaWduID0gKHVuZGVmaW5lZCAmJiB1bmRlZmluZWQuX19hc3NpZ24pIHx8IE9iamVjdC5hc3NpZ24gfHwgZnVuY3Rpb24odCkge1xuICAgIGZvciAodmFyIHMsIGkgPSAxLCBuID0gYXJndW1lbnRzLmxlbmd0aDsgaSA8IG47IGkrKykge1xuICAgICAgICBzID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBmb3IgKHZhciBwIGluIHMpIGlmIChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwocywgcCkpXG4gICAgICAgICAgICB0W3BdID0gc1twXTtcbiAgICB9XG4gICAgcmV0dXJuIHQ7XG59O1xudmFyIGhhbmRsZVNjcm9sbCA9IGZ1bmN0aW9uIChwYXJlbnQsIF9hLCBjb25maWcpIHtcbiAgICB2YXIgc2Nyb2xsTGVmdCA9IF9hLnNjcm9sbExlZnQsIHNjcm9sbFRvcCA9IF9hLnNjcm9sbFRvcDtcbiAgICBpZiAoY29uZmlnLmR1cmF0aW9uKSB7XG4gICAgICAgIGFtYXRvcihwYXJlbnQsIHtcbiAgICAgICAgICAgIHNjcm9sbExlZnQ6IHNjcm9sbExlZnQsXG4gICAgICAgICAgICBzY3JvbGxUb3A6IHNjcm9sbFRvcCxcbiAgICAgICAgfSwgeyBkdXJhdGlvbjogY29uZmlnLmR1cmF0aW9uLCBlYXNpbmc6IGNvbmZpZy5lYXNpbmcgfSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBwYXJlbnQuc2Nyb2xsTGVmdCA9IHNjcm9sbExlZnQ7XG4gICAgICAgIHBhcmVudC5zY3JvbGxUb3AgPSBzY3JvbGxUb3A7XG4gICAgfVxufTtcbmZ1bmN0aW9uIGlzQm9vbGVhbihvcHRpb25zKSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvcHRpb25zID09PSAnYm9vbGVhbic7XG59XG5mdW5jdGlvbiBzY3JvbGxJbnRvVmlld0lmTmVlZGVkKHRhcmdldCwgb3B0aW9ucywgYW5pbWF0ZU9wdGlvbnMsIGZpbmFsRWxlbWVudCwgb2Zmc2V0T3B0aW9ucykge1xuICAgIGlmIChvZmZzZXRPcHRpb25zID09PSB2b2lkIDApIHsgb2Zmc2V0T3B0aW9ucyA9IHt9OyB9XG4gICAgaWYgKCF0YXJnZXQgfHwgISh0YXJnZXQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRWxlbWVudCBpcyByZXF1aXJlZCBpbiBzY3JvbGxJbnRvVmlld0lmTmVlZGVkJyk7XG4gICAgdmFyIGNvbmZpZyA9IHsgY2VudGVySWZOZWVkZWQ6IGZhbHNlLCBoYW5kbGVTY3JvbGw6IGhhbmRsZVNjcm9sbCB9O1xuICAgIGlmIChpc0Jvb2xlYW4ob3B0aW9ucykpIHtcbiAgICAgICAgY29uZmlnLmNlbnRlcklmTmVlZGVkID0gb3B0aW9ucztcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGNvbmZpZyA9IF9fYXNzaWduKHt9LCBjb25maWcsIG9wdGlvbnMpO1xuICAgIH1cbiAgICB2YXIgZGVmYXVsdE9mZnNldCA9IHsgdG9wOiAwLCByaWdodDogMCwgYm90dG9tOiAwLCBsZWZ0OiAwIH07XG4gICAgY29uZmlnLm9mZnNldCA9IGNvbmZpZy5vZmZzZXRcbiAgICAgICAgPyBfX2Fzc2lnbih7fSwgZGVmYXVsdE9mZnNldCwgY29uZmlnLm9mZnNldCkgOiBkZWZhdWx0T2Zmc2V0O1xuICAgIGlmIChhbmltYXRlT3B0aW9ucykge1xuICAgICAgICBjb25maWcuZHVyYXRpb24gPSBhbmltYXRlT3B0aW9ucy5kdXJhdGlvbjtcbiAgICAgICAgY29uZmlnLmVhc2luZyA9IGFuaW1hdGVPcHRpb25zLmVhc2luZztcbiAgICB9XG4gICAgaWYgKGZpbmFsRWxlbWVudCkge1xuICAgICAgICBjb25maWcuYm91bmRhcnkgPSBmaW5hbEVsZW1lbnQ7XG4gICAgfVxuICAgIGlmIChvZmZzZXRPcHRpb25zLm9mZnNldFRvcCkge1xuICAgICAgICBjb25maWcub2Zmc2V0LnRvcCA9IG9mZnNldE9wdGlvbnMub2Zmc2V0VG9wO1xuICAgIH1cbiAgICBpZiAob2Zmc2V0T3B0aW9ucy5vZmZzZXRSaWdodCkge1xuICAgICAgICBjb25maWcub2Zmc2V0LnJpZ2h0ID0gb2Zmc2V0T3B0aW9ucy5vZmZzZXRSaWdodDtcbiAgICB9XG4gICAgaWYgKG9mZnNldE9wdGlvbnMub2Zmc2V0Qm90dG9tKSB7XG4gICAgICAgIGNvbmZpZy5vZmZzZXQuYm90dG9tID0gb2Zmc2V0T3B0aW9ucy5vZmZzZXRCb3R0b207XG4gICAgfVxuICAgIGlmIChvZmZzZXRPcHRpb25zLm9mZnNldExlZnQpIHtcbiAgICAgICAgY29uZmlnLm9mZnNldC5sZWZ0ID0gb2Zmc2V0T3B0aW9ucy5vZmZzZXRMZWZ0O1xuICAgIH1cbiAgICByZXR1cm4gY2FsY3VsYXRlKHRhcmdldCwgY29uZmlnKTtcbn1cblxucmV0dXJuIHNjcm9sbEludG9WaWV3SWZOZWVkZWQ7XG5cbn0pKSk7XG4iXX0=
