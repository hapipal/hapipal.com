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

    if (!menuButton || !topButton || !docsNav || !docsNavLinks) {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvcHVibGljL2pzL2RvY3MtbmF2LmpzIiwibGliL3B1YmxpYy9qcy9tYWluLmpzIiwibGliL3B1YmxpYy9qcy92ZW5kb3IvbmF2YmFyLmpzIiwibm9kZV9tb2R1bGVzL3Njcm9sbC1pbnRvLXZpZXctaWYtbmVlZGVkL2Rpc3QvYnVuZGxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7Ozs7O0FBRUEsSUFBTSx5QkFBeUIsUUFBUSw0QkFBUixDQUEvQjtBQUNBLElBQU0sU0FBUyxRQUFRLGlCQUFSLENBQWY7O0FBRUEsSUFBTSxZQUFZLEVBQWxCOztBQUVBLElBQU0sc0JBQXNCLEVBQTVCO0FBQ0EsSUFBTSxjQUFjLEVBQXBCOztBQUVBLFFBQVEsSUFBUixHQUFlLFVBQUMsU0FBRCxFQUFZLEtBQVosRUFBc0I7O0FBRWpDLFFBQUksQ0FBQyxTQUFMLEVBQWdCO0FBQ1o7QUFDSDs7QUFFRCxRQUFJLENBQUMsS0FBTCxFQUFZO0FBQ1IsY0FBTSxJQUFJLEtBQUosQ0FBVSxrRUFBVixDQUFOO0FBQ0g7O0FBRUQsUUFBTSxZQUFZLElBQUksVUFBVSxTQUFkLEVBQWxCOztBQUVBLFFBQU0sU0FBUyxPQUFPO0FBQ2xCLGlCQUFTLE1BQU0sT0FERztBQUVsQixxQkFBYSxVQUFVLGdCQUFWLENBQTJCLHdCQUEzQixDQUZLO0FBR2xCLHlCQUFpQix5QkFBQyxFQUFELEVBQVE7O0FBRXJCLGlCQUFLLEdBQUcsU0FBSCxDQUFhLElBQWIsQ0FBTDs7QUFFQSxnQkFBTSxTQUFTLEdBQUcsV0FBSCxDQUFlLEdBQUcsYUFBSCxDQUFpQixHQUFqQixDQUFmLENBQWY7QUFDQSxnQkFBTSxTQUFTLE9BQU8sR0FBRyxPQUFILENBQVcsT0FBWCxDQUFtQixHQUFuQixFQUF3QixFQUF4QixDQUFQLENBQWY7O0FBRUEsbUJBQU8sVUFBVSxNQUFWLENBQ0gsVUFBVSxJQUFWLENB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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0Jztcbi8qIGdsb2JhbCBkb2N1bWVudCAqL1xuXG5jb25zdCBTY3JvbGxJbnRvVmlld0lmTmVlZGVkID0gcmVxdWlyZSgnc2Nyb2xsLWludG8tdmlldy1pZi1uZWVkZWQnKTtcbmNvbnN0IE5hdmJhciA9IHJlcXVpcmUoJy4vdmVuZG9yL25hdmJhcicpO1xuXG5jb25zdCBpbnRlcm5hbHMgPSB7fTtcblxuY29uc3QgRklYRURfSEVBREVSX0hFSUdIVCA9IDgwO1xuY29uc3QgVE9QX1BBRERJTkcgPSAzNTtcblxuZXhwb3J0cy5pbml0ID0gKGNvbnRlbnRFbCwgbmF2RWwpID0+IHtcblxuICAgIGlmICghY29udGVudEVsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoIW5hdkVsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignRG9jcyBuYXZpZ2F0aW9uIGNvbnRlbnQgZWxlbWVudCBleGlzdHMsIGJ1dCBub3QgdGhlIG5hdiBlbGVtZW50LicpO1xuICAgIH1cblxuICAgIGNvbnN0IGhhc2hTdGF0ZSA9IG5ldyBpbnRlcm5hbHMuSGFzaFN0YXRlKCk7XG5cbiAgICBjb25zdCBuYXZiYXIgPSBOYXZiYXIoe1xuICAgICAgICB0YWdOYW1lOiBuYXZFbC50YWdOYW1lLFxuICAgICAgICBlbGVtZW50TGlzdDogY29udGVudEVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ2gxLCBoMiwgaDMsIGg0LCBoNSwgaDYnKSxcbiAgICAgICAgbWFrZU5hdkxpc3RJdGVtOiAoZWwpID0+IHtcblxuICAgICAgICAgICAgZWwgPSBlbC5jbG9uZU5vZGUodHJ1ZSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGFuY2hvciA9IGVsLnJlbW92ZUNoaWxkKGVsLnF1ZXJ5U2VsZWN0b3IoJ2EnKSk7XG4gICAgICAgICAgICBjb25zdCBpbmRlbnQgPSBOdW1iZXIoZWwudGFnTmFtZS5yZXBsYWNlKCdIJywgJycpKTtcblxuICAgICAgICAgICAgcmV0dXJuIGludGVybmFscy5yZW5kZXIoXG4gICAgICAgICAgICAgICAgaW50ZXJuYWxzLml0ZW0oZWwuaW5uZXJIVE1MLCBhbmNob3IuaGFzaCwgaW5kZW50KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcbiAgICAgICAgb25TY3JvbGw6IChuYXZJdGVtKSA9PiB7XG5cbiAgICAgICAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaCAhPT0gbmF2SXRlbS5oYXNoICYmICFoYXNoU3RhdGUuYXV0b1Njcm9sbGluZyAmJiAhaGFzaFN0YXRlLmZpcnN0U2Nyb2xsKSB7XG4gICAgICAgICAgICAgICAgaGFzaFN0YXRlLmhhc2hDaGFuZ2VGcm9tU2Nyb2xsKCk7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gbmF2SXRlbS5ocmVmO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBoYXNoU3RhdGUuc2Nyb2xsZWQoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgbmF2YmFyLmNsYXNzTGlzdC5hZGQoJ21hcmtkb3duLWJvZHknKTtcblxuICAgIGNvbnN0IGhhbmRsZUhhc2ggPSAoKSA9PiB7XG5cbiAgICAgICAgaW50ZXJuYWxzLm1heWJlU2Nyb2xsVG9IYXNoKHdpbmRvdy5sb2NhdGlvbi5oYXNoLCBuYXZiYXIsIGhhc2hTdGF0ZSk7XG4gICAgfTtcblxuICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdoYXNoY2hhbmdlJywgaGFuZGxlSGFzaCk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBoYW5kbGVIYXNoKTtcblxuICAgIHJldHVybiBuYXZFbC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChuYXZiYXIsIG5hdkVsKTtcbn07XG5cbmludGVybmFscy5IYXNoU3RhdGUgPSBjbGFzcyBIYXNoU3RhdGUge1xuXG4gICAgY29uc3RydWN0b3IoKSB7XG5cbiAgICAgICAgdGhpcy5hdXRvU2Nyb2xsaW5nID0gMDtcbiAgICAgICAgdGhpcy5mcm9tU2Nyb2xsID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZmlyc3RTY3JvbGwgPSB0cnVlO1xuICAgIH1cblxuICAgIHNjcm9sbGVkKCkge1xuXG4gICAgICAgIHRoaXMuZmlyc3RTY3JvbGwgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBoYXNoQ2hhbmdlRnJvbVNjcm9sbCgpIHtcblxuICAgICAgICB0aGlzLmZyb21TY3JvbGwgPSB0cnVlO1xuICAgIH1cblxuICAgIGhhbmRsZWRDaGFuZ2UoKSB7XG5cbiAgICAgICAgdGhpcy5mcm9tU2Nyb2xsID0gZmFsc2U7XG4gICAgfVxuXG4gICAgc3RhcnRBdXRvU2Nyb2xsaW5nKCkge1xuXG4gICAgICAgIHRoaXMuYXV0b1Njcm9sbGluZysrO1xuICAgIH1cblxuICAgIHN0b3BBdXRvU2Nyb2xsaW5nKCkge1xuXG4gICAgICAgIHRoaXMuYXV0b1Njcm9sbGluZy0tO1xuICAgIH1cbn07XG5cbmludGVybmFscy5tYXliZVNjcm9sbFRvSGFzaCA9IChoYXNoLCBuYXZiYXIsIGhhc2hTdGF0ZSkgPT4ge1xuXG4gICAgY29uc3QgYW5jaG9yID0gaGFzaCAmJiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBhLmFuY2hvcltocmVmPVwiJHtoYXNofVwiXWApO1xuICAgIGNvbnN0IG5hdkl0ZW0gPSAoaGFzaCAmJiBuYXZiYXIucXVlcnlTZWxlY3RvcihgYS5uYXYtaXRlbVtocmVmPVwiJHtoYXNofVwiXWApKSB8fCBuYXZiYXIucXVlcnlTZWxlY3RvcignLm5hdi1pdGVtJyk7XG5cbiAgICBpZiAobmF2SXRlbSkge1xuICAgICAgICBpbnRlcm5hbHMuc2VsZWN0TmF2SXRlbShuYXZJdGVtKTtcbiAgICAgICAgU2Nyb2xsSW50b1ZpZXdJZk5lZWRlZChuYXZJdGVtLCB7IGJvdW5kYXJ5OiBuYXZiYXIucGFyZW50Tm9kZSB9KTtcbiAgICB9XG5cbiAgICBpZiAoYW5jaG9yICYmICFoYXNoU3RhdGUuZnJvbVNjcm9sbCkge1xuICAgICAgICBoYXNoU3RhdGUuc3RhcnRBdXRvU2Nyb2xsaW5nKCk7XG4gICAgICAgIGFuY2hvci5zY3JvbGxJbnRvVmlldygpO1xuXG4gICAgICAgIC8vIEVuc3VyZSBlbGVtZW50IGlzIHZpc2libGVcbiAgICAgICAgaWYgKGFuY2hvci5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgPCAoRklYRURfSEVBREVSX0hFSUdIVCArIFRPUF9QQURESU5HKSkge1xuICAgICAgICAgICAgd2luZG93LnNjcm9sbEJ5KDAsIC0oRklYRURfSEVBREVSX0hFSUdIVCArIFRPUF9QQURESU5HKSk7XG4gICAgICAgIH1cblxuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IGhhc2hTdGF0ZS5zdG9wQXV0b1Njcm9sbGluZygpLCA1MCk7XG4gICAgfVxuXG4gICAgaGFzaFN0YXRlLmhhbmRsZWRDaGFuZ2UoKTtcbn07XG5cbmludGVybmFscy5zZWxlY3ROYXZJdGVtID0gKG5hdkl0ZW0pID0+IHtcblxuICAgIGNvbnN0IGxhc3ROYXZJdGVtID0gbmF2SXRlbS5wYXJlbnROb2RlLnF1ZXJ5U2VsZWN0b3IoJzpzY29wZSA+IC5uYXZiYXItYWN0aXZlJyk7XG5cbiAgICBpZiAobGFzdE5hdkl0ZW0pIHtcbiAgICAgICAgbGFzdE5hdkl0ZW0uY2xhc3NMaXN0LnJlbW92ZSgnbmF2YmFyLWFjdGl2ZScpO1xuICAgIH1cblxuICAgIG5hdkl0ZW0uY2xhc3NMaXN0LmFkZCgnbmF2YmFyLWFjdGl2ZScpO1xufTtcblxuaW50ZXJuYWxzLml0ZW0gPSAoaW5uZXJIVE1MLCBocmVmLCBpbmRlbnQpID0+IChcbiAgICBgPGEgaHJlZj1cIiR7aHJlZn1cIiBjbGFzcz1cIm5hdi1pdGVtIGluZGVudC0ke2luZGVudH1cIj5cbiAgICAgICAgJHtpbm5lckhUTUx9XG4gICAgPC9hPmBcbik7XG5cbmludGVybmFscy5yZW5kZXIgPSAoaHRtbCkgPT4ge1xuXG4gICAgY29uc3Qgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHdyYXBwZXIuaW5uZXJIVE1MID0gaHRtbDtcblxuICAgIHJldHVybiB3cmFwcGVyLmZpcnN0Q2hpbGQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuLyogZ2xvYmFsIGRvY3VtZW50LCB3aW5kb3csIFhNTEh0dHBSZXF1ZXN0ICovXG5cbmNvbnN0IERvY3NOYXYgPSByZXF1aXJlKCcuL2RvY3MtbmF2Jyk7XG5cbkRvY3NOYXYuaW5pdChcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZG9jcy1kZXRhaWwgLndyYXBwZXInKSxcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZG9jcy1kZXRhaWwgLm5hdi10YXJnZXQnKVxuKTtcblxuY29uc3Qgc2V0QWN0aXZlTmF2SXRlbXMgPSAoKSA9PiB7XG5cbiAgICBjb25zdCBsaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbmF2X19pdGVtJyk7XG4gICAgY29uc3QgY3VycmVudFBhZ2UgPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuc3BsaXQoJy8nKVsxXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBpdGVtID0gbGlzdFtpXTtcbiAgICAgICAgaWYgKGl0ZW0ucGF0aG5hbWUuc3BsaXQoJy8nKVsxXSA9PT0gY3VycmVudFBhZ2UpIHtcbiAgICAgICAgICAgIGl0ZW0uY2xhc3NMaXN0LmFkZCgnbmF2X19pdGVtLS1hY3RpdmUnKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmNvbnN0IG5ld3NsZXR0ZXJTdWJtaXQgPSAoKSA9PiB7XG5cbiAgICBjb25zdCBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ld3NsZXR0ZXJGb3JtJyk7XG5cbiAgICBpZiAoIWZvcm0pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvcm0ub25zdWJtaXQgPSAoZSkgPT4ge1xuXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBjb25zdCBlbWFpbElucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ld3NsZXR0ZXJFbWFpbCcpO1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ld3NsZXR0ZXJNZXNzYWdlJyk7XG5cbiAgICAgICAgaWYgKGVtYWlsSW5wdXQudmFsaWRpdHkudmFsaWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHBheWxvYWQgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgZW1haWw6IGVtYWlsSW5wdXQudmFsdWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICB4aHIub3BlbignUE9TVCcsICcvbWFpbGNoaW1wJyk7XG4gICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgIHhoci5vbmxvYWQgPSAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gJ1lvdXIgZW1haWwgYWRkcmVzczogJyArIGVtYWlsSW5wdXQudmFsdWUgKyAnLCBpcyBub3cgc2lnbmVkIHVwLiBUaGFua3MgcGFsISc7XG4gICAgICAgICAgICAgICAgICAgIGVtYWlsSW5wdXQudmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBmb3JtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHhoci5zdGF0dXMgPT09IDQwMCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLmlubmVySFRNTCA9ICdUaGUgZW1haWwgYWRkcmVzczogJyArIGVtYWlsSW5wdXQudmFsdWUgKyAnIGlzIGVpdGhlciBpbnZhbGlkLCBvciBtYXkgYWxyZWFkeSBiZSBzdWJzY3JpYmVkLic7XG4gICAgICAgICAgICAgICAgICAgIGVtYWlsSW5wdXQudmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBlbWFpbElucHV0LmNsYXNzTGlzdC5hZGQoJ25ld3NsZXR0ZXJfX2lucHV0LS1pbnZhbGlkJyk7XG4gICAgICAgICAgICAgICAgICAgIGZvcm0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLmlubmVySFRNTCA9ICdUaGUgZW1haWwgYWRkcmVzczogJyArIGVtYWlsSW5wdXQudmFsdWUgKyAnIG1heSBiZSBpbnZhbGlkLCBvciB5b3VyIG5ldHdvcmsgY29ubmVjdGlvbiBpcyBpbmFjdGl2ZSc7XG4gICAgICAgICAgICAgICAgICAgIGVtYWlsSW5wdXQudmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBlbWFpbElucHV0LmNsYXNzTGlzdC5hZGQoJ25ld3NsZXR0ZXJfX2lucHV0LS1pbnZhbGlkJyk7XG4gICAgICAgICAgICAgICAgICAgIGZvcm0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHhoci5zZW5kKHBheWxvYWQpO1xuICAgICAgICB9XG4gICAgfTtcbn07XG5cbmNvbnN0IGRvY3NOYXZNb2JpbGVBY3Rpb25zID0gKCkgPT4ge1xuXG4gICAgY29uc3QgbWVudUJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5uYXYtaXRlbV9fbGVmdCcpO1xuICAgIGNvbnN0IHRvcEJ1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5uYXYtaXRlbV9fcmlnaHQnKTtcbiAgICBjb25zdCBkb2NzTmF2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmRvY3MtbmF2Jyk7XG5cbiAgICBpZiAoIW1lbnVCdXR0b24gfHwgIXRvcEJ1dHRvbiB8fCAhZG9jc05hdiB8fCAhZG9jc05hdkxpbmtzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBkb2NzTmF2TGlua3MgPSBkb2NzTmF2LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ25hdi1pdGVtJyk7XG5cbiAgICBjb25zdCBpc01vYmlsZSA9ICgpID0+IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKG1lbnVCdXR0b24ucGFyZW50Tm9kZSkuZ2V0UHJvcGVydHlWYWx1ZSgnZGlzcGxheScpICE9PSAnbm9uZSc7XG4gICAgY29uc3QgZG9jc05hdklzT3BlbiA9ICgpID0+IGRvY3NOYXYuY2xhc3NMaXN0LmNvbnRhaW5zKCdkb2NzLW5hdi0tb3BlbicpO1xuICAgIGNvbnN0IHRvZ2dsZURvY3NOYXYgPSAoKSA9PiB7XG5cbiAgICAgICAgaWYgKCFpc01vYmlsZSgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZG9jc05hdklzT3BlbigpKSB7XG4gICAgICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5yZW1vdmUoJ2JvZHktLW5vc2Nyb2xsJyk7XG4gICAgICAgICAgICBkb2NzTmF2LmNsYXNzTGlzdC5yZW1vdmUoJ2RvY3MtbmF2LS1vcGVuJyk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBkb2N1bWVudC5ib2R5LmNsYXNzTGlzdC5hZGQoJ2JvZHktLW5vc2Nyb2xsJyk7XG4gICAgICAgIGRvY3NOYXYuY2xhc3NMaXN0LmFkZCgnZG9jcy1uYXYtLW9wZW4nKTtcbiAgICB9O1xuXG4gICAgbWVudUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRvZ2dsZURvY3NOYXYpO1xuXG4gICAgQXJyYXkuZnJvbShkb2NzTmF2TGlua3MpLmZvckVhY2goXG4gICAgICAgIChsaW5rKSA9PiBsaW5rLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdG9nZ2xlRG9jc05hdilcbiAgICApO1xuXG4gICAgdG9wQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuXG4gICAgICAgIGlmIChkb2NzTmF2SXNPcGVuKCkpIHtcbiAgICAgICAgICAgIHRvZ2dsZURvY3NOYXYoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB3aW5kb3cuc2Nyb2xsVG8oMCwgMCk7XG4gICAgfSk7XG59O1xuXG5jb25zdCBjaGFuZ2VQYWNrYWdlVmVyc2lvbiA9ICgpID0+IHtcblxuICAgIGNvbnN0IHNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd2ZXJzaW9uJyk7XG5cbiAgICBpZiAoIXNlbGVjdCl7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzZWxlY3QuYWRkRXZlbnRMaXN0ZW5lcignY2hhbmdlJywgKG9wdGlvbikgPT4ge1xuXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggPSAndj0nICsgb3B0aW9uLnNyY0VsZW1lbnQudmFsdWU7XG4gICAgfSk7XG59O1xuXG5zZXRBY3RpdmVOYXZJdGVtcygpO1xubmV3c2xldHRlclN1Ym1pdCgpO1xuZG9jc05hdk1vYmlsZUFjdGlvbnMoKTtcbmNoYW5nZVBhY2thZ2VWZXJzaW9uKCk7XG4iLCIvKlxuICogVGhlIE1JVCBMaWNlbnNlIChNSVQpXG4gKlxuICogQ29weXJpZ2h0IChjKSAyMDE3IE1hcmsgUy4gRXZlcml0dFxuICogQ29weXJpZ2h0IChjKSAyMDE4IERldmluIEl2eSBbbW9kaWZpZWQgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vcXVieXRlL25hdmJhcl1cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvbiBvYnRhaW5pbmcgYSBjb3B5XG4gKiBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsXG4gKiBpbiB0aGUgU29mdHdhcmUgd2l0aG91dCByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzXG4gKiB0byB1c2UsIGNvcHksIG1vZGlmeSwgbWVyZ2UsIHB1Ymxpc2gsIGRpc3RyaWJ1dGUsIHN1YmxpY2Vuc2UsIGFuZC9vciBzZWxsXG4gKiBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXNcbiAqIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnM6XG4gKlxuICogVGhlIGFib3ZlIGNvcHlyaWdodCBub3RpY2UgYW5kIHRoaXMgcGVybWlzc2lvbiBub3RpY2Ugc2hhbGwgYmUgaW5jbHVkZWQgaW4gYWxsXG4gKiBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuICpcbiAqIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIsIFdJVEhPVVQgV0FSUkFOVFkgT0YgQU5ZIEtJTkQsIEVYUFJFU1MgT1JcbiAqIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVMgT0YgTUVSQ0hBTlRBQklMSVRZLFxuICogRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFXG4gKiBBVVRIT1JTIE9SIENPUFlSSUdIVCBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSXG4gKiBMSUFCSUxJVFksIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLFxuICogT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEVcbiAqIFNPRlRXQVJFLlxuICovXG5cbnZhciBzZWxlY3RlZENsYXNzID0gJ25hdmJhci1hY3RpdmUnO1xudmFyIHN1cHBvcnRzUGFzc2l2ZSA9IGZhbHNlO1xuXG50cnkge1xuICB2YXIgb3B0cyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ3Bhc3NpdmUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICBzdXBwb3J0c1Bhc3NpdmUgPSB0cnVlO1xuICAgIH1cbiAgfSk7XG5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Rlc3QnLCBudWxsLCBvcHRzKTtcbn0gY2F0Y2ggKGUpIHt9XG5cbi8vIEl0J2QgYmUgbmljZXIgdG8gdXNlIHRoZSBjbGFzc0xpc3QgQVBJLCBidXQgSSBwcmVmZXIgdG8gc3VwcG9ydCBtb3JlIGJyb3dzZXJzLiBSZW1vdmUgYSBjbGFzc1xuLy8gaWYgaXQncyBmb3VuZCBvbiB0aGUgZWxlbWVudC5cbmZ1bmN0aW9uIHJlbW92ZUNsYXNzSWZOZWVkZWQoZWwpIHtcbiAgLy8gSWYgdGhlIGVsZW1lbnQgaGFzIG5vIGNsYXNzZXMgdGhlbiB3ZSBjYW4gdGFrZSBhIHNob3J0Y3V0LlxuICBpZiAoIWVsLmNsYXNzTmFtZSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBzcGxpdENsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZS5zcGxpdCgnICcpO1xuICB2YXIgcmVwbGFjZW1lbnRDbGFzc05hbWUgPSAnJztcblxuICAvLyBBc3NlbWJsZSBhIHN0cmluZyBvZiBvdGhlciBjbGFzcyBuYW1lcy5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHNwbGl0Q2xhc3NOYW1lLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgdmFyIGNsYXNzTmFtZSA9IHNwbGl0Q2xhc3NOYW1lW2ldO1xuXG4gICAgaWYgKGNsYXNzTmFtZSAhPT0gc2VsZWN0ZWRDbGFzcykge1xuICAgICAgcmVwbGFjZW1lbnRDbGFzc05hbWUgKz0gcmVwbGFjZW1lbnRDbGFzc05hbWUgPT09ICcnID8gY2xhc3NOYW1lIDogJyAnICsgY2xhc3NOYW1lO1xuICAgIH1cbiAgfVxuXG4gIC8vIElmIHRoZSBsZW5ndGggb2YgdGhlIGNsYXNzTmFtZSBkaWZmZXJzLCB0aGVuIGl0IGhhZCBhbiBzZWxlY3RlZCBjbGFzcyBpbiBhbmQgbmVlZHMgdG8gYmVcbiAgLy8gdXBkYXRlZC5cbiAgaWYgKHJlcGxhY2VtZW50Q2xhc3NOYW1lLmxlbmd0aCAhPT0gZWwuY2xhc3NOYW1lLmxlbmd0aCkge1xuICAgIGVsLmNsYXNzTmFtZSA9IHJlcGxhY2VtZW50Q2xhc3NOYW1lO1xuICB9XG59XG5cbi8vIEFkZCBhIGNsYXNzIHRvIGFuIGVsZW1lbnQgaWYgaXQgaXMgbm90IGZvdW5kLlxuZnVuY3Rpb24gYWRkQ2xhc3NJZk5lZWRlZChlbCkge1xuICAvLyBJZiB0aGUgZWxlbWVudCBoYXMgbm8gY2xhc3NlcyB0aGVuIHdlIGNhbiB0YWtlIGEgc2hvcnRjdXQuXG4gIGlmICghZWwuY2xhc3NOYW1lKSB7XG4gICAgZWwuY2xhc3NOYW1lID0gc2VsZWN0ZWRDbGFzcztcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgc3BsaXRDbGFzc05hbWUgPSBlbC5jbGFzc05hbWUuc3BsaXQoJyAnKTtcblxuICAvLyBJZiBhbnkgb2YgdGhlIGNsYXNzIG5hbWVzIG1hdGNoIHRoZSBzZWxlY3RlZCBjbGFzcyB0aGVuIHJldHVybi5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHNwbGl0Q2xhc3NOYW1lLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKHNwbGl0Q2xhc3NOYW1lW2ldID09PSBzZWxlY3RlZENsYXNzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgLy8gSWYgd2UgZ290IGhlcmUgdGhlbiB0aGUgc2VsZWN0ZWQgY2xhc3MgbmVlZHMgdG8gYmUgYWRkZWQgdG8gYW4gZXhpc3RpbmcgY2xhc3NOYW1lLlxuICBlbC5jbGFzc05hbWUgKz0gJyAnICsgc2VsZWN0ZWRDbGFzcztcbn1cblxuZnVuY3Rpb24gY3JlYXRlQW5kQXBwZW5kTGlzdEl0ZW1zKG5hdkxpc3QsIGVsZW1lbnRMaXN0LCBtYWtlTmF2TGlzdEl0ZW0pIHtcbiAgdmFyIHBhaXJzID0gW107XG4gIHZhciBlbGVtZW50O1xuICB2YXIgbGk7XG5cbiAgLy8gQ3JlYXRlIGxpc3QgZWxlbWVudHNcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGVsZW1lbnRMaXN0Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgZWxlbWVudCA9IGVsZW1lbnRMaXN0W2ldO1xuICAgIGxpID0gbWFrZU5hdkxpc3RJdGVtKGVsZW1lbnQpO1xuXG4gICAgbmF2TGlzdC5hcHBlbmRDaGlsZChsaSk7XG5cbiAgICBwYWlycy5wdXNoKHsgZWxlbWVudDogZWxlbWVudCwgbmF2RWxlbWVudDogbGkgfSk7XG4gIH1cblxuICByZXR1cm4gcGFpcnM7XG59XG5cbmZ1bmN0aW9uIG1ha2VIYW5kbGVTY3JvbGwocGFpcnMsIG9uU2Nyb2xsSG9vaywgZGVib3VuY2VUaW1lKSB7XG4gIGZ1bmN0aW9uIGhhbmRsZVNjcm9sbCgpIHtcbiAgICB2YXIgZnJvbnRSdW5uZXJJbmRleDtcbiAgICB2YXIgY2xvc2VzdERpc3QgPSBJbmZpbml0eTtcbiAgICB2YXIgcGFpcjtcbiAgICB2YXIgYWJzRGlzdDtcblxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBwYWlycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgcGFpciA9IHBhaXJzW2ldO1xuICAgICAgYWJzRGlzdCA9IE1hdGguYWJzKHBhaXIuZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3ApO1xuXG4gICAgICAvLyBJZiB0aGlzIGVsZW1lbnQgaXMgbm90IHRoZSBmcm9udCBydW5uZXIgZm9yIHRvcCwgZGVhY3RpdmF0ZSBpdC5cbiAgICAgIGlmIChhYnNEaXN0ID4gY2xvc2VzdERpc3QpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIGZyb250UnVubmVySW5kZXggPSBpO1xuICAgICAgY2xvc2VzdERpc3QgPSBhYnNEaXN0O1xuICAgIH1cblxuICAgIGlmIChvblNjcm9sbEhvb2spIHtcbiAgICAgICAgb25TY3JvbGxIb29rKHBhaXJzW2Zyb250UnVubmVySW5kZXhdLm5hdkVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIC8vIFRoZSBkZWZhdWx0IGJlaGF2aW91ciBpcyBubyBkZWJvdW5jZS5cbiAgaWYgKHR5cGVvZiBkZWJvdW5jZVRpbWUgIT09ICdudW1iZXInIHx8IGlzTmFOKGRlYm91bmNlVGltZSkpIHtcbiAgICByZXR1cm4gaGFuZGxlU2Nyb2xsO1xuICB9XG5cbiAgdmFyIHRpbWVvdXQ7XG5cbiAgZnVuY3Rpb24gbnVsbGlmeVRpbWVvdXQoKSB7XG4gICAgdGltZW91dCA9IG51bGw7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gZGVib3VuY2VkSGFuZGxlU2Nyb2xsKCkge1xuICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSW1tZWRpYXRlbHkgdXNlIGhhbmRsZVNjcm9sbCB0byBjYWxjdWxhdGUuXG4gICAgaGFuZGxlU2Nyb2xsKCk7XG5cbiAgICAvLyBObyBmdXJ0aGVyIGNhbGxzIHRvIGhhbmRsZVNjcm9sbCB1bnRpbCBkZWJvdW5jZVRpbWUgaGFzIGVsYXBzZWQuXG4gICAgdGltZW91dCA9IHNldFRpbWVvdXQobnVsbGlmeVRpbWVvdXQsIGRlYm91bmNlVGltZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGFkZFNjcm9sbExpc3RlbmVyKHRhcmdldCwgaGFuZGxlU2Nyb2xsKSB7XG4gIGZ1bmN0aW9uIHNjcm9sbEhhbmRsZVdyYXBwZXIoZXZ0KSB7XG4gICAgaWYgKGV2dC50YXJnZXQgPT09IHRhcmdldCkge1xuICAgICAgaGFuZGxlU2Nyb2xsKCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHRhcmdldC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHNjcm9sbEhhbmRsZVdyYXBwZXIsIHN1cHBvcnRzUGFzc2l2ZSA/IHsgcGFzc2l2ZTogdHJ1ZSB9IDogZmFsc2UpO1xuICB9IGVsc2UgaWYgKHRhcmdldC5hdHRhY2hFdmVudCkge1xuICAgIHRhcmdldC5hdHRhY2hFdmVudCgnb25zY3JvbGwnLCBzY3JvbGxIYW5kbGVXcmFwcGVyKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoaXMgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGFkZEV2ZW50TGlzdGVuZXIgb3IgYXR0YWNoRXZlbnQuJyk7XG4gIH1cblxuICAvLyBUbyBjYWxjdWxhdGUgdGhlIGluaXRpYWwgYWN0aXZlIGxpc3QgZWxlbWVudC5cbiAgaGFuZGxlU2Nyb2xsKCk7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gbWFrZU5hdihvcHRpb25zKSB7XG4gIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5lbGVtZW50TGlzdCB8fCAhb3B0aW9ucy5tYWtlTmF2TGlzdEl0ZW0pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ09wdGlvbnMgb2JqZWN0IHdpdGggZWxlbWVudExpc3QgYW5kIG1ha2VOYXZMaXN0SXRlbSBtdXN0IGJlIHByb3ZpZGVkLicpO1xuICB9XG5cbiAgdmFyIG5hdmJhciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQob3B0aW9ucy50YWdOYW1lIHx8ICduYXYnKTtcbiAgdmFyIG5hdkxpc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpO1xuXG4gIC8vIFRoZSB0YXJnZXQgZGVmYXVsdHMgdG8gd2luZG93LlxuICB2YXIgdGFyZ2V0ID0gb3B0aW9ucy50YXJnZXQgfHwgZG9jdW1lbnQ7XG5cbiAgLy8gQ3JlYXRlIGxpc3QgZWxlbWVudHNcbiAgdmFyIHBhaXJzID0gY3JlYXRlQW5kQXBwZW5kTGlzdEl0ZW1zKG5hdkxpc3QsIG9wdGlvbnMuZWxlbWVudExpc3QsIG9wdGlvbnMubWFrZU5hdkxpc3RJdGVtKTtcblxuICAvLyBXaGVuZXZlciB0aGUgd2luZG93IGlzIHNjcm9sbGVkLCByZWNhbGN1bGF0ZSB0aGUgYWN0aXZlIGxpc3QgZWxlbWVudC4gQ29tcGF0aWJsZSB3aXRoIG9sZGVyXG4gIC8vIHZlcnNpb25zIG9mIElFLlxuICBhZGRTY3JvbGxMaXN0ZW5lcih0YXJnZXQsIG1ha2VIYW5kbGVTY3JvbGwocGFpcnMsIG9wdGlvbnMub25TY3JvbGwsIG9wdGlvbnMuZGVib3VuY2VUaW1lKSk7XG5cbiAgbmF2YmFyLmFwcGVuZENoaWxkKG5hdkxpc3QpO1xuXG4gIHJldHVybiBuYXZiYXI7XG59XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuXHR0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6XG5cdHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmYWN0b3J5KSA6XG5cdChnbG9iYWwuc2Nyb2xsSW50b1ZpZXdJZk5lZWRlZCA9IGZhY3RvcnkoKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoKSB7ICd1c2Ugc3RyaWN0JztcblxuLyoqXG4gKiBodHRwczovL2dpdGh1Yi5jb20vZ3JlL2Jlemllci1lYXNpbmdcbiAqIEJlemllckVhc2luZyAtIHVzZSBiZXppZXIgY3VydmUgZm9yIHRyYW5zaXRpb24gZWFzaW5nIGZ1bmN0aW9uXG4gKiBieSBHYcOrdGFuIFJlbmF1ZGVhdSAyMDE0IC0gMjAxNSDigJMgTUlUIExpY2Vuc2VcbiAqL1xuXG4vLyBUaGVzZSB2YWx1ZXMgYXJlIGVzdGFibGlzaGVkIGJ5IGVtcGlyaWNpc20gd2l0aCB0ZXN0cyAodHJhZGVvZmY6IHBlcmZvcm1hbmNlIFZTIHByZWNpc2lvbilcbnZhciBORVdUT05fSVRFUkFUSU9OUyA9IDQ7XG52YXIgTkVXVE9OX01JTl9TTE9QRSA9IDAuMDAxO1xudmFyIFNVQkRJVklTSU9OX1BSRUNJU0lPTiA9IDAuMDAwMDAwMTtcbnZhciBTVUJESVZJU0lPTl9NQVhfSVRFUkFUSU9OUyA9IDEwO1xuXG52YXIga1NwbGluZVRhYmxlU2l6ZSA9IDExO1xudmFyIGtTYW1wbGVTdGVwU2l6ZSA9IDEuMCAvIChrU3BsaW5lVGFibGVTaXplIC0gMS4wKTtcblxudmFyIGZsb2F0MzJBcnJheVN1cHBvcnRlZCA9IHR5cGVvZiBGbG9hdDMyQXJyYXkgPT09ICdmdW5jdGlvbic7XG5cbmZ1bmN0aW9uIEEgKGFBMSwgYUEyKSB7IHJldHVybiAxLjAgLSAzLjAgKiBhQTIgKyAzLjAgKiBhQTE7IH1cbmZ1bmN0aW9uIEIgKGFBMSwgYUEyKSB7IHJldHVybiAzLjAgKiBhQTIgLSA2LjAgKiBhQTE7IH1cbmZ1bmN0aW9uIEMgKGFBMSkgICAgICB7IHJldHVybiAzLjAgKiBhQTE7IH1cblxuLy8gUmV0dXJucyB4KHQpIGdpdmVuIHQsIHgxLCBhbmQgeDIsIG9yIHkodCkgZ2l2ZW4gdCwgeTEsIGFuZCB5Mi5cbmZ1bmN0aW9uIGNhbGNCZXppZXIgKGFULCBhQTEsIGFBMikgeyByZXR1cm4gKChBKGFBMSwgYUEyKSAqIGFUICsgQihhQTEsIGFBMikpICogYVQgKyBDKGFBMSkpICogYVQ7IH1cblxuLy8gUmV0dXJucyBkeC9kdCBnaXZlbiB0LCB4MSwgYW5kIHgyLCBvciBkeS9kdCBnaXZlbiB0LCB5MSwgYW5kIHkyLlxuZnVuY3Rpb24gZ2V0U2xvcGUgKGFULCBhQTEsIGFBMikgeyByZXR1cm4gMy4wICogQShhQTEsIGFBMikgKiBhVCAqIGFUICsgMi4wICogQihhQTEsIGFBMikgKiBhVCArIEMoYUExKTsgfVxuXG5mdW5jdGlvbiBiaW5hcnlTdWJkaXZpZGUgKGFYLCBhQSwgYUIsIG1YMSwgbVgyKSB7XG4gIHZhciBjdXJyZW50WCwgY3VycmVudFQsIGkgPSAwO1xuICBkbyB7XG4gICAgY3VycmVudFQgPSBhQSArIChhQiAtIGFBKSAvIDIuMDtcbiAgICBjdXJyZW50WCA9IGNhbGNCZXppZXIoY3VycmVudFQsIG1YMSwgbVgyKSAtIGFYO1xuICAgIGlmIChjdXJyZW50WCA+IDAuMCkge1xuICAgICAgYUIgPSBjdXJyZW50VDtcbiAgICB9IGVsc2Uge1xuICAgICAgYUEgPSBjdXJyZW50VDtcbiAgICB9XG4gIH0gd2hpbGUgKE1hdGguYWJzKGN1cnJlbnRYKSA+IFNVQkRJVklTSU9OX1BSRUNJU0lPTiAmJiArK2kgPCBTVUJESVZJU0lPTl9NQVhfSVRFUkFUSU9OUyk7XG4gIHJldHVybiBjdXJyZW50VDtcbn1cblxuZnVuY3Rpb24gbmV3dG9uUmFwaHNvbkl0ZXJhdGUgKGFYLCBhR3Vlc3NULCBtWDEsIG1YMikge1xuIGZvciAodmFyIGkgPSAwOyBpIDwgTkVXVE9OX0lURVJBVElPTlM7ICsraSkge1xuICAgdmFyIGN1cnJlbnRTbG9wZSA9IGdldFNsb3BlKGFHdWVzc1QsIG1YMSwgbVgyKTtcbiAgIGlmIChjdXJyZW50U2xvcGUgPT09IDAuMCkge1xuICAgICByZXR1cm4gYUd1ZXNzVDtcbiAgIH1cbiAgIHZhciBjdXJyZW50WCA9IGNhbGNCZXppZXIoYUd1ZXNzVCwgbVgxLCBtWDIpIC0gYVg7XG4gICBhR3Vlc3NUIC09IGN1cnJlbnRYIC8gY3VycmVudFNsb3BlO1xuIH1cbiByZXR1cm4gYUd1ZXNzVDtcbn1cblxudmFyIHNyYyA9IGZ1bmN0aW9uIGJlemllciAobVgxLCBtWTEsIG1YMiwgbVkyKSB7XG4gIGlmICghKDAgPD0gbVgxICYmIG1YMSA8PSAxICYmIDAgPD0gbVgyICYmIG1YMiA8PSAxKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignYmV6aWVyIHggdmFsdWVzIG11c3QgYmUgaW4gWzAsIDFdIHJhbmdlJyk7XG4gIH1cblxuICAvLyBQcmVjb21wdXRlIHNhbXBsZXMgdGFibGVcbiAgdmFyIHNhbXBsZVZhbHVlcyA9IGZsb2F0MzJBcnJheVN1cHBvcnRlZCA/IG5ldyBGbG9hdDMyQXJyYXkoa1NwbGluZVRhYmxlU2l6ZSkgOiBuZXcgQXJyYXkoa1NwbGluZVRhYmxlU2l6ZSk7XG4gIGlmIChtWDEgIT09IG1ZMSB8fCBtWDIgIT09IG1ZMikge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwga1NwbGluZVRhYmxlU2l6ZTsgKytpKSB7XG4gICAgICBzYW1wbGVWYWx1ZXNbaV0gPSBjYWxjQmV6aWVyKGkgKiBrU2FtcGxlU3RlcFNpemUsIG1YMSwgbVgyKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBnZXRURm9yWCAoYVgpIHtcbiAgICB2YXIgaW50ZXJ2YWxTdGFydCA9IDAuMDtcbiAgICB2YXIgY3VycmVudFNhbXBsZSA9IDE7XG4gICAgdmFyIGxhc3RTYW1wbGUgPSBrU3BsaW5lVGFibGVTaXplIC0gMTtcblxuICAgIGZvciAoOyBjdXJyZW50U2FtcGxlICE9PSBsYXN0U2FtcGxlICYmIHNhbXBsZVZhbHVlc1tjdXJyZW50U2FtcGxlXSA8PSBhWDsgKytjdXJyZW50U2FtcGxlKSB7XG4gICAgICBpbnRlcnZhbFN0YXJ0ICs9IGtTYW1wbGVTdGVwU2l6ZTtcbiAgICB9XG4gICAgLS1jdXJyZW50U2FtcGxlO1xuXG4gICAgLy8gSW50ZXJwb2xhdGUgdG8gcHJvdmlkZSBhbiBpbml0aWFsIGd1ZXNzIGZvciB0XG4gICAgdmFyIGRpc3QgPSAoYVggLSBzYW1wbGVWYWx1ZXNbY3VycmVudFNhbXBsZV0pIC8gKHNhbXBsZVZhbHVlc1tjdXJyZW50U2FtcGxlICsgMV0gLSBzYW1wbGVWYWx1ZXNbY3VycmVudFNhbXBsZV0pO1xuICAgIHZhciBndWVzc0ZvclQgPSBpbnRlcnZhbFN0YXJ0ICsgZGlzdCAqIGtTYW1wbGVTdGVwU2l6ZTtcblxuICAgIHZhciBpbml0aWFsU2xvcGUgPSBnZXRTbG9wZShndWVzc0ZvclQsIG1YMSwgbVgyKTtcbiAgICBpZiAoaW5pdGlhbFNsb3BlID49IE5FV1RPTl9NSU5fU0xPUEUpIHtcbiAgICAgIHJldHVybiBuZXd0b25SYXBoc29uSXRlcmF0ZShhWCwgZ3Vlc3NGb3JULCBtWDEsIG1YMik7XG4gICAgfSBlbHNlIGlmIChpbml0aWFsU2xvcGUgPT09IDAuMCkge1xuICAgICAgcmV0dXJuIGd1ZXNzRm9yVDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGJpbmFyeVN1YmRpdmlkZShhWCwgaW50ZXJ2YWxTdGFydCwgaW50ZXJ2YWxTdGFydCArIGtTYW1wbGVTdGVwU2l6ZSwgbVgxLCBtWDIpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiBCZXppZXJFYXNpbmcgKHgpIHtcbiAgICBpZiAobVgxID09PSBtWTEgJiYgbVgyID09PSBtWTIpIHtcbiAgICAgIHJldHVybiB4OyAvLyBsaW5lYXJcbiAgICB9XG4gICAgLy8gQmVjYXVzZSBKYXZhU2NyaXB0IG51bWJlciBhcmUgaW1wcmVjaXNlLCB3ZSBzaG91bGQgZ3VhcmFudGVlIHRoZSBleHRyZW1lcyBhcmUgcmlnaHQuXG4gICAgaWYgKHggPT09IDApIHtcbiAgICAgIHJldHVybiAwO1xuICAgIH1cbiAgICBpZiAoeCA9PT0gMSkge1xuICAgICAgcmV0dXJuIDE7XG4gICAgfVxuICAgIHJldHVybiBjYWxjQmV6aWVyKGdldFRGb3JYKHgpLCBtWTEsIG1ZMik7XG4gIH07XG59O1xuXG4vLyBQcmVkZWZpbmVkIHNldCBvZiBhbmltYXRpb25zLiBTaW1pbGFyIHRvIENTUyBlYXNpbmcgZnVuY3Rpb25zXG52YXIgYW5pbWF0aW9ucyA9IHtcbiAgZWFzZTogIHNyYygwLjI1LCAwLjEsIDAuMjUsIDEpLFxuICBlYXNlSW46IHNyYygwLjQyLCAwLCAxLCAxKSxcbiAgZWFzZU91dDogc3JjKDAsIDAsIDAuNTgsIDEpLFxuICBlYXNlSW5PdXQ6IHNyYygwLjQyLCAwLCAwLjU4LCAxKSxcbiAgbGluZWFyOiBzcmMoMCwgMCwgMSwgMSlcbn07XG5cblxudmFyIGFtYXRvciA9IGFuaW1hdGU7XG5cbmZ1bmN0aW9uIGFuaW1hdGUoc291cmNlLCB0YXJnZXQsIG9wdGlvbnMpIHtcbiAgdmFyIHN0YXJ0PSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICB2YXIgZGlmZiA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAvLyBXZSBsZXQgY2xpZW50cyBzcGVjaWZ5IHRoZWlyIG93biBlYXNpbmcgZnVuY3Rpb25cbiAgdmFyIGVhc2luZyA9ICh0eXBlb2Ygb3B0aW9ucy5lYXNpbmcgPT09ICdmdW5jdGlvbicpID8gb3B0aW9ucy5lYXNpbmcgOiBhbmltYXRpb25zW29wdGlvbnMuZWFzaW5nXTtcblxuICAvLyBpZiBub3RoaW5nIGlzIHNwZWNpZmllZCwgZGVmYXVsdCB0byBlYXNlIChzaW1pbGFyIHRvIENTUyBhbmltYXRpb25zKVxuICBpZiAoIWVhc2luZykge1xuICAgIGlmIChvcHRpb25zLmVhc2luZykge1xuICAgICAgY29uc29sZS53YXJuKCdVbmtub3duIGVhc2luZyBmdW5jdGlvbiBpbiBhbWF0b3I6ICcgKyBvcHRpb25zLmVhc2luZyk7XG4gICAgfVxuICAgIGVhc2luZyA9IGFuaW1hdGlvbnMuZWFzZTtcbiAgfVxuXG4gIHZhciBzdGVwID0gdHlwZW9mIG9wdGlvbnMuc3RlcCA9PT0gJ2Z1bmN0aW9uJyA/IG9wdGlvbnMuc3RlcCA6IG5vb3A7XG4gIHZhciBkb25lID0gdHlwZW9mIG9wdGlvbnMuZG9uZSA9PT0gJ2Z1bmN0aW9uJyA/IG9wdGlvbnMuZG9uZSA6IG5vb3A7XG5cbiAgdmFyIHNjaGVkdWxlciA9IGdldFNjaGVkdWxlcihvcHRpb25zLnNjaGVkdWxlcik7XG5cbiAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyh0YXJnZXQpO1xuICBrZXlzLmZvckVhY2goZnVuY3Rpb24oa2V5KSB7XG4gICAgc3RhcnRba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgIGRpZmZba2V5XSA9IHRhcmdldFtrZXldIC0gc291cmNlW2tleV07XG4gIH0pO1xuXG4gIHZhciBkdXJhdGlvbkluTXMgPSBvcHRpb25zLmR1cmF0aW9uIHx8IDQwMDtcbiAgdmFyIGR1cmF0aW9uSW5GcmFtZXMgPSBNYXRoLm1heCgxLCBkdXJhdGlvbkluTXMgKiAwLjA2KTsgLy8gMC4wNiBiZWNhdXNlIDYwIGZyYW1lcyBwZXJzIDEsMDAwIG1zXG4gIHZhciBwcmV2aW91c0FuaW1hdGlvbklkO1xuICB2YXIgZnJhbWUgPSAwO1xuXG4gIHByZXZpb3VzQW5pbWF0aW9uSWQgPSBzY2hlZHVsZXIubmV4dChsb29wKTtcblxuICByZXR1cm4ge1xuICAgIGNhbmNlbDogY2FuY2VsXG4gIH1cblxuICBmdW5jdGlvbiBjYW5jZWwoKSB7XG4gICAgc2NoZWR1bGVyLmNhbmNlbChwcmV2aW91c0FuaW1hdGlvbklkKTtcbiAgICBwcmV2aW91c0FuaW1hdGlvbklkID0gMDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGxvb3AoKSB7XG4gICAgdmFyIHQgPSBlYXNpbmcoZnJhbWUvZHVyYXRpb25JbkZyYW1lcyk7XG4gICAgZnJhbWUgKz0gMTtcbiAgICBzZXRWYWx1ZXModCk7XG4gICAgaWYgKGZyYW1lIDw9IGR1cmF0aW9uSW5GcmFtZXMpIHtcbiAgICAgIHByZXZpb3VzQW5pbWF0aW9uSWQgPSBzY2hlZHVsZXIubmV4dChsb29wKTtcbiAgICAgIHN0ZXAoc291cmNlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcHJldmlvdXNBbmltYXRpb25JZCA9IDA7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkgeyBkb25lKHNvdXJjZSk7IH0sIDApO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNldFZhbHVlcyh0KSB7XG4gICAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgICAgc291cmNlW2tleV0gPSBkaWZmW2tleV0gKiB0ICsgc3RhcnRba2V5XTtcbiAgICB9KTtcbiAgfVxufVxuXG5mdW5jdGlvbiBub29wKCkgeyB9XG5cbmZ1bmN0aW9uIGdldFNjaGVkdWxlcihzY2hlZHVsZXIpIHtcbiAgaWYgKCFzY2hlZHVsZXIpIHtcbiAgICB2YXIgY2FuUmFmID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZTtcbiAgICByZXR1cm4gY2FuUmFmID8gcmFmU2NoZWR1bGVyKCkgOiB0aW1lb3V0U2NoZWR1bGVyKClcbiAgfVxuICBpZiAodHlwZW9mIHNjaGVkdWxlci5uZXh0ICE9PSAnZnVuY3Rpb24nKSB0aHJvdyBuZXcgRXJyb3IoJ1NjaGVkdWxlciBpcyBzdXBwb3NlZCB0byBoYXZlIG5leHQoY2IpIGZ1bmN0aW9uJylcbiAgaWYgKHR5cGVvZiBzY2hlZHVsZXIuY2FuY2VsICE9PSAnZnVuY3Rpb24nKSB0aHJvdyBuZXcgRXJyb3IoJ1NjaGVkdWxlciBpcyBzdXBwb3NlZCB0byBoYXZlIGNhbmNlbChoYW5kbGUpIGZ1bmN0aW9uJylcblxuICByZXR1cm4gc2NoZWR1bGVyXG59XG5cbmZ1bmN0aW9uIHJhZlNjaGVkdWxlcigpIHtcbiAgcmV0dXJuIHtcbiAgICBuZXh0OiB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lLmJpbmQod2luZG93KSxcbiAgICBjYW5jZWw6IHdpbmRvdy5jYW5jZWxBbmltYXRpb25GcmFtZS5iaW5kKHdpbmRvdylcbiAgfVxufVxuXG5mdW5jdGlvbiB0aW1lb3V0U2NoZWR1bGVyKCkge1xuICByZXR1cm4ge1xuICAgIG5leHQ6IGZ1bmN0aW9uKGNiKSB7XG4gICAgICByZXR1cm4gc2V0VGltZW91dChjYiwgMTAwMC82MClcbiAgICB9LFxuICAgIGNhbmNlbDogZnVuY3Rpb24gKGlkKSB7XG4gICAgICByZXR1cm4gY2xlYXJUaW1lb3V0KGlkKVxuICAgIH1cbiAgfVxufVxuXG52YXIgX19hc3NpZ24kMSA9ICh1bmRlZmluZWQgJiYgdW5kZWZpbmVkLl9fYXNzaWduKSB8fCBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uKHQpIHtcbiAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKVxuICAgICAgICAgICAgdFtwXSA9IHNbcF07XG4gICAgfVxuICAgIHJldHVybiB0O1xufTtcbnZhciBoYW5kbGVTY3JvbGwkMSA9IGZ1bmN0aW9uIChwYXJlbnQsIF9hKSB7XG4gICAgdmFyIHNjcm9sbExlZnQgPSBfYS5zY3JvbGxMZWZ0LCBzY3JvbGxUb3AgPSBfYS5zY3JvbGxUb3A7XG4gICAgcGFyZW50LnNjcm9sbExlZnQgPSBzY3JvbGxMZWZ0O1xuICAgIHBhcmVudC5zY3JvbGxUb3AgPSBzY3JvbGxUb3A7XG59O1xuZnVuY3Rpb24gY2FsY3VsYXRlKHRhcmdldCwgb3B0aW9ucykge1xuICAgIGlmICghdGFyZ2V0IHx8ICEodGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VsZW1lbnQgaXMgcmVxdWlyZWQgaW4gc2Nyb2xsSW50b1ZpZXdJZk5lZWRlZCcpO1xuICAgIHZhciBjb25maWcgPSBfX2Fzc2lnbiQxKHsgaGFuZGxlU2Nyb2xsOiBoYW5kbGVTY3JvbGwkMSB9LCBvcHRpb25zKTtcbiAgICB2YXIgZGVmYXVsdE9mZnNldCA9IHsgdG9wOiAwLCByaWdodDogMCwgYm90dG9tOiAwLCBsZWZ0OiAwIH07XG4gICAgY29uZmlnLm9mZnNldCA9IGNvbmZpZy5vZmZzZXRcbiAgICAgICAgPyBfX2Fzc2lnbiQxKHt9LCBkZWZhdWx0T2Zmc2V0LCBjb25maWcub2Zmc2V0KSA6IGRlZmF1bHRPZmZzZXQ7XG4gICAgZnVuY3Rpb24gd2l0aGluQm91bmRzKHZhbHVlLCBtaW4sIG1heCwgZXh0ZW50KSB7XG4gICAgICAgIGlmIChjb25maWcuY2VudGVySWZOZWVkZWQgPT09IGZhbHNlIHx8XG4gICAgICAgICAgICAobWF4IDw9IHZhbHVlICsgZXh0ZW50ICYmIHZhbHVlIDw9IG1pbiArIGV4dGVudCkpIHtcbiAgICAgICAgICAgIHJldHVybiBNYXRoLm1pbihtYXgsIE1hdGgubWF4KG1pbiwgdmFsdWUpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAobWluICsgbWF4KSAvIDI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdmFyIG9mZnNldCA9IGNvbmZpZy5vZmZzZXQ7XG4gICAgdmFyIG9mZnNldFRvcCA9IG9mZnNldC50b3A7XG4gICAgdmFyIG9mZnNldExlZnQgPSBvZmZzZXQubGVmdDtcbiAgICB2YXIgb2Zmc2V0Qm90dG9tID0gb2Zmc2V0LmJvdHRvbTtcbiAgICB2YXIgb2Zmc2V0UmlnaHQgPSBvZmZzZXQucmlnaHQ7XG4gICAgZnVuY3Rpb24gbWFrZUFyZWEobGVmdCwgdG9wLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBsZWZ0OiBsZWZ0ICsgb2Zmc2V0TGVmdCxcbiAgICAgICAgICAgIHRvcDogdG9wICsgb2Zmc2V0VG9wLFxuICAgICAgICAgICAgd2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBoZWlnaHQsXG4gICAgICAgICAgICByaWdodDogbGVmdCArIG9mZnNldExlZnQgKyB3aWR0aCArIG9mZnNldFJpZ2h0LFxuICAgICAgICAgICAgYm90dG9tOiB0b3AgKyBvZmZzZXRUb3AgKyBoZWlnaHQgKyBvZmZzZXRCb3R0b20sXG4gICAgICAgICAgICB0cmFuc2xhdGU6IGZ1bmN0aW9uICh4LCB5KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1ha2VBcmVhKHggKyBsZWZ0ICsgb2Zmc2V0TGVmdCwgeSArIHRvcCArIG9mZnNldFRvcCwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVsYXRpdmVGcm9tVG86IGZ1bmN0aW9uIChsaHMsIHJocykge1xuICAgICAgICAgICAgICAgIHZhciBuZXdMZWZ0ID0gbGVmdCArIG9mZnNldExlZnQsIG5ld1RvcCA9IHRvcCArIG9mZnNldFRvcDtcbiAgICAgICAgICAgICAgICBsaHMgPSBsaHMub2Zmc2V0UGFyZW50O1xuICAgICAgICAgICAgICAgIHJocyA9IHJocy5vZmZzZXRQYXJlbnQ7XG4gICAgICAgICAgICAgICAgaWYgKGxocyA9PT0gcmhzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhcmVhO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3IgKDsgbGhzOyBsaHMgPSBsaHMub2Zmc2V0UGFyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld0xlZnQgKz0gbGhzLm9mZnNldExlZnQgKyBsaHMuY2xpZW50TGVmdDtcbiAgICAgICAgICAgICAgICAgICAgbmV3VG9wICs9IGxocy5vZmZzZXRUb3AgKyBsaHMuY2xpZW50VG9wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBmb3IgKDsgcmhzOyByaHMgPSByaHMub2Zmc2V0UGFyZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIG5ld0xlZnQgLT0gcmhzLm9mZnNldExlZnQgKyByaHMuY2xpZW50TGVmdDtcbiAgICAgICAgICAgICAgICAgICAgbmV3VG9wIC09IHJocy5vZmZzZXRUb3AgKyByaHMuY2xpZW50VG9wO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbWFrZUFyZWEobmV3TGVmdCwgbmV3VG9wLCB3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH07XG4gICAgfVxuICAgIHZhciBwYXJlbnQsIGFyZWEgPSBtYWtlQXJlYSh0YXJnZXQub2Zmc2V0TGVmdCwgdGFyZ2V0Lm9mZnNldFRvcCwgdGFyZ2V0Lm9mZnNldFdpZHRoLCB0YXJnZXQub2Zmc2V0SGVpZ2h0KTtcbiAgICB3aGlsZSAoKHBhcmVudCA9IHRhcmdldC5wYXJlbnROb2RlKSBpbnN0YW5jZW9mIEhUTUxFbGVtZW50ICYmXG4gICAgICAgIHRhcmdldCAhPT0gY29uZmlnLmJvdW5kYXJ5KSB7XG4gICAgICAgIHZhciBjbGllbnRMZWZ0ID0gcGFyZW50Lm9mZnNldExlZnQgKyBwYXJlbnQuY2xpZW50TGVmdDtcbiAgICAgICAgdmFyIGNsaWVudFRvcCA9IHBhcmVudC5vZmZzZXRUb3AgKyBwYXJlbnQuY2xpZW50VG9wO1xuICAgICAgICAvLyBNYWtlIGFyZWEgcmVsYXRpdmUgdG8gcGFyZW50J3MgY2xpZW50IGFyZWEuXG4gICAgICAgIGFyZWEgPSBhcmVhXG4gICAgICAgICAgICAucmVsYXRpdmVGcm9tVG8odGFyZ2V0LCBwYXJlbnQpXG4gICAgICAgICAgICAudHJhbnNsYXRlKC1jbGllbnRMZWZ0LCAtY2xpZW50VG9wKTtcbiAgICAgICAgdmFyIHNjcm9sbExlZnQgPSB3aXRoaW5Cb3VuZHMocGFyZW50LnNjcm9sbExlZnQsIGFyZWEucmlnaHQgLSBwYXJlbnQuY2xpZW50V2lkdGgsIGFyZWEubGVmdCwgcGFyZW50LmNsaWVudFdpZHRoKTtcbiAgICAgICAgdmFyIHNjcm9sbFRvcCA9IHdpdGhpbkJvdW5kcyhwYXJlbnQuc2Nyb2xsVG9wLCBhcmVhLmJvdHRvbSAtIHBhcmVudC5jbGllbnRIZWlnaHQsIGFyZWEudG9wLCBwYXJlbnQuY2xpZW50SGVpZ2h0KTtcbiAgICAgICAgLy8gUGFzcyB0aGUgbmV3IGNvb3JkaW5hdGVzIHRvIHRoZSBoYW5kbGVTY3JvbGwgY2FsbGJhY2tcbiAgICAgICAgY29uZmlnLmhhbmRsZVNjcm9sbChwYXJlbnQsIHsgc2Nyb2xsTGVmdDogc2Nyb2xsTGVmdCwgc2Nyb2xsVG9wOiBzY3JvbGxUb3AgfSwgY29uZmlnKTtcbiAgICAgICAgLy8gRGV0ZXJtaW5lIGFjdHVhbCBzY3JvbGwgYW1vdW50IGJ5IHJlYWRpbmcgYmFjayBzY3JvbGwgcHJvcGVydGllcy5cbiAgICAgICAgYXJlYSA9IGFyZWEudHJhbnNsYXRlKGNsaWVudExlZnQgLSBwYXJlbnQuc2Nyb2xsTGVmdCwgY2xpZW50VG9wIC0gcGFyZW50LnNjcm9sbFRvcCk7XG4gICAgICAgIHRhcmdldCA9IHBhcmVudDtcbiAgICB9XG59XG5cbnZhciBfX2Fzc2lnbiA9ICh1bmRlZmluZWQgJiYgdW5kZWZpbmVkLl9fYXNzaWduKSB8fCBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uKHQpIHtcbiAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcbiAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcbiAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKVxuICAgICAgICAgICAgdFtwXSA9IHNbcF07XG4gICAgfVxuICAgIHJldHVybiB0O1xufTtcbnZhciBoYW5kbGVTY3JvbGwgPSBmdW5jdGlvbiAocGFyZW50LCBfYSwgY29uZmlnKSB7XG4gICAgdmFyIHNjcm9sbExlZnQgPSBfYS5zY3JvbGxMZWZ0LCBzY3JvbGxUb3AgPSBfYS5zY3JvbGxUb3A7XG4gICAgaWYgKGNvbmZpZy5kdXJhdGlvbikge1xuICAgICAgICBhbWF0b3IocGFyZW50LCB7XG4gICAgICAgICAgICBzY3JvbGxMZWZ0OiBzY3JvbGxMZWZ0LFxuICAgICAgICAgICAgc2Nyb2xsVG9wOiBzY3JvbGxUb3AsXG4gICAgICAgIH0sIHsgZHVyYXRpb246IGNvbmZpZy5kdXJhdGlvbiwgZWFzaW5nOiBjb25maWcuZWFzaW5nIH0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcGFyZW50LnNjcm9sbExlZnQgPSBzY3JvbGxMZWZ0O1xuICAgICAgICBwYXJlbnQuc2Nyb2xsVG9wID0gc2Nyb2xsVG9wO1xuICAgIH1cbn07XG5mdW5jdGlvbiBpc0Jvb2xlYW4ob3B0aW9ucykge1xuICAgIHJldHVybiB0eXBlb2Ygb3B0aW9ucyA9PT0gJ2Jvb2xlYW4nO1xufVxuZnVuY3Rpb24gc2Nyb2xsSW50b1ZpZXdJZk5lZWRlZCh0YXJnZXQsIG9wdGlvbnMsIGFuaW1hdGVPcHRpb25zLCBmaW5hbEVsZW1lbnQsIG9mZnNldE9wdGlvbnMpIHtcbiAgICBpZiAob2Zmc2V0T3B0aW9ucyA9PT0gdm9pZCAwKSB7IG9mZnNldE9wdGlvbnMgPSB7fTsgfVxuICAgIGlmICghdGFyZ2V0IHx8ICEodGFyZ2V0IGluc3RhbmNlb2YgSFRNTEVsZW1lbnQpKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0VsZW1lbnQgaXMgcmVxdWlyZWQgaW4gc2Nyb2xsSW50b1ZpZXdJZk5lZWRlZCcpO1xuICAgIHZhciBjb25maWcgPSB7IGNlbnRlcklmTmVlZGVkOiBmYWxzZSwgaGFuZGxlU2Nyb2xsOiBoYW5kbGVTY3JvbGwgfTtcbiAgICBpZiAoaXNCb29sZWFuKG9wdGlvbnMpKSB7XG4gICAgICAgIGNvbmZpZy5jZW50ZXJJZk5lZWRlZCA9IG9wdGlvbnM7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25maWcgPSBfX2Fzc2lnbih7fSwgY29uZmlnLCBvcHRpb25zKTtcbiAgICB9XG4gICAgdmFyIGRlZmF1bHRPZmZzZXQgPSB7IHRvcDogMCwgcmlnaHQ6IDAsIGJvdHRvbTogMCwgbGVmdDogMCB9O1xuICAgIGNvbmZpZy5vZmZzZXQgPSBjb25maWcub2Zmc2V0XG4gICAgICAgID8gX19hc3NpZ24oe30sIGRlZmF1bHRPZmZzZXQsIGNvbmZpZy5vZmZzZXQpIDogZGVmYXVsdE9mZnNldDtcbiAgICBpZiAoYW5pbWF0ZU9wdGlvbnMpIHtcbiAgICAgICAgY29uZmlnLmR1cmF0aW9uID0gYW5pbWF0ZU9wdGlvbnMuZHVyYXRpb247XG4gICAgICAgIGNvbmZpZy5lYXNpbmcgPSBhbmltYXRlT3B0aW9ucy5lYXNpbmc7XG4gICAgfVxuICAgIGlmIChmaW5hbEVsZW1lbnQpIHtcbiAgICAgICAgY29uZmlnLmJvdW5kYXJ5ID0gZmluYWxFbGVtZW50O1xuICAgIH1cbiAgICBpZiAob2Zmc2V0T3B0aW9ucy5vZmZzZXRUb3ApIHtcbiAgICAgICAgY29uZmlnLm9mZnNldC50b3AgPSBvZmZzZXRPcHRpb25zLm9mZnNldFRvcDtcbiAgICB9XG4gICAgaWYgKG9mZnNldE9wdGlvbnMub2Zmc2V0UmlnaHQpIHtcbiAgICAgICAgY29uZmlnLm9mZnNldC5yaWdodCA9IG9mZnNldE9wdGlvbnMub2Zmc2V0UmlnaHQ7XG4gICAgfVxuICAgIGlmIChvZmZzZXRPcHRpb25zLm9mZnNldEJvdHRvbSkge1xuICAgICAgICBjb25maWcub2Zmc2V0LmJvdHRvbSA9IG9mZnNldE9wdGlvbnMub2Zmc2V0Qm90dG9tO1xuICAgIH1cbiAgICBpZiAob2Zmc2V0T3B0aW9ucy5vZmZzZXRMZWZ0KSB7XG4gICAgICAgIGNvbmZpZy5vZmZzZXQubGVmdCA9IG9mZnNldE9wdGlvbnMub2Zmc2V0TGVmdDtcbiAgICB9XG4gICAgcmV0dXJuIGNhbGN1bGF0ZSh0YXJnZXQsIGNvbmZpZyk7XG59XG5cbnJldHVybiBzY3JvbGxJbnRvVmlld0lmTmVlZGVkO1xuXG59KSkpO1xuIl19
