(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
/* global document */

var Navbar = require('navbar');

var internals = {};

exports.init = function (contentEl, navEl) {

    if (!contentEl) {
        return;
    }

    if (!navEl) {
        throw new Error('Docs navigation content element exists, but not the nav element.');
    }

    var navbar = Navbar({
        elementList: contentEl.querySelectorAll('h1, h2, h3, h4, h5, h6'),
        makeNavListItem: function makeNavListItem(el) {

            var text = el.textContent.trim();

            var item = internals.render(internals.item(text));

            item.addEventListener('click', function () {
                return el.scrollIntoView({ block: 'start', behavior: 'smooth' });
            });

            return item;
        }
    });

    return navEl.appendChild(navbar);
};

internals.item = function (text) {
    return '<div class="nav-item">' + text + '</div>';
};

internals.render = function (html) {

    var wrapper = document.createElement('div');

    wrapper.innerHTML = html;

    return wrapper.firstChild;
};

},{"navbar":3}],2:[function(require,module,exports){
'use strict';
/* global document, window, XMLHttpRequest */

var DocsNav = require('./docs-nav');

DocsNav.init(document.querySelector('.docs-detail .wrapper'), document.querySelector('.docs-detail .nav'));

var setActiveNavItems = function setActiveNavItems() {

    var list = document.getElementsByClassName('nav__item');
    var currentPage = window.location.href;

    for (var i = 0; i < list.length; ++i) {
        var item = list[i];
        if (item.href === currentPage) {
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

var scrollToElement = function scrollToElement(selector) {

    var top = {
        box: document.querySelector(selector).getBoundingClientRect().top,
        scroll: window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop,
        client: document.documentElement.clientTop || document.body.clientTop || 0
    };
    window.scrollTo(0, Math.round(top.box + top.scroll - top.client));
};

window.onhashchange = function () {

    scrollToElement('a[href="' + window.location.hash + '"]');
};

window.onload = function () {

    if (window.location.hash) {
        scrollToElement('a[href="' + window.location.hash + '"]');
    }
};

setActiveNavItems();
newsletterSubmit();

},{"./docs-nav":1}],3:[function(require,module,exports){
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.navbar = factory());
}(this, (function () { 'use strict';

var selectedClass = 'navbar-active';
var supportsPassive = false;

try {
  var opts = Object.defineProperty({}, 'passive', {
    get: function () {
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

function makeHandleScroll(pairs, debounceTime) {
  function handleScroll() {
    var frontRunner = { navElement: {} };
    var closestDist = Infinity;
    var pair;
    var absDist;

    for (var i = 0, len = pairs.length; i < len; i++) {
      pair = pairs[i];
      absDist = Math.abs(pair.element.getBoundingClientRect().top);

      // If this element is not the front runner for top, deactivate it.
      if (absDist > closestDist) {
        removeClassIfNeeded(pair.navElement);
        continue;
      }

      // If this is a new front runner, deactivate the previous front runner.
      removeClassIfNeeded(frontRunner);

      frontRunner = pair.navElement;
      closestDist = absDist;
    }

    // All other elements have been deactivated, and now the top element is known and can be set
    // as active.
    addClassIfNeeded(frontRunner, selectedClass);
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

function makeNav(options) {
  if (!options || !options.elementList || !options.makeNavListItem) {
    throw new Error('Options object with elementList and makeNavListItem must be provided.');
  }

  var nav = document.createElement(options.tagName || 'nav');
  var navList = document.createElement('ul');

  // The target defaults to window.
  var target = options.target || document;

  // Create list elements
  var pairs = createAndAppendListItems(navList, options.elementList, options.makeNavListItem);

  // Whenever the window is scrolled, recalculate the active list element. Compatible with older
  // versions of IE.
  addScrollListener(target, makeHandleScroll(pairs, options.debounceTime));

  nav.appendChild(navList);

  return nav;
}

return makeNav;

})));

},{}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvcHVibGljL2pzL2RvY3MtbmF2LmpzIiwibGliL3B1YmxpYy9qcy9tYWluLmpzIiwibm9kZV9tb2R1bGVzL25hdmJhci9uYXZiYXIudW1kLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUFFQSxJQUFNLFNBQVMsUUFBUSxRQUFSLENBQWY7O0FBRUEsSUFBTSxZQUFZLEVBQWxCOztBQUVBLFFBQVEsSUFBUixHQUFlLFVBQUMsU0FBRCxFQUFZLEtBQVosRUFBc0I7O0FBRWpDLFFBQUksQ0FBQyxTQUFMLEVBQWdCO0FBQ1o7QUFDSDs7QUFFRCxRQUFJLENBQUMsS0FBTCxFQUFZO0FBQ1IsY0FBTSxJQUFJLEtBQUosQ0FBVSxrRUFBVixDQUFOO0FBQ0g7O0FBRUQsUUFBTSxTQUFTLE9BQU87QUFDbEIscUJBQWEsVUFBVSxnQkFBVixDQUEyQix3QkFBM0IsQ0FESztBQUVsQix5QkFBaUIseUJBQUMsRUFBRCxFQUFROztBQUVyQixnQkFBTSxPQUFPLEdBQUcsV0FBSCxDQUFlLElBQWYsRUFBYjs7QUFFQSxnQkFBTSxPQUFPLFVBQVUsTUFBVixDQUNULFVBQVUsSUFBVixDQUFlLElBQWYsQ0FEUyxDQUFiOztBQUlBLGlCQUFLLGdCQUFMLENBQXNCLE9BQXRCLEVBQStCO0FBQUEsdUJBQU0sR0FBRyxjQUFILENBQWtCLEVBQUUsT0FBTyxPQUFULEVBQWtCLFVBQVUsUUFBNUIsRUFBbEIsQ0FBTjtBQUFBLGFBQS9COztBQUVBLG1CQUFPLElBQVA7QUFDSDtBQWJpQixLQUFQLENBQWY7O0FBZ0JBLFdBQU8sTUFBTSxXQUFOLENBQWtCLE1BQWxCLENBQVA7QUFDSCxDQTNCRDs7QUE2QkEsVUFBVSxJQUFWLEdBQWlCLFVBQUMsSUFBRDtBQUFBLHNDQUFtQyxJQUFuQztBQUFBLENBQWpCOztBQUVBLFVBQVUsTUFBVixHQUFtQixVQUFDLElBQUQsRUFBVTs7QUFF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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgZG9jdW1lbnQgKi9cblxuY29uc3QgTmF2YmFyID0gcmVxdWlyZSgnbmF2YmFyJyk7XG5cbmNvbnN0IGludGVybmFscyA9IHt9O1xuXG5leHBvcnRzLmluaXQgPSAoY29udGVudEVsLCBuYXZFbCkgPT4ge1xuXG4gICAgaWYgKCFjb250ZW50RWwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghbmF2RWwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEb2NzIG5hdmlnYXRpb24gY29udGVudCBlbGVtZW50IGV4aXN0cywgYnV0IG5vdCB0aGUgbmF2IGVsZW1lbnQuJyk7XG4gICAgfVxuXG4gICAgY29uc3QgbmF2YmFyID0gTmF2YmFyKHtcbiAgICAgICAgZWxlbWVudExpc3Q6IGNvbnRlbnRFbC5xdWVyeVNlbGVjdG9yQWxsKCdoMSwgaDIsIGgzLCBoNCwgaDUsIGg2JyksXG4gICAgICAgIG1ha2VOYXZMaXN0SXRlbTogKGVsKSA9PiB7XG5cbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSBlbC50ZXh0Q29udGVudC50cmltKCk7XG5cbiAgICAgICAgICAgIGNvbnN0IGl0ZW0gPSBpbnRlcm5hbHMucmVuZGVyKFxuICAgICAgICAgICAgICAgIGludGVybmFscy5pdGVtKHRleHQpXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICBpdGVtLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4gZWwuc2Nyb2xsSW50b1ZpZXcoeyBibG9jazogJ3N0YXJ0JywgYmVoYXZpb3I6ICdzbW9vdGgnIH0pKTtcblxuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBuYXZFbC5hcHBlbmRDaGlsZChuYXZiYXIpO1xufTtcblxuaW50ZXJuYWxzLml0ZW0gPSAodGV4dCkgPT4gYDxkaXYgY2xhc3M9XCJuYXYtaXRlbVwiPiR7dGV4dH08L2Rpdj5gO1xuXG5pbnRlcm5hbHMucmVuZGVyID0gKGh0bWwpID0+IHtcblxuICAgIGNvbnN0IHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgIHdyYXBwZXIuaW5uZXJIVE1MID0gaHRtbDtcblxuICAgIHJldHVybiB3cmFwcGVyLmZpcnN0Q2hpbGQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuLyogZ2xvYmFsIGRvY3VtZW50LCB3aW5kb3csIFhNTEh0dHBSZXF1ZXN0ICovXG5cbmNvbnN0IERvY3NOYXYgPSByZXF1aXJlKCcuL2RvY3MtbmF2Jyk7XG5cbkRvY3NOYXYuaW5pdChcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZG9jcy1kZXRhaWwgLndyYXBwZXInKSxcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZG9jcy1kZXRhaWwgLm5hdicpXG4pO1xuXG5jb25zdCBzZXRBY3RpdmVOYXZJdGVtcyA9ICgpID0+IHtcblxuICAgIGNvbnN0IGxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCduYXZfX2l0ZW0nKTtcbiAgICBjb25zdCBjdXJyZW50UGFnZSA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBsaXN0W2ldO1xuICAgICAgICBpZiAoaXRlbS5ocmVmID09PSBjdXJyZW50UGFnZSkge1xuICAgICAgICAgICAgaXRlbS5jbGFzc0xpc3QuYWRkKCduYXZfX2l0ZW0tLWFjdGl2ZScpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuY29uc3QgbmV3c2xldHRlclN1Ym1pdCA9ICgpID0+IHtcblxuICAgIGNvbnN0IGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV3c2xldHRlckZvcm0nKTtcblxuICAgIGlmICghZm9ybSkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9ybS5vbnN1Ym1pdCA9IChlKSA9PiB7XG5cbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIGNvbnN0IGVtYWlsSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV3c2xldHRlckVtYWlsJyk7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV3c2xldHRlck1lc3NhZ2UnKTtcblxuICAgICAgICBpZiAoZW1haWxJbnB1dC52YWxpZGl0eS52YWxpZCkge1xuICAgICAgICAgICAgY29uc3QgcGF5bG9hZCA9IEpTT04uc3RyaW5naWZ5KHtcbiAgICAgICAgICAgICAgICBlbWFpbDogZW1haWxJbnB1dC52YWx1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgIHhoci5vcGVuKCdQT1NUJywgJy9tYWlsY2hpbXAnKTtcbiAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xuICAgICAgICAgICAgeGhyLm9ubG9hZCA9ICgpID0+IHtcblxuICAgICAgICAgICAgICAgIGlmICh4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSAnWW91ciBlbWFpbCBhZGRyZXNzOiAnICsgZW1haWxJbnB1dC52YWx1ZSArICcsIGlzIG5vdyBzaWduZWQgdXAuIFRoYW5rcyBwYWwhJztcbiAgICAgICAgICAgICAgICAgICAgZW1haWxJbnB1dC52YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGZvcm0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoeGhyLnN0YXR1cyA9PT0gNDAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gJ1RoZSBlbWFpbCBhZGRyZXNzOiAnICsgZW1haWxJbnB1dC52YWx1ZSArICcgaXMgZWl0aGVyIGludmFsaWQsIG9yIG1heSBhbHJlYWR5IGJlIHN1YnNjcmliZWQuJztcbiAgICAgICAgICAgICAgICAgICAgZW1haWxJbnB1dC52YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGVtYWlsSW5wdXQuY2xhc3NMaXN0LmFkZCgnbmV3c2xldHRlcl9faW5wdXQtLWludmFsaWQnKTtcbiAgICAgICAgICAgICAgICAgICAgZm9ybS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gJ1RoZSBlbWFpbCBhZGRyZXNzOiAnICsgZW1haWxJbnB1dC52YWx1ZSArICcgbWF5IGJlIGludmFsaWQsIG9yIHlvdXIgbmV0d29yayBjb25uZWN0aW9uIGlzIGluYWN0aXZlJztcbiAgICAgICAgICAgICAgICAgICAgZW1haWxJbnB1dC52YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgIGVtYWlsSW5wdXQuY2xhc3NMaXN0LmFkZCgnbmV3c2xldHRlcl9faW5wdXQtLWludmFsaWQnKTtcbiAgICAgICAgICAgICAgICAgICAgZm9ybS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgeGhyLnNlbmQocGF5bG9hZCk7XG4gICAgICAgIH1cbiAgICB9O1xufTtcblxuY29uc3Qgc2Nyb2xsVG9FbGVtZW50ID0gKHNlbGVjdG9yKSA9PiB7XG5cbiAgICBjb25zdCB0b3AgPSB7XG4gICAgICAgIGJveDogZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3RvcikuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wLFxuICAgICAgICBzY3JvbGw6IHdpbmRvdy5wYWdlWU9mZnNldCB8fCBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2Nyb2xsVG9wIHx8IGRvY3VtZW50LmJvZHkuc2Nyb2xsVG9wLFxuICAgICAgICBjbGllbnQ6IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5jbGllbnRUb3AgfHwgZG9jdW1lbnQuYm9keS5jbGllbnRUb3AgfHwgMFxuICAgIH07XG4gICAgd2luZG93LnNjcm9sbFRvKDAsIE1hdGgucm91bmQodG9wLmJveCArIHRvcC5zY3JvbGwgLSB0b3AuY2xpZW50KSk7XG59O1xuXG53aW5kb3cub25oYXNoY2hhbmdlID0gKCkgPT4ge1xuXG4gICAgc2Nyb2xsVG9FbGVtZW50KCdhW2hyZWY9XCInICsgd2luZG93LmxvY2F0aW9uLmhhc2ggKyAnXCJdJyk7XG59O1xuXG53aW5kb3cub25sb2FkID0gKCkgPT4ge1xuXG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoKSB7XG4gICAgICAgIHNjcm9sbFRvRWxlbWVudCgnYVtocmVmPVwiJyArIHdpbmRvdy5sb2NhdGlvbi5oYXNoICsgJ1wiXScpO1xuICAgIH1cbn07XG5cbnNldEFjdGl2ZU5hdkl0ZW1zKCk7XG5uZXdzbGV0dGVyU3VibWl0KCk7XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuXHR0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6XG5cdHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmYWN0b3J5KSA6XG5cdChnbG9iYWwubmF2YmFyID0gZmFjdG9yeSgpKTtcbn0odGhpcywgKGZ1bmN0aW9uICgpIHsgJ3VzZSBzdHJpY3QnO1xuXG52YXIgc2VsZWN0ZWRDbGFzcyA9ICduYXZiYXItYWN0aXZlJztcbnZhciBzdXBwb3J0c1Bhc3NpdmUgPSBmYWxzZTtcblxudHJ5IHtcbiAgdmFyIG9wdHMgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdwYXNzaXZlJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgc3VwcG9ydHNQYXNzaXZlID0gdHJ1ZTtcbiAgICB9XG4gIH0pO1xuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0ZXN0JywgbnVsbCwgb3B0cyk7XG59IGNhdGNoIChlKSB7fVxuXG4vLyBJdCdkIGJlIG5pY2VyIHRvIHVzZSB0aGUgY2xhc3NMaXN0IEFQSSwgYnV0IEkgcHJlZmVyIHRvIHN1cHBvcnQgbW9yZSBicm93c2Vycy4gUmVtb3ZlIGEgY2xhc3Ncbi8vIGlmIGl0J3MgZm91bmQgb24gdGhlIGVsZW1lbnQuXG5mdW5jdGlvbiByZW1vdmVDbGFzc0lmTmVlZGVkKGVsKSB7XG4gIC8vIElmIHRoZSBlbGVtZW50IGhhcyBubyBjbGFzc2VzIHRoZW4gd2UgY2FuIHRha2UgYSBzaG9ydGN1dC5cbiAgaWYgKCFlbC5jbGFzc05hbWUpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgc3BsaXRDbGFzc05hbWUgPSBlbC5jbGFzc05hbWUuc3BsaXQoJyAnKTtcbiAgdmFyIHJlcGxhY2VtZW50Q2xhc3NOYW1lID0gJyc7XG5cbiAgLy8gQXNzZW1ibGUgYSBzdHJpbmcgb2Ygb3RoZXIgY2xhc3MgbmFtZXMuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBzcGxpdENsYXNzTmFtZS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIHZhciBjbGFzc05hbWUgPSBzcGxpdENsYXNzTmFtZVtpXTtcblxuICAgIGlmIChjbGFzc05hbWUgIT09IHNlbGVjdGVkQ2xhc3MpIHtcbiAgICAgIHJlcGxhY2VtZW50Q2xhc3NOYW1lICs9IHJlcGxhY2VtZW50Q2xhc3NOYW1lID09PSAnJyA/IGNsYXNzTmFtZSA6ICcgJyArIGNsYXNzTmFtZTtcbiAgICB9XG4gIH1cblxuICAvLyBJZiB0aGUgbGVuZ3RoIG9mIHRoZSBjbGFzc05hbWUgZGlmZmVycywgdGhlbiBpdCBoYWQgYW4gc2VsZWN0ZWQgY2xhc3MgaW4gYW5kIG5lZWRzIHRvIGJlXG4gIC8vIHVwZGF0ZWQuXG4gIGlmIChyZXBsYWNlbWVudENsYXNzTmFtZS5sZW5ndGggIT09IGVsLmNsYXNzTmFtZS5sZW5ndGgpIHtcbiAgICBlbC5jbGFzc05hbWUgPSByZXBsYWNlbWVudENsYXNzTmFtZTtcbiAgfVxufVxuXG4vLyBBZGQgYSBjbGFzcyB0byBhbiBlbGVtZW50IGlmIGl0IGlzIG5vdCBmb3VuZC5cbmZ1bmN0aW9uIGFkZENsYXNzSWZOZWVkZWQoZWwpIHtcbiAgLy8gSWYgdGhlIGVsZW1lbnQgaGFzIG5vIGNsYXNzZXMgdGhlbiB3ZSBjYW4gdGFrZSBhIHNob3J0Y3V0LlxuICBpZiAoIWVsLmNsYXNzTmFtZSkge1xuICAgIGVsLmNsYXNzTmFtZSA9IHNlbGVjdGVkQ2xhc3M7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIHNwbGl0Q2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lLnNwbGl0KCcgJyk7XG5cbiAgLy8gSWYgYW55IG9mIHRoZSBjbGFzcyBuYW1lcyBtYXRjaCB0aGUgc2VsZWN0ZWQgY2xhc3MgdGhlbiByZXR1cm4uXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBzcGxpdENsYXNzTmFtZS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChzcGxpdENsYXNzTmFtZVtpXSA9PT0gc2VsZWN0ZWRDbGFzcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIC8vIElmIHdlIGdvdCBoZXJlIHRoZW4gdGhlIHNlbGVjdGVkIGNsYXNzIG5lZWRzIHRvIGJlIGFkZGVkIHRvIGFuIGV4aXN0aW5nIGNsYXNzTmFtZS5cbiAgZWwuY2xhc3NOYW1lICs9ICcgJyArIHNlbGVjdGVkQ2xhc3M7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUFuZEFwcGVuZExpc3RJdGVtcyhuYXZMaXN0LCBlbGVtZW50TGlzdCwgbWFrZU5hdkxpc3RJdGVtKSB7XG4gIHZhciBwYWlycyA9IFtdO1xuICB2YXIgZWxlbWVudDtcbiAgdmFyIGxpO1xuXG4gIC8vIENyZWF0ZSBsaXN0IGVsZW1lbnRzXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBlbGVtZW50TGlzdC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGVsZW1lbnQgPSBlbGVtZW50TGlzdFtpXTtcbiAgICBsaSA9IG1ha2VOYXZMaXN0SXRlbShlbGVtZW50KTtcblxuICAgIG5hdkxpc3QuYXBwZW5kQ2hpbGQobGkpO1xuXG4gICAgcGFpcnMucHVzaCh7IGVsZW1lbnQ6IGVsZW1lbnQsIG5hdkVsZW1lbnQ6IGxpIH0pO1xuICB9XG5cbiAgcmV0dXJuIHBhaXJzO1xufVxuXG5mdW5jdGlvbiBtYWtlSGFuZGxlU2Nyb2xsKHBhaXJzLCBkZWJvdW5jZVRpbWUpIHtcbiAgZnVuY3Rpb24gaGFuZGxlU2Nyb2xsKCkge1xuICAgIHZhciBmcm9udFJ1bm5lciA9IHsgbmF2RWxlbWVudDoge30gfTtcbiAgICB2YXIgY2xvc2VzdERpc3QgPSBJbmZpbml0eTtcbiAgICB2YXIgcGFpcjtcbiAgICB2YXIgYWJzRGlzdDtcblxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBwYWlycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgcGFpciA9IHBhaXJzW2ldO1xuICAgICAgYWJzRGlzdCA9IE1hdGguYWJzKHBhaXIuZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3ApO1xuXG4gICAgICAvLyBJZiB0aGlzIGVsZW1lbnQgaXMgbm90IHRoZSBmcm9udCBydW5uZXIgZm9yIHRvcCwgZGVhY3RpdmF0ZSBpdC5cbiAgICAgIGlmIChhYnNEaXN0ID4gY2xvc2VzdERpc3QpIHtcbiAgICAgICAgcmVtb3ZlQ2xhc3NJZk5lZWRlZChwYWlyLm5hdkVsZW1lbnQpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhpcyBpcyBhIG5ldyBmcm9udCBydW5uZXIsIGRlYWN0aXZhdGUgdGhlIHByZXZpb3VzIGZyb250IHJ1bm5lci5cbiAgICAgIHJlbW92ZUNsYXNzSWZOZWVkZWQoZnJvbnRSdW5uZXIpO1xuXG4gICAgICBmcm9udFJ1bm5lciA9IHBhaXIubmF2RWxlbWVudDtcbiAgICAgIGNsb3Nlc3REaXN0ID0gYWJzRGlzdDtcbiAgICB9XG5cbiAgICAvLyBBbGwgb3RoZXIgZWxlbWVudHMgaGF2ZSBiZWVuIGRlYWN0aXZhdGVkLCBhbmQgbm93IHRoZSB0b3AgZWxlbWVudCBpcyBrbm93biBhbmQgY2FuIGJlIHNldFxuICAgIC8vIGFzIGFjdGl2ZS5cbiAgICBhZGRDbGFzc0lmTmVlZGVkKGZyb250UnVubmVyLCBzZWxlY3RlZENsYXNzKTtcbiAgfVxuXG4gIC8vIFRoZSBkZWZhdWx0IGJlaGF2aW91ciBpcyBubyBkZWJvdW5jZS5cbiAgaWYgKHR5cGVvZiBkZWJvdW5jZVRpbWUgIT09ICdudW1iZXInIHx8IGlzTmFOKGRlYm91bmNlVGltZSkpIHtcbiAgICByZXR1cm4gaGFuZGxlU2Nyb2xsO1xuICB9XG5cbiAgdmFyIHRpbWVvdXQ7XG5cbiAgZnVuY3Rpb24gbnVsbGlmeVRpbWVvdXQoKSB7XG4gICAgdGltZW91dCA9IG51bGw7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gZGVib3VuY2VkSGFuZGxlU2Nyb2xsKCkge1xuICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSW1tZWRpYXRlbHkgdXNlIGhhbmRsZVNjcm9sbCB0byBjYWxjdWxhdGUuXG4gICAgaGFuZGxlU2Nyb2xsKCk7XG5cbiAgICAvLyBObyBmdXJ0aGVyIGNhbGxzIHRvIGhhbmRsZVNjcm9sbCB1bnRpbCBkZWJvdW5jZVRpbWUgaGFzIGVsYXBzZWQuXG4gICAgdGltZW91dCA9IHNldFRpbWVvdXQobnVsbGlmeVRpbWVvdXQsIGRlYm91bmNlVGltZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGFkZFNjcm9sbExpc3RlbmVyKHRhcmdldCwgaGFuZGxlU2Nyb2xsKSB7XG4gIGZ1bmN0aW9uIHNjcm9sbEhhbmRsZVdyYXBwZXIoZXZ0KSB7XG4gICAgaWYgKGV2dC50YXJnZXQgPT09IHRhcmdldCkge1xuICAgICAgaGFuZGxlU2Nyb2xsKCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHRhcmdldC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHNjcm9sbEhhbmRsZVdyYXBwZXIsIHN1cHBvcnRzUGFzc2l2ZSA/IHsgcGFzc2l2ZTogdHJ1ZSB9IDogZmFsc2UpO1xuICB9IGVsc2UgaWYgKHRhcmdldC5hdHRhY2hFdmVudCkge1xuICAgIHRhcmdldC5hdHRhY2hFdmVudCgnb25zY3JvbGwnLCBzY3JvbGxIYW5kbGVXcmFwcGVyKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoaXMgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGFkZEV2ZW50TGlzdGVuZXIgb3IgYXR0YWNoRXZlbnQuJyk7XG4gIH1cblxuICAvLyBUbyBjYWxjdWxhdGUgdGhlIGluaXRpYWwgYWN0aXZlIGxpc3QgZWxlbWVudC5cbiAgaGFuZGxlU2Nyb2xsKCk7XG59XG5cbmZ1bmN0aW9uIG1ha2VOYXYob3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMuZWxlbWVudExpc3QgfHwgIW9wdGlvbnMubWFrZU5hdkxpc3RJdGVtKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdPcHRpb25zIG9iamVjdCB3aXRoIGVsZW1lbnRMaXN0IGFuZCBtYWtlTmF2TGlzdEl0ZW0gbXVzdCBiZSBwcm92aWRlZC4nKTtcbiAgfVxuXG4gIHZhciBuYXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG9wdGlvbnMudGFnTmFtZSB8fCAnbmF2Jyk7XG4gIHZhciBuYXZMaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcblxuICAvLyBUaGUgdGFyZ2V0IGRlZmF1bHRzIHRvIHdpbmRvdy5cbiAgdmFyIHRhcmdldCA9IG9wdGlvbnMudGFyZ2V0IHx8IGRvY3VtZW50O1xuXG4gIC8vIENyZWF0ZSBsaXN0IGVsZW1lbnRzXG4gIHZhciBwYWlycyA9IGNyZWF0ZUFuZEFwcGVuZExpc3RJdGVtcyhuYXZMaXN0LCBvcHRpb25zLmVsZW1lbnRMaXN0LCBvcHRpb25zLm1ha2VOYXZMaXN0SXRlbSk7XG5cbiAgLy8gV2hlbmV2ZXIgdGhlIHdpbmRvdyBpcyBzY3JvbGxlZCwgcmVjYWxjdWxhdGUgdGhlIGFjdGl2ZSBsaXN0IGVsZW1lbnQuIENvbXBhdGlibGUgd2l0aCBvbGRlclxuICAvLyB2ZXJzaW9ucyBvZiBJRS5cbiAgYWRkU2Nyb2xsTGlzdGVuZXIodGFyZ2V0LCBtYWtlSGFuZGxlU2Nyb2xsKHBhaXJzLCBvcHRpb25zLmRlYm91bmNlVGltZSkpO1xuXG4gIG5hdi5hcHBlbmRDaGlsZChuYXZMaXN0KTtcblxuICByZXR1cm4gbmF2O1xufVxuXG5yZXR1cm4gbWFrZU5hdjtcblxufSkpKTtcbiJdfQ==
