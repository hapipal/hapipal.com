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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvcHVibGljL2pzL2RvY3MtbmF2LmpzIiwibGliL3B1YmxpYy9qcy9tYWluLmpzIiwibm9kZV9tb2R1bGVzL25hdmJhci9uYXZiYXIudW1kLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUFFQSxJQUFNLFNBQVMsUUFBUSxRQUFSLENBQWY7O0FBRUEsSUFBTSxZQUFZLEVBQWxCOztBQUVBLFFBQVEsSUFBUixHQUFlLFVBQUMsU0FBRCxFQUFZLEtBQVosRUFBc0I7O0FBRWpDLFFBQUksQ0FBQyxTQUFMLEVBQWdCO0FBQ1o7QUFDSDs7QUFFRCxRQUFJLENBQUMsS0FBTCxFQUFZO0FBQ1IsY0FBTSxJQUFJLEtBQUosQ0FBVSxtRUFBVixDQUFOO0FBQ0g7O0FBRUQsUUFBTSxTQUFTLE9BQU87QUFDbEIsaUJBQVMsTUFBTSxPQURHO0FBRWxCLHFCQUFhLFVBQVUsZ0JBQVYsQ0FBMkIsd0JBQTNCLENBRks7QUFHbEIseUJBQWlCLHlCQUFDLEVBQUQsRUFBUTs7QUFFckIsZ0JBQU0sT0FBTyxHQUFHLFdBQUgsQ0FBZSxJQUFmLEVBQWI7O0FBRUEsZ0JBQU0sT0FBTyxVQUFVLE1BQVYsQ0FDVCxVQUFVLElBQVYsQ0FBZSxJQUFmLEVBQXFCLEdBQUcsT0FBSCxDQUFXLE9BQVgsQ0FBbUIsR0FBbkIsRUFBd0IsU0FBeEIsQ0FBckIsQ0FEUyxDQUFiOztBQUlBLGlCQUFLLGdCQUFMLENBQXNCLE9BQXRCLEVBQStCO0FBQUEsdUJBQU0sR0FBRyxjQUFILENBQWtCLEVBQUUsT0FBTyxPQUFULEVBQWtCLFVBQVUsUUFBNUIsRUFBbEIsQ0FBTjtBQUFBLGFBQS9COztBQUVBLG1CQUFPLElBQVA7QUFDSDtBQWRpQixLQUFQLENBQWY7O0FBaUJBLFdBQU8sTUFBTSxVQUFOLENBQWlCLFlBQWpCLENBQThCLE1BQTlCLEVBQXNDLEtBQXRDLENBQVA7QUFDSCxDQTVCRDs7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Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgZG9jdW1lbnQgKi9cblxuY29uc3QgTmF2YmFyID0gcmVxdWlyZSgnbmF2YmFyJyk7XG5cbmNvbnN0IGludGVybmFscyA9IHt9O1xuXG5leHBvcnRzLmluaXQgPSAoY29udGVudEVsLCBuYXZFbCkgPT4ge1xuXG4gICAgaWYgKCFjb250ZW50RWwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghbmF2RWwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEb2NzIG5hdmlnYXRpb24gY29udGVudCBlbGVtZW50IGV4aXN0cywgYnV0IG5vdCB0aGUgbmF2IGVsZW1lbnRzLicpO1xuICAgIH1cblxuICAgIGNvbnN0IG5hdmJhciA9IE5hdmJhcih7XG4gICAgICAgIHRhZ05hbWU6IG5hdkVsLnRhZ05hbWUsXG4gICAgICAgIGVsZW1lbnRMaXN0OiBjb250ZW50RWwucXVlcnlTZWxlY3RvckFsbCgnaDEsIGgyLCBoMywgaDQsIGg1LCBoNicpLFxuICAgICAgICBtYWtlTmF2TGlzdEl0ZW06IChlbCkgPT4ge1xuXG4gICAgICAgICAgICBjb25zdCB0ZXh0ID0gZWwudGV4dENvbnRlbnQudHJpbSgpO1xuXG4gICAgICAgICAgICBjb25zdCBpdGVtID0gaW50ZXJuYWxzLnJlbmRlcihcbiAgICAgICAgICAgICAgICBpbnRlcm5hbHMuaXRlbSh0ZXh0LCBlbC50YWdOYW1lLnJlcGxhY2UoJ0gnLCAnaW5kZW50LScpKVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaXRlbS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsICgpID0+IGVsLnNjcm9sbEludG9WaWV3KHsgYmxvY2s6ICdzdGFydCcsIGJlaGF2aW9yOiAnc21vb3RoJyB9KSk7XG5cbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gbmF2RWwucGFyZW50Tm9kZS5yZXBsYWNlQ2hpbGQobmF2YmFyLCBuYXZFbCk7XG59O1xuXG5pbnRlcm5hbHMuaXRlbSA9ICh0ZXh0LCBpbmRlbnQpID0+IGA8ZGl2IGNsYXNzPVwibmF2LWl0ZW0gJHtpbmRlbnR9XCI+JHt0ZXh0fTwvZGl2PmA7XG5cbmludGVybmFscy5yZW5kZXIgPSAoaHRtbCkgPT4ge1xuXG4gICAgY29uc3Qgd3JhcHBlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHdyYXBwZXIuaW5uZXJIVE1MID0gaHRtbDtcblxuICAgIHJldHVybiB3cmFwcGVyLmZpcnN0Q2hpbGQ7XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuLyogZ2xvYmFsIGRvY3VtZW50LCB3aW5kb3csIFhNTEh0dHBSZXF1ZXN0ICovXG5cbmNvbnN0IERvY3NOYXYgPSByZXF1aXJlKCcuL2RvY3MtbmF2Jyk7XG5cbkRvY3NOYXYuaW5pdChcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZG9jcy1kZXRhaWwgLndyYXBwZXInKSxcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZG9jcy1kZXRhaWwgLm5hdi10YXJnZXQnKVxuKTtcblxuY29uc3Qgc2V0QWN0aXZlTmF2SXRlbXMgPSAoKSA9PiB7XG5cbiAgICBjb25zdCBsaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbmF2X19pdGVtJyk7XG4gICAgY29uc3QgY3VycmVudFBhZ2UgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7ICsraSkge1xuICAgICAgICBjb25zdCBpdGVtID0gbGlzdFtpXTtcbiAgICAgICAgaWYgKGl0ZW0uaHJlZiA9PT0gY3VycmVudFBhZ2UpIHtcbiAgICAgICAgICAgIGl0ZW0uY2xhc3NMaXN0LmFkZCgnbmF2X19pdGVtLS1hY3RpdmUnKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmNvbnN0IG5ld3NsZXR0ZXJTdWJtaXQgPSAoKSA9PiB7XG5cbiAgICBjb25zdCBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ld3NsZXR0ZXJGb3JtJyk7XG5cbiAgICBpZiAoIWZvcm0pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvcm0ub25zdWJtaXQgPSAoZSkgPT4ge1xuXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBjb25zdCBlbWFpbElucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ld3NsZXR0ZXJFbWFpbCcpO1xuICAgICAgICBjb25zdCBtZXNzYWdlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ld3NsZXR0ZXJNZXNzYWdlJyk7XG5cbiAgICAgICAgaWYgKGVtYWlsSW5wdXQudmFsaWRpdHkudmFsaWQpIHtcbiAgICAgICAgICAgIGNvbnN0IHBheWxvYWQgPSBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgZW1haWw6IGVtYWlsSW5wdXQudmFsdWVcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgICAgICB4aHIub3BlbignUE9TVCcsICcvbWFpbGNoaW1wJyk7XG4gICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcbiAgICAgICAgICAgIHhoci5vbmxvYWQgPSAoKSA9PiB7XG5cbiAgICAgICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gJ1lvdXIgZW1haWwgYWRkcmVzczogJyArIGVtYWlsSW5wdXQudmFsdWUgKyAnLCBpcyBub3cgc2lnbmVkIHVwLiBUaGFua3MgcGFsISc7XG4gICAgICAgICAgICAgICAgICAgIGVtYWlsSW5wdXQudmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBmb3JtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2UgaWYgKHhoci5zdGF0dXMgPT09IDQwMCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLmlubmVySFRNTCA9ICdUaGUgZW1haWwgYWRkcmVzczogJyArIGVtYWlsSW5wdXQudmFsdWUgKyAnIGlzIGVpdGhlciBpbnZhbGlkLCBvciBtYXkgYWxyZWFkeSBiZSBzdWJzY3JpYmVkLic7XG4gICAgICAgICAgICAgICAgICAgIGVtYWlsSW5wdXQudmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBlbWFpbElucHV0LmNsYXNzTGlzdC5hZGQoJ25ld3NsZXR0ZXJfX2lucHV0LS1pbnZhbGlkJyk7XG4gICAgICAgICAgICAgICAgICAgIGZvcm0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLmlubmVySFRNTCA9ICdUaGUgZW1haWwgYWRkcmVzczogJyArIGVtYWlsSW5wdXQudmFsdWUgKyAnIG1heSBiZSBpbnZhbGlkLCBvciB5b3VyIG5ldHdvcmsgY29ubmVjdGlvbiBpcyBpbmFjdGl2ZSc7XG4gICAgICAgICAgICAgICAgICAgIGVtYWlsSW5wdXQudmFsdWUgPSBudWxsO1xuICAgICAgICAgICAgICAgICAgICBlbWFpbElucHV0LmNsYXNzTGlzdC5hZGQoJ25ld3NsZXR0ZXJfX2lucHV0LS1pbnZhbGlkJyk7XG4gICAgICAgICAgICAgICAgICAgIGZvcm0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHhoci5zZW5kKHBheWxvYWQpO1xuICAgICAgICB9XG4gICAgfTtcbn07XG5cbmNvbnN0IHNjcm9sbFRvRWxlbWVudCA9IChzZWxlY3RvcikgPT4ge1xuXG4gICAgY29uc3QgdG9wID0ge1xuICAgICAgICBib3g6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3Ioc2VsZWN0b3IpLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCxcbiAgICAgICAgc2Nyb2xsOiB3aW5kb3cucGFnZVlPZmZzZXQgfHwgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnNjcm9sbFRvcCB8fCBkb2N1bWVudC5ib2R5LnNjcm9sbFRvcCxcbiAgICAgICAgY2xpZW50OiBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuY2xpZW50VG9wIHx8IGRvY3VtZW50LmJvZHkuY2xpZW50VG9wIHx8IDBcbiAgICB9O1xuICAgIHdpbmRvdy5zY3JvbGxUbygwLCBNYXRoLnJvdW5kKHRvcC5ib3ggKyB0b3Auc2Nyb2xsIC0gdG9wLmNsaWVudCkpO1xufTtcblxuY29uc3QgZG9jc05hdk1vYmlsZUFjdGlvbnMgPSAoKSA9PiB7XG5cbiAgICBjb25zdCBtZW51QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm5hdi1pdGVtX19sZWZ0Jyk7XG4gICAgY29uc3QgdG9wQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm5hdi1pdGVtX19yaWdodCcpO1xuICAgIGNvbnN0IGRvY3NOYXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZG9jcy1uYXYnKTtcblxuICAgIGNvbnN0IGRvY3NOYXZJc09wZW4gPSAoKSA9PiBkb2NzTmF2LmNsYXNzTGlzdC5jb250YWlucygnZG9jcy1uYXYtLW9wZW4nKTtcbiAgICBjb25zdCB0b2dnbGVEb2NzTmF2ID0gKCkgPT4ge1xuXG4gICAgICAgIGlmIChkb2NzTmF2SXNPcGVuKCkpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnYm9keS0tbm9zY3JvbGwnKTtcbiAgICAgICAgICAgIGRvY3NOYXYuY2xhc3NMaXN0LnJlbW92ZSgnZG9jcy1uYXYtLW9wZW4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnYm9keS0tbm9zY3JvbGwnKTtcbiAgICAgICAgZG9jc05hdi5jbGFzc0xpc3QuYWRkKCdkb2NzLW5hdi0tb3BlbicpO1xuICAgIH07XG5cbiAgICBtZW51QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdG9nZ2xlRG9jc05hdik7XG4gICAgdG9wQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuXG4gICAgICAgIGlmIChkb2NzTmF2SXNPcGVuKCkpIHtcbiAgICAgICAgICAgIHRvZ2dsZURvY3NOYXYoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB3aW5kb3cuc2Nyb2xsVG8oMCwwKTtcbiAgICB9KTtcbn07XG5cbndpbmRvdy5vbmhhc2hjaGFuZ2UgPSAoKSA9PiB7XG5cbiAgICBzY3JvbGxUb0VsZW1lbnQoJ2FbaHJlZj1cIicgKyB3aW5kb3cubG9jYXRpb24uaGFzaCArICdcIl0nKTtcbn07XG5cbndpbmRvdy5vbmxvYWQgPSAoKSA9PiB7XG5cbiAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2gpIHtcbiAgICAgICAgc2Nyb2xsVG9FbGVtZW50KCdhW2hyZWY9XCInICsgd2luZG93LmxvY2F0aW9uLmhhc2ggKyAnXCJdJyk7XG4gICAgfVxufTtcblxuc2V0QWN0aXZlTmF2SXRlbXMoKTtcbm5ld3NsZXR0ZXJTdWJtaXQoKTtcbmRvY3NOYXZNb2JpbGVBY3Rpb25zKCk7XG4iLCIoZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuXHR0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKSA6XG5cdHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShmYWN0b3J5KSA6XG5cdChnbG9iYWwubmF2YmFyID0gZmFjdG9yeSgpKTtcbn0odGhpcywgKGZ1bmN0aW9uICgpIHsgJ3VzZSBzdHJpY3QnO1xuXG52YXIgc2VsZWN0ZWRDbGFzcyA9ICduYXZiYXItYWN0aXZlJztcbnZhciBzdXBwb3J0c1Bhc3NpdmUgPSBmYWxzZTtcblxudHJ5IHtcbiAgdmFyIG9wdHMgPSBPYmplY3QuZGVmaW5lUHJvcGVydHkoe30sICdwYXNzaXZlJywge1xuICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgc3VwcG9ydHNQYXNzaXZlID0gdHJ1ZTtcbiAgICB9XG4gIH0pO1xuXG4gIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKCd0ZXN0JywgbnVsbCwgb3B0cyk7XG59IGNhdGNoIChlKSB7fVxuXG4vLyBJdCdkIGJlIG5pY2VyIHRvIHVzZSB0aGUgY2xhc3NMaXN0IEFQSSwgYnV0IEkgcHJlZmVyIHRvIHN1cHBvcnQgbW9yZSBicm93c2Vycy4gUmVtb3ZlIGEgY2xhc3Ncbi8vIGlmIGl0J3MgZm91bmQgb24gdGhlIGVsZW1lbnQuXG5mdW5jdGlvbiByZW1vdmVDbGFzc0lmTmVlZGVkKGVsKSB7XG4gIC8vIElmIHRoZSBlbGVtZW50IGhhcyBubyBjbGFzc2VzIHRoZW4gd2UgY2FuIHRha2UgYSBzaG9ydGN1dC5cbiAgaWYgKCFlbC5jbGFzc05hbWUpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgc3BsaXRDbGFzc05hbWUgPSBlbC5jbGFzc05hbWUuc3BsaXQoJyAnKTtcbiAgdmFyIHJlcGxhY2VtZW50Q2xhc3NOYW1lID0gJyc7XG5cbiAgLy8gQXNzZW1ibGUgYSBzdHJpbmcgb2Ygb3RoZXIgY2xhc3MgbmFtZXMuXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBzcGxpdENsYXNzTmFtZS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIHZhciBjbGFzc05hbWUgPSBzcGxpdENsYXNzTmFtZVtpXTtcblxuICAgIGlmIChjbGFzc05hbWUgIT09IHNlbGVjdGVkQ2xhc3MpIHtcbiAgICAgIHJlcGxhY2VtZW50Q2xhc3NOYW1lICs9IHJlcGxhY2VtZW50Q2xhc3NOYW1lID09PSAnJyA/IGNsYXNzTmFtZSA6ICcgJyArIGNsYXNzTmFtZTtcbiAgICB9XG4gIH1cblxuICAvLyBJZiB0aGUgbGVuZ3RoIG9mIHRoZSBjbGFzc05hbWUgZGlmZmVycywgdGhlbiBpdCBoYWQgYW4gc2VsZWN0ZWQgY2xhc3MgaW4gYW5kIG5lZWRzIHRvIGJlXG4gIC8vIHVwZGF0ZWQuXG4gIGlmIChyZXBsYWNlbWVudENsYXNzTmFtZS5sZW5ndGggIT09IGVsLmNsYXNzTmFtZS5sZW5ndGgpIHtcbiAgICBlbC5jbGFzc05hbWUgPSByZXBsYWNlbWVudENsYXNzTmFtZTtcbiAgfVxufVxuXG4vLyBBZGQgYSBjbGFzcyB0byBhbiBlbGVtZW50IGlmIGl0IGlzIG5vdCBmb3VuZC5cbmZ1bmN0aW9uIGFkZENsYXNzSWZOZWVkZWQoZWwpIHtcbiAgLy8gSWYgdGhlIGVsZW1lbnQgaGFzIG5vIGNsYXNzZXMgdGhlbiB3ZSBjYW4gdGFrZSBhIHNob3J0Y3V0LlxuICBpZiAoIWVsLmNsYXNzTmFtZSkge1xuICAgIGVsLmNsYXNzTmFtZSA9IHNlbGVjdGVkQ2xhc3M7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIHNwbGl0Q2xhc3NOYW1lID0gZWwuY2xhc3NOYW1lLnNwbGl0KCcgJyk7XG5cbiAgLy8gSWYgYW55IG9mIHRoZSBjbGFzcyBuYW1lcyBtYXRjaCB0aGUgc2VsZWN0ZWQgY2xhc3MgdGhlbiByZXR1cm4uXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBzcGxpdENsYXNzTmFtZS5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGlmIChzcGxpdENsYXNzTmFtZVtpXSA9PT0gc2VsZWN0ZWRDbGFzcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgfVxuXG4gIC8vIElmIHdlIGdvdCBoZXJlIHRoZW4gdGhlIHNlbGVjdGVkIGNsYXNzIG5lZWRzIHRvIGJlIGFkZGVkIHRvIGFuIGV4aXN0aW5nIGNsYXNzTmFtZS5cbiAgZWwuY2xhc3NOYW1lICs9ICcgJyArIHNlbGVjdGVkQ2xhc3M7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUFuZEFwcGVuZExpc3RJdGVtcyhuYXZMaXN0LCBlbGVtZW50TGlzdCwgbWFrZU5hdkxpc3RJdGVtKSB7XG4gIHZhciBwYWlycyA9IFtdO1xuICB2YXIgZWxlbWVudDtcbiAgdmFyIGxpO1xuXG4gIC8vIENyZWF0ZSBsaXN0IGVsZW1lbnRzXG4gIGZvciAodmFyIGkgPSAwLCBsZW4gPSBlbGVtZW50TGlzdC5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgIGVsZW1lbnQgPSBlbGVtZW50TGlzdFtpXTtcbiAgICBsaSA9IG1ha2VOYXZMaXN0SXRlbShlbGVtZW50KTtcblxuICAgIG5hdkxpc3QuYXBwZW5kQ2hpbGQobGkpO1xuXG4gICAgcGFpcnMucHVzaCh7IGVsZW1lbnQ6IGVsZW1lbnQsIG5hdkVsZW1lbnQ6IGxpIH0pO1xuICB9XG5cbiAgcmV0dXJuIHBhaXJzO1xufVxuXG5mdW5jdGlvbiBtYWtlSGFuZGxlU2Nyb2xsKHBhaXJzLCBkZWJvdW5jZVRpbWUpIHtcbiAgZnVuY3Rpb24gaGFuZGxlU2Nyb2xsKCkge1xuICAgIHZhciBmcm9udFJ1bm5lciA9IHsgbmF2RWxlbWVudDoge30gfTtcbiAgICB2YXIgY2xvc2VzdERpc3QgPSBJbmZpbml0eTtcbiAgICB2YXIgcGFpcjtcbiAgICB2YXIgYWJzRGlzdDtcblxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBwYWlycy5sZW5ndGg7IGkgPCBsZW47IGkrKykge1xuICAgICAgcGFpciA9IHBhaXJzW2ldO1xuICAgICAgYWJzRGlzdCA9IE1hdGguYWJzKHBhaXIuZWxlbWVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3ApO1xuXG4gICAgICAvLyBJZiB0aGlzIGVsZW1lbnQgaXMgbm90IHRoZSBmcm9udCBydW5uZXIgZm9yIHRvcCwgZGVhY3RpdmF0ZSBpdC5cbiAgICAgIGlmIChhYnNEaXN0ID4gY2xvc2VzdERpc3QpIHtcbiAgICAgICAgcmVtb3ZlQ2xhc3NJZk5lZWRlZChwYWlyLm5hdkVsZW1lbnQpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhpcyBpcyBhIG5ldyBmcm9udCBydW5uZXIsIGRlYWN0aXZhdGUgdGhlIHByZXZpb3VzIGZyb250IHJ1bm5lci5cbiAgICAgIHJlbW92ZUNsYXNzSWZOZWVkZWQoZnJvbnRSdW5uZXIpO1xuXG4gICAgICBmcm9udFJ1bm5lciA9IHBhaXIubmF2RWxlbWVudDtcbiAgICAgIGNsb3Nlc3REaXN0ID0gYWJzRGlzdDtcbiAgICB9XG5cbiAgICAvLyBBbGwgb3RoZXIgZWxlbWVudHMgaGF2ZSBiZWVuIGRlYWN0aXZhdGVkLCBhbmQgbm93IHRoZSB0b3AgZWxlbWVudCBpcyBrbm93biBhbmQgY2FuIGJlIHNldFxuICAgIC8vIGFzIGFjdGl2ZS5cbiAgICBhZGRDbGFzc0lmTmVlZGVkKGZyb250UnVubmVyLCBzZWxlY3RlZENsYXNzKTtcbiAgfVxuXG4gIC8vIFRoZSBkZWZhdWx0IGJlaGF2aW91ciBpcyBubyBkZWJvdW5jZS5cbiAgaWYgKHR5cGVvZiBkZWJvdW5jZVRpbWUgIT09ICdudW1iZXInIHx8IGlzTmFOKGRlYm91bmNlVGltZSkpIHtcbiAgICByZXR1cm4gaGFuZGxlU2Nyb2xsO1xuICB9XG5cbiAgdmFyIHRpbWVvdXQ7XG5cbiAgZnVuY3Rpb24gbnVsbGlmeVRpbWVvdXQoKSB7XG4gICAgdGltZW91dCA9IG51bGw7XG4gIH1cblxuICByZXR1cm4gZnVuY3Rpb24gZGVib3VuY2VkSGFuZGxlU2Nyb2xsKCkge1xuICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSW1tZWRpYXRlbHkgdXNlIGhhbmRsZVNjcm9sbCB0byBjYWxjdWxhdGUuXG4gICAgaGFuZGxlU2Nyb2xsKCk7XG5cbiAgICAvLyBObyBmdXJ0aGVyIGNhbGxzIHRvIGhhbmRsZVNjcm9sbCB1bnRpbCBkZWJvdW5jZVRpbWUgaGFzIGVsYXBzZWQuXG4gICAgdGltZW91dCA9IHNldFRpbWVvdXQobnVsbGlmeVRpbWVvdXQsIGRlYm91bmNlVGltZSk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGFkZFNjcm9sbExpc3RlbmVyKHRhcmdldCwgaGFuZGxlU2Nyb2xsKSB7XG4gIGZ1bmN0aW9uIHNjcm9sbEhhbmRsZVdyYXBwZXIoZXZ0KSB7XG4gICAgaWYgKGV2dC50YXJnZXQgPT09IHRhcmdldCkge1xuICAgICAgaGFuZGxlU2Nyb2xsKCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHRhcmdldC5hZGRFdmVudExpc3RlbmVyKSB7XG4gICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHNjcm9sbEhhbmRsZVdyYXBwZXIsIHN1cHBvcnRzUGFzc2l2ZSA/IHsgcGFzc2l2ZTogdHJ1ZSB9IDogZmFsc2UpO1xuICB9IGVsc2UgaWYgKHRhcmdldC5hdHRhY2hFdmVudCkge1xuICAgIHRhcmdldC5hdHRhY2hFdmVudCgnb25zY3JvbGwnLCBzY3JvbGxIYW5kbGVXcmFwcGVyKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoaXMgYnJvd3NlciBkb2VzIG5vdCBzdXBwb3J0IGFkZEV2ZW50TGlzdGVuZXIgb3IgYXR0YWNoRXZlbnQuJyk7XG4gIH1cblxuICAvLyBUbyBjYWxjdWxhdGUgdGhlIGluaXRpYWwgYWN0aXZlIGxpc3QgZWxlbWVudC5cbiAgaGFuZGxlU2Nyb2xsKCk7XG59XG5cbmZ1bmN0aW9uIG1ha2VOYXYob3B0aW9ucykge1xuICBpZiAoIW9wdGlvbnMgfHwgIW9wdGlvbnMuZWxlbWVudExpc3QgfHwgIW9wdGlvbnMubWFrZU5hdkxpc3RJdGVtKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdPcHRpb25zIG9iamVjdCB3aXRoIGVsZW1lbnRMaXN0IGFuZCBtYWtlTmF2TGlzdEl0ZW0gbXVzdCBiZSBwcm92aWRlZC4nKTtcbiAgfVxuXG4gIHZhciBuYXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KG9wdGlvbnMudGFnTmFtZSB8fCAnbmF2Jyk7XG4gIHZhciBuYXZMaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcblxuICAvLyBUaGUgdGFyZ2V0IGRlZmF1bHRzIHRvIHdpbmRvdy5cbiAgdmFyIHRhcmdldCA9IG9wdGlvbnMudGFyZ2V0IHx8IGRvY3VtZW50O1xuXG4gIC8vIENyZWF0ZSBsaXN0IGVsZW1lbnRzXG4gIHZhciBwYWlycyA9IGNyZWF0ZUFuZEFwcGVuZExpc3RJdGVtcyhuYXZMaXN0LCBvcHRpb25zLmVsZW1lbnRMaXN0LCBvcHRpb25zLm1ha2VOYXZMaXN0SXRlbSk7XG5cbiAgLy8gV2hlbmV2ZXIgdGhlIHdpbmRvdyBpcyBzY3JvbGxlZCwgcmVjYWxjdWxhdGUgdGhlIGFjdGl2ZSBsaXN0IGVsZW1lbnQuIENvbXBhdGlibGUgd2l0aCBvbGRlclxuICAvLyB2ZXJzaW9ucyBvZiBJRS5cbiAgYWRkU2Nyb2xsTGlzdGVuZXIodGFyZ2V0LCBtYWtlSGFuZGxlU2Nyb2xsKHBhaXJzLCBvcHRpb25zLmRlYm91bmNlVGltZSkpO1xuXG4gIG5hdi5hcHBlbmRDaGlsZChuYXZMaXN0KTtcblxuICByZXR1cm4gbmF2O1xufVxuXG5yZXR1cm4gbWFrZU5hdjtcblxufSkpKTtcbiJdfQ==
