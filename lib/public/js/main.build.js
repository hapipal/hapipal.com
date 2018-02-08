(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

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
/* global document, window */

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvcHVibGljL2pzL2RvY3MtbmF2LmpzIiwibGliL3B1YmxpYy9qcy9tYWluLmpzIiwibm9kZV9tb2R1bGVzL25hdmJhci9uYXZiYXIudW1kLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7O0FBRUEsSUFBTSxTQUFTLFFBQVEsUUFBUixDQUFmOztBQUVBLElBQU0sWUFBWSxFQUFsQjs7QUFFQSxRQUFRLElBQVIsR0FBZSxVQUFDLFNBQUQsRUFBWSxLQUFaLEVBQXNCOztBQUVqQyxRQUFJLENBQUMsU0FBTCxFQUFnQjtBQUNaO0FBQ0g7O0FBRUQsUUFBSSxDQUFDLEtBQUwsRUFBWTtBQUNSLGNBQU0sSUFBSSxLQUFKLENBQVUsa0VBQVYsQ0FBTjtBQUNIOztBQUVELFFBQU0sU0FBUyxPQUFPO0FBQ2xCLHFCQUFhLFVBQVUsZ0JBQVYsQ0FBMkIsd0JBQTNCLENBREs7QUFFbEIseUJBQWlCLHlCQUFDLEVBQUQsRUFBUTs7QUFFckIsZ0JBQU0sT0FBTyxHQUFHLFdBQUgsQ0FBZSxJQUFmLEVBQWI7O0FBRUEsZ0JBQU0sT0FBTyxVQUFVLE1BQVYsQ0FDVCxVQUFVLElBQVYsQ0FBZSxJQUFmLENBRFMsQ0FBYjs7QUFJQSxpQkFBSyxnQkFBTCxDQUFzQixPQUF0QixFQUErQjtBQUFBLHVCQUFNLEdBQUcsY0FBSCxDQUFrQixFQUFFLE9BQU8sT0FBVCxFQUFrQixVQUFVLFFBQTVCLEVBQWxCLENBQU47QUFBQSxhQUEvQjs7QUFFQSxtQkFBTyxJQUFQO0FBQ0g7QUFiaUIsS0FBUCxDQUFmOztBQWdCQSxXQUFPLE1BQU0sV0FBTixDQUFrQixNQUFsQixDQUFQO0FBQ0gsQ0EzQkQ7O0FBNkJBLFVBQVUsSUFBVixHQUFpQixVQUFDLElBQUQ7QUFBQSxzQ0FBbUMsSUFBbkM7QUFBQSxDQUFqQjs7QUFFQSxVQUFVLE1BQVYsR0FBbUIsVUFBQyxJQUFELEVBQVU7O0FBRXpCLFFB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuXG5jb25zdCBOYXZiYXIgPSByZXF1aXJlKCduYXZiYXInKTtcblxuY29uc3QgaW50ZXJuYWxzID0ge307XG5cbmV4cG9ydHMuaW5pdCA9IChjb250ZW50RWwsIG5hdkVsKSA9PiB7XG5cbiAgICBpZiAoIWNvbnRlbnRFbCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFuYXZFbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RvY3MgbmF2aWdhdGlvbiBjb250ZW50IGVsZW1lbnQgZXhpc3RzLCBidXQgbm90IHRoZSBuYXYgZWxlbWVudC4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBuYXZiYXIgPSBOYXZiYXIoe1xuICAgICAgICBlbGVtZW50TGlzdDogY29udGVudEVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ2gxLCBoMiwgaDMsIGg0LCBoNSwgaDYnKSxcbiAgICAgICAgbWFrZU5hdkxpc3RJdGVtOiAoZWwpID0+IHtcblxuICAgICAgICAgICAgY29uc3QgdGV4dCA9IGVsLnRleHRDb250ZW50LnRyaW0oKTtcblxuICAgICAgICAgICAgY29uc3QgaXRlbSA9IGludGVybmFscy5yZW5kZXIoXG4gICAgICAgICAgICAgICAgaW50ZXJuYWxzLml0ZW0odGV4dClcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGl0ZW0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBlbC5zY3JvbGxJbnRvVmlldyh7IGJsb2NrOiAnc3RhcnQnLCBiZWhhdmlvcjogJ3Ntb290aCcgfSkpO1xuXG4gICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgfSxcbiAgICB9KTtcblxuICAgIHJldHVybiBuYXZFbC5hcHBlbmRDaGlsZChuYXZiYXIpO1xufTtcblxuaW50ZXJuYWxzLml0ZW0gPSAodGV4dCkgPT4gYDxkaXYgY2xhc3M9XCJuYXYtaXRlbVwiPiR7dGV4dH08L2Rpdj5gO1xuXG5pbnRlcm5hbHMucmVuZGVyID0gKGh0bWwpID0+IHtcblxuICAgIGNvbnN0IHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgIHdyYXBwZXIuaW5uZXJIVE1MID0gaHRtbDtcblxuICAgIHJldHVybiB3cmFwcGVyLmZpcnN0Q2hpbGQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuLyogZ2xvYmFsIGRvY3VtZW50LCB3aW5kb3cgKi9cblxuY29uc3QgRG9jc05hdiA9IHJlcXVpcmUoJy4vZG9jcy1uYXYnKTtcblxuRG9jc05hdi5pbml0KFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5kb2NzLWRldGFpbCAud3JhcHBlcicpLFxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5kb2NzLWRldGFpbCAubmF2Jylcbik7XG5cbmNvbnN0IHNldEFjdGl2ZU5hdkl0ZW1zID0gKCkgPT4ge1xuXG4gICAgY29uc3QgbGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ25hdl9faXRlbScpO1xuICAgIGNvbnN0IGN1cnJlbnRQYWdlID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGxpc3RbaV07XG4gICAgICAgIGlmIChpdGVtLmhyZWYgPT09IGN1cnJlbnRQYWdlKSB7XG4gICAgICAgICAgICBpdGVtLmNsYXNzTGlzdC5hZGQoJ25hdl9faXRlbS0tYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5jb25zdCBuZXdzbGV0dGVyU3VibWl0ID0gKCkgPT4ge1xuXG4gICAgY29uc3QgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXdzbGV0dGVyRm9ybScpO1xuXG4gICAgaWYgKCFmb3JtKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3JtLm9uc3VibWl0ID0gKGUpID0+IHtcblxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgY29uc3QgZW1haWxJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXdzbGV0dGVyRW1haWwnKTtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXdzbGV0dGVyTWVzc2FnZScpO1xuXG4gICAgICAgIGlmIChlbWFpbElucHV0LnZhbGlkaXR5LnZhbGlkKSB7XG4gICAgICAgICAgICBjb25zdCBwYXlsb2FkID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIGVtYWlsOiBlbWFpbElucHV0LnZhbHVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgeGhyLm9wZW4oJ1BPU1QnLCAnL21haWxjaGltcCcpO1xuICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICB4aHIub25sb2FkID0gKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLmlubmVySFRNTCA9ICdZb3VyIGVtYWlsIGFkZHJlc3M6ICcgKyBlbWFpbElucHV0LnZhbHVlICsgJywgaXMgbm93IHNpZ25lZCB1cC4gVGhhbmtzIHBhbCEnO1xuICAgICAgICAgICAgICAgICAgICBlbWFpbElucHV0LnZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgZm9ybS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh4aHIuc3RhdHVzID09PSA0MDApIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSAnVGhlIGVtYWlsIGFkZHJlc3M6ICcgKyBlbWFpbElucHV0LnZhbHVlICsgJyBpcyBlaXRoZXIgaW52YWxpZCwgb3IgbWF5IGFscmVhZHkgYmUgc3Vic2NyaWJlZC4nO1xuICAgICAgICAgICAgICAgICAgICBlbWFpbElucHV0LnZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgZW1haWxJbnB1dC5jbGFzc0xpc3QuYWRkKCduZXdzbGV0dGVyX19pbnB1dC0taW52YWxpZCcpO1xuICAgICAgICAgICAgICAgICAgICBmb3JtLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSAnVGhlIGVtYWlsIGFkZHJlc3M6ICcgKyBlbWFpbElucHV0LnZhbHVlICsgJyBtYXkgYmUgaW52YWxpZCwgb3IgeW91ciBuZXR3b3JrIGNvbm5lY3Rpb24gaXMgaW5hY3RpdmUnO1xuICAgICAgICAgICAgICAgICAgICBlbWFpbElucHV0LnZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgZW1haWxJbnB1dC5jbGFzc0xpc3QuYWRkKCduZXdzbGV0dGVyX19pbnB1dC0taW52YWxpZCcpO1xuICAgICAgICAgICAgICAgICAgICBmb3JtLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB4aHIuc2VuZChwYXlsb2FkKTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuXG5jb25zdCBzY3JvbGxUb0VsZW1lbnQgPSAoc2VsZWN0b3IpID0+IHtcblxuICAgIGNvbnN0IHRvcCA9IHtcbiAgICAgICAgYm94OiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKHNlbGVjdG9yKS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AsXG4gICAgICAgIHNjcm9sbDogd2luZG93LnBhZ2VZT2Zmc2V0IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zY3JvbGxUb3AgfHwgZG9jdW1lbnQuYm9keS5zY3JvbGxUb3AsXG4gICAgICAgIGNsaWVudDogZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LmNsaWVudFRvcCB8fCBkb2N1bWVudC5ib2R5LmNsaWVudFRvcCB8fCAwXG4gICAgfTtcbiAgICB3aW5kb3cuc2Nyb2xsVG8oMCwgTWF0aC5yb3VuZCh0b3AuYm94ICsgdG9wLnNjcm9sbCAtIHRvcC5jbGllbnQpKTtcbn07XG5cbndpbmRvdy5vbmhhc2hjaGFuZ2UgPSAoKSA9PiB7XG5cbiAgICBzY3JvbGxUb0VsZW1lbnQoJ2FbaHJlZj1cIicgKyB3aW5kb3cubG9jYXRpb24uaGFzaCArICdcIl0nKTtcbn07XG5cbndpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XG5cbiAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2gpIHtcbiAgICAgICAgc2Nyb2xsVG9FbGVtZW50KCdhW2hyZWY9XCInICsgd2luZG93LmxvY2F0aW9uLmhhc2ggKyAnXCJdJyk7XG4gICAgfVxufTtcblxuc2V0QWN0aXZlTmF2SXRlbXMoKTtcbm5ld3NsZXR0ZXJTdWJtaXQoKTtcbiIsIihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG5cdHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcblx0dHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcblx0KGdsb2JhbC5uYXZiYXIgPSBmYWN0b3J5KCkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbnZhciBzZWxlY3RlZENsYXNzID0gJ25hdmJhci1hY3RpdmUnO1xudmFyIHN1cHBvcnRzUGFzc2l2ZSA9IGZhbHNlO1xuXG50cnkge1xuICB2YXIgb3B0cyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ3Bhc3NpdmUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICBzdXBwb3J0c1Bhc3NpdmUgPSB0cnVlO1xuICAgIH1cbiAgfSk7XG5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Rlc3QnLCBudWxsLCBvcHRzKTtcbn0gY2F0Y2ggKGUpIHt9XG5cbi8vIEl0J2QgYmUgbmljZXIgdG8gdXNlIHRoZSBjbGFzc0xpc3QgQVBJLCBidXQgSSBwcmVmZXIgdG8gc3VwcG9ydCBtb3JlIGJyb3dzZXJzLiBSZW1vdmUgYSBjbGFzc1xuLy8gaWYgaXQncyBmb3VuZCBvbiB0aGUgZWxlbWVudC5cbmZ1bmN0aW9uIHJlbW92ZUNsYXNzSWZOZWVkZWQoZWwpIHtcbiAgLy8gSWYgdGhlIGVsZW1lbnQgaGFzIG5vIGNsYXNzZXMgdGhlbiB3ZSBjYW4gdGFrZSBhIHNob3J0Y3V0LlxuICBpZiAoIWVsLmNsYXNzTmFtZSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBzcGxpdENsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZS5zcGxpdCgnICcpO1xuICB2YXIgcmVwbGFjZW1lbnRDbGFzc05hbWUgPSAnJztcblxuICAvLyBBc3NlbWJsZSBhIHN0cmluZyBvZiBvdGhlciBjbGFzcyBuYW1lcy5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHNwbGl0Q2xhc3NOYW1lLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgdmFyIGNsYXNzTmFtZSA9IHNwbGl0Q2xhc3NOYW1lW2ldO1xuXG4gICAgaWYgKGNsYXNzTmFtZSAhPT0gc2VsZWN0ZWRDbGFzcykge1xuICAgICAgcmVwbGFjZW1lbnRDbGFzc05hbWUgKz0gcmVwbGFjZW1lbnRDbGFzc05hbWUgPT09ICcnID8gY2xhc3NOYW1lIDogJyAnICsgY2xhc3NOYW1lO1xuICAgIH1cbiAgfVxuXG4gIC8vIElmIHRoZSBsZW5ndGggb2YgdGhlIGNsYXNzTmFtZSBkaWZmZXJzLCB0aGVuIGl0IGhhZCBhbiBzZWxlY3RlZCBjbGFzcyBpbiBhbmQgbmVlZHMgdG8gYmVcbiAgLy8gdXBkYXRlZC5cbiAgaWYgKHJlcGxhY2VtZW50Q2xhc3NOYW1lLmxlbmd0aCAhPT0gZWwuY2xhc3NOYW1lLmxlbmd0aCkge1xuICAgIGVsLmNsYXNzTmFtZSA9IHJlcGxhY2VtZW50Q2xhc3NOYW1lO1xuICB9XG59XG5cbi8vIEFkZCBhIGNsYXNzIHRvIGFuIGVsZW1lbnQgaWYgaXQgaXMgbm90IGZvdW5kLlxuZnVuY3Rpb24gYWRkQ2xhc3NJZk5lZWRlZChlbCkge1xuICAvLyBJZiB0aGUgZWxlbWVudCBoYXMgbm8gY2xhc3NlcyB0aGVuIHdlIGNhbiB0YWtlIGEgc2hvcnRjdXQuXG4gIGlmICghZWwuY2xhc3NOYW1lKSB7XG4gICAgZWwuY2xhc3NOYW1lID0gc2VsZWN0ZWRDbGFzcztcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgc3BsaXRDbGFzc05hbWUgPSBlbC5jbGFzc05hbWUuc3BsaXQoJyAnKTtcblxuICAvLyBJZiBhbnkgb2YgdGhlIGNsYXNzIG5hbWVzIG1hdGNoIHRoZSBzZWxlY3RlZCBjbGFzcyB0aGVuIHJldHVybi5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHNwbGl0Q2xhc3NOYW1lLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKHNwbGl0Q2xhc3NOYW1lW2ldID09PSBzZWxlY3RlZENsYXNzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgLy8gSWYgd2UgZ290IGhlcmUgdGhlbiB0aGUgc2VsZWN0ZWQgY2xhc3MgbmVlZHMgdG8gYmUgYWRkZWQgdG8gYW4gZXhpc3RpbmcgY2xhc3NOYW1lLlxuICBlbC5jbGFzc05hbWUgKz0gJyAnICsgc2VsZWN0ZWRDbGFzcztcbn1cblxuZnVuY3Rpb24gY3JlYXRlQW5kQXBwZW5kTGlzdEl0ZW1zKG5hdkxpc3QsIGVsZW1lbnRMaXN0LCBtYWtlTmF2TGlzdEl0ZW0pIHtcbiAgdmFyIHBhaXJzID0gW107XG4gIHZhciBlbGVtZW50O1xuICB2YXIgbGk7XG5cbiAgLy8gQ3JlYXRlIGxpc3QgZWxlbWVudHNcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGVsZW1lbnRMaXN0Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgZWxlbWVudCA9IGVsZW1lbnRMaXN0W2ldO1xuICAgIGxpID0gbWFrZU5hdkxpc3RJdGVtKGVsZW1lbnQpO1xuXG4gICAgbmF2TGlzdC5hcHBlbmRDaGlsZChsaSk7XG5cbiAgICBwYWlycy5wdXNoKHsgZWxlbWVudDogZWxlbWVudCwgbmF2RWxlbWVudDogbGkgfSk7XG4gIH1cblxuICByZXR1cm4gcGFpcnM7XG59XG5cbmZ1bmN0aW9uIG1ha2VIYW5kbGVTY3JvbGwocGFpcnMsIGRlYm91bmNlVGltZSkge1xuICBmdW5jdGlvbiBoYW5kbGVTY3JvbGwoKSB7XG4gICAgdmFyIGZyb250UnVubmVyID0geyBuYXZFbGVtZW50OiB7fSB9O1xuICAgIHZhciBjbG9zZXN0RGlzdCA9IEluZmluaXR5O1xuICAgIHZhciBwYWlyO1xuICAgIHZhciBhYnNEaXN0O1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHBhaXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBwYWlyID0gcGFpcnNbaV07XG4gICAgICBhYnNEaXN0ID0gTWF0aC5hYnMocGFpci5lbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCk7XG5cbiAgICAgIC8vIElmIHRoaXMgZWxlbWVudCBpcyBub3QgdGhlIGZyb250IHJ1bm5lciBmb3IgdG9wLCBkZWFjdGl2YXRlIGl0LlxuICAgICAgaWYgKGFic0Rpc3QgPiBjbG9zZXN0RGlzdCkge1xuICAgICAgICByZW1vdmVDbGFzc0lmTmVlZGVkKHBhaXIubmF2RWxlbWVudCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGlzIGlzIGEgbmV3IGZyb250IHJ1bm5lciwgZGVhY3RpdmF0ZSB0aGUgcHJldmlvdXMgZnJvbnQgcnVubmVyLlxuICAgICAgcmVtb3ZlQ2xhc3NJZk5lZWRlZChmcm9udFJ1bm5lcik7XG5cbiAgICAgIGZyb250UnVubmVyID0gcGFpci5uYXZFbGVtZW50O1xuICAgICAgY2xvc2VzdERpc3QgPSBhYnNEaXN0O1xuICAgIH1cblxuICAgIC8vIEFsbCBvdGhlciBlbGVtZW50cyBoYXZlIGJlZW4gZGVhY3RpdmF0ZWQsIGFuZCBub3cgdGhlIHRvcCBlbGVtZW50IGlzIGtub3duIGFuZCBjYW4gYmUgc2V0XG4gICAgLy8gYXMgYWN0aXZlLlxuICAgIGFkZENsYXNzSWZOZWVkZWQoZnJvbnRSdW5uZXIsIHNlbGVjdGVkQ2xhc3MpO1xuICB9XG5cbiAgLy8gVGhlIGRlZmF1bHQgYmVoYXZpb3VyIGlzIG5vIGRlYm91bmNlLlxuICBpZiAodHlwZW9mIGRlYm91bmNlVGltZSAhPT0gJ251bWJlcicgfHwgaXNOYU4oZGVib3VuY2VUaW1lKSkge1xuICAgIHJldHVybiBoYW5kbGVTY3JvbGw7XG4gIH1cblxuICB2YXIgdGltZW91dDtcblxuICBmdW5jdGlvbiBudWxsaWZ5VGltZW91dCgpIHtcbiAgICB0aW1lb3V0ID0gbnVsbDtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiBkZWJvdW5jZWRIYW5kbGVTY3JvbGwoKSB7XG4gICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJbW1lZGlhdGVseSB1c2UgaGFuZGxlU2Nyb2xsIHRvIGNhbGN1bGF0ZS5cbiAgICBoYW5kbGVTY3JvbGwoKTtcblxuICAgIC8vIE5vIGZ1cnRoZXIgY2FsbHMgdG8gaGFuZGxlU2Nyb2xsIHVudGlsIGRlYm91bmNlVGltZSBoYXMgZWxhcHNlZC5cbiAgICB0aW1lb3V0ID0gc2V0VGltZW91dChudWxsaWZ5VGltZW91dCwgZGVib3VuY2VUaW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYWRkU2Nyb2xsTGlzdGVuZXIodGFyZ2V0LCBoYW5kbGVTY3JvbGwpIHtcbiAgZnVuY3Rpb24gc2Nyb2xsSGFuZGxlV3JhcHBlcihldnQpIHtcbiAgICBpZiAoZXZ0LnRhcmdldCA9PT0gdGFyZ2V0KSB7XG4gICAgICBoYW5kbGVTY3JvbGwoKTtcbiAgICB9XG4gIH1cblxuICBpZiAodGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgc2Nyb2xsSGFuZGxlV3JhcHBlciwgc3VwcG9ydHNQYXNzaXZlID8geyBwYXNzaXZlOiB0cnVlIH0gOiBmYWxzZSk7XG4gIH0gZWxzZSBpZiAodGFyZ2V0LmF0dGFjaEV2ZW50KSB7XG4gICAgdGFyZ2V0LmF0dGFjaEV2ZW50KCdvbnNjcm9sbCcsIHNjcm9sbEhhbmRsZVdyYXBwZXIpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignVGhpcyBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgYWRkRXZlbnRMaXN0ZW5lciBvciBhdHRhY2hFdmVudC4nKTtcbiAgfVxuXG4gIC8vIFRvIGNhbGN1bGF0ZSB0aGUgaW5pdGlhbCBhY3RpdmUgbGlzdCBlbGVtZW50LlxuICBoYW5kbGVTY3JvbGwoKTtcbn1cblxuZnVuY3Rpb24gbWFrZU5hdihvcHRpb25zKSB7XG4gIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5lbGVtZW50TGlzdCB8fCAhb3B0aW9ucy5tYWtlTmF2TGlzdEl0ZW0pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ09wdGlvbnMgb2JqZWN0IHdpdGggZWxlbWVudExpc3QgYW5kIG1ha2VOYXZMaXN0SXRlbSBtdXN0IGJlIHByb3ZpZGVkLicpO1xuICB9XG5cbiAgdmFyIG5hdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQob3B0aW9ucy50YWdOYW1lIHx8ICduYXYnKTtcbiAgdmFyIG5hdkxpc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpO1xuXG4gIC8vIFRoZSB0YXJnZXQgZGVmYXVsdHMgdG8gd2luZG93LlxuICB2YXIgdGFyZ2V0ID0gb3B0aW9ucy50YXJnZXQgfHwgZG9jdW1lbnQ7XG5cbiAgLy8gQ3JlYXRlIGxpc3QgZWxlbWVudHNcbiAgdmFyIHBhaXJzID0gY3JlYXRlQW5kQXBwZW5kTGlzdEl0ZW1zKG5hdkxpc3QsIG9wdGlvbnMuZWxlbWVudExpc3QsIG9wdGlvbnMubWFrZU5hdkxpc3RJdGVtKTtcblxuICAvLyBXaGVuZXZlciB0aGUgd2luZG93IGlzIHNjcm9sbGVkLCByZWNhbGN1bGF0ZSB0aGUgYWN0aXZlIGxpc3QgZWxlbWVudC4gQ29tcGF0aWJsZSB3aXRoIG9sZGVyXG4gIC8vIHZlcnNpb25zIG9mIElFLlxuICBhZGRTY3JvbGxMaXN0ZW5lcih0YXJnZXQsIG1ha2VIYW5kbGVTY3JvbGwocGFpcnMsIG9wdGlvbnMuZGVib3VuY2VUaW1lKSk7XG5cbiAgbmF2LmFwcGVuZENoaWxkKG5hdkxpc3QpO1xuXG4gIHJldHVybiBuYXY7XG59XG5cbnJldHVybiBtYWtlTmF2O1xuXG59KSkpO1xuIl19
