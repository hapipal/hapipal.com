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
        throw new Error('Docs navigation content element exists, but not the nav elements.');
    }

    var navbar = Navbar({
        tagName: navEl.tagName,
        elementList: contentEl.querySelectorAll('h1, h2, h3, h4, h5, h6'),
        makeNavListItem: function makeNavListItem(el) {

            var text = el.textContent.trim();

            var item = internals.render(internals.item(text, el.tagName.replace('H', 'indent-')));

            item.addEventListener('click', function () {
                return el.scrollIntoView({ block: 'start', behavior: 'smooth' });
            });

            return item;
        }
    });

    return navEl.parentNode.replaceChild(navbar, navEl);
};

internals.item = function (text, indent) {
    return '<div class="nav-item ' + indent + '">' + text + '</div>';
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

DocsNav.init(document.querySelector('.docs-detail .wrapper'), document.querySelector('.docs-detail .nav-target'));

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

var docsNavMobileActions = function docsNavMobileActions() {

    var menuButton = document.querySelector('.nav-item__left');
    var topButton = document.querySelector('.nav-item__right');
    var docsNav = document.querySelector('.docs-nav');
    var docsNavLinks = docsNav.getElementsByClassName('nav-item');

    if (!menuButton || !topButton || !docsNav || !docsNavLinks) {
        return;
    }

    topButton.addEventListener('click', function () {
        return window.scrollTo(0, 0);
    });

    menuButton.addEventListener('click', function () {

        if (docsNav.classList.contains('docs-nav--open')) {
            return docsNav.classList.remove('docs-nav--open');
        }
        docsNav.classList.add('docs-nav--open');
    });

    Array.from(docsNavLinks).forEach(function (link) {

        link.addEventListener('click', function () {
            return docsNav.classList.remove('docs-nav--open');
        });
    });
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
docsNavMobileActions();

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvcHVibGljL2pzL2RvY3MtbmF2LmpzIiwibGliL3B1YmxpYy9qcy9tYWluLmpzIiwibm9kZV9tb2R1bGVzL25hdmJhci9uYXZiYXIudW1kLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUFFQSxJQUFNLFNBQVMsUUFBUSxRQUFSLENBQWY7O0FBRUEsSUFBTSxZQUFZLEVBQWxCOztBQUVBLFFBQVEsSUFBUixHQUFlLFVBQUMsU0FBRCxFQUFZLEtBQVosRUFBc0I7O0FBRWpDLFFBQUksQ0FBQyxTQUFMLEVBQWdCO0FBQ1o7QUFDSDs7QUFFRCxRQUFJLENBQUMsS0FBTCxFQUFZO0FBQ1IsY0FBTSxJQUFJLEtBQUosQ0FBVSxtRUFBVixDQUFOO0FBQ0g7O0FBRUQsUUFBTSxTQUFTLE9BQU87QUFDbEIsaUJBQVMsTUFBTSxPQURHO0FBRWxCLHFCQUFhLFVBQVUsZ0JBQVYsQ0FBMkIsd0JBQTNCLENBRks7QUFHbEIseUJBQWlCLHlCQUFDLEVBQUQsRUFBUTs7QUFFckIsZ0JBQU0sT0FBTyxHQUFHLFdBQUgsQ0FBZSxJQUFmLEVBQWI7O0FBRUEsZ0JBQU0sT0FBTyxVQUFVLE1BQVYsQ0FDVCxVQUFVLElBQVYsQ0FBZSxJQUFmLEVBQXFCLEdBQUcsT0FBSCxDQUFXLE9BQVgsQ0FBbUIsR0FBbkIsRUFBd0IsU0FBeEIsQ0FBckIsQ0FEUyxDQUFiOztBQUlBLGlCQUFLLGdCQUFMLENBQXNCLE9BQXRCLEVBQStCO0FBQUEsdUJBQU0sR0FBRyxjQUFILENBQWtCLEVBQUUsT0FBTyxPQUFULEVBQWtCLFVBQVUsUUFBNUIsRUFBbEIsQ0FBTjtBQUFBLGFBQS9COztBQUVBLG1CQUFPLElBQVA7QUFDSDtBQWRpQixLQUFQLENBQWY7O0FBaUJBLFdBQU8sTUFBTSxVQUFOLENBQWlCLFlBQWpCLENBQThCLE1BQTlCLEVBQXNDLEtBQXRDLENBQVA7QUFDSCxDQTVCRDs7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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgZG9jdW1lbnQgKi9cblxuY29uc3QgTmF2YmFyID0gcmVxdWlyZSgnbmF2YmFyJyk7XG5cbmNvbnN0IGludGVybmFscyA9IHt9O1xuXG5leHBvcnRzLmluaXQgPSAoY29udGVudEVsLCBuYXZFbCkgPT4ge1xuXG4gICAgaWYgKCFjb250ZW50RWwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghbmF2RWwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEb2NzIG5hdmlnYXRpb24gY29udGVudCBlbGVtZW50IGV4aXN0cywgYnV0IG5vdCB0aGUgbmF2IGVsZW1lbnRzLicpO1xuICAgIH1cblxuICAgIGNvbnN0IG5hdmJhciA9IE5hdmJhcih7XG4gICAgICAgIHRhZ05hbWU6IG5hdkVsLnRhZ05hbWUsXG4gICAgICAgIGVsZW1lbnRMaXN0OiBjb250ZW50RWwucXVlcnlTZWxlY3RvckFsbCgnaDEsIGgyLCBoMywgaDQsIGg1LCBoNicpLFxuICAgICAgICBtYWtlTmF2TGlzdEl0ZW06IChlbCkgPT4ge1xuXG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gZWwudGV4dENvbnRlbnQudHJpbSgpO1xuXG4gICAgICAgICAgICBjb25zdCBpdGVtID0gaW50ZXJuYWxzLnJlbmRlcihcbiAgICAgICAgICAgICAgICBpbnRlcm5hbHMuaXRlbSh0ZXh0LCBlbC50YWdOYW1lLnJlcGxhY2UoJ0gnLCAnaW5kZW50LScpKVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IGVsLnNjcm9sbEludG9WaWV3KHsgYmxvY2s6ICdzdGFydCcsIGJlaGF2aW9yOiAnc21vb3RoJyB9KSk7XG5cbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gbmF2RWwucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQobmF2YmFyLCBuYXZFbCk7XG59O1xuXG5pbnRlcm5hbHMuaXRlbSA9ICh0ZXh0LCBpbmRlbnQpID0+IGA8ZGl2IGNsYXNzPVwibmF2LWl0ZW0gJHtpbmRlbnR9XCI+JHt0ZXh0fTwvZGl2PmA7XG5cbmludGVybmFscy5yZW5kZXIgPSAoaHRtbCkgPT4ge1xuXG4gICAgY29uc3Qgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHdyYXBwZXIuaW5uZXJIVE1MID0gaHRtbDtcblxuICAgIHJldHVybiB3cmFwcGVyLmZpcnN0Q2hpbGQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuLyogZ2xvYmFsIGRvY3VtZW50LCB3aW5kb3csIFhNTEh0dHBSZXF1ZXN0ICovXG5cbmNvbnN0IERvY3NOYXYgPSByZXF1aXJlKCcuL2RvY3MtbmF2Jyk7XG5cbkRvY3NOYXYuaW5pdChcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZG9jcy1kZXRhaWwgLndyYXBwZXInKSxcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZG9jcy1kZXRhaWwgLm5hdi10YXJnZXQnKVxuKTtcblxuY29uc3Qgc2V0QWN0aXZlTmF2SXRlbXMgPSAoKSA9PiB7XG5cbiAgICBjb25zdCBsaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbmF2X19pdGVtJyk7XG4gICAgY29uc3QgY3VycmVudFBhZ2UgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBpdGVtID0gbGlzdFtpXTtcbiAgICAgICAgaWYgKGl0ZW0uaHJlZiA9PT0gY3VycmVudFBhZ2UpIHtcbiAgICAgICAgICAgIGl0ZW0uY2xhc3NMaXN0LmFkZCgnbmF2X19pdGVtLS1hY3RpdmUnKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmNvbnN0IG5ld3NsZXR0ZXJTdWJtaXQgPSAoKSA9PiB7XG5cbiAgICBjb25zdCBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ld3NsZXR0ZXJGb3JtJyk7XG5cbiAgICBpZiAoIWZvcm0pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvcm0ub25zdWJtaXQgPSAoZSkgPT4ge1xuXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBjb25zdCBlbWFpbElucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ld3NsZXR0ZXJFbWFpbCcpO1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ld3NsZXR0ZXJNZXNzYWdlJyk7XG5cbiAgICAgICAgaWYgKGVtYWlsSW5wdXQudmFsaWRpdHkudmFsaWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHBheWxvYWQgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgZW1haWw6IGVtYWlsSW5wdXQudmFsdWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICB4aHIub3BlbignUE9TVCcsICcvbWFpbGNoaW1wJyk7XG4gICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgIHhoci5vbmxvYWQgPSAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gJ1lvdXIgZW1haWwgYWRkcmVzczogJyArIGVtYWlsSW5wdXQudmFsdWUgKyAnLCBpcyBub3cgc2lnbmVkIHVwLiBUaGFua3MgcGFsISc7XG4gICAgICAgICAgICAgICAgICAgIGVtYWlsSW5wdXQudmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBmb3JtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHhoci5zdGF0dXMgPT09IDQwMCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLmlubmVySFRNTCA9ICdUaGUgZW1haWwgYWRkcmVzczogJyArIGVtYWlsSW5wdXQudmFsdWUgKyAnIGlzIGVpdGhlciBpbnZhbGlkLCBvciBtYXkgYWxyZWFkeSBiZSBzdWJzY3JpYmVkLic7XG4gICAgICAgICAgICAgICAgICAgIGVtYWlsSW5wdXQudmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBlbWFpbElucHV0LmNsYXNzTGlzdC5hZGQoJ25ld3NsZXR0ZXJfX2lucHV0LS1pbnZhbGlkJyk7XG4gICAgICAgICAgICAgICAgICAgIGZvcm0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLmlubmVySFRNTCA9ICdUaGUgZW1haWwgYWRkcmVzczogJyArIGVtYWlsSW5wdXQudmFsdWUgKyAnIG1heSBiZSBpbnZhbGlkLCBvciB5b3VyIG5ldHdvcmsgY29ubmVjdGlvbiBpcyBpbmFjdGl2ZSc7XG4gICAgICAgICAgICAgICAgICAgIGVtYWlsSW5wdXQudmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBlbWFpbElucHV0LmNsYXNzTGlzdC5hZGQoJ25ld3NsZXR0ZXJfX2lucHV0LS1pbnZhbGlkJyk7XG4gICAgICAgICAgICAgICAgICAgIGZvcm0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHhoci5zZW5kKHBheWxvYWQpO1xuICAgICAgICB9XG4gICAgfTtcbn07XG5cbmNvbnN0IHNjcm9sbFRvRWxlbWVudCA9IChzZWxlY3RvcikgPT4ge1xuXG4gICAgY29uc3QgdG9wID0ge1xuICAgICAgICBib3g6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCxcbiAgICAgICAgc2Nyb2xsOiB3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCxcbiAgICAgICAgY2xpZW50OiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50VG9wIHx8IGRvY3VtZW50LmJvZHkuY2xpZW50VG9wIHx8IDBcbiAgICB9O1xuICAgIHdpbmRvdy5zY3JvbGxUbygwLCBNYXRoLnJvdW5kKHRvcC5ib3ggKyB0b3Auc2Nyb2xsIC0gdG9wLmNsaWVudCkpO1xufTtcblxuY29uc3QgZG9jc05hdk1vYmlsZUFjdGlvbnMgPSAoKSA9PiB7XG5cbiAgICBjb25zdCBtZW51QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm5hdi1pdGVtX19sZWZ0Jyk7XG4gICAgY29uc3QgdG9wQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm5hdi1pdGVtX19yaWdodCcpO1xuICAgIGNvbnN0IGRvY3NOYXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZG9jcy1uYXYnKTtcbiAgICBjb25zdCBkb2NzTmF2TGlua3MgPSBkb2NzTmF2LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ25hdi1pdGVtJyk7XG5cbiAgICBpZiAoIW1lbnVCdXR0b24gfHwgIXRvcEJ1dHRvbiB8fCAhZG9jc05hdiB8fCAhZG9jc05hdkxpbmtzKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0b3BCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiB3aW5kb3cuc2Nyb2xsVG8oMCwwKSk7XG5cbiAgICBtZW51QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuXG4gICAgICAgIGlmIChkb2NzTmF2LmNsYXNzTGlzdC5jb250YWlucygnZG9jcy1uYXYtLW9wZW4nKSl7XG4gICAgICAgICAgICByZXR1cm4gZG9jc05hdi5jbGFzc0xpc3QucmVtb3ZlKCdkb2NzLW5hdi0tb3BlbicpO1xuICAgICAgICB9XG4gICAgICAgIGRvY3NOYXYuY2xhc3NMaXN0LmFkZCgnZG9jcy1uYXYtLW9wZW4nKTtcbiAgICB9KTtcblxuICAgIEFycmF5LmZyb20oZG9jc05hdkxpbmtzKS5mb3JFYWNoKChsaW5rKSA9PiB7XG5cbiAgICAgICAgbGluay5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IGRvY3NOYXYuY2xhc3NMaXN0LnJlbW92ZSgnZG9jcy1uYXYtLW9wZW4nKSk7XG4gICAgfSk7XG59O1xuXG53aW5kb3cub25oYXNoY2hhbmdlID0gKCkgPT4ge1xuXG4gICAgc2Nyb2xsVG9FbGVtZW50KCdhW2hyZWY9XCInICsgd2luZG93LmxvY2F0aW9uLmhhc2ggKyAnXCJdJyk7XG59O1xuXG53aW5kb3cub25sb2FkID0gKCkgPT4ge1xuXG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoKSB7XG4gICAgICAgIHNjcm9sbFRvRWxlbWVudCgnYVtocmVmPVwiJyArIHdpbmRvdy5sb2NhdGlvbi5oYXNoICsgJ1wiXScpO1xuICAgIH1cbn07XG5cbnNldEFjdGl2ZU5hdkl0ZW1zKCk7XG5uZXdzbGV0dGVyU3VibWl0KCk7XG5kb2NzTmF2TW9iaWxlQWN0aW9ucygpO1xuIiwiKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcblx0dHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCkgOlxuXHR0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoZmFjdG9yeSkgOlxuXHQoZ2xvYmFsLm5hdmJhciA9IGZhY3RvcnkoKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoKSB7ICd1c2Ugc3RyaWN0JztcblxudmFyIHNlbGVjdGVkQ2xhc3MgPSAnbmF2YmFyLWFjdGl2ZSc7XG52YXIgc3VwcG9ydHNQYXNzaXZlID0gZmFsc2U7XG5cbnRyeSB7XG4gIHZhciBvcHRzID0gT2JqZWN0LmRlZmluZVByb3BlcnR5KHt9LCAncGFzc2l2ZScsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHN1cHBvcnRzUGFzc2l2ZSA9IHRydWU7XG4gICAgfVxuICB9KTtcblxuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcigndGVzdCcsIG51bGwsIG9wdHMpO1xufSBjYXRjaCAoZSkge31cblxuLy8gSXQnZCBiZSBuaWNlciB0byB1c2UgdGhlIGNsYXNzTGlzdCBBUEksIGJ1dCBJIHByZWZlciB0byBzdXBwb3J0IG1vcmUgYnJvd3NlcnMuIFJlbW92ZSBhIGNsYXNzXG4vLyBpZiBpdCdzIGZvdW5kIG9uIHRoZSBlbGVtZW50LlxuZnVuY3Rpb24gcmVtb3ZlQ2xhc3NJZk5lZWRlZChlbCkge1xuICAvLyBJZiB0aGUgZWxlbWVudCBoYXMgbm8gY2xhc3NlcyB0aGVuIHdlIGNhbiB0YWtlIGEgc2hvcnRjdXQuXG4gIGlmICghZWwuY2xhc3NOYW1lKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIHNwbGl0Q2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lLnNwbGl0KCcgJyk7XG4gIHZhciByZXBsYWNlbWVudENsYXNzTmFtZSA9ICcnO1xuXG4gIC8vIEFzc2VtYmxlIGEgc3RyaW5nIG9mIG90aGVyIGNsYXNzIG5hbWVzLlxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gc3BsaXRDbGFzc05hbWUubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICB2YXIgY2xhc3NOYW1lID0gc3BsaXRDbGFzc05hbWVbaV07XG5cbiAgICBpZiAoY2xhc3NOYW1lICE9PSBzZWxlY3RlZENsYXNzKSB7XG4gICAgICByZXBsYWNlbWVudENsYXNzTmFtZSArPSByZXBsYWNlbWVudENsYXNzTmFtZSA9PT0gJycgPyBjbGFzc05hbWUgOiAnICcgKyBjbGFzc05hbWU7XG4gICAgfVxuICB9XG5cbiAgLy8gSWYgdGhlIGxlbmd0aCBvZiB0aGUgY2xhc3NOYW1lIGRpZmZlcnMsIHRoZW4gaXQgaGFkIGFuIHNlbGVjdGVkIGNsYXNzIGluIGFuZCBuZWVkcyB0byBiZVxuICAvLyB1cGRhdGVkLlxuICBpZiAocmVwbGFjZW1lbnRDbGFzc05hbWUubGVuZ3RoICE9PSBlbC5jbGFzc05hbWUubGVuZ3RoKSB7XG4gICAgZWwuY2xhc3NOYW1lID0gcmVwbGFjZW1lbnRDbGFzc05hbWU7XG4gIH1cbn1cblxuLy8gQWRkIGEgY2xhc3MgdG8gYW4gZWxlbWVudCBpZiBpdCBpcyBub3QgZm91bmQuXG5mdW5jdGlvbiBhZGRDbGFzc0lmTmVlZGVkKGVsKSB7XG4gIC8vIElmIHRoZSBlbGVtZW50IGhhcyBubyBjbGFzc2VzIHRoZW4gd2UgY2FuIHRha2UgYSBzaG9ydGN1dC5cbiAgaWYgKCFlbC5jbGFzc05hbWUpIHtcbiAgICBlbC5jbGFzc05hbWUgPSBzZWxlY3RlZENsYXNzO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBzcGxpdENsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZS5zcGxpdCgnICcpO1xuXG4gIC8vIElmIGFueSBvZiB0aGUgY2xhc3MgbmFtZXMgbWF0Y2ggdGhlIHNlbGVjdGVkIGNsYXNzIHRoZW4gcmV0dXJuLlxuICBmb3IgKHZhciBpID0gMCwgbGVuID0gc3BsaXRDbGFzc05hbWUubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBpZiAoc3BsaXRDbGFzc05hbWVbaV0gPT09IHNlbGVjdGVkQ2xhc3MpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICAvLyBJZiB3ZSBnb3QgaGVyZSB0aGVuIHRoZSBzZWxlY3RlZCBjbGFzcyBuZWVkcyB0byBiZSBhZGRlZCB0byBhbiBleGlzdGluZyBjbGFzc05hbWUuXG4gIGVsLmNsYXNzTmFtZSArPSAnICcgKyBzZWxlY3RlZENsYXNzO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVBbmRBcHBlbmRMaXN0SXRlbXMobmF2TGlzdCwgZWxlbWVudExpc3QsIG1ha2VOYXZMaXN0SXRlbSkge1xuICB2YXIgcGFpcnMgPSBbXTtcbiAgdmFyIGVsZW1lbnQ7XG4gIHZhciBsaTtcblxuICAvLyBDcmVhdGUgbGlzdCBlbGVtZW50c1xuICBmb3IgKHZhciBpID0gMCwgbGVuID0gZWxlbWVudExpc3QubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICBlbGVtZW50ID0gZWxlbWVudExpc3RbaV07XG4gICAgbGkgPSBtYWtlTmF2TGlzdEl0ZW0oZWxlbWVudCk7XG5cbiAgICBuYXZMaXN0LmFwcGVuZENoaWxkKGxpKTtcblxuICAgIHBhaXJzLnB1c2goeyBlbGVtZW50OiBlbGVtZW50LCBuYXZFbGVtZW50OiBsaSB9KTtcbiAgfVxuXG4gIHJldHVybiBwYWlycztcbn1cblxuZnVuY3Rpb24gbWFrZUhhbmRsZVNjcm9sbChwYWlycywgZGVib3VuY2VUaW1lKSB7XG4gIGZ1bmN0aW9uIGhhbmRsZVNjcm9sbCgpIHtcbiAgICB2YXIgZnJvbnRSdW5uZXIgPSB7IG5hdkVsZW1lbnQ6IHt9IH07XG4gICAgdmFyIGNsb3Nlc3REaXN0ID0gSW5maW5pdHk7XG4gICAgdmFyIHBhaXI7XG4gICAgdmFyIGFic0Rpc3Q7XG5cbiAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gcGFpcnMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIHBhaXIgPSBwYWlyc1tpXTtcbiAgICAgIGFic0Rpc3QgPSBNYXRoLmFicyhwYWlyLmVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkudG9wKTtcblxuICAgICAgLy8gSWYgdGhpcyBlbGVtZW50IGlzIG5vdCB0aGUgZnJvbnQgcnVubmVyIGZvciB0b3AsIGRlYWN0aXZhdGUgaXQuXG4gICAgICBpZiAoYWJzRGlzdCA+IGNsb3Nlc3REaXN0KSB7XG4gICAgICAgIHJlbW92ZUNsYXNzSWZOZWVkZWQocGFpci5uYXZFbGVtZW50KTtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoaXMgaXMgYSBuZXcgZnJvbnQgcnVubmVyLCBkZWFjdGl2YXRlIHRoZSBwcmV2aW91cyBmcm9udCBydW5uZXIuXG4gICAgICByZW1vdmVDbGFzc0lmTmVlZGVkKGZyb250UnVubmVyKTtcblxuICAgICAgZnJvbnRSdW5uZXIgPSBwYWlyLm5hdkVsZW1lbnQ7XG4gICAgICBjbG9zZXN0RGlzdCA9IGFic0Rpc3Q7XG4gICAgfVxuXG4gICAgLy8gQWxsIG90aGVyIGVsZW1lbnRzIGhhdmUgYmVlbiBkZWFjdGl2YXRlZCwgYW5kIG5vdyB0aGUgdG9wIGVsZW1lbnQgaXMga25vd24gYW5kIGNhbiBiZSBzZXRcbiAgICAvLyBhcyBhY3RpdmUuXG4gICAgYWRkQ2xhc3NJZk5lZWRlZChmcm9udFJ1bm5lciwgc2VsZWN0ZWRDbGFzcyk7XG4gIH1cblxuICAvLyBUaGUgZGVmYXVsdCBiZWhhdmlvdXIgaXMgbm8gZGVib3VuY2UuXG4gIGlmICh0eXBlb2YgZGVib3VuY2VUaW1lICE9PSAnbnVtYmVyJyB8fCBpc05hTihkZWJvdW5jZVRpbWUpKSB7XG4gICAgcmV0dXJuIGhhbmRsZVNjcm9sbDtcbiAgfVxuXG4gIHZhciB0aW1lb3V0O1xuXG4gIGZ1bmN0aW9uIG51bGxpZnlUaW1lb3V0KCkge1xuICAgIHRpbWVvdXQgPSBudWxsO1xuICB9XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIGRlYm91bmNlZEhhbmRsZVNjcm9sbCgpIHtcbiAgICBpZiAodGltZW91dCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEltbWVkaWF0ZWx5IHVzZSBoYW5kbGVTY3JvbGwgdG8gY2FsY3VsYXRlLlxuICAgIGhhbmRsZVNjcm9sbCgpO1xuXG4gICAgLy8gTm8gZnVydGhlciBjYWxscyB0byBoYW5kbGVTY3JvbGwgdW50aWwgZGVib3VuY2VUaW1lIGhhcyBlbGFwc2VkLlxuICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KG51bGxpZnlUaW1lb3V0LCBkZWJvdW5jZVRpbWUpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBhZGRTY3JvbGxMaXN0ZW5lcih0YXJnZXQsIGhhbmRsZVNjcm9sbCkge1xuICBmdW5jdGlvbiBzY3JvbGxIYW5kbGVXcmFwcGVyKGV2dCkge1xuICAgIGlmIChldnQudGFyZ2V0ID09PSB0YXJnZXQpIHtcbiAgICAgIGhhbmRsZVNjcm9sbCgpO1xuICAgIH1cbiAgfVxuXG4gIGlmICh0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcikge1xuICAgIHRhcmdldC5hZGRFdmVudExpc3RlbmVyKCdzY3JvbGwnLCBzY3JvbGxIYW5kbGVXcmFwcGVyLCBzdXBwb3J0c1Bhc3NpdmUgPyB7IHBhc3NpdmU6IHRydWUgfSA6IGZhbHNlKTtcbiAgfSBlbHNlIGlmICh0YXJnZXQuYXR0YWNoRXZlbnQpIHtcbiAgICB0YXJnZXQuYXR0YWNoRXZlbnQoJ29uc2Nyb2xsJywgc2Nyb2xsSGFuZGxlV3JhcHBlcik7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIGJyb3dzZXIgZG9lcyBub3Qgc3VwcG9ydCBhZGRFdmVudExpc3RlbmVyIG9yIGF0dGFjaEV2ZW50LicpO1xuICB9XG5cbiAgLy8gVG8gY2FsY3VsYXRlIHRoZSBpbml0aWFsIGFjdGl2ZSBsaXN0IGVsZW1lbnQuXG4gIGhhbmRsZVNjcm9sbCgpO1xufVxuXG5mdW5jdGlvbiBtYWtlTmF2KG9wdGlvbnMpIHtcbiAgaWYgKCFvcHRpb25zIHx8ICFvcHRpb25zLmVsZW1lbnRMaXN0IHx8ICFvcHRpb25zLm1ha2VOYXZMaXN0SXRlbSkge1xuICAgIHRocm93IG5ldyBFcnJvcignT3B0aW9ucyBvYmplY3Qgd2l0aCBlbGVtZW50TGlzdCBhbmQgbWFrZU5hdkxpc3RJdGVtIG11c3QgYmUgcHJvdmlkZWQuJyk7XG4gIH1cblxuICB2YXIgbmF2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChvcHRpb25zLnRhZ05hbWUgfHwgJ25hdicpO1xuICB2YXIgbmF2TGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XG5cbiAgLy8gVGhlIHRhcmdldCBkZWZhdWx0cyB0byB3aW5kb3cuXG4gIHZhciB0YXJnZXQgPSBvcHRpb25zLnRhcmdldCB8fCBkb2N1bWVudDtcblxuICAvLyBDcmVhdGUgbGlzdCBlbGVtZW50c1xuICB2YXIgcGFpcnMgPSBjcmVhdGVBbmRBcHBlbmRMaXN0SXRlbXMobmF2TGlzdCwgb3B0aW9ucy5lbGVtZW50TGlzdCwgb3B0aW9ucy5tYWtlTmF2TGlzdEl0ZW0pO1xuXG4gIC8vIFdoZW5ldmVyIHRoZSB3aW5kb3cgaXMgc2Nyb2xsZWQsIHJlY2FsY3VsYXRlIHRoZSBhY3RpdmUgbGlzdCBlbGVtZW50LiBDb21wYXRpYmxlIHdpdGggb2xkZXJcbiAgLy8gdmVyc2lvbnMgb2YgSUUuXG4gIGFkZFNjcm9sbExpc3RlbmVyKHRhcmdldCwgbWFrZUhhbmRsZVNjcm9sbChwYWlycywgb3B0aW9ucy5kZWJvdW5jZVRpbWUpKTtcblxuICBuYXYuYXBwZW5kQ2hpbGQobmF2TGlzdCk7XG5cbiAgcmV0dXJuIG5hdjtcbn1cblxucmV0dXJuIG1ha2VOYXY7XG5cbn0pKSk7XG4iXX0=
