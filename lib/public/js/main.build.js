(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

console.log('Hello, pals!');

const setActiveNavItems = () => {

    const list = document.getElementsByClassName('nav__item');
    const length = list.length;
    const currentPage = window.location.href;

    let iterator;
    for (iterator = 0; iterator < length; ++iterator) {
        const item = list[iterator];
        if (item.href === currentPage) {
            item.classList.add('nav__item--active');
        }
    }
};

setActiveNavItems();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvcHVibGljL2pzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUFFQSxRQUFRLEdBQVIsQ0FBWSxjQUFaOztBQUVBLE1BQU0sb0JBQW9CLE1BQU07O0FBRTVCLFVBQU0sT0FBTyxTQUFTLHNCQUFULENBQWdDLFdBQWhDLENBQWI7QUFDQSxVQUFNLFNBQVMsS0FBSyxNQUFwQjtBQUNBLFVBQU0sY0FBYyxPQUFPLFFBQVAsQ0FBZ0IsSUFBcEM7O0FBRUEsUUFBSSxRQUFKO0FBQ0EsU0FBSyxXQUFXLENBQWhCLEVBQW1CLFdBQVcsTUFBOUIsRUFBc0MsRUFBRSxRQUF4QyxFQUFrRDtBQUM5QyxjQUFNLE9BQU8sS0FBSyxRQUFMLENBQWI7QUFDQSxZQUFJLEtBQUssSUFBTCxLQUFjLFdBQWxCLEVBQStCO0FBQzNCLGlCQUFLLFNBQUwsQ0FBZSxHQUFmLENBQW1CLG1CQUFuQjtBQUNIO0FBQ0o7QUFDSixDQWJEOztBQWVBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuY29uc29sZS5sb2coJ0hlbGxvLCBwYWxzIScpO1xuXG5jb25zdCBzZXRBY3RpdmVOYXZJdGVtcyA9ICgpID0+IHtcblxuICAgIGNvbnN0IGxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCduYXZfX2l0ZW0nKTtcbiAgICBjb25zdCBsZW5ndGggPSBsaXN0Lmxlbmd0aDtcbiAgICBjb25zdCBjdXJyZW50UGFnZSA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuXG4gICAgbGV0IGl0ZXJhdG9yO1xuICAgIGZvciAoaXRlcmF0b3IgPSAwOyBpdGVyYXRvciA8IGxlbmd0aDsgKytpdGVyYXRvcikge1xuICAgICAgICBjb25zdCBpdGVtID0gbGlzdFtpdGVyYXRvcl07XG4gICAgICAgIGlmIChpdGVtLmhyZWYgPT09IGN1cnJlbnRQYWdlKSB7XG4gICAgICAgICAgICBpdGVtLmNsYXNzTGlzdC5hZGQoJ25hdl9faXRlbS0tYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5zZXRBY3RpdmVOYXZJdGVtcygpO1xuIl19
