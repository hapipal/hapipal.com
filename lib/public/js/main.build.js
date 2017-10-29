(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
/* global document, window */

console.log('Hello, pals!');

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
                    message.innerHTML = 'You are now signed up, pal!';
                    emailInput.value = null;
                    form.style.display = 'none';
                    message.style.display = 'block';
                }
                if (xhr.status === 400) {
                    message.innerHTML = 'The email is invalid, or you must already be subscribed, pal! ', +xhr.responseText;
                    form.style.display = 'block';
                    message.style.display = 'block';
                }
            };
            xhr.send(payload);
        }
    };
};

setActiveNavItems();
newsletterSubmit();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvcHVibGljL2pzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBOztBQUVBLFFBQVEsR0FBUixDQUFZLGNBQVo7O0FBRUEsSUFBTSxvQkFBb0IsU0FBcEIsaUJBQW9CLEdBQU07O0FBRTVCLFFBQU0sT0FBTyxTQUFTLHNCQUFULENBQWdDLFdBQWhDLENBQWI7QUFDQSxRQUFNLGNBQWMsT0FBTyxRQUFQLENBQWdCLElBQXBDOztBQUVBLFNBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxLQUFLLE1BQXpCLEVBQWlDLEVBQUUsQ0FBbkMsRUFBc0M7QUFDbEMsWUFBTSxPQUFPLEtBQUssQ0FBTCxDQUFiO0FBQ0EsWUFBSSxLQUFLLElBQUwsS0FBYyxXQUFsQixFQUErQjtBQUMzQixpQkFBSyxTQUFMLENBQWUsR0FBZixDQUFtQixtQkFBbkI7QUFDSDtBQUNKO0FBQ0osQ0FYRDs7QUFhQSxJQUFNLG1CQUFtQixTQUFuQixnQkFBbUIsR0FBTTs7QUFFM0IsUUFBTSxPQUFPLFNBQVMsY0FBVCxDQUF3QixnQkFBeEIsQ0FBYjtBQUNBLFNBQUssUUFBTCxHQUFnQixVQUFDLENBQUQsRUFBTzs7QUFFbkIsVUFBRSxjQUFGOztBQUVBLFlBQU0sYUFBYSxTQUFTLGNBQVQsQ0FBd0IsaUJBQXhCLENBQW5CO0FBQ0EsWUFBTSxVQUFVLFNBQVMsY0FBVCxDQUF3QixtQkFBeEIsQ0FBaEI7O0FBRUEsWUFBSSxXQUFXLFFBQVgsQ0FBb0IsS0FBeEIsRUFBK0I7QUFDM0IsZ0JBQU0sVUFBVSxLQUFLLFNBQUwsQ0FBZTtBQUMzQix1QkFBTyxXQUFXO0FBRFMsYUFBZixDQUFoQjtBQUdBLGdCQUFNLE1BQU0sSUFBSSxjQUFKLEVBQVo7QUFDQSxnQkFBSSxJQUFKLENBQVMsTUFBVCxFQUFpQixZQUFqQjtBQUNBLGdCQUFJLGdCQUFKLENBQXFCLGNBQXJCLEVBQXFDLGtCQUFyQztBQUNBLGdCQUFJLE1BQUosR0FBYSxZQUFNOztBQUVmLG9CQUFJLElBQUksTUFBSixLQUFlLEdBQW5CLEVBQXdCO0FBQ3BCLDRCQUFRLFNBQVIsR0FBb0IsNkJBQXBCO0FBQ0EsK0JBQVcsS0FBWCxHQUFtQixJQUFuQjtBQUNBLHlCQUFLLEtBQUwsQ0FBVyxPQUFYLEdBQXFCLE1BQXJCO0FBQ0EsNEJBQVEsS0FBUixDQUFjLE9BQWQsR0FBd0IsT0FBeEI7QUFDSDtBQUNELG9CQUFJLElBQUksTUFBSixLQUFlLEdBQW5CLEVBQXdCO0FBQ3BCLDRCQUFRLFNBQVIsR0FBb0IsZ0VBQXBCLEVBQXNGLENBQUMsSUFBSSxZQUEzRjtBQUNBLHlCQUFLLEtBQUwsQ0FBVyxPQUFYLEdBQXFCLE9BQXJCO0FBQ0EsNEJBQVEsS0FBUixDQUFjLE9BQWQsR0FBd0IsT0FBeEI7QUFDSDtBQUNKLGFBYkQ7QUFjQSxnQkFBSSxJQUFKLENBQVMsT0FBVDtBQUNIO0FBQ0osS0E5QkQ7QUErQkgsQ0FsQ0Q7O0FBb0NBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuLyogZ2xvYmFsIGRvY3VtZW50LCB3aW5kb3cgKi9cblxuY29uc29sZS5sb2coJ0hlbGxvLCBwYWxzIScpO1xuXG5jb25zdCBzZXRBY3RpdmVOYXZJdGVtcyA9ICgpID0+IHtcblxuICAgIGNvbnN0IGxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCduYXZfX2l0ZW0nKTtcbiAgICBjb25zdCBjdXJyZW50UGFnZSA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBsaXN0Lmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBsaXN0W2ldO1xuICAgICAgICBpZiAoaXRlbS5ocmVmID09PSBjdXJyZW50UGFnZSkge1xuICAgICAgICAgICAgaXRlbS5jbGFzc0xpc3QuYWRkKCduYXZfX2l0ZW0tLWFjdGl2ZScpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuY29uc3QgbmV3c2xldHRlclN1Ym1pdCA9ICgpID0+IHtcblxuICAgIGNvbnN0IGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV3c2xldHRlckZvcm0nKTtcbiAgICBmb3JtLm9uc3VibWl0ID0gKGUpID0+IHtcblxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgY29uc3QgZW1haWxJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXdzbGV0dGVyRW1haWwnKTtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXdzbGV0dGVyTWVzc2FnZScpO1xuXG4gICAgICAgIGlmIChlbWFpbElucHV0LnZhbGlkaXR5LnZhbGlkKSB7XG4gICAgICAgICAgICBjb25zdCBwYXlsb2FkID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIGVtYWlsOiBlbWFpbElucHV0LnZhbHVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgeGhyLm9wZW4oJ1BPU1QnLCAnL21haWxjaGltcCcpO1xuICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICB4aHIub25sb2FkID0gKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLmlubmVySFRNTCA9ICdZb3UgYXJlIG5vdyBzaWduZWQgdXAsIHBhbCEnO1xuICAgICAgICAgICAgICAgICAgICBlbWFpbElucHV0LnZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgZm9ybS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoeGhyLnN0YXR1cyA9PT0gNDAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2UuaW5uZXJIVE1MID0gJ1RoZSBlbWFpbCBpcyBpbnZhbGlkLCBvciB5b3UgbXVzdCBhbHJlYWR5IGJlIHN1YnNjcmliZWQsIHBhbCEgJywgK3hoci5yZXNwb25zZVRleHQ7XG4gICAgICAgICAgICAgICAgICAgIGZvcm0uc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgICAgIG1lc3NhZ2Uuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHhoci5zZW5kKHBheWxvYWQpO1xuICAgICAgICB9XG4gICAgfTtcbn07XG5cbnNldEFjdGl2ZU5hdkl0ZW1zKCk7XG5uZXdzbGV0dGVyU3VibWl0KCk7XG4iXX0=
