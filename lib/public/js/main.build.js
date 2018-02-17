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
        tagName: navEl.tagName,
        elementList: contentEl.querySelectorAll('h1, h2, h3, h4, h5, h6'),
        makeNavListItem: function makeNavListItem(el) {

            el = el.cloneNode(true);

            var anchor = el.removeChild(el.querySelector('a'));
            var indent = Number(el.tagName.replace('H', ''));

            return internals.render(internals.item(el.innerHTML, anchor.href, indent));
        }
    });

    navbar.classList.add('markdown-body');

    return navEl.parentNode.replaceChild(navbar, navEl);
};

internals.item = function (innerHTML, href, indent) {
    return '<a href="' + href + '" class="nav-item indent-' + indent + '">\n        ' + innerHTML + '\n    </a>';
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

    var el = document.querySelector(selector);

    if (!el) {
        return;
    }

    el.scrollIntoView();
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

    scrollToElement('a.anchor[href="' + window.location.hash + '"]');
};

window.onload = function () {

    if (window.location.hash) {
        scrollToElement('a.anchor[href="' + window.location.hash + '"]');
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvcHVibGljL2pzL2RvY3MtbmF2LmpzIiwibGliL3B1YmxpYy9qcy9tYWluLmpzIiwibm9kZV9tb2R1bGVzL25hdmJhci9uYXZiYXIudW1kLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTs7QUFFQSxJQUFNLFNBQVMsUUFBUSxRQUFSLENBQWY7O0FBRUEsSUFBTSxZQUFZLEVBQWxCOztBQUVBLFFBQVEsSUFBUixHQUFlLFVBQUMsU0FBRCxFQUFZLEtBQVosRUFBc0I7O0FBRWpDLFFBQUksQ0FBQyxTQUFMLEVBQWdCO0FBQ1o7QUFDSDs7QUFFRCxRQUFJLENBQUMsS0FBTCxFQUFZO0FBQ1IsY0FBTSxJQUFJLEtBQUosQ0FBVSxrRUFBVixDQUFOO0FBQ0g7O0FBRUQsUUFBTSxTQUFTLE9BQU87QUFDbEIsaUJBQVMsTUFBTSxPQURHO0FBRWxCLHFCQUFhLFVBQVUsZ0JBQVYsQ0FBMkIsd0JBQTNCLENBRks7QUFHbEIseUJBQWlCLHlCQUFDLEVBQUQsRUFBUTs7QUFFckIsaUJBQUssR0FBRyxTQUFILENBQWEsSUFBYixDQUFMOztBQUVBLGdCQUFNLFNBQVMsR0FBRyxXQUFILENBQWUsR0FBRyxhQUFILENBQWlCLEdBQWpCLENBQWYsQ0FBZjtBQUNBLGdCQUFNLFNBQVMsT0FBTyxHQUFHLE9BQUgsQ0FBVyxPQUFYLENBQW1CLEdBQW5CLEVBQXdCLEVBQXhCLENBQVAsQ0FBZjs7QUFFQSxtQkFBTyxVQUFVLE1BQVYsQ0FDSCxVQUFVLElBQVYsQ0FBZSxHQUFHLFNBQWxCLEVBQTZCLE9BQU8sSUFBcEMsRUFBMEMsTUFBMUMsQ0FERyxDQUFQO0FBR0g7QUFiaUIsS0FBUCxDQUFmOztBQWdCQSxXQUFPLFNBQVAsQ0FBaUIsR0FBakIsQ0FBcUIsZUFBckI7O0FBRUEsV0FBTyxNQUFNLFVBQU4sQ0FBaUIsWUFBakIsQ0FBOEIsTUFBOUIsRUFBc0MsS0FBdEMsQ0FB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0Jztcbi8qIGdsb2JhbCBkb2N1bWVudCAqL1xuXG5jb25zdCBOYXZiYXIgPSByZXF1aXJlKCduYXZiYXInKTtcblxuY29uc3QgaW50ZXJuYWxzID0ge307XG5cbmV4cG9ydHMuaW5pdCA9IChjb250ZW50RWwsIG5hdkVsKSA9PiB7XG5cbiAgICBpZiAoIWNvbnRlbnRFbCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCFuYXZFbCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0RvY3MgbmF2aWdhdGlvbiBjb250ZW50IGVsZW1lbnQgZXhpc3RzLCBidXQgbm90IHRoZSBuYXYgZWxlbWVudC4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBuYXZiYXIgPSBOYXZiYXIoe1xuICAgICAgICB0YWdOYW1lOiBuYXZFbC50YWdOYW1lLFxuICAgICAgICBlbGVtZW50TGlzdDogY29udGVudEVsLnF1ZXJ5U2VsZWN0b3JBbGwoJ2gxLCBoMiwgaDMsIGg0LCBoNSwgaDYnKSxcbiAgICAgICAgbWFrZU5hdkxpc3RJdGVtOiAoZWwpID0+IHtcblxuICAgICAgICAgICAgZWwgPSBlbC5jbG9uZU5vZGUodHJ1ZSk7XG5cbiAgICAgICAgICAgIGNvbnN0IGFuY2hvciA9IGVsLnJlbW92ZUNoaWxkKGVsLnF1ZXJ5U2VsZWN0b3IoJ2EnKSk7XG4gICAgICAgICAgICBjb25zdCBpbmRlbnQgPSBOdW1iZXIoZWwudGFnTmFtZS5yZXBsYWNlKCdIJywgJycpKTtcblxuICAgICAgICAgICAgcmV0dXJuIGludGVybmFscy5yZW5kZXIoXG4gICAgICAgICAgICAgICAgaW50ZXJuYWxzLml0ZW0oZWwuaW5uZXJIVE1MLCBhbmNob3IuaHJlZiwgaW5kZW50KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgbmF2YmFyLmNsYXNzTGlzdC5hZGQoJ21hcmtkb3duLWJvZHknKTtcblxuICAgIHJldHVybiBuYXZFbC5wYXJlbnROb2RlLnJlcGxhY2VDaGlsZChuYXZiYXIsIG5hdkVsKTtcbn07XG5cbmludGVybmFscy5pdGVtID0gKGlubmVySFRNTCwgaHJlZiwgaW5kZW50KSA9PiAoXG4gICAgYDxhIGhyZWY9XCIke2hyZWZ9XCIgY2xhc3M9XCJuYXYtaXRlbSBpbmRlbnQtJHtpbmRlbnR9XCI+XG4gICAgICAgICR7aW5uZXJIVE1MfVxuICAgIDwvYT5gXG4pO1xuXG5pbnRlcm5hbHMucmVuZGVyID0gKGh0bWwpID0+IHtcblxuICAgIGNvbnN0IHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB3cmFwcGVyLmlubmVySFRNTCA9IGh0bWw7XG5cbiAgICByZXR1cm4gd3JhcHBlci5maXJzdENoaWxkO1xufTtcbiIsIid1c2Ugc3RyaWN0Jztcbi8qIGdsb2JhbCBkb2N1bWVudCwgd2luZG93LCBYTUxIdHRwUmVxdWVzdCAqL1xuXG5jb25zdCBEb2NzTmF2ID0gcmVxdWlyZSgnLi9kb2NzLW5hdicpO1xuXG5Eb2NzTmF2LmluaXQoXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmRvY3MtZGV0YWlsIC53cmFwcGVyJyksXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmRvY3MtZGV0YWlsIC5uYXYtdGFyZ2V0Jylcbik7XG5cbmNvbnN0IHNldEFjdGl2ZU5hdkl0ZW1zID0gKCkgPT4ge1xuXG4gICAgY29uc3QgbGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ25hdl9faXRlbScpO1xuICAgIGNvbnN0IGN1cnJlbnRQYWdlID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGxpc3RbaV07XG4gICAgICAgIGlmIChpdGVtLmhyZWYgPT09IGN1cnJlbnRQYWdlKSB7XG4gICAgICAgICAgICBpdGVtLmNsYXNzTGlzdC5hZGQoJ25hdl9faXRlbS0tYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5jb25zdCBuZXdzbGV0dGVyU3VibWl0ID0gKCkgPT4ge1xuXG4gICAgY29uc3QgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXdzbGV0dGVyRm9ybScpO1xuXG4gICAgaWYgKCFmb3JtKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3JtLm9uc3VibWl0ID0gKGUpID0+IHtcblxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgY29uc3QgZW1haWxJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXdzbGV0dGVyRW1haWwnKTtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXdzbGV0dGVyTWVzc2FnZScpO1xuXG4gICAgICAgIGlmIChlbWFpbElucHV0LnZhbGlkaXR5LnZhbGlkKSB7XG4gICAgICAgICAgICBjb25zdCBwYXlsb2FkID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIGVtYWlsOiBlbWFpbElucHV0LnZhbHVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgeGhyLm9wZW4oJ1BPU1QnLCAnL21haWxjaGltcCcpO1xuICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICB4aHIub25sb2FkID0gKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLmlubmVySFRNTCA9ICdZb3VyIGVtYWlsIGFkZHJlc3M6ICcgKyBlbWFpbElucHV0LnZhbHVlICsgJywgaXMgbm93IHNpZ25lZCB1cC4gVGhhbmtzIHBhbCEnO1xuICAgICAgICAgICAgICAgICAgICBlbWFpbElucHV0LnZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgZm9ybS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh4aHIuc3RhdHVzID09PSA0MDApIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSAnVGhlIGVtYWlsIGFkZHJlc3M6ICcgKyBlbWFpbElucHV0LnZhbHVlICsgJyBpcyBlaXRoZXIgaW52YWxpZCwgb3IgbWF5IGFscmVhZHkgYmUgc3Vic2NyaWJlZC4nO1xuICAgICAgICAgICAgICAgICAgICBlbWFpbElucHV0LnZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgZW1haWxJbnB1dC5jbGFzc0xpc3QuYWRkKCduZXdzbGV0dGVyX19pbnB1dC0taW52YWxpZCcpO1xuICAgICAgICAgICAgICAgICAgICBmb3JtLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSAnVGhlIGVtYWlsIGFkZHJlc3M6ICcgKyBlbWFpbElucHV0LnZhbHVlICsgJyBtYXkgYmUgaW52YWxpZCwgb3IgeW91ciBuZXR3b3JrIGNvbm5lY3Rpb24gaXMgaW5hY3RpdmUnO1xuICAgICAgICAgICAgICAgICAgICBlbWFpbElucHV0LnZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgZW1haWxJbnB1dC5jbGFzc0xpc3QuYWRkKCduZXdzbGV0dGVyX19pbnB1dC0taW52YWxpZCcpO1xuICAgICAgICAgICAgICAgICAgICBmb3JtLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB4aHIuc2VuZChwYXlsb2FkKTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuXG5jb25zdCBzY3JvbGxUb0VsZW1lbnQgPSAoc2VsZWN0b3IpID0+IHtcblxuICAgIGNvbnN0IGVsID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzZWxlY3Rvcik7XG5cbiAgICBpZiAoIWVsKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBlbC5zY3JvbGxJbnRvVmlldygpO1xufTtcblxuY29uc3QgZG9jc05hdk1vYmlsZUFjdGlvbnMgPSAoKSA9PiB7XG5cbiAgICBjb25zdCBtZW51QnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm5hdi1pdGVtX19sZWZ0Jyk7XG4gICAgY29uc3QgdG9wQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm5hdi1pdGVtX19yaWdodCcpO1xuICAgIGNvbnN0IGRvY3NOYXYgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuZG9jcy1uYXYnKTtcblxuICAgIGNvbnN0IGRvY3NOYXZJc09wZW4gPSAoKSA9PiBkb2NzTmF2LmNsYXNzTGlzdC5jb250YWlucygnZG9jcy1uYXYtLW9wZW4nKTtcbiAgICBjb25zdCB0b2dnbGVEb2NzTmF2ID0gKCkgPT4ge1xuXG4gICAgICAgIGlmIChkb2NzTmF2SXNPcGVuKCkpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LnJlbW92ZSgnYm9keS0tbm9zY3JvbGwnKTtcbiAgICAgICAgICAgIGRvY3NOYXYuY2xhc3NMaXN0LnJlbW92ZSgnZG9jcy1uYXYtLW9wZW4nKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvY3VtZW50LmJvZHkuY2xhc3NMaXN0LmFkZCgnYm9keS0tbm9zY3JvbGwnKTtcbiAgICAgICAgZG9jc05hdi5jbGFzc0xpc3QuYWRkKCdkb2NzLW5hdi0tb3BlbicpO1xuICAgIH07XG5cbiAgICBtZW51QnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdG9nZ2xlRG9jc05hdik7XG4gICAgdG9wQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4ge1xuXG4gICAgICAgIGlmIChkb2NzTmF2SXNPcGVuKCkpIHtcbiAgICAgICAgICAgIHRvZ2dsZURvY3NOYXYoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB3aW5kb3cuc2Nyb2xsVG8oMCwwKTtcbiAgICB9KTtcbn07XG5cbndpbmRvdy5vbmhhc2hjaGFuZ2UgPSAoKSA9PiB7XG5cbiAgICBzY3JvbGxUb0VsZW1lbnQoJ2EuYW5jaG9yW2hyZWY9XCInICsgd2luZG93LmxvY2F0aW9uLmhhc2ggKyAnXCJdJyk7XG59O1xuXG53aW5kb3cub25sb2FkID0gKCkgPT4ge1xuXG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoKSB7XG4gICAgICAgIHNjcm9sbFRvRWxlbWVudCgnYS5hbmNob3JbaHJlZj1cIicgKyB3aW5kb3cubG9jYXRpb24uaGFzaCArICdcIl0nKTtcbiAgICB9XG59O1xuXG5zZXRBY3RpdmVOYXZJdGVtcygpO1xubmV3c2xldHRlclN1Ym1pdCgpO1xuZG9jc05hdk1vYmlsZUFjdGlvbnMoKTtcbiIsIihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG5cdHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcblx0dHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcblx0KGdsb2JhbC5uYXZiYXIgPSBmYWN0b3J5KCkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbnZhciBzZWxlY3RlZENsYXNzID0gJ25hdmJhci1hY3RpdmUnO1xudmFyIHN1cHBvcnRzUGFzc2l2ZSA9IGZhbHNlO1xuXG50cnkge1xuICB2YXIgb3B0cyA9IE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh7fSwgJ3Bhc3NpdmUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICBzdXBwb3J0c1Bhc3NpdmUgPSB0cnVlO1xuICAgIH1cbiAgfSk7XG5cbiAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Rlc3QnLCBudWxsLCBvcHRzKTtcbn0gY2F0Y2ggKGUpIHt9XG5cbi8vIEl0J2QgYmUgbmljZXIgdG8gdXNlIHRoZSBjbGFzc0xpc3QgQVBJLCBidXQgSSBwcmVmZXIgdG8gc3VwcG9ydCBtb3JlIGJyb3dzZXJzLiBSZW1vdmUgYSBjbGFzc1xuLy8gaWYgaXQncyBmb3VuZCBvbiB0aGUgZWxlbWVudC5cbmZ1bmN0aW9uIHJlbW92ZUNsYXNzSWZOZWVkZWQoZWwpIHtcbiAgLy8gSWYgdGhlIGVsZW1lbnQgaGFzIG5vIGNsYXNzZXMgdGhlbiB3ZSBjYW4gdGFrZSBhIHNob3J0Y3V0LlxuICBpZiAoIWVsLmNsYXNzTmFtZSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBzcGxpdENsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZS5zcGxpdCgnICcpO1xuICB2YXIgcmVwbGFjZW1lbnRDbGFzc05hbWUgPSAnJztcblxuICAvLyBBc3NlbWJsZSBhIHN0cmluZyBvZiBvdGhlciBjbGFzcyBuYW1lcy5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHNwbGl0Q2xhc3NOYW1lLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgdmFyIGNsYXNzTmFtZSA9IHNwbGl0Q2xhc3NOYW1lW2ldO1xuXG4gICAgaWYgKGNsYXNzTmFtZSAhPT0gc2VsZWN0ZWRDbGFzcykge1xuICAgICAgcmVwbGFjZW1lbnRDbGFzc05hbWUgKz0gcmVwbGFjZW1lbnRDbGFzc05hbWUgPT09ICcnID8gY2xhc3NOYW1lIDogJyAnICsgY2xhc3NOYW1lO1xuICAgIH1cbiAgfVxuXG4gIC8vIElmIHRoZSBsZW5ndGggb2YgdGhlIGNsYXNzTmFtZSBkaWZmZXJzLCB0aGVuIGl0IGhhZCBhbiBzZWxlY3RlZCBjbGFzcyBpbiBhbmQgbmVlZHMgdG8gYmVcbiAgLy8gdXBkYXRlZC5cbiAgaWYgKHJlcGxhY2VtZW50Q2xhc3NOYW1lLmxlbmd0aCAhPT0gZWwuY2xhc3NOYW1lLmxlbmd0aCkge1xuICAgIGVsLmNsYXNzTmFtZSA9IHJlcGxhY2VtZW50Q2xhc3NOYW1lO1xuICB9XG59XG5cbi8vIEFkZCBhIGNsYXNzIHRvIGFuIGVsZW1lbnQgaWYgaXQgaXMgbm90IGZvdW5kLlxuZnVuY3Rpb24gYWRkQ2xhc3NJZk5lZWRlZChlbCkge1xuICAvLyBJZiB0aGUgZWxlbWVudCBoYXMgbm8gY2xhc3NlcyB0aGVuIHdlIGNhbiB0YWtlIGEgc2hvcnRjdXQuXG4gIGlmICghZWwuY2xhc3NOYW1lKSB7XG4gICAgZWwuY2xhc3NOYW1lID0gc2VsZWN0ZWRDbGFzcztcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgc3BsaXRDbGFzc05hbWUgPSBlbC5jbGFzc05hbWUuc3BsaXQoJyAnKTtcblxuICAvLyBJZiBhbnkgb2YgdGhlIGNsYXNzIG5hbWVzIG1hdGNoIHRoZSBzZWxlY3RlZCBjbGFzcyB0aGVuIHJldHVybi5cbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHNwbGl0Q2xhc3NOYW1lLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgaWYgKHNwbGl0Q2xhc3NOYW1lW2ldID09PSBzZWxlY3RlZENsYXNzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgLy8gSWYgd2UgZ290IGhlcmUgdGhlbiB0aGUgc2VsZWN0ZWQgY2xhc3MgbmVlZHMgdG8gYmUgYWRkZWQgdG8gYW4gZXhpc3RpbmcgY2xhc3NOYW1lLlxuICBlbC5jbGFzc05hbWUgKz0gJyAnICsgc2VsZWN0ZWRDbGFzcztcbn1cblxuZnVuY3Rpb24gY3JlYXRlQW5kQXBwZW5kTGlzdEl0ZW1zKG5hdkxpc3QsIGVsZW1lbnRMaXN0LCBtYWtlTmF2TGlzdEl0ZW0pIHtcbiAgdmFyIHBhaXJzID0gW107XG4gIHZhciBlbGVtZW50O1xuICB2YXIgbGk7XG5cbiAgLy8gQ3JlYXRlIGxpc3QgZWxlbWVudHNcbiAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IGVsZW1lbnRMaXN0Lmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgZWxlbWVudCA9IGVsZW1lbnRMaXN0W2ldO1xuICAgIGxpID0gbWFrZU5hdkxpc3RJdGVtKGVsZW1lbnQpO1xuXG4gICAgbmF2TGlzdC5hcHBlbmRDaGlsZChsaSk7XG5cbiAgICBwYWlycy5wdXNoKHsgZWxlbWVudDogZWxlbWVudCwgbmF2RWxlbWVudDogbGkgfSk7XG4gIH1cblxuICByZXR1cm4gcGFpcnM7XG59XG5cbmZ1bmN0aW9uIG1ha2VIYW5kbGVTY3JvbGwocGFpcnMsIGRlYm91bmNlVGltZSkge1xuICBmdW5jdGlvbiBoYW5kbGVTY3JvbGwoKSB7XG4gICAgdmFyIGZyb250UnVubmVyID0geyBuYXZFbGVtZW50OiB7fSB9O1xuICAgIHZhciBjbG9zZXN0RGlzdCA9IEluZmluaXR5O1xuICAgIHZhciBwYWlyO1xuICAgIHZhciBhYnNEaXN0O1xuXG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbiA9IHBhaXJzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICBwYWlyID0gcGFpcnNbaV07XG4gICAgICBhYnNEaXN0ID0gTWF0aC5hYnMocGFpci5lbGVtZW50LmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnRvcCk7XG5cbiAgICAgIC8vIElmIHRoaXMgZWxlbWVudCBpcyBub3QgdGhlIGZyb250IHJ1bm5lciBmb3IgdG9wLCBkZWFjdGl2YXRlIGl0LlxuICAgICAgaWYgKGFic0Rpc3QgPiBjbG9zZXN0RGlzdCkge1xuICAgICAgICByZW1vdmVDbGFzc0lmTmVlZGVkKHBhaXIubmF2RWxlbWVudCk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGlzIGlzIGEgbmV3IGZyb250IHJ1bm5lciwgZGVhY3RpdmF0ZSB0aGUgcHJldmlvdXMgZnJvbnQgcnVubmVyLlxuICAgICAgcmVtb3ZlQ2xhc3NJZk5lZWRlZChmcm9udFJ1bm5lcik7XG5cbiAgICAgIGZyb250UnVubmVyID0gcGFpci5uYXZFbGVtZW50O1xuICAgICAgY2xvc2VzdERpc3QgPSBhYnNEaXN0O1xuICAgIH1cblxuICAgIC8vIEFsbCBvdGhlciBlbGVtZW50cyBoYXZlIGJlZW4gZGVhY3RpdmF0ZWQsIGFuZCBub3cgdGhlIHRvcCBlbGVtZW50IGlzIGtub3duIGFuZCBjYW4gYmUgc2V0XG4gICAgLy8gYXMgYWN0aXZlLlxuICAgIGFkZENsYXNzSWZOZWVkZWQoZnJvbnRSdW5uZXIsIHNlbGVjdGVkQ2xhc3MpO1xuICB9XG5cbiAgLy8gVGhlIGRlZmF1bHQgYmVoYXZpb3VyIGlzIG5vIGRlYm91bmNlLlxuICBpZiAodHlwZW9mIGRlYm91bmNlVGltZSAhPT0gJ251bWJlcicgfHwgaXNOYU4oZGVib3VuY2VUaW1lKSkge1xuICAgIHJldHVybiBoYW5kbGVTY3JvbGw7XG4gIH1cblxuICB2YXIgdGltZW91dDtcblxuICBmdW5jdGlvbiBudWxsaWZ5VGltZW91dCgpIHtcbiAgICB0aW1lb3V0ID0gbnVsbDtcbiAgfVxuXG4gIHJldHVybiBmdW5jdGlvbiBkZWJvdW5jZWRIYW5kbGVTY3JvbGwoKSB7XG4gICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJbW1lZGlhdGVseSB1c2UgaGFuZGxlU2Nyb2xsIHRvIGNhbGN1bGF0ZS5cbiAgICBoYW5kbGVTY3JvbGwoKTtcblxuICAgIC8vIE5vIGZ1cnRoZXIgY2FsbHMgdG8gaGFuZGxlU2Nyb2xsIHVudGlsIGRlYm91bmNlVGltZSBoYXMgZWxhcHNlZC5cbiAgICB0aW1lb3V0ID0gc2V0VGltZW91dChudWxsaWZ5VGltZW91dCwgZGVib3VuY2VUaW1lKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gYWRkU2Nyb2xsTGlzdGVuZXIodGFyZ2V0LCBoYW5kbGVTY3JvbGwpIHtcbiAgZnVuY3Rpb24gc2Nyb2xsSGFuZGxlV3JhcHBlcihldnQpIHtcbiAgICBpZiAoZXZ0LnRhcmdldCA9PT0gdGFyZ2V0KSB7XG4gICAgICBoYW5kbGVTY3JvbGwoKTtcbiAgICB9XG4gIH1cblxuICBpZiAodGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIpIHtcbiAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcignc2Nyb2xsJywgc2Nyb2xsSGFuZGxlV3JhcHBlciwgc3VwcG9ydHNQYXNzaXZlID8geyBwYXNzaXZlOiB0cnVlIH0gOiBmYWxzZSk7XG4gIH0gZWxzZSBpZiAodGFyZ2V0LmF0dGFjaEV2ZW50KSB7XG4gICAgdGFyZ2V0LmF0dGFjaEV2ZW50KCdvbnNjcm9sbCcsIHNjcm9sbEhhbmRsZVdyYXBwZXIpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignVGhpcyBicm93c2VyIGRvZXMgbm90IHN1cHBvcnQgYWRkRXZlbnRMaXN0ZW5lciBvciBhdHRhY2hFdmVudC4nKTtcbiAgfVxuXG4gIC8vIFRvIGNhbGN1bGF0ZSB0aGUgaW5pdGlhbCBhY3RpdmUgbGlzdCBlbGVtZW50LlxuICBoYW5kbGVTY3JvbGwoKTtcbn1cblxuZnVuY3Rpb24gbWFrZU5hdihvcHRpb25zKSB7XG4gIGlmICghb3B0aW9ucyB8fCAhb3B0aW9ucy5lbGVtZW50TGlzdCB8fCAhb3B0aW9ucy5tYWtlTmF2TGlzdEl0ZW0pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ09wdGlvbnMgb2JqZWN0IHdpdGggZWxlbWVudExpc3QgYW5kIG1ha2VOYXZMaXN0SXRlbSBtdXN0IGJlIHByb3ZpZGVkLicpO1xuICB9XG5cbiAgdmFyIG5hdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQob3B0aW9ucy50YWdOYW1lIHx8ICduYXYnKTtcbiAgdmFyIG5hdkxpc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpO1xuXG4gIC8vIFRoZSB0YXJnZXQgZGVmYXVsdHMgdG8gd2luZG93LlxuICB2YXIgdGFyZ2V0ID0gb3B0aW9ucy50YXJnZXQgfHwgZG9jdW1lbnQ7XG5cbiAgLy8gQ3JlYXRlIGxpc3QgZWxlbWVudHNcbiAgdmFyIHBhaXJzID0gY3JlYXRlQW5kQXBwZW5kTGlzdEl0ZW1zKG5hdkxpc3QsIG9wdGlvbnMuZWxlbWVudExpc3QsIG9wdGlvbnMubWFrZU5hdkxpc3RJdGVtKTtcblxuICAvLyBXaGVuZXZlciB0aGUgd2luZG93IGlzIHNjcm9sbGVkLCByZWNhbGN1bGF0ZSB0aGUgYWN0aXZlIGxpc3QgZWxlbWVudC4gQ29tcGF0aWJsZSB3aXRoIG9sZGVyXG4gIC8vIHZlcnNpb25zIG9mIElFLlxuICBhZGRTY3JvbGxMaXN0ZW5lcih0YXJnZXQsIG1ha2VIYW5kbGVTY3JvbGwocGFpcnMsIG9wdGlvbnMuZGVib3VuY2VUaW1lKSk7XG5cbiAgbmF2LmFwcGVuZENoaWxkKG5hdkxpc3QpO1xuXG4gIHJldHVybiBuYXY7XG59XG5cbnJldHVybiBtYWtlTmF2O1xuXG59KSkpO1xuIl19
