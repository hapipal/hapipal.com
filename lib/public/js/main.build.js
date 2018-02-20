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

    var docsNavIsOpen = function docsNavIsOpen() {
        return docsNav.classList.contains('docs-nav--open');
    };
    var toggleDocsNav = function toggleDocsNav() {

        if (docsNavIsOpen()) {
            document.body.classList.remove('body--noscroll');
            docsNav.classList.remove('docs-nav--open');
            return;
        }

        document.body.classList.add('body--noscroll');
        docsNav.classList.add('docs-nav--open');
    };

    menuButton.addEventListener('click', toggleDocsNav);
    topButton.addEventListener('click', function () {

        if (docsNavIsOpen()) {
            toggleDocsNav();
        }

        return window.scrollTo(0, 0);
    });
};

setActiveNavItems();
newsletterSubmit();
docsNavMobileActions();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvcHVibGljL2pzL2RvY3MtbmF2LmpzIiwibGliL3B1YmxpYy9qcy9tYWluLmpzIiwibGliL3B1YmxpYy9qcy92ZW5kb3IvbmF2YmFyLmpzIiwibm9kZV9tb2R1bGVzL3Njcm9sbC1pbnRvLXZpZXctaWYtbmVlZGVkL2Rpc3QvYnVuZGxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7Ozs7O0FBRUEsSUFBTSx5QkFBeUIsUUFBUSw0QkFBUixDQUEvQjtBQUNBLElBQU0sU0FBUyxRQUFRLGlCQUFSLENBQWY7O0FBRUEsSUFBTSxZQUFZLEVBQWxCOztBQUVBLElBQU0sc0JBQXNCLEVBQTVCO0FBQ0EsSUFBTSxjQUFjLEVBQXBCOztBQUVBLFFBQVEsSUFBUixHQUFlLFVBQUMsU0FBRCxFQUFZLEtBQVosRUFBc0I7O0FBRWpDLFFBQUksQ0FBQyxTQUFMLEVBQWdCO0FBQ1o7QUFDSDs7QUFFRCxRQUFJLENBQUMsS0FBTCxFQUFZO0FBQ1IsY0FBTSxJQUFJLEtBQUosQ0FBVSxrRUFBVixDQUFOO0FBQ0g7O0FBRUQsUUFBTSxZQUFZLElBQUksVUFBVSxTQUFkLEVBQWxCOztBQUVBLFFBQU0sU0FBUyxPQUFPO0FBQ2xCLGlCQUFTLE1BQU0sT0FERztBQUVsQixxQkFBYSxVQUFVLGdCQUFWLENBQTJCLHdCQUEzQixDQUZLO0FBR2xCLHlCQUFpQix5QkFBQyxFQUFELEVBQVE7O0FBRXJCLGlCQUFLLEdBQUcsU0FBSCxDQUFhLElBQWIsQ0FBTDs7QUFFQSxnQkFBTSxTQUFTLEdBQUcsV0FBSCxDQUFlLEdBQUcsYUFBSCxDQUFpQixHQUFqQixDQUFmLENBQWY7QUFDQSxnQkFBTSxTQUFTLE9BQU8sR0FBRyxPQUFILENBQVcsT0FBWCxDQUFtQixHQUFuQixFQUF3QixFQUF4QixDQUFQLENBQWY7O0FBRUEsbUJBQU8sVUFBVSxNQUFWLENBQ0gsVUFBVSxJQUFWLENBQWUsR0FBRyxTQUFsQixFQUE2QixPQUFPLElBQXBDLEVBQTBDLE1BQTFDLENBREcsQ0FBUDtBQUdILFNBYmlCO0FBY2xCLGtCQUFVLGtCQUFDLE9BQUQsRUFBYTs7QUFFbkIsZ0JBQUksT0FBTyxRQUFQLENBQWdCLElBQWhCLEtBQXlCLFFBQVEsSUFBakMsSUFBeUMsQ0FBQyxVQUFVLGFBQXBELElBQXFFLENBQUMsVUFBVSxXQUFwRixFQUFpRztBQUM3RiwwQkFBVSxvQkFBVjtBQUNBLHVCQUFPLFFBQVAsR0FBa0IsUUFBUSxJQUExQjtBQUNIOztBQUVELHNCQUFVLFFBQVY7QUFDSDtBQXRCaUIsS0FBUCxDQUFmOztBQXlCQSxXQUFPLFNBQVAsQ0FBaUIsR0FBakIsQ0FBcUIsZUFBckI7O0FBRUEsUUFBTSxhQUFhLFNBQWIsVUFBYSxHQUFNOztBQUVyQixrQkFBVSxpQkFBVixDQUE0QixPQUFPLFFBQVAsQ0FBZ0IsSUFBNUMsRUFBa0QsTUFBbEQsRUFBMEQsU0FBMUQ7QUFDSCxLQUhEOztBQUtBLFdBQU8sZ0JBQVAsQ0FBd0IsWUFBeEIsRUFBc0MsVUFBdEM7QUFDQSxXQUFPLGdCQUFQLENBQXdCLE1BQXhCLEVBQWdDLFVBQWhDOztBQUVBLFdBQU8sTUFBTSxVQUFOLENBQWlCLFlBQWpCLENBQThCLE1BQTlCLEVBQXNDLEtBQXRDLENBQVA7QUFDSCxDQWhERDs7QUFrREEsVUFBVSxTQUFWO0FBRUkseUJBQWM7QUFBQTs7QUFFVixhQUFLLGFBQUwsR0FBcUIsQ0FBckI7QUFDQSxhQUFLLFVBQUwsR0FBa0IsS0FBbEI7QUFDQSxhQUFLLFdBQUwsR0FBbUIsSUFBbkI7QUFDSDs7QUFQTDtBQUFBO0FBQUEsbUNBU2U7O0FBRVAsaUJBQUssV0FBTCxHQUFtQixLQUFuQjtBQUNIO0FBWkw7QUFBQTtBQUFBLCtDQWMyQjs7QUFFbkIsaUJBQUssVUFBTCxHQUFrQixJQUFsQjtBQUNIO0FBakJMO0FBQUE7QUFBQSx3Q0FtQm9COztBQUVaLGlCQUFLLFVBQUwsR0FBa0IsS0FBbEI7QUFDSDtBQXRCTDtBQUFBO0FBQUEsNkNBd0J5Qjs7QUFFakIsaUJBQUssYUFBTDtBQUNIO0FBM0JMO0FBQUE7QUFBQSw0Q0E2QndCOztBQUVoQixpQkFBSyxhQUFMO0FBQ0g7QUFoQ0w7O0FBQUE7QUFBQTs7QUFtQ0EsVUFBVSxpQkFBVixHQUE4QixVQUFDLElBQUQsRUFBTyxNQUFQLEVBQWUsU0FBZixFQUE2Qjs7QUFFdkQsUUFBTSxTQUFTLFFBQVEsU0FBUyxhQUFULHFCQUF5QyxJQUF6QyxRQUF2QjtBQUNBLFFBQU0sVUFBVyxRQUFRLE9BQU8sYUFBUCx1QkFBeUMsSUFBekMsUUFBVCxJQUFnRSxPQUFPLGFBQVAsQ0FBcUIsV0FBckIsQ0FBaEY7O0FBRUEsUUFBSSxPQUFKLEVBQWE7QUFDVCxrQkFBVSxhQUFWLENBQXdCLE9BQXhCO0FBQ0EsK0JBQXVCLE9BQXZCLEVBQWdDLEVBQUUsVUFBVSxPQUFPLFVBQW5CLEVBQWhDO0FBQ0g7O0FBRUQsUUFBSSxVQUFVLENBQUMsVUFBVSxVQUF6QixFQUFxQztBQUNqQyxrQkFBVSxrQkFBVjtBQUNBLGVBQU8sY0FBUDs7QUFFQTtBQUNBLFlBQUksT0FBTyxxQkFBUCxHQUErQixHQUEvQixHQUFzQyxzQkFBc0IsV0FBaEUsRUFBOEU7QUFDMUUsbUJBQU8sUUFBUCxDQUFnQixDQUFoQixFQUFtQixFQUFFLHNCQUFzQixXQUF4QixDQUFuQjtBQUNIOztBQUVELG1CQUFXO0FBQUEsbUJBQU0sVUFBVSxpQkFBVixFQUFOO0FBQUEsU0FBWCxFQUFnRCxFQUFoRDtBQUNIOztBQUVELGNBQVUsYUFBVjtBQUNILENBdkJEOztBQXlCQSxVQUFVLGFBQVYsR0FBMEIsVUFBQyxPQUFELEVBQWE7O0FBRW5DLFFBQU0sY0FBYyxRQUFRLFVBQVIsQ0FBbUIsYUFBbkIsQ0FBaUMseUJBQWpDLENBQXBCOztBQUVBLFFBQUksV0FBSixFQUFpQjtBQUNiLG9CQUFZLFNBQVosQ0FBc0IsTUFBdEIsQ0FBNkIsZUFBN0I7QUFDSDs7QUFFRCxZQUFRLFNBQVIsQ0FBa0IsR0FBbEIsQ0FBc0IsZUFBdEI7QUFDSCxDQVREOztBQVdBLFVBQVUsSUFBVixHQUFpQixVQUFDLFNBQUQsRUFBWSxJQUFaLEVBQWtCLE1BQWxCO0FBQUEseUJBQ0QsSUFEQyxpQ0FDK0IsTUFEL0Isb0JBRVAsU0FGTztBQUFBLENBQWpCOztBQU1BLFVBQVUsTUFBVixHQUFtQixVQUFDLElBQUQsRUFBVTs7QUFFekIsUUFBTSxVQUFVLFNBQVMsYUFBVCxDQUF1QixLQUF2QixDQUFoQjtBQUNBLFlBQVEsU0FBUixHQUFvQixJQUFwQjs7QUFFQSxXQUFPLFFBQVEsVUFBZjtBQUNILENBTkQ7OztBQzFJQTtBQUNBOztBQUVBLElBQU0sVUFBVSxRQUFRLFlBQVIsQ0FBaEI7O0FBRUEsUUFBUSxJQUFSLENBQ0ksU0FBUyxhQUFULENBQXVCLHVCQUF2QixDQURKLEVBRUksU0FBUyxhQUFULENBQXVCLDBCQUF2QixDQUZKOztBQUtBLElBQU0sb0JBQW9CLFNBQXBCLGlCQUFvQixHQUFNOztBQUU1QixRQUFNLE9BQU8sU0FBUyxzQkFBVCxDQUFnQyxXQUFoQyxDQUFiO0FBQ0EsUUFBTSxjQUFjLE9BQU8sUUFBUCxDQUFnQixRQUFoQixDQUF5QixLQUF6QixDQUErQixHQUEvQixFQUFvQyxDQUFwQyxDQUFwQjs7QUFFQSxTQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksS0FBSyxNQUF6QixFQUFpQyxFQUFFLENBQW5DLEVBQXNDO0FBQ2xDLFlBQU0sT0FBTyxLQUFLLENBQUwsQ0FBYjtBQUNBLFlBQUksS0FBSyxRQUFMLENBQWMsS0FBZCxDQUFvQixHQUFwQixFQUF5QixDQUF6QixNQUFnQyxXQUFwQyxFQUFpRDtBQUM3QyxpQkFBSyxTQUFMLENBQWUsR0FBZixDQUFtQixtQkFBbkI7QUFDSDtBQUNKO0FBQ0osQ0FYRDs7QUFhQSxJQUFNLG1CQUFtQixTQUFuQixnQkFBbUIsR0FBTTs7QUFFM0IsUUFBTSxPQUFPLFNBQVMsY0FBVCxDQUF3QixnQkFBeEIsQ0FBYjs7QUFFQSxRQUFJLENBQUMsSUFBTCxFQUFXO0FBQ1A7QUFDSDs7QUFFRCxTQUFLLFFBQUwsR0FBZ0IsVUFBQyxDQUFELEVBQU87O0FBRW5CLFVBQUUsY0FBRjs7QUFFQSxZQUFNLGFBQWEsU0FBUyxjQUFULENBQXdCLGlCQUF4QixDQUFuQjtBQUNBLFlBQU0sVUFBVSxTQUFTLGNBQVQsQ0FBd0IsbUJBQXhCLENBQWhCOztBQUVBLFlBQUksV0FBVyxRQUFYLENBQW9CLEtBQXhCLEVBQStCO0FBQzNCLGdCQUFNLFVBQVUsS0FBSyxTQUFMLENBQWU7QUFDM0IsdUJBQU8sV0FBVztBQURTLGFBQWYsQ0FBaEI7QUFHQSxnQkFBTSxNQUFNLElBQUksY0FBSixFQUFaO0FBQ0EsZ0JBQUksSUFBSixDQUFTLE1BQVQsRUFBaUIsWUFBakI7QUFDQSxnQkFBSSxnQkFBSixDQUFxQixjQUFyQixFQUFxQyxrQkFBckM7QUFDQSxnQkFBSSxNQUFKLEdBQWEsWUFBTTs7QUFFZixvQkFBSSxJQUFJLE1BQUosS0FBZSxHQUFuQixFQUF3QjtBQUNwQiw0QkFBUSxTQUFSLEdBQW9CLHlCQUF5QixXQUFXLEtBQXBDLEdBQTRDLGlDQUFoRTtBQUNBLCtCQUFXLEtBQVgsR0FBbUIsSUFBbkI7QUFDQSx5QkFBSyxLQUFMLENBQVcsT0FBWCxHQUFxQixNQUFyQjtBQUNBLDRCQUFRLEtBQVIsQ0FBYyxPQUFkLEdBQXdCLE9BQXhCO0FBQ0gsaUJBTEQsTUFNSyxJQUFJLElBQUksTUFBSixLQUFlLEdBQW5CLEVBQXdCO0FBQ3pCLDRCQUFRLFNBQVIsR0FBb0Isd0JBQXdCLFdBQVcsS0FBbkMsR0FBMkMsbURBQS9EO0FBQ0EsK0JBQVcsS0FBWCxHQUFtQixJQUFuQjtBQUNBLCtCQUFXLFNBQVgsQ0FBcUIsR0FBckIsQ0FBeUIsNEJBQXpCO0FBQ0EseUJBQUssS0FBTCxDQUFXLE9BQVgsR0FBcUIsT0FBckI7QUFDQSw0QkFBUSxLQUFSLENBQWMsT0FBZCxHQUF3QixPQUF4QjtBQUNILGlCQU5JLE1BT0E7QUFDRCw0QkFBUSxTQUFSLEdBQW9CLHdCQUF3QixXQUFXLEtBQW5DLEdBQTJDLHlEQUEvRDtBQUNBLCtCQUFXLEtBQVgsR0FBbUIsSUFBbkI7QUFDQSwrQkFBVyxTQUFYLENBQXFCLEdBQXJCLENBQXlCLDRCQUF6QjtBQUNBLHlCQUFLLEtBQUwsQ0FBVyxPQUFYLEdBQXFCLE9BQXJCO0FBQ0EsNEJBQVEsS0FBUixDQUFjLE9BQWQsR0FBd0IsT0FBeEI7QUFDSDtBQUNKLGFBdEJEO0FBdUJBLGdCQUFJLElBQUosQ0FBUyxPQUFUO0FBQ0g7QUFDSixLQXZDRDtBQXdDSCxDQWhERDs7QUFrREEsSUFBTSx1QkFBdUIsU0FBdkIsb0JBQXVCLEdBQU07O0FBRS9CLFFBQU0sYUFBYSxTQUFTLGFBQVQsQ0FBdUIsaUJBQXZCLENBQW5CO0FBQ0EsUUFBTSxZQUFZLFNBQVMsYUFBVCxDQUF1QixrQkFBdkIsQ0FBbEI7QUFDQSxRQUFNLFVBQVUsU0FBUyxhQUFULENBQXVCLFdBQXZCLENBQWhCOztBQUVBLFFBQU0sZ0JBQWdCLFNBQWhCLGFBQWdCO0FBQUEsZUFBTSxRQUFRLFNBQVIsQ0FBa0IsUUFBbEIsQ0FBMkIsZ0JBQTNCLENBQU47QUFBQSxLQUF0QjtBQUNBLFFBQU0sZ0JBQWdCLFNBQWhCLGFBQWdCLEdBQU07O0FBRXhCLFlBQUksZUFBSixFQUFxQjtBQUNqQixxQkFBUyxJQUFULENBQWMsU0FBZCxDQUF3QixNQUF4QixDQUErQixnQkFBL0I7QUFDQSxvQkFBUSxTQUFSLENBQWtCLE1BQWxCLENBQXlCLGdCQUF6QjtBQUNBO0FBQ0g7O0FBRUQsaUJBQVMsSUFBVCxDQUFjLFNBQWQsQ0FBd0IsR0FBeEIsQ0FBNEIsZ0JBQTVCO0FBQ0EsZ0JBQVEsU0FBUixDQUFrQixHQUFsQixDQUFzQixnQkFBdEI7QUFDSCxLQVZEOztBQVlBLGVBQVcsZ0JBQVgsQ0FBNEIsT0FBNUIsRUFBcUMsYUFBckM7QUFDQSxjQUFVLGdCQUFWLENBQTJCLE9BQTNCLEVBQW9DLFlBQU07O0FBRXRDLFlBQUksZUFBSixFQUFxQjtBQUNqQjtBQUNIOztBQUVELGVBQU8sT0FBTyxRQUFQLENBQWdCLENBQWhCLEVBQWtCLENBQWxCLENBQVA7QUFDSCxLQVBEO0FBUUgsQ0E1QkQ7O0FBOEJBO0FBQ0E7QUFDQTs7Ozs7QUN6R0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF5QkEsSUFBSSxnQkFBZ0IsZUFBcEI7QUFDQSxJQUFJLGtCQUFrQixLQUF0Qjs7QUFFQSxJQUFJO0FBQ0YsTUFBSSxPQUFPLE9BQU8sY0FBUCxDQUFzQixFQUF0QixFQUEwQixTQUExQixFQUFxQztBQUM5QyxTQUFLLGVBQVk7QUFDZix3QkFBa0IsSUFBbEI7QUFDRDtBQUg2QyxHQUFyQyxDQUFYOztBQU1BLFNBQU8sZ0JBQVAsQ0FBd0IsTUFBeEIsRUFBZ0MsSUFBaEMsRUFBc0MsSUFBdEM7QUFDRCxDQVJELENBUUUsT0FBTyxDQUFQLEVBQVUsQ0FBRTs7QUFFZDtBQUNBO0FBQ0EsU0FBUyxtQkFBVCxDQUE2QixFQUE3QixFQUFpQztBQUMvQjtBQUNBLE1BQUksQ0FBQyxHQUFHLFNBQVIsRUFBbUI7QUFDakI7QUFDRDs7QUFFRCxNQUFJLGlCQUFpQixHQUFHLFNBQUgsQ0FBYSxLQUFiLENBQW1CLEdBQW5CLENBQXJCO0FBQ0EsTUFBSSx1QkFBdUIsRUFBM0I7O0FBRUE7QUFDQSxPQUFLLElBQUksSUFBSSxDQUFSLEVBQVcsTUFBTSxlQUFlLE1BQXJDLEVBQTZDLElBQUksR0FBakQsRUFBc0QsR0FBdEQsRUFBMkQ7QUFDekQsUUFBSSxZQUFZLGVBQWUsQ0FBZixDQUFoQjs7QUFFQSxRQUFJLGNBQWMsYUFBbEIsRUFBaUM7QUFDL0IsOEJBQXdCLHlCQUF5QixFQUF6QixHQUE4QixTQUE5QixHQUEwQyxNQUFNLFNBQXhFO0FBQ0Q7QUFDRjs7QUFFRDtBQUNBO0FBQ0EsTUFBSSxxQkFBcUIsTUFBckIsS0FBZ0MsR0FBRyxTQUFILENBQWEsTUFBakQsRUFBeUQ7QUFDdkQsT0FBRyxTQUFILEdBQWUsb0JBQWY7QUFDRDtBQUNGOztBQUVEO0FBQ0EsU0FBUyxnQkFBVCxDQUEwQixFQUExQixFQUE4QjtBQUM1QjtBQUNBLE1BQUksQ0FBQyxHQUFHLFNBQVIsRUFBbUI7QUFDakIsT0FBRyxTQUFILEdBQWUsYUFBZjtBQUNBO0FBQ0Q7O0FBRUQsTUFBSSxpQkFBaUIsR0FBRyxTQUFILENBQWEsS0FBYixDQUFtQixHQUFuQixDQUFyQjs7QUFFQTtBQUNBLE9BQUssSUFBSSxJQUFJLENBQVIsRUFBVyxNQUFNLGVBQWUsTUFBckMsRUFBNkMsSUFBSSxHQUFqRCxFQUFzRCxHQUF0RCxFQUEyRDtBQUN6RCxRQUFJLGVBQWUsQ0FBZixNQUFzQixhQUExQixFQUF5QztBQUN2QztBQUNEO0FBQ0Y7O0FBRUQ7QUFDQSxLQUFHLFNBQUgsSUFBZ0IsTUFBTSxhQUF0QjtBQUNEOztBQUVELFNBQVMsd0JBQVQsQ0FBa0MsT0FBbEMsRUFBMkMsV0FBM0MsRUFBd0QsZUFBeEQsRUFBeUU7QUFDdkUsTUFBSSxRQUFRLEVBQVo7QUFDQSxNQUFJLE9BQUo7QUFDQSxNQUFJLEVBQUo7O0FBRUE7QUFDQSxPQUFLLElBQUksSUFBSSxDQUFSLEVBQVcsTUFBTSxZQUFZLE1BQWxDLEVBQTBDLElBQUksR0FBOUMsRUFBbUQsR0FBbkQsRUFBd0Q7QUFDdEQsY0FBVSxZQUFZLENBQVosQ0FBVjtBQUNBLFNBQUssZ0JBQWdCLE9BQWhCLENBQUw7O0FBRUEsWUFBUSxXQUFSLENBQW9CLEVBQXBCOztBQUVBLFVBQU0sSUFBTixDQUFXLEVBQUUsU0FBUyxPQUFYLEVBQW9CLFlBQVksRUFBaEMsRUFBWDtBQUNEOztBQUVELFNBQU8sS0FBUDtBQUNEOztBQUVELFNBQVMsZ0JBQVQsQ0FBMEIsS0FBMUIsRUFBaUMsWUFBakMsRUFBK0MsWUFBL0MsRUFBNkQ7QUFDM0QsV0FBUyxZQUFULEdBQXdCO0FBQ3RCLFFBQUksZ0JBQUo7QUFDQSxRQUFJLGNBQWMsUUFBbEI7QUFDQSxRQUFJLElBQUo7QUFDQSxRQUFJLE9BQUo7O0FBRUEsU0FBSyxJQUFJLElBQUksQ0FBUixFQUFXLE1BQU0sTUFBTSxNQUE1QixFQUFvQyxJQUFJLEdBQXhDLEVBQTZDLEdBQTdDLEVBQWtEO0FBQ2hELGFBQU8sTUFBTSxDQUFOLENBQVA7QUFDQSxnQkFBVSxLQUFLLEdBQUwsQ0FBUyxLQUFLLE9BQUwsQ0FBYSxxQkFBYixHQUFxQyxHQUE5QyxDQUFWOztBQUVBO0FBQ0EsVUFBSSxVQUFVLFdBQWQsRUFBMkI7QUFDekI7QUFDRDs7QUFFRCx5QkFBbUIsQ0FBbkI7QUFDQSxvQkFBYyxPQUFkO0FBQ0Q7O0FBRUQsUUFBSSxZQUFKLEVBQWtCO0FBQ2QsbUJBQWEsTUFBTSxnQkFBTixFQUF3QixVQUFyQztBQUNIO0FBQ0Y7O0FBRUQ7QUFDQSxNQUFJLE9BQU8sWUFBUCxLQUF3QixRQUF4QixJQUFvQyxNQUFNLFlBQU4sQ0FBeEMsRUFBNkQ7QUFDM0QsV0FBTyxZQUFQO0FBQ0Q7O0FBRUQsTUFBSSxPQUFKOztBQUVBLFdBQVMsY0FBVCxHQUEwQjtBQUN4QixjQUFVLElBQVY7QUFDRDs7QUFFRCxTQUFPLFNBQVMscUJBQVQsR0FBaUM7QUFDdEMsUUFBSSxPQUFKLEVBQWE7QUFDWDtBQUNEOztBQUVEO0FBQ0E7O0FBRUE7QUFDQSxjQUFVLFdBQVcsY0FBWCxFQUEyQixZQUEzQixDQUFWO0FBQ0QsR0FWRDtBQVdEOztBQUVELFNBQVMsaUJBQVQsQ0FBMkIsTUFBM0IsRUFBbUMsWUFBbkMsRUFBaUQ7QUFDL0MsV0FBUyxtQkFBVCxDQUE2QixHQUE3QixFQUFrQztBQUNoQyxRQUFJLElBQUksTUFBSixLQUFlLE1BQW5CLEVBQTJCO0FBQ3pCO0FBQ0Q7QUFDRjs7QUFFRCxNQUFJLE9BQU8sZ0JBQVgsRUFBNkI7QUFDM0IsV0FBTyxnQkFBUCxDQUF3QixRQUF4QixFQUFrQyxtQkFBbEMsRUFBdUQsa0JBQWtCLEVBQUUsU0FBUyxJQUFYLEVBQWxCLEdBQXNDLEtBQTdGO0FBQ0QsR0FGRCxNQUVPLElBQUksT0FBTyxXQUFYLEVBQXdCO0FBQzdCLFdBQU8sV0FBUCxDQUFtQixVQUFuQixFQUErQixtQkFBL0I7QUFDRCxHQUZNLE1BRUE7QUFDTCxVQUFNLElBQUksS0FBSixDQUFVLGdFQUFWLENBQU47QUFDRDs7QUFFRDtBQUNBO0FBQ0Q7O0FBRUQsT0FBTyxPQUFQLEdBQWlCLFNBQVMsT0FBVCxDQUFpQixPQUFqQixFQUEwQjtBQUN6QyxNQUFJLENBQUMsT0FBRCxJQUFZLENBQUMsUUFBUSxXQUFyQixJQUFvQyxDQUFDLFFBQVEsZUFBakQsRUFBa0U7QUFDaEUsVUFBTSxJQUFJLEtBQUosQ0FBVSx1RUFBVixDQUFOO0FBQ0Q7O0FBRUQsTUFBSSxTQUFTLFNBQVMsYUFBVCxDQUF1QixRQUFRLE9BQVIsSUFBbUIsS0FBMUMsQ0FBYjtBQUNBLE1BQUksVUFBVSxTQUFTLGFBQVQsQ0FBdUIsSUFBdkIsQ0FBZDs7QUFFQTtBQUNBLE1BQUksU0FBUyxRQUFRLE1BQVIsSUFBa0IsUUFBL0I7O0FBRUE7QUFDQSxNQUFJLFFBQVEseUJBQXlCLE9BQXpCLEVBQWtDLFFBQVEsV0FBMUMsRUFBdUQsUUFBUSxlQUEvRCxDQUFaOztBQUVBO0FBQ0E7QUFDQSxvQkFBa0IsTUFBbEIsRUFBMEIsaUJBQWlCLEtBQWpCLEVBQXdCLFFBQVEsUUFBaEMsRUFBMEMsUUFBUSxZQUFsRCxDQUExQjs7QUFFQSxTQUFPLFdBQVAsQ0FBbUIsT0FBbkI7O0FBRUEsU0FBTyxNQUFQO0FBQ0QsQ0FyQkQ7OztBQzVLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuLyogZ2xvYmFsIGRvY3VtZW50ICovXG5cbmNvbnN0IFNjcm9sbEludG9WaWV3SWZOZWVkZWQgPSByZXF1aXJlKCdzY3JvbGwtaW50by12aWV3LWlmLW5lZWRlZCcpO1xuY29uc3QgTmF2YmFyID0gcmVxdWlyZSgnLi92ZW5kb3IvbmF2YmFyJyk7XG5cbmNvbnN0IGludGVybmFscyA9IHt9O1xuXG5jb25zdCBGSVhFRF9IRUFERVJfSEVJR0hUID0gODA7XG5jb25zdCBUT1BfUEFERElORyA9IDM1O1xuXG5leHBvcnRzLmluaXQgPSAoY29udGVudEVsLCBuYXZFbCkgPT4ge1xuXG4gICAgaWYgKCFjb250ZW50RWwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghbmF2RWwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEb2NzIG5hdmlnYXRpb24gY29udGVudCBlbGVtZW50IGV4aXN0cywgYnV0IG5vdCB0aGUgbmF2IGVsZW1lbnQuJyk7XG4gICAgfVxuXG4gICAgY29uc3QgaGFzaFN0YXRlID0gbmV3IGludGVybmFscy5IYXNoU3RhdGUoKTtcblxuICAgIGNvbnN0IG5hdmJhciA9IE5hdmJhcih7XG4gICAgICAgIHRhZ05hbWU6IG5hdkVsLnRhZ05hbWUsXG4gICAgICAgIGVsZW1lbnRMaXN0OiBjb250ZW50RWwucXVlcnlTZWxlY3RvckFsbCgnaDEsIGgyLCBoMywgaDQsIGg1LCBoNicpLFxuICAgICAgICBtYWtlTmF2TGlzdEl0ZW06IChlbCkgPT4ge1xuXG4gICAgICAgICAgICBlbCA9IGVsLmNsb25lTm9kZSh0cnVlKTtcblxuICAgICAgICAgICAgY29uc3QgYW5jaG9yID0gZWwucmVtb3ZlQ2hpbGQoZWwucXVlcnlTZWxlY3RvcignYScpKTtcbiAgICAgICAgICAgIGNvbnN0IGluZGVudCA9IE51bWJlcihlbC50YWdOYW1lLnJlcGxhY2UoJ0gnLCAnJykpO1xuXG4gICAgICAgICAgICByZXR1cm4gaW50ZXJuYWxzLnJlbmRlcihcbiAgICAgICAgICAgICAgICBpbnRlcm5hbHMuaXRlbShlbC5pbm5lckhUTUwsIGFuY2hvci5oYXNoLCBpbmRlbnQpXG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuICAgICAgICBvblNjcm9sbDogKG5hdkl0ZW0pID0+IHtcblxuICAgICAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoICE9PSBuYXZJdGVtLmhhc2ggJiYgIWhhc2hTdGF0ZS5hdXRvU2Nyb2xsaW5nICYmICFoYXNoU3RhdGUuZmlyc3RTY3JvbGwpIHtcbiAgICAgICAgICAgICAgICBoYXNoU3RhdGUuaGFzaENoYW5nZUZyb21TY3JvbGwoKTtcbiAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24gPSBuYXZJdGVtLmhyZWY7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGhhc2hTdGF0ZS5zY3JvbGxlZCgpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBuYXZiYXIuY2xhc3NMaXN0LmFkZCgnbWFya2Rvd24tYm9keScpO1xuXG4gICAgY29uc3QgaGFuZGxlSGFzaCA9ICgpID0+IHtcblxuICAgICAgICBpbnRlcm5hbHMubWF5YmVTY3JvbGxUb0hhc2god2luZG93LmxvY2F0aW9uLmhhc2gsIG5hdmJhciwgaGFzaFN0YXRlKTtcbiAgICB9O1xuXG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ2hhc2hjaGFuZ2UnLCBoYW5kbGVIYXNoKTtcbiAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGhhbmRsZUhhc2gpO1xuXG4gICAgcmV0dXJuIG5hdkVsLnBhcmVudE5vZGUucmVwbGFjZUNoaWxkKG5hdmJhciwgbmF2RWwpO1xufTtcblxuaW50ZXJuYWxzLkhhc2hTdGF0ZSA9IGNsYXNzIEhhc2hTdGF0ZSB7XG5cbiAgICBjb25zdHJ1Y3RvcigpIHtcblxuICAgICAgICB0aGlzLmF1dG9TY3JvbGxpbmcgPSAwO1xuICAgICAgICB0aGlzLmZyb21TY3JvbGwgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5maXJzdFNjcm9sbCA9IHRydWU7XG4gICAgfVxuXG4gICAgc2Nyb2xsZWQoKSB7XG5cbiAgICAgICAgdGhpcy5maXJzdFNjcm9sbCA9IGZhbHNlO1xuICAgIH1cblxuICAgIGhhc2hDaGFuZ2VGcm9tU2Nyb2xsKCkge1xuXG4gICAgICAgIHRoaXMuZnJvbVNjcm9sbCA9IHRydWU7XG4gICAgfVxuXG4gICAgaGFuZGxlZENoYW5nZSgpIHtcblxuICAgICAgICB0aGlzLmZyb21TY3JvbGwgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBzdGFydEF1dG9TY3JvbGxpbmcoKSB7XG5cbiAgICAgICAgdGhpcy5hdXRvU2Nyb2xsaW5nKys7XG4gICAgfVxuXG4gICAgc3RvcEF1dG9TY3JvbGxpbmcoKSB7XG5cbiAgICAgICAgdGhpcy5hdXRvU2Nyb2xsaW5nLS07XG4gICAgfVxufTtcblxuaW50ZXJuYWxzLm1heWJlU2Nyb2xsVG9IYXNoID0gKGhhc2gsIG5hdmJhciwgaGFzaFN0YXRlKSA9PiB7XG5cbiAgICBjb25zdCBhbmNob3IgPSBoYXNoICYmIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYGEuYW5jaG9yW2hyZWY9XCIke2hhc2h9XCJdYCk7XG4gICAgY29uc3QgbmF2SXRlbSA9IChoYXNoICYmIG5hdmJhci5xdWVyeVNlbGVjdG9yKGBhLm5hdi1pdGVtW2hyZWY9XCIke2hhc2h9XCJdYCkpIHx8IG5hdmJhci5xdWVyeVNlbGVjdG9yKCcubmF2LWl0ZW0nKTtcblxuICAgIGlmIChuYXZJdGVtKSB7XG4gICAgICAgIGludGVybmFscy5zZWxlY3ROYXZJdGVtKG5hdkl0ZW0pO1xuICAgICAgICBTY3JvbGxJbnRvVmlld0lmTmVlZGVkKG5hdkl0ZW0sIHsgYm91bmRhcnk6IG5hdmJhci5wYXJlbnROb2RlIH0pO1xuICAgIH1cblxuICAgIGlmIChhbmNob3IgJiYgIWhhc2hTdGF0ZS5mcm9tU2Nyb2xsKSB7XG4gICAgICAgIGhhc2hTdGF0ZS5zdGFydEF1dG9TY3JvbGxpbmcoKTtcbiAgICAgICAgYW5jaG9yLnNjcm9sbEludG9WaWV3KCk7XG5cbiAgICAgICAgLy8gRW5zdXJlIGVsZW1lbnQgaXMgdmlzaWJsZVxuICAgICAgICBpZiAoYW5jaG9yLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCA8IChGSVhFRF9IRUFERVJfSEVJR0hUICsgVE9QX1BBRERJTkcpKSB7XG4gICAgICAgICAgICB3aW5kb3cuc2Nyb2xsQnkoMCwgLShGSVhFRF9IRUFERVJfSEVJR0hUICsgVE9QX1BBRERJTkcpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4gaGFzaFN0YXRlLnN0b3BBdXRvU2Nyb2xsaW5nKCksIDUwKTtcbiAgICB9XG5cbiAgICBoYXNoU3RhdGUuaGFuZGxlZENoYW5nZSgpO1xufTtcblxuaW50ZXJuYWxzLnNlbGVjdE5hdkl0ZW0gPSAobmF2SXRlbSkgPT4ge1xuXG4gICAgY29uc3QgbGFzdE5hdkl0ZW0gPSBuYXZJdGVtLnBhcmVudE5vZGUucXVlcnlTZWxlY3RvcignOnNjb3BlID4gLm5hdmJhci1hY3RpdmUnKTtcblxuICAgIGlmIChsYXN0TmF2SXRlbSkge1xuICAgICAgICBsYXN0TmF2SXRlbS5jbGFzc0xpc3QucmVtb3ZlKCduYXZiYXItYWN0aXZlJyk7XG4gICAgfVxuXG4gICAgbmF2SXRlbS5jbGFzc0xpc3QuYWRkKCduYXZiYXItYWN0aXZlJyk7XG59O1xuXG5pbnRlcm5hbHMuaXRlbSA9IChpbm5lckhUTUwsIGhyZWYsIGluZGVudCkgPT4gKFxuICAgIGA8YSBocmVmPVwiJHtocmVmfVwiIGNsYXNzPVwibmF2LWl0ZW0gaW5kZW50LSR7aW5kZW50fVwiPlxuICAgICAgICAke2lubmVySFRNTH1cbiAgICA8L2E+YFxuKTtcblxuaW50ZXJuYWxzLnJlbmRlciA9IChodG1sKSA9PiB7XG5cbiAgICBjb25zdCB3cmFwcGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgd3JhcHBlci5pbm5lckhUTUwgPSBodG1sO1xuXG4gICAgcmV0dXJuIHdyYXBwZXIuZmlyc3RDaGlsZDtcbn07XG4iLCIndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgZG9jdW1lbnQsIHdpbmRvdywgWE1MSHR0cFJlcXVlc3QgKi9cblxuY29uc3QgRG9jc05hdiA9IHJlcXVpcmUoJy4vZG9jcy1uYXYnKTtcblxuRG9jc05hdi5pbml0KFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5kb2NzLWRldGFpbCAud3JhcHBlcicpLFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5kb2NzLWRldGFpbCAubmF2LXRhcmdldCcpXG4pO1xuXG5jb25zdCBzZXRBY3RpdmVOYXZJdGVtcyA9ICgpID0+IHtcblxuICAgIGNvbnN0IGxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCduYXZfX2l0ZW0nKTtcbiAgICBjb25zdCBjdXJyZW50UGFnZSA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5zcGxpdCgnLycpWzFdO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBsaXN0W2ldO1xuICAgICAgICBpZiAoaXRlbS5wYXRobmFtZS5zcGxpdCgnLycpWzFdID09PSBjdXJyZW50UGFnZSkge1xuICAgICAgICAgICAgaXRlbS5jbGFzc0xpc3QuYWRkKCduYXZfX2l0ZW0tLWFjdGl2ZScpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuY29uc3QgbmV3c2xldHRlclN1Ym1pdCA9ICgpID0+IHtcblxuICAgIGNvbnN0IGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV3c2xldHRlckZvcm0nKTtcblxuICAgIGlmICghZm9ybSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9ybS5vbnN1Ym1pdCA9IChlKSA9PiB7XG5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGNvbnN0IGVtYWlsSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV3c2xldHRlckVtYWlsJyk7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV3c2xldHRlck1lc3NhZ2UnKTtcblxuICAgICAgICBpZiAoZW1haWxJbnB1dC52YWxpZGl0eS52YWxpZCkge1xuICAgICAgICAgICAgY29uc3QgcGF5bG9hZCA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICBlbWFpbDogZW1haWxJbnB1dC52YWx1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIHhoci5vcGVuKCdQT1NUJywgJy9tYWlsY2hpbXAnKTtcbiAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgeGhyLm9ubG9hZCA9ICgpID0+IHtcblxuICAgICAgICAgICAgICAgIGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSAnWW91ciBlbWFpbCBhZGRyZXNzOiAnICsgZW1haWxJbnB1dC52YWx1ZSArICcsIGlzIG5vdyBzaWduZWQgdXAuIFRoYW5rcyBwYWwhJztcbiAgICAgICAgICAgICAgICAgICAgZW1haWxJbnB1dC52YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGZvcm0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoeGhyLnN0YXR1cyA9PT0gNDAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gJ1RoZSBlbWFpbCBhZGRyZXNzOiAnICsgZW1haWxJbnB1dC52YWx1ZSArICcgaXMgZWl0aGVyIGludmFsaWQsIG9yIG1heSBhbHJlYWR5IGJlIHN1YnNjcmliZWQuJztcbiAgICAgICAgICAgICAgICAgICAgZW1haWxJbnB1dC52YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGVtYWlsSW5wdXQuY2xhc3NMaXN0LmFkZCgnbmV3c2xldHRlcl9faW5wdXQtLWludmFsaWQnKTtcbiAgICAgICAgICAgICAgICAgICAgZm9ybS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gJ1RoZSBlbWFpbCBhZGRyZXNzOiAnICsgZW1haWxJbnB1dC52YWx1ZSArICcgbWF5IGJlIGludmFsaWQsIG9yIHlvdXIgbmV0d29yayBjb25uZWN0aW9uIGlzIGluYWN0aXZlJztcbiAgICAgICAgICAgICAgICAgICAgZW1haWxJbnB1dC52YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGVtYWlsSW5wdXQuY2xhc3NMaXN0LmFkZCgnbmV3c2xldHRlcl9faW5wdXQtLWludmFsaWQnKTtcbiAgICAgICAgICAgICAgICAgICAgZm9ybS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgeGhyLnNlbmQocGF5bG9hZCk7XG4gICAgICAgIH1cbiAgICB9O1xufTtcblxuY29uc3QgZG9jc05hdk1vYmlsZUFjdGlvbnMgPSAoKSA9PiB7XG5cbiAgICBjb25zdCBtZW51QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm5hdi1pdGVtX19sZWZ0Jyk7XG4gICAgY29uc3QgdG9wQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm5hdi1pdGVtX19yaWdodCcpO1xuICAgIGNvbnN0IGRvY3NOYXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZG9jcy1uYXYnKTtcblxuICAgIGNvbnN0IGRvY3NOYXZJc09wZW4gPSAoKSA9PiBkb2NzTmF2LmNsYXNzTGlzdC5jb250YWlucygnZG9jcy1uYXYtLW9wZW4nKTtcbiAgICBjb25zdCB0b2dnbGVEb2NzTmF2ID0gKCkgPT4ge1xuXG4gICAgICAgIGlmIChkb2NzTmF2SXNPcGVuKCkpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnYm9keS0tbm9zY3JvbGwnKTtcbiAgICAgICAgICAgIGRvY3NOYXYuY2xhc3NMaXN0LnJlbW92ZSgnZG9jcy1uYXYtLW9wZW4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnYm9keS0tbm9zY3JvbGwnKTtcbiAgICAgICAgZG9jc05hdi5jbGFzc0xpc3QuYWRkKCdkb2NzLW5hdi0tb3BlbicpO1xuICAgIH07XG5cbiAgICBtZW51QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdG9nZ2xlRG9jc05hdik7XG4gICAgdG9wQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuXG4gICAgICAgIGlmIChkb2NzTmF2SXNPcGVuKCkpIHtcbiAgICAgICAgICAgIHRvZ2dsZURvY3NOYXYoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB3aW5kb3cuc2Nyb2xsVG8oMCwwKTtcbiAgICB9KTtcbn07XG5cbnNldEFjdGl2ZU5hdkl0ZW1zKCk7XG5uZXdzbGV0dGVyU3VibWl0KCk7XG5kb2NzTmF2TW9iaWxlQWN0aW9ucygpO1xuIiwiLypcbiAqIFRoZSBNSVQgTGljZW5zZSAoTUlUKVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNyBNYXJrIFMuIEV2ZXJpdHRcbiAqIENvcHlyaWdodCAoYykgMjAxOCBEZXZpbiBJdnkgW21vZGlmaWVkIGZyb20gaHR0cHM6Ly9naXRodWIuY29tL3F1Ynl0ZS9uYXZiYXJdXG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqL1xuXG52YXIgc2VsZWN0ZWRDbGFzcyA9ICduYXZiYXItYWN0aXZlJztcbnZhciBzdXBwb3J0c1Bhc3NpdmUgPSBmYWxzZTtcblxudHJ5IHtcbiAgdmFyIG9wdHMgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdwYXNzaXZlJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgc3VwcG9ydHNQYXNzaXZlID0gdHJ1ZTtcbiAgICB9XG4gIH0pO1xuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0ZXN0JywgbnVsbCwgb3B0cyk7XG59IGNhdGNoIChlKSB7fVxuXG4vLyBJdCdkIGJlIG5pY2VyIHRvIHVzZSB0aGUgY2xhc3NMaXN0IEFQSSwgYnV0IEkgcHJlZmVyIHRvIHN1cHBvcnQgbW9yZSBicm93c2Vycy4gUmVtb3ZlIGEgY2xhc3Ncbi8vIGlmIGl0J3MgZm91bmQgb24gdGhlIGVsZW1lbnQuXG5mdW5jdGlvbiByZW1vdmVDbGFzc0lmTmVlZGVkKGVsKSB7XG4gIC8vIElmIHRoZSBlbGVtZW50IGhhcyBubyBjbGFzc2VzIHRoZW4gd2UgY2FuIHRha2UgYSBzaG9ydGN1dC5cbiAgaWYgKCFlbC5jbGFzc05hbWUpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgc3BsaXRDbGFzc05hbWUgPSBlbC5jbGFzc05hbWUuc3BsaXQoJyAnKTtcbiAgdmFyIHJlcGxhY2VtZW50Q2xhc3NOYW1lID0gJyc7XG5cbiAgLy8gQXNzZW1ibGUgYSBzdHJpbmcgb2Ygb3RoZXIgY2xhc3MgbmFtZXMuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBzcGxpdENsYXNzTmFtZS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIHZhciBjbGFzc05hbWUgPSBzcGxpdENsYXNzTmFtZVtpXTtcblxuICAgIGlmIChjbGFzc05hbWUgIT09IHNlbGVjdGVkQ2xhc3MpIHtcbiAgICAgIHJlcGxhY2VtZW50Q2xhc3NOYW1lICs9IHJlcGxhY2VtZW50Q2xhc3NOYW1lID09PSAnJyA/IGNsYXNzTmFtZSA6ICcgJyArIGNsYXNzTmFtZTtcbiAgICB9XG4gIH1cblxuICAvLyBJZiB0aGUgbGVuZ3RoIG9mIHRoZSBjbGFzc05hbWUgZGlmZmVycywgdGhlbiBpdCBoYWQgYW4gc2VsZWN0ZWQgY2xhc3MgaW4gYW5kIG5lZWRzIHRvIGJlXG4gIC8vIHVwZGF0ZWQuXG4gIGlmIChyZXBsYWNlbWVudENsYXNzTmFtZS5sZW5ndGggIT09IGVsLmNsYXNzTmFtZS5sZW5ndGgpIHtcbiAgICBlbC5jbGFzc05hbWUgPSByZXBsYWNlbWVudENsYXNzTmFtZTtcbiAgfVxufVxuXG4vLyBBZGQgYSBjbGFzcyB0byBhbiBlbGVtZW50IGlmIGl0IGlzIG5vdCBmb3VuZC5cbmZ1bmN0aW9uIGFkZENsYXNzSWZOZWVkZWQoZWwpIHtcbiAgLy8gSWYgdGhlIGVsZW1lbnQgaGFzIG5vIGNsYXNzZXMgdGhlbiB3ZSBjYW4gdGFrZSBhIHNob3J0Y3V0LlxuICBpZiAoIWVsLmNsYXNzTmFtZSkge1xuICAgIGVsLmNsYXNzTmFtZSA9IHNlbGVjdGVkQ2xhc3M7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIHNwbGl0Q2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lLnNwbGl0KCcgJyk7XG5cbiAgLy8gSWYgYW55IG9mIHRoZSBjbGFzcyBuYW1lcyBtYXRjaCB0aGUgc2VsZWN0ZWQgY2xhc3MgdGhlbiByZXR1cm4uXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBzcGxpdENsYXNzTmFtZS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChzcGxpdENsYXNzTmFtZVtpXSA9PT0gc2VsZWN0ZWRDbGFzcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIC8vIElmIHdlIGdvdCBoZXJlIHRoZW4gdGhlIHNlbGVjdGVkIGNsYXNzIG5lZWRzIHRvIGJlIGFkZGVkIHRvIGFuIGV4aXN0aW5nIGNsYXNzTmFtZS5cbiAgZWwuY2xhc3NOYW1lICs9ICcgJyArIHNlbGVjdGVkQ2xhc3M7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUFuZEFwcGVuZExpc3RJdGVtcyhuYXZMaXN0LCBlbGVtZW50TGlzdCwgbWFrZU5hdkxpc3RJdGVtKSB7XG4gIHZhciBwYWlycyA9IFtdO1xuICB2YXIgZWxlbWVudDtcbiAgdmFyIGxpO1xuXG4gIC8vIENyZWF0ZSBsaXN0IGVsZW1lbnRzXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBlbGVtZW50TGlzdC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGVsZW1lbnQgPSBlbGVtZW50TGlzdFtpXTtcbiAgICBsaSA9IG1ha2VOYXZMaXN0SXRlbShlbGVtZW50KTtcblxuICAgIG5hdkxpc3QuYXBwZW5kQ2hpbGQobGkpO1xuXG4gICAgcGFpcnMucHVzaCh7IGVsZW1lbnQ6IGVsZW1lbnQsIG5hdkVsZW1lbnQ6IGxpIH0pO1xuICB9XG5cbiAgcmV0dXJuIHBhaXJzO1xufVxuXG5mdW5jdGlvbiBtYWtlSGFuZGxlU2Nyb2xsKHBhaXJzLCBvblNjcm9sbEhvb2ssIGRlYm91bmNlVGltZSkge1xuICBmdW5jdGlvbiBoYW5kbGVTY3JvbGwoKSB7XG4gICAgdmFyIGZyb250UnVubmVySW5kZXg7XG4gICAgdmFyIGNsb3Nlc3REaXN0ID0gSW5maW5pdHk7XG4gICAgdmFyIHBhaXI7XG4gICAgdmFyIGFic0Rpc3Q7XG5cbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGFpcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHBhaXIgPSBwYWlyc1tpXTtcbiAgICAgIGFic0Rpc3QgPSBNYXRoLmFicyhwYWlyLmVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wKTtcblxuICAgICAgLy8gSWYgdGhpcyBlbGVtZW50IGlzIG5vdCB0aGUgZnJvbnQgcnVubmVyIGZvciB0b3AsIGRlYWN0aXZhdGUgaXQuXG4gICAgICBpZiAoYWJzRGlzdCA+IGNsb3Nlc3REaXN0KSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBmcm9udFJ1bm5lckluZGV4ID0gaTtcbiAgICAgIGNsb3Nlc3REaXN0ID0gYWJzRGlzdDtcbiAgICB9XG5cbiAgICBpZiAob25TY3JvbGxIb29rKSB7XG4gICAgICAgIG9uU2Nyb2xsSG9vayhwYWlyc1tmcm9udFJ1bm5lckluZGV4XS5uYXZFbGVtZW50KTtcbiAgICB9XG4gIH1cblxuICAvLyBUaGUgZGVmYXVsdCBiZWhhdmlvdXIgaXMgbm8gZGVib3VuY2UuXG4gIGlmICh0eXBlb2YgZGVib3VuY2VUaW1lICE9PSAnbnVtYmVyJyB8fCBpc05hTihkZWJvdW5jZVRpbWUpKSB7XG4gICAgcmV0dXJuIGhhbmRsZVNjcm9sbDtcbiAgfVxuXG4gIHZhciB0aW1lb3V0O1xuXG4gIGZ1bmN0aW9uIG51bGxpZnlUaW1lb3V0KCkge1xuICAgIHRpbWVvdXQgPSBudWxsO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGRlYm91bmNlZEhhbmRsZVNjcm9sbCgpIHtcbiAgICBpZiAodGltZW91dCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEltbWVkaWF0ZWx5IHVzZSBoYW5kbGVTY3JvbGwgdG8gY2FsY3VsYXRlLlxuICAgIGhhbmRsZVNjcm9sbCgpO1xuXG4gICAgLy8gTm8gZnVydGhlciBjYWxscyB0byBoYW5kbGVTY3JvbGwgdW50aWwgZGVib3VuY2VUaW1lIGhhcyBlbGFwc2VkLlxuICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KG51bGxpZnlUaW1lb3V0LCBkZWJvdW5jZVRpbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhZGRTY3JvbGxMaXN0ZW5lcih0YXJnZXQsIGhhbmRsZVNjcm9sbCkge1xuICBmdW5jdGlvbiBzY3JvbGxIYW5kbGVXcmFwcGVyKGV2dCkge1xuICAgIGlmIChldnQudGFyZ2V0ID09PSB0YXJnZXQpIHtcbiAgICAgIGhhbmRsZVNjcm9sbCgpO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBzY3JvbGxIYW5kbGVXcmFwcGVyLCBzdXBwb3J0c1Bhc3NpdmUgPyB7IHBhc3NpdmU6IHRydWUgfSA6IGZhbHNlKTtcbiAgfSBlbHNlIGlmICh0YXJnZXQuYXR0YWNoRXZlbnQpIHtcbiAgICB0YXJnZXQuYXR0YWNoRXZlbnQoJ29uc2Nyb2xsJywgc2Nyb2xsSGFuZGxlV3JhcHBlcik7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBhZGRFdmVudExpc3RlbmVyIG9yIGF0dGFjaEV2ZW50LicpO1xuICB9XG5cbiAgLy8gVG8gY2FsY3VsYXRlIHRoZSBpbml0aWFsIGFjdGl2ZSBsaXN0IGVsZW1lbnQuXG4gIGhhbmRsZVNjcm9sbCgpO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIG1ha2VOYXYob3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMuZWxlbWVudExpc3QgfHwgIW9wdGlvbnMubWFrZU5hdkxpc3RJdGVtKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdPcHRpb25zIG9iamVjdCB3aXRoIGVsZW1lbnRMaXN0IGFuZCBtYWtlTmF2TGlzdEl0ZW0gbXVzdCBiZSBwcm92aWRlZC4nKTtcbiAgfVxuXG4gIHZhciBuYXZiYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG9wdGlvbnMudGFnTmFtZSB8fCAnbmF2Jyk7XG4gIHZhciBuYXZMaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcblxuICAvLyBUaGUgdGFyZ2V0IGRlZmF1bHRzIHRvIHdpbmRvdy5cbiAgdmFyIHRhcmdldCA9IG9wdGlvbnMudGFyZ2V0IHx8IGRvY3VtZW50O1xuXG4gIC8vIENyZWF0ZSBsaXN0IGVsZW1lbnRzXG4gIHZhciBwYWlycyA9IGNyZWF0ZUFuZEFwcGVuZExpc3RJdGVtcyhuYXZMaXN0LCBvcHRpb25zLmVsZW1lbnRMaXN0LCBvcHRpb25zLm1ha2VOYXZMaXN0SXRlbSk7XG5cbiAgLy8gV2hlbmV2ZXIgdGhlIHdpbmRvdyBpcyBzY3JvbGxlZCwgcmVjYWxjdWxhdGUgdGhlIGFjdGl2ZSBsaXN0IGVsZW1lbnQuIENvbXBhdGlibGUgd2l0aCBvbGRlclxuICAvLyB2ZXJzaW9ucyBvZiBJRS5cbiAgYWRkU2Nyb2xsTGlzdGVuZXIodGFyZ2V0LCBtYWtlSGFuZGxlU2Nyb2xsKHBhaXJzLCBvcHRpb25zLm9uU2Nyb2xsLCBvcHRpb25zLmRlYm91bmNlVGltZSkpO1xuXG4gIG5hdmJhci5hcHBlbmRDaGlsZChuYXZMaXN0KTtcblxuICByZXR1cm4gbmF2YmFyO1xufVxuIiwiKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcblx0dHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCkgOlxuXHR0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZmFjdG9yeSkgOlxuXHQoZ2xvYmFsLnNjcm9sbEludG9WaWV3SWZOZWVkZWQgPSBmYWN0b3J5KCkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbi8qKlxuICogaHR0cHM6Ly9naXRodWIuY29tL2dyZS9iZXppZXItZWFzaW5nXG4gKiBCZXppZXJFYXNpbmcgLSB1c2UgYmV6aWVyIGN1cnZlIGZvciB0cmFuc2l0aW9uIGVhc2luZyBmdW5jdGlvblxuICogYnkgR2HDq3RhbiBSZW5hdWRlYXUgMjAxNCAtIDIwMTUg4oCTIE1JVCBMaWNlbnNlXG4gKi9cblxuLy8gVGhlc2UgdmFsdWVzIGFyZSBlc3RhYmxpc2hlZCBieSBlbXBpcmljaXNtIHdpdGggdGVzdHMgKHRyYWRlb2ZmOiBwZXJmb3JtYW5jZSBWUyBwcmVjaXNpb24pXG52YXIgTkVXVE9OX0lURVJBVElPTlMgPSA0O1xudmFyIE5FV1RPTl9NSU5fU0xPUEUgPSAwLjAwMTtcbnZhciBTVUJESVZJU0lPTl9QUkVDSVNJT04gPSAwLjAwMDAwMDE7XG52YXIgU1VCRElWSVNJT05fTUFYX0lURVJBVElPTlMgPSAxMDtcblxudmFyIGtTcGxpbmVUYWJsZVNpemUgPSAxMTtcbnZhciBrU2FtcGxlU3RlcFNpemUgPSAxLjAgLyAoa1NwbGluZVRhYmxlU2l6ZSAtIDEuMCk7XG5cbnZhciBmbG9hdDMyQXJyYXlTdXBwb3J0ZWQgPSB0eXBlb2YgRmxvYXQzMkFycmF5ID09PSAnZnVuY3Rpb24nO1xuXG5mdW5jdGlvbiBBIChhQTEsIGFBMikgeyByZXR1cm4gMS4wIC0gMy4wICogYUEyICsgMy4wICogYUExOyB9XG5mdW5jdGlvbiBCIChhQTEsIGFBMikgeyByZXR1cm4gMy4wICogYUEyIC0gNi4wICogYUExOyB9XG5mdW5jdGlvbiBDIChhQTEpICAgICAgeyByZXR1cm4gMy4wICogYUExOyB9XG5cbi8vIFJldHVybnMgeCh0KSBnaXZlbiB0LCB4MSwgYW5kIHgyLCBvciB5KHQpIGdpdmVuIHQsIHkxLCBhbmQgeTIuXG5mdW5jdGlvbiBjYWxjQmV6aWVyIChhVCwgYUExLCBhQTIpIHsgcmV0dXJuICgoQShhQTEsIGFBMikgKiBhVCArIEIoYUExLCBhQTIpKSAqIGFUICsgQyhhQTEpKSAqIGFUOyB9XG5cbi8vIFJldHVybnMgZHgvZHQgZ2l2ZW4gdCwgeDEsIGFuZCB4Miwgb3IgZHkvZHQgZ2l2ZW4gdCwgeTEsIGFuZCB5Mi5cbmZ1bmN0aW9uIGdldFNsb3BlIChhVCwgYUExLCBhQTIpIHsgcmV0dXJuIDMuMCAqIEEoYUExLCBhQTIpICogYVQgKiBhVCArIDIuMCAqIEIoYUExLCBhQTIpICogYVQgKyBDKGFBMSk7IH1cblxuZnVuY3Rpb24gYmluYXJ5U3ViZGl2aWRlIChhWCwgYUEsIGFCLCBtWDEsIG1YMikge1xuICB2YXIgY3VycmVudFgsIGN1cnJlbnRULCBpID0gMDtcbiAgZG8ge1xuICAgIGN1cnJlbnRUID0gYUEgKyAoYUIgLSBhQSkgLyAyLjA7XG4gICAgY3VycmVudFggPSBjYWxjQmV6aWVyKGN1cnJlbnRULCBtWDEsIG1YMikgLSBhWDtcbiAgICBpZiAoY3VycmVudFggPiAwLjApIHtcbiAgICAgIGFCID0gY3VycmVudFQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIGFBID0gY3VycmVudFQ7XG4gICAgfVxuICB9IHdoaWxlIChNYXRoLmFicyhjdXJyZW50WCkgPiBTVUJESVZJU0lPTl9QUkVDSVNJT04gJiYgKytpIDwgU1VCRElWSVNJT05fTUFYX0lURVJBVElPTlMpO1xuICByZXR1cm4gY3VycmVudFQ7XG59XG5cbmZ1bmN0aW9uIG5ld3RvblJhcGhzb25JdGVyYXRlIChhWCwgYUd1ZXNzVCwgbVgxLCBtWDIpIHtcbiBmb3IgKHZhciBpID0gMDsgaSA8IE5FV1RPTl9JVEVSQVRJT05TOyArK2kpIHtcbiAgIHZhciBjdXJyZW50U2xvcGUgPSBnZXRTbG9wZShhR3Vlc3NULCBtWDEsIG1YMik7XG4gICBpZiAoY3VycmVudFNsb3BlID09PSAwLjApIHtcbiAgICAgcmV0dXJuIGFHdWVzc1Q7XG4gICB9XG4gICB2YXIgY3VycmVudFggPSBjYWxjQmV6aWVyKGFHdWVzc1QsIG1YMSwgbVgyKSAtIGFYO1xuICAgYUd1ZXNzVCAtPSBjdXJyZW50WCAvIGN1cnJlbnRTbG9wZTtcbiB9XG4gcmV0dXJuIGFHdWVzc1Q7XG59XG5cbnZhciBzcmMgPSBmdW5jdGlvbiBiZXppZXIgKG1YMSwgbVkxLCBtWDIsIG1ZMikge1xuICBpZiAoISgwIDw9IG1YMSAmJiBtWDEgPD0gMSAmJiAwIDw9IG1YMiAmJiBtWDIgPD0gMSkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ2JlemllciB4IHZhbHVlcyBtdXN0IGJlIGluIFswLCAxXSByYW5nZScpO1xuICB9XG5cbiAgLy8gUHJlY29tcHV0ZSBzYW1wbGVzIHRhYmxlXG4gIHZhciBzYW1wbGVWYWx1ZXMgPSBmbG9hdDMyQXJyYXlTdXBwb3J0ZWQgPyBuZXcgRmxvYXQzMkFycmF5KGtTcGxpbmVUYWJsZVNpemUpIDogbmV3IEFycmF5KGtTcGxpbmVUYWJsZVNpemUpO1xuICBpZiAobVgxICE9PSBtWTEgfHwgbVgyICE9PSBtWTIpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGtTcGxpbmVUYWJsZVNpemU7ICsraSkge1xuICAgICAgc2FtcGxlVmFsdWVzW2ldID0gY2FsY0JlemllcihpICoga1NhbXBsZVN0ZXBTaXplLCBtWDEsIG1YMik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0VEZvclggKGFYKSB7XG4gICAgdmFyIGludGVydmFsU3RhcnQgPSAwLjA7XG4gICAgdmFyIGN1cnJlbnRTYW1wbGUgPSAxO1xuICAgIHZhciBsYXN0U2FtcGxlID0ga1NwbGluZVRhYmxlU2l6ZSAtIDE7XG5cbiAgICBmb3IgKDsgY3VycmVudFNhbXBsZSAhPT0gbGFzdFNhbXBsZSAmJiBzYW1wbGVWYWx1ZXNbY3VycmVudFNhbXBsZV0gPD0gYVg7ICsrY3VycmVudFNhbXBsZSkge1xuICAgICAgaW50ZXJ2YWxTdGFydCArPSBrU2FtcGxlU3RlcFNpemU7XG4gICAgfVxuICAgIC0tY3VycmVudFNhbXBsZTtcblxuICAgIC8vIEludGVycG9sYXRlIHRvIHByb3ZpZGUgYW4gaW5pdGlhbCBndWVzcyBmb3IgdFxuICAgIHZhciBkaXN0ID0gKGFYIC0gc2FtcGxlVmFsdWVzW2N1cnJlbnRTYW1wbGVdKSAvIChzYW1wbGVWYWx1ZXNbY3VycmVudFNhbXBsZSArIDFdIC0gc2FtcGxlVmFsdWVzW2N1cnJlbnRTYW1wbGVdKTtcbiAgICB2YXIgZ3Vlc3NGb3JUID0gaW50ZXJ2YWxTdGFydCArIGRpc3QgKiBrU2FtcGxlU3RlcFNpemU7XG5cbiAgICB2YXIgaW5pdGlhbFNsb3BlID0gZ2V0U2xvcGUoZ3Vlc3NGb3JULCBtWDEsIG1YMik7XG4gICAgaWYgKGluaXRpYWxTbG9wZSA+PSBORVdUT05fTUlOX1NMT1BFKSB7XG4gICAgICByZXR1cm4gbmV3dG9uUmFwaHNvbkl0ZXJhdGUoYVgsIGd1ZXNzRm9yVCwgbVgxLCBtWDIpO1xuICAgIH0gZWxzZSBpZiAoaW5pdGlhbFNsb3BlID09PSAwLjApIHtcbiAgICAgIHJldHVybiBndWVzc0ZvclQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBiaW5hcnlTdWJkaXZpZGUoYVgsIGludGVydmFsU3RhcnQsIGludGVydmFsU3RhcnQgKyBrU2FtcGxlU3RlcFNpemUsIG1YMSwgbVgyKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gQmV6aWVyRWFzaW5nICh4KSB7XG4gICAgaWYgKG1YMSA9PT0gbVkxICYmIG1YMiA9PT0gbVkyKSB7XG4gICAgICByZXR1cm4geDsgLy8gbGluZWFyXG4gICAgfVxuICAgIC8vIEJlY2F1c2UgSmF2YVNjcmlwdCBudW1iZXIgYXJlIGltcHJlY2lzZSwgd2Ugc2hvdWxkIGd1YXJhbnRlZSB0aGUgZXh0cmVtZXMgYXJlIHJpZ2h0LlxuICAgIGlmICh4ID09PSAwKSB7XG4gICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgaWYgKHggPT09IDEpIHtcbiAgICAgIHJldHVybiAxO1xuICAgIH1cbiAgICByZXR1cm4gY2FsY0JlemllcihnZXRURm9yWCh4KSwgbVkxLCBtWTIpO1xuICB9O1xufTtcblxuLy8gUHJlZGVmaW5lZCBzZXQgb2YgYW5pbWF0aW9ucy4gU2ltaWxhciB0byBDU1MgZWFzaW5nIGZ1bmN0aW9uc1xudmFyIGFuaW1hdGlvbnMgPSB7XG4gIGVhc2U6ICBzcmMoMC4yNSwgMC4xLCAwLjI1LCAxKSxcbiAgZWFzZUluOiBzcmMoMC40MiwgMCwgMSwgMSksXG4gIGVhc2VPdXQ6IHNyYygwLCAwLCAwLjU4LCAxKSxcbiAgZWFzZUluT3V0OiBzcmMoMC40MiwgMCwgMC41OCwgMSksXG4gIGxpbmVhcjogc3JjKDAsIDAsIDEsIDEpXG59O1xuXG5cbnZhciBhbWF0b3IgPSBhbmltYXRlO1xuXG5mdW5jdGlvbiBhbmltYXRlKHNvdXJjZSwgdGFyZ2V0LCBvcHRpb25zKSB7XG4gIHZhciBzdGFydD0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiAgdmFyIGRpZmYgPSBPYmplY3QuY3JlYXRlKG51bGwpO1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgLy8gV2UgbGV0IGNsaWVudHMgc3BlY2lmeSB0aGVpciBvd24gZWFzaW5nIGZ1bmN0aW9uXG4gIHZhciBlYXNpbmcgPSAodHlwZW9mIG9wdGlvbnMuZWFzaW5nID09PSAnZnVuY3Rpb24nKSA/IG9wdGlvbnMuZWFzaW5nIDogYW5pbWF0aW9uc1tvcHRpb25zLmVhc2luZ107XG5cbiAgLy8gaWYgbm90aGluZyBpcyBzcGVjaWZpZWQsIGRlZmF1bHQgdG8gZWFzZSAoc2ltaWxhciB0byBDU1MgYW5pbWF0aW9ucylcbiAgaWYgKCFlYXNpbmcpIHtcbiAgICBpZiAob3B0aW9ucy5lYXNpbmcpIHtcbiAgICAgIGNvbnNvbGUud2FybignVW5rbm93biBlYXNpbmcgZnVuY3Rpb24gaW4gYW1hdG9yOiAnICsgb3B0aW9ucy5lYXNpbmcpO1xuICAgIH1cbiAgICBlYXNpbmcgPSBhbmltYXRpb25zLmVhc2U7XG4gIH1cblxuICB2YXIgc3RlcCA9IHR5cGVvZiBvcHRpb25zLnN0ZXAgPT09ICdmdW5jdGlvbicgPyBvcHRpb25zLnN0ZXAgOiBub29wO1xuICB2YXIgZG9uZSA9IHR5cGVvZiBvcHRpb25zLmRvbmUgPT09ICdmdW5jdGlvbicgPyBvcHRpb25zLmRvbmUgOiBub29wO1xuXG4gIHZhciBzY2hlZHVsZXIgPSBnZXRTY2hlZHVsZXIob3B0aW9ucy5zY2hlZHVsZXIpO1xuXG4gIHZhciBrZXlzID0gT2JqZWN0LmtleXModGFyZ2V0KTtcbiAga2V5cy5mb3JFYWNoKGZ1bmN0aW9uKGtleSkge1xuICAgIHN0YXJ0W2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICBkaWZmW2tleV0gPSB0YXJnZXRba2V5XSAtIHNvdXJjZVtrZXldO1xuICB9KTtcblxuICB2YXIgZHVyYXRpb25Jbk1zID0gb3B0aW9ucy5kdXJhdGlvbiB8fCA0MDA7XG4gIHZhciBkdXJhdGlvbkluRnJhbWVzID0gTWF0aC5tYXgoMSwgZHVyYXRpb25Jbk1zICogMC4wNik7IC8vIDAuMDYgYmVjYXVzZSA2MCBmcmFtZXMgcGVycyAxLDAwMCBtc1xuICB2YXIgcHJldmlvdXNBbmltYXRpb25JZDtcbiAgdmFyIGZyYW1lID0gMDtcblxuICBwcmV2aW91c0FuaW1hdGlvbklkID0gc2NoZWR1bGVyLm5leHQobG9vcCk7XG5cbiAgcmV0dXJuIHtcbiAgICBjYW5jZWw6IGNhbmNlbFxuICB9XG5cbiAgZnVuY3Rpb24gY2FuY2VsKCkge1xuICAgIHNjaGVkdWxlci5jYW5jZWwocHJldmlvdXNBbmltYXRpb25JZCk7XG4gICAgcHJldmlvdXNBbmltYXRpb25JZCA9IDA7XG4gIH1cblxuICBmdW5jdGlvbiBsb29wKCkge1xuICAgIHZhciB0ID0gZWFzaW5nKGZyYW1lL2R1cmF0aW9uSW5GcmFtZXMpO1xuICAgIGZyYW1lICs9IDE7XG4gICAgc2V0VmFsdWVzKHQpO1xuICAgIGlmIChmcmFtZSA8PSBkdXJhdGlvbkluRnJhbWVzKSB7XG4gICAgICBwcmV2aW91c0FuaW1hdGlvbklkID0gc2NoZWR1bGVyLm5leHQobG9vcCk7XG4gICAgICBzdGVwKHNvdXJjZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHByZXZpb3VzQW5pbWF0aW9uSWQgPSAwO1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHsgZG9uZShzb3VyY2UpOyB9LCAwKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBzZXRWYWx1ZXModCkge1xuICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcbiAgICAgIHNvdXJjZVtrZXldID0gZGlmZltrZXldICogdCArIHN0YXJ0W2tleV07XG4gICAgfSk7XG4gIH1cbn1cblxuZnVuY3Rpb24gbm9vcCgpIHsgfVxuXG5mdW5jdGlvbiBnZXRTY2hlZHVsZXIoc2NoZWR1bGVyKSB7XG4gIGlmICghc2NoZWR1bGVyKSB7XG4gICAgdmFyIGNhblJhZiA9IHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWU7XG4gICAgcmV0dXJuIGNhblJhZiA/IHJhZlNjaGVkdWxlcigpIDogdGltZW91dFNjaGVkdWxlcigpXG4gIH1cbiAgaWYgKHR5cGVvZiBzY2hlZHVsZXIubmV4dCAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IEVycm9yKCdTY2hlZHVsZXIgaXMgc3VwcG9zZWQgdG8gaGF2ZSBuZXh0KGNiKSBmdW5jdGlvbicpXG4gIGlmICh0eXBlb2Ygc2NoZWR1bGVyLmNhbmNlbCAhPT0gJ2Z1bmN0aW9uJykgdGhyb3cgbmV3IEVycm9yKCdTY2hlZHVsZXIgaXMgc3VwcG9zZWQgdG8gaGF2ZSBjYW5jZWwoaGFuZGxlKSBmdW5jdGlvbicpXG5cbiAgcmV0dXJuIHNjaGVkdWxlclxufVxuXG5mdW5jdGlvbiByYWZTY2hlZHVsZXIoKSB7XG4gIHJldHVybiB7XG4gICAgbmV4dDogd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZS5iaW5kKHdpbmRvdyksXG4gICAgY2FuY2VsOiB3aW5kb3cuY2FuY2VsQW5pbWF0aW9uRnJhbWUuYmluZCh3aW5kb3cpXG4gIH1cbn1cblxuZnVuY3Rpb24gdGltZW91dFNjaGVkdWxlcigpIHtcbiAgcmV0dXJuIHtcbiAgICBuZXh0OiBmdW5jdGlvbihjYikge1xuICAgICAgcmV0dXJuIHNldFRpbWVvdXQoY2IsIDEwMDAvNjApXG4gICAgfSxcbiAgICBjYW5jZWw6IGZ1bmN0aW9uIChpZCkge1xuICAgICAgcmV0dXJuIGNsZWFyVGltZW91dChpZClcbiAgICB9XG4gIH1cbn1cblxudmFyIF9fYXNzaWduJDEgPSAodW5kZWZpbmVkICYmIHVuZGVmaW5lZC5fX2Fzc2lnbikgfHwgT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbih0KSB7XG4gICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgIHMgPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSlcbiAgICAgICAgICAgIHRbcF0gPSBzW3BdO1xuICAgIH1cbiAgICByZXR1cm4gdDtcbn07XG52YXIgaGFuZGxlU2Nyb2xsJDEgPSBmdW5jdGlvbiAocGFyZW50LCBfYSkge1xuICAgIHZhciBzY3JvbGxMZWZ0ID0gX2Euc2Nyb2xsTGVmdCwgc2Nyb2xsVG9wID0gX2Euc2Nyb2xsVG9wO1xuICAgIHBhcmVudC5zY3JvbGxMZWZ0ID0gc2Nyb2xsTGVmdDtcbiAgICBwYXJlbnQuc2Nyb2xsVG9wID0gc2Nyb2xsVG9wO1xufTtcbmZ1bmN0aW9uIGNhbGN1bGF0ZSh0YXJnZXQsIG9wdGlvbnMpIHtcbiAgICBpZiAoIXRhcmdldCB8fCAhKHRhcmdldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbGVtZW50IGlzIHJlcXVpcmVkIGluIHNjcm9sbEludG9WaWV3SWZOZWVkZWQnKTtcbiAgICB2YXIgY29uZmlnID0gX19hc3NpZ24kMSh7IGhhbmRsZVNjcm9sbDogaGFuZGxlU2Nyb2xsJDEgfSwgb3B0aW9ucyk7XG4gICAgdmFyIGRlZmF1bHRPZmZzZXQgPSB7IHRvcDogMCwgcmlnaHQ6IDAsIGJvdHRvbTogMCwgbGVmdDogMCB9O1xuICAgIGNvbmZpZy5vZmZzZXQgPSBjb25maWcub2Zmc2V0XG4gICAgICAgID8gX19hc3NpZ24kMSh7fSwgZGVmYXVsdE9mZnNldCwgY29uZmlnLm9mZnNldCkgOiBkZWZhdWx0T2Zmc2V0O1xuICAgIGZ1bmN0aW9uIHdpdGhpbkJvdW5kcyh2YWx1ZSwgbWluLCBtYXgsIGV4dGVudCkge1xuICAgICAgICBpZiAoY29uZmlnLmNlbnRlcklmTmVlZGVkID09PSBmYWxzZSB8fFxuICAgICAgICAgICAgKG1heCA8PSB2YWx1ZSArIGV4dGVudCAmJiB2YWx1ZSA8PSBtaW4gKyBleHRlbnQpKSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5taW4obWF4LCBNYXRoLm1heChtaW4sIHZhbHVlKSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gKG1pbiArIG1heCkgLyAyO1xuICAgICAgICB9XG4gICAgfVxuICAgIHZhciBvZmZzZXQgPSBjb25maWcub2Zmc2V0O1xuICAgIHZhciBvZmZzZXRUb3AgPSBvZmZzZXQudG9wO1xuICAgIHZhciBvZmZzZXRMZWZ0ID0gb2Zmc2V0LmxlZnQ7XG4gICAgdmFyIG9mZnNldEJvdHRvbSA9IG9mZnNldC5ib3R0b207XG4gICAgdmFyIG9mZnNldFJpZ2h0ID0gb2Zmc2V0LnJpZ2h0O1xuICAgIGZ1bmN0aW9uIG1ha2VBcmVhKGxlZnQsIHRvcCwgd2lkdGgsIGhlaWdodCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgbGVmdDogbGVmdCArIG9mZnNldExlZnQsXG4gICAgICAgICAgICB0b3A6IHRvcCArIG9mZnNldFRvcCxcbiAgICAgICAgICAgIHdpZHRoOiB3aWR0aCxcbiAgICAgICAgICAgIGhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgICAgcmlnaHQ6IGxlZnQgKyBvZmZzZXRMZWZ0ICsgd2lkdGggKyBvZmZzZXRSaWdodCxcbiAgICAgICAgICAgIGJvdHRvbTogdG9wICsgb2Zmc2V0VG9wICsgaGVpZ2h0ICsgb2Zmc2V0Qm90dG9tLFxuICAgICAgICAgICAgdHJhbnNsYXRlOiBmdW5jdGlvbiAoeCwgeSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtYWtlQXJlYSh4ICsgbGVmdCArIG9mZnNldExlZnQsIHkgKyB0b3AgKyBvZmZzZXRUb3AsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlbGF0aXZlRnJvbVRvOiBmdW5jdGlvbiAobGhzLCByaHMpIHtcbiAgICAgICAgICAgICAgICB2YXIgbmV3TGVmdCA9IGxlZnQgKyBvZmZzZXRMZWZ0LCBuZXdUb3AgPSB0b3AgKyBvZmZzZXRUb3A7XG4gICAgICAgICAgICAgICAgbGhzID0gbGhzLm9mZnNldFBhcmVudDtcbiAgICAgICAgICAgICAgICByaHMgPSByaHMub2Zmc2V0UGFyZW50O1xuICAgICAgICAgICAgICAgIGlmIChsaHMgPT09IHJocykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gYXJlYTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yICg7IGxoczsgbGhzID0gbGhzLm9mZnNldFBhcmVudCkge1xuICAgICAgICAgICAgICAgICAgICBuZXdMZWZ0ICs9IGxocy5vZmZzZXRMZWZ0ICsgbGhzLmNsaWVudExlZnQ7XG4gICAgICAgICAgICAgICAgICAgIG5ld1RvcCArPSBsaHMub2Zmc2V0VG9wICsgbGhzLmNsaWVudFRvcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZm9yICg7IHJoczsgcmhzID0gcmhzLm9mZnNldFBhcmVudCkge1xuICAgICAgICAgICAgICAgICAgICBuZXdMZWZ0IC09IHJocy5vZmZzZXRMZWZ0ICsgcmhzLmNsaWVudExlZnQ7XG4gICAgICAgICAgICAgICAgICAgIG5ld1RvcCAtPSByaHMub2Zmc2V0VG9wICsgcmhzLmNsaWVudFRvcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIG1ha2VBcmVhKG5ld0xlZnQsIG5ld1RvcCwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICB9O1xuICAgIH1cbiAgICB2YXIgcGFyZW50LCBhcmVhID0gbWFrZUFyZWEodGFyZ2V0Lm9mZnNldExlZnQsIHRhcmdldC5vZmZzZXRUb3AsIHRhcmdldC5vZmZzZXRXaWR0aCwgdGFyZ2V0Lm9mZnNldEhlaWdodCk7XG4gICAgd2hpbGUgKChwYXJlbnQgPSB0YXJnZXQucGFyZW50Tm9kZSkgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCAmJlxuICAgICAgICB0YXJnZXQgIT09IGNvbmZpZy5ib3VuZGFyeSkge1xuICAgICAgICB2YXIgY2xpZW50TGVmdCA9IHBhcmVudC5vZmZzZXRMZWZ0ICsgcGFyZW50LmNsaWVudExlZnQ7XG4gICAgICAgIHZhciBjbGllbnRUb3AgPSBwYXJlbnQub2Zmc2V0VG9wICsgcGFyZW50LmNsaWVudFRvcDtcbiAgICAgICAgLy8gTWFrZSBhcmVhIHJlbGF0aXZlIHRvIHBhcmVudCdzIGNsaWVudCBhcmVhLlxuICAgICAgICBhcmVhID0gYXJlYVxuICAgICAgICAgICAgLnJlbGF0aXZlRnJvbVRvKHRhcmdldCwgcGFyZW50KVxuICAgICAgICAgICAgLnRyYW5zbGF0ZSgtY2xpZW50TGVmdCwgLWNsaWVudFRvcCk7XG4gICAgICAgIHZhciBzY3JvbGxMZWZ0ID0gd2l0aGluQm91bmRzKHBhcmVudC5zY3JvbGxMZWZ0LCBhcmVhLnJpZ2h0IC0gcGFyZW50LmNsaWVudFdpZHRoLCBhcmVhLmxlZnQsIHBhcmVudC5jbGllbnRXaWR0aCk7XG4gICAgICAgIHZhciBzY3JvbGxUb3AgPSB3aXRoaW5Cb3VuZHMocGFyZW50LnNjcm9sbFRvcCwgYXJlYS5ib3R0b20gLSBwYXJlbnQuY2xpZW50SGVpZ2h0LCBhcmVhLnRvcCwgcGFyZW50LmNsaWVudEhlaWdodCk7XG4gICAgICAgIC8vIFBhc3MgdGhlIG5ldyBjb29yZGluYXRlcyB0byB0aGUgaGFuZGxlU2Nyb2xsIGNhbGxiYWNrXG4gICAgICAgIGNvbmZpZy5oYW5kbGVTY3JvbGwocGFyZW50LCB7IHNjcm9sbExlZnQ6IHNjcm9sbExlZnQsIHNjcm9sbFRvcDogc2Nyb2xsVG9wIH0sIGNvbmZpZyk7XG4gICAgICAgIC8vIERldGVybWluZSBhY3R1YWwgc2Nyb2xsIGFtb3VudCBieSByZWFkaW5nIGJhY2sgc2Nyb2xsIHByb3BlcnRpZXMuXG4gICAgICAgIGFyZWEgPSBhcmVhLnRyYW5zbGF0ZShjbGllbnRMZWZ0IC0gcGFyZW50LnNjcm9sbExlZnQsIGNsaWVudFRvcCAtIHBhcmVudC5zY3JvbGxUb3ApO1xuICAgICAgICB0YXJnZXQgPSBwYXJlbnQ7XG4gICAgfVxufVxuXG52YXIgX19hc3NpZ24gPSAodW5kZWZpbmVkICYmIHVuZGVmaW5lZC5fX2Fzc2lnbikgfHwgT2JqZWN0LmFzc2lnbiB8fCBmdW5jdGlvbih0KSB7XG4gICAgZm9yICh2YXIgcywgaSA9IDEsIG4gPSBhcmd1bWVudHMubGVuZ3RoOyBpIDwgbjsgaSsrKSB7XG4gICAgICAgIHMgPSBhcmd1bWVudHNbaV07XG4gICAgICAgIGZvciAodmFyIHAgaW4gcykgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChzLCBwKSlcbiAgICAgICAgICAgIHRbcF0gPSBzW3BdO1xuICAgIH1cbiAgICByZXR1cm4gdDtcbn07XG52YXIgaGFuZGxlU2Nyb2xsID0gZnVuY3Rpb24gKHBhcmVudCwgX2EsIGNvbmZpZykge1xuICAgIHZhciBzY3JvbGxMZWZ0ID0gX2Euc2Nyb2xsTGVmdCwgc2Nyb2xsVG9wID0gX2Euc2Nyb2xsVG9wO1xuICAgIGlmIChjb25maWcuZHVyYXRpb24pIHtcbiAgICAgICAgYW1hdG9yKHBhcmVudCwge1xuICAgICAgICAgICAgc2Nyb2xsTGVmdDogc2Nyb2xsTGVmdCxcbiAgICAgICAgICAgIHNjcm9sbFRvcDogc2Nyb2xsVG9wLFxuICAgICAgICB9LCB7IGR1cmF0aW9uOiBjb25maWcuZHVyYXRpb24sIGVhc2luZzogY29uZmlnLmVhc2luZyB9KTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHBhcmVudC5zY3JvbGxMZWZ0ID0gc2Nyb2xsTGVmdDtcbiAgICAgICAgcGFyZW50LnNjcm9sbFRvcCA9IHNjcm9sbFRvcDtcbiAgICB9XG59O1xuZnVuY3Rpb24gaXNCb29sZWFuKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gdHlwZW9mIG9wdGlvbnMgPT09ICdib29sZWFuJztcbn1cbmZ1bmN0aW9uIHNjcm9sbEludG9WaWV3SWZOZWVkZWQodGFyZ2V0LCBvcHRpb25zLCBhbmltYXRlT3B0aW9ucywgZmluYWxFbGVtZW50LCBvZmZzZXRPcHRpb25zKSB7XG4gICAgaWYgKG9mZnNldE9wdGlvbnMgPT09IHZvaWQgMCkgeyBvZmZzZXRPcHRpb25zID0ge307IH1cbiAgICBpZiAoIXRhcmdldCB8fCAhKHRhcmdldCBpbnN0YW5jZW9mIEhUTUxFbGVtZW50KSlcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdFbGVtZW50IGlzIHJlcXVpcmVkIGluIHNjcm9sbEludG9WaWV3SWZOZWVkZWQnKTtcbiAgICB2YXIgY29uZmlnID0geyBjZW50ZXJJZk5lZWRlZDogZmFsc2UsIGhhbmRsZVNjcm9sbDogaGFuZGxlU2Nyb2xsIH07XG4gICAgaWYgKGlzQm9vbGVhbihvcHRpb25zKSkge1xuICAgICAgICBjb25maWcuY2VudGVySWZOZWVkZWQgPSBvcHRpb25zO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29uZmlnID0gX19hc3NpZ24oe30sIGNvbmZpZywgb3B0aW9ucyk7XG4gICAgfVxuICAgIHZhciBkZWZhdWx0T2Zmc2V0ID0geyB0b3A6IDAsIHJpZ2h0OiAwLCBib3R0b206IDAsIGxlZnQ6IDAgfTtcbiAgICBjb25maWcub2Zmc2V0ID0gY29uZmlnLm9mZnNldFxuICAgICAgICA/IF9fYXNzaWduKHt9LCBkZWZhdWx0T2Zmc2V0LCBjb25maWcub2Zmc2V0KSA6IGRlZmF1bHRPZmZzZXQ7XG4gICAgaWYgKGFuaW1hdGVPcHRpb25zKSB7XG4gICAgICAgIGNvbmZpZy5kdXJhdGlvbiA9IGFuaW1hdGVPcHRpb25zLmR1cmF0aW9uO1xuICAgICAgICBjb25maWcuZWFzaW5nID0gYW5pbWF0ZU9wdGlvbnMuZWFzaW5nO1xuICAgIH1cbiAgICBpZiAoZmluYWxFbGVtZW50KSB7XG4gICAgICAgIGNvbmZpZy5ib3VuZGFyeSA9IGZpbmFsRWxlbWVudDtcbiAgICB9XG4gICAgaWYgKG9mZnNldE9wdGlvbnMub2Zmc2V0VG9wKSB7XG4gICAgICAgIGNvbmZpZy5vZmZzZXQudG9wID0gb2Zmc2V0T3B0aW9ucy5vZmZzZXRUb3A7XG4gICAgfVxuICAgIGlmIChvZmZzZXRPcHRpb25zLm9mZnNldFJpZ2h0KSB7XG4gICAgICAgIGNvbmZpZy5vZmZzZXQucmlnaHQgPSBvZmZzZXRPcHRpb25zLm9mZnNldFJpZ2h0O1xuICAgIH1cbiAgICBpZiAob2Zmc2V0T3B0aW9ucy5vZmZzZXRCb3R0b20pIHtcbiAgICAgICAgY29uZmlnLm9mZnNldC5ib3R0b20gPSBvZmZzZXRPcHRpb25zLm9mZnNldEJvdHRvbTtcbiAgICB9XG4gICAgaWYgKG9mZnNldE9wdGlvbnMub2Zmc2V0TGVmdCkge1xuICAgICAgICBjb25maWcub2Zmc2V0LmxlZnQgPSBvZmZzZXRPcHRpb25zLm9mZnNldExlZnQ7XG4gICAgfVxuICAgIHJldHVybiBjYWxjdWxhdGUodGFyZ2V0LCBjb25maWcpO1xufVxuXG5yZXR1cm4gc2Nyb2xsSW50b1ZpZXdJZk5lZWRlZDtcblxufSkpKTtcbiJdfQ==
