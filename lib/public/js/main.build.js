(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

console.log('Hello, pals!');

const setActiveNavItems = () => {

    const list = document.getElementsByClassName('nav__item');
    const currentPage = window.location.href;

    for (let iterator = 0; iterator < list.length; ++iterator) {
        const item = list[iterator];
        if (item.href === currentPage) {
            item.classList.add('nav__item--active');
        }
    }
};

const newsletterSubmit = () => {

    const form = document.getElementById('newsletterForm');
    form.onsubmit = e => {

        e.preventDefault();
        const emailInput = document.getElementById('newsletterEmail');
        const message = document.getElementById('newsletterMessage');

        if (emailInput.validity.valid) {
            const payload = {
                email: emailInput.value,
                status: 'subscribed'
            };
            //TODO: have this hit an internal server call to mailchimp, with Authorization
            console.log('make api call here', payload, 'https://us17.api.mailchimp.com/3.0/lists/4123041e5d/members');
            emailInput.value = null;
            form.style.display = 'none';
            message.style.display = 'block';
        }
        // You must return false to prevent the default form behavior
        return false;
    };
};

setActiveNavItems();
newsletterSubmit();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvcHVibGljL2pzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUFFQSxRQUFRLEdBQVIsQ0FBWSxjQUFaOztBQUVBLE1BQU0sb0JBQW9CLE1BQU07O0FBRTVCLFVBQU0sT0FBTyxTQUFTLHNCQUFULENBQWdDLFdBQWhDLENBQWI7QUFDQSxVQUFNLGNBQWMsT0FBTyxRQUFQLENBQWdCLElBQXBDOztBQUVBLFNBQUssSUFBSSxXQUFXLENBQXBCLEVBQXVCLFdBQVcsS0FBSyxNQUF2QyxFQUErQyxFQUFFLFFBQWpELEVBQTJEO0FBQ3ZELGNBQU0sT0FBTyxLQUFLLFFBQUwsQ0FBYjtBQUNBLFlBQUksS0FBSyxJQUFMLEtBQWMsV0FBbEIsRUFBK0I7QUFDM0IsaUJBQUssU0FBTCxDQUFlLEdBQWYsQ0FBbUIsbUJBQW5CO0FBQ0g7QUFDSjtBQUNKLENBWEQ7O0FBYUEsTUFBTSxtQkFBbUIsTUFBTTs7QUFFM0IsVUFBTSxPQUFPLFNBQVMsY0FBVCxDQUF3QixnQkFBeEIsQ0FBYjtBQUNBLFNBQUssUUFBTCxHQUFpQixDQUFELElBQU87O0FBRW5CLFVBQUUsY0FBRjtBQUNBLGNBQU0sYUFBYSxTQUFTLGNBQVQsQ0FBd0IsaUJBQXhCLENBQW5CO0FBQ0EsY0FBTSxVQUFXLFNBQVMsY0FBVCxDQUF3QixtQkFBeEIsQ0FBakI7O0FBRUEsWUFBSSxXQUFXLFFBQVgsQ0FBb0IsS0FBeEIsRUFBOEI7QUFDMUIsa0JBQU0sVUFBVTtBQUNaLHVCQUFPLFdBQVcsS0FETjtBQUVaLHdCQUFRO0FBRkksYUFBaEI7QUFJQTtBQUNBLG9CQUFRLEdBQVIsQ0FBWSxvQkFBWixFQUFrQyxPQUFsQyxFQUEyQyw2REFBM0M7QUFDQSx1QkFBVyxLQUFYLEdBQW1CLElBQW5CO0FBQ0EsaUJBQUssS0FBTCxDQUFXLE9BQVgsR0FBcUIsTUFBckI7QUFDQSxvQkFBUSxLQUFSLENBQWMsT0FBZCxHQUF3QixPQUF4QjtBQUNIO0FBQ0Q7QUFDQSxlQUFPLEtBQVA7QUFDSCxLQW5CRDtBQW9CSCxDQXZCRDs7QUF5QkE7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbmNvbnNvbGUubG9nKCdIZWxsbywgcGFscyEnKTtcblxuY29uc3Qgc2V0QWN0aXZlTmF2SXRlbXMgPSAoKSA9PiB7XG5cbiAgICBjb25zdCBsaXN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgnbmF2X19pdGVtJyk7XG4gICAgY29uc3QgY3VycmVudFBhZ2UgPSB3aW5kb3cubG9jYXRpb24uaHJlZjtcblxuICAgIGZvciAobGV0IGl0ZXJhdG9yID0gMDsgaXRlcmF0b3IgPCBsaXN0Lmxlbmd0aDsgKytpdGVyYXRvcikge1xuICAgICAgICBjb25zdCBpdGVtID0gbGlzdFtpdGVyYXRvcl07XG4gICAgICAgIGlmIChpdGVtLmhyZWYgPT09IGN1cnJlbnRQYWdlKSB7XG4gICAgICAgICAgICBpdGVtLmNsYXNzTGlzdC5hZGQoJ25hdl9faXRlbS0tYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5jb25zdCBuZXdzbGV0dGVyU3VibWl0ID0gKCkgPT4ge1xuXG4gICAgY29uc3QgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXdzbGV0dGVyRm9ybScpO1xuICAgIGZvcm0ub25zdWJtaXQgPSAoZSkgPT4ge1xuXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29uc3QgZW1haWxJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXdzbGV0dGVyRW1haWwnKTtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9ICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV3c2xldHRlck1lc3NhZ2UnKTtcblxuICAgICAgICBpZiAoZW1haWxJbnB1dC52YWxpZGl0eS52YWxpZCl7XG4gICAgICAgICAgICBjb25zdCBwYXlsb2FkID0ge1xuICAgICAgICAgICAgICAgIGVtYWlsOiBlbWFpbElucHV0LnZhbHVlLFxuICAgICAgICAgICAgICAgIHN0YXR1czogJ3N1YnNjcmliZWQnXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgLy9UT0RPOiBoYXZlIHRoaXMgaGl0IGFuIGludGVybmFsIHNlcnZlciBjYWxsIHRvIG1haWxjaGltcCwgd2l0aCBBdXRob3JpemF0aW9uXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnbWFrZSBhcGkgY2FsbCBoZXJlJywgcGF5bG9hZCwgJ2h0dHBzOi8vdXMxNy5hcGkubWFpbGNoaW1wLmNvbS8zLjAvbGlzdHMvNDEyMzA0MWU1ZC9tZW1iZXJzJyk7XG4gICAgICAgICAgICBlbWFpbElucHV0LnZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgIGZvcm0uc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgIG1lc3NhZ2Uuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgICAgIH1cbiAgICAgICAgLy8gWW91IG11c3QgcmV0dXJuIGZhbHNlIHRvIHByZXZlbnQgdGhlIGRlZmF1bHQgZm9ybSBiZWhhdmlvclxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcbn07XG5cbnNldEFjdGl2ZU5hdkl0ZW1zKCk7XG5uZXdzbGV0dGVyU3VibWl0KCk7XG4iXX0=
