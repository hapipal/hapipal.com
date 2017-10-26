(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

console.log('Hello, pals!');

const setActiveNavItems = function () {

    const list = document.getElementsByClassName('nav__item');
    const currentPage = window.location.href;

    for (var iterator = 0; iterator < list.length; ++iterator) {
        const item = list[iterator];
        if (item.href === currentPage) {
            item.classList.add('nav__item--active');
        }
    }
};

const newsletterSubmit = function () {

    const form = document.getElementById('newsletterForm');
    form.onsubmit = function (e) {

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvcHVibGljL2pzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTs7QUFFQSxRQUFRLEdBQVIsQ0FBWSxjQUFaOztBQUVBLE1BQU0sb0JBQW9CLFlBQVk7O0FBRWxDLFVBQU0sT0FBTyxTQUFTLHNCQUFULENBQWdDLFdBQWhDLENBQWI7QUFDQSxVQUFNLGNBQWMsT0FBTyxRQUFQLENBQWdCLElBQXBDOztBQUVBLFNBQUssSUFBSSxXQUFXLENBQXBCLEVBQXVCLFdBQVcsS0FBSyxNQUF2QyxFQUErQyxFQUFFLFFBQWpELEVBQTJEO0FBQ3ZELGNBQU0sT0FBTyxLQUFLLFFBQUwsQ0FBYjtBQUNBLFlBQUksS0FBSyxJQUFMLEtBQWMsV0FBbEIsRUFBK0I7QUFDM0IsaUJBQUssU0FBTCxDQUFlLEdBQWYsQ0FBbUIsbUJBQW5CO0FBQ0g7QUFDSjtBQUNKLENBWEQ7O0FBYUEsTUFBTSxtQkFBbUIsWUFBWTs7QUFFakMsVUFBTSxPQUFPLFNBQVMsY0FBVCxDQUF3QixnQkFBeEIsQ0FBYjtBQUNBLFNBQUssUUFBTCxHQUFnQixVQUFTLENBQVQsRUFBWTs7QUFFeEIsVUFBRSxjQUFGO0FBQ0EsY0FBTSxhQUFhLFNBQVMsY0FBVCxDQUF3QixpQkFBeEIsQ0FBbkI7QUFDQSxjQUFNLFVBQVcsU0FBUyxjQUFULENBQXdCLG1CQUF4QixDQUFqQjs7QUFFQSxZQUFJLFdBQVcsUUFBWCxDQUFvQixLQUF4QixFQUE4QjtBQUMxQixrQkFBTSxVQUFVO0FBQ1osdUJBQU8sV0FBVyxLQUROO0FBRVosd0JBQVE7QUFGSSxhQUFoQjtBQUlBO0FBQ0Esb0JBQVEsR0FBUixDQUFZLG9CQUFaLEVBQWtDLE9BQWxDLEVBQTJDLDZEQUEzQztBQUNBLHVCQUFXLEtBQVgsR0FBbUIsSUFBbkI7QUFDQSxpQkFBSyxLQUFMLENBQVcsT0FBWCxHQUFxQixNQUFyQjtBQUNBLG9CQUFRLEtBQVIsQ0FBYyxPQUFkLEdBQXdCLE9BQXhCO0FBQ0g7QUFDRDtBQUNBLGVBQU8sS0FBUDtBQUNILEtBbkJEO0FBb0JILENBdkJEOztBQXlCQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxuY29uc29sZS5sb2coJ0hlbGxvLCBwYWxzIScpO1xuXG5jb25zdCBzZXRBY3RpdmVOYXZJdGVtcyA9IGZ1bmN0aW9uICgpIHtcblxuICAgIGNvbnN0IGxpc3QgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCduYXZfX2l0ZW0nKTtcbiAgICBjb25zdCBjdXJyZW50UGFnZSA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmO1xuXG4gICAgZm9yICh2YXIgaXRlcmF0b3IgPSAwOyBpdGVyYXRvciA8IGxpc3QubGVuZ3RoOyArK2l0ZXJhdG9yKSB7XG4gICAgICAgIGNvbnN0IGl0ZW0gPSBsaXN0W2l0ZXJhdG9yXTtcbiAgICAgICAgaWYgKGl0ZW0uaHJlZiA9PT0gY3VycmVudFBhZ2UpIHtcbiAgICAgICAgICAgIGl0ZW0uY2xhc3NMaXN0LmFkZCgnbmF2X19pdGVtLS1hY3RpdmUnKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbmNvbnN0IG5ld3NsZXR0ZXJTdWJtaXQgPSBmdW5jdGlvbiAoKSB7XG5cbiAgICBjb25zdCBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ld3NsZXR0ZXJGb3JtJyk7XG4gICAgZm9ybS5vbnN1Ym1pdCA9IGZ1bmN0aW9uKGUpIHtcblxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGNvbnN0IGVtYWlsSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnbmV3c2xldHRlckVtYWlsJyk7XG4gICAgICAgIGNvbnN0IG1lc3NhZ2UgPSAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ld3NsZXR0ZXJNZXNzYWdlJyk7XG5cbiAgICAgICAgaWYgKGVtYWlsSW5wdXQudmFsaWRpdHkudmFsaWQpe1xuICAgICAgICAgICAgY29uc3QgcGF5bG9hZCA9IHtcbiAgICAgICAgICAgICAgICBlbWFpbDogZW1haWxJbnB1dC52YWx1ZSxcbiAgICAgICAgICAgICAgICBzdGF0dXM6ICdzdWJzY3JpYmVkJ1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vVE9ETzogaGF2ZSB0aGlzIGhpdCBhbiBpbnRlcm5hbCBzZXJ2ZXIgY2FsbCB0byBtYWlsY2hpbXAsIHdpdGggQXV0aG9yaXphdGlvblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ21ha2UgYXBpIGNhbGwgaGVyZScsIHBheWxvYWQsICdodHRwczovL3VzMTcuYXBpLm1haWxjaGltcC5jb20vMy4wL2xpc3RzLzQxMjMwNDFlNWQvbWVtYmVycycpO1xuICAgICAgICAgICAgZW1haWxJbnB1dC52YWx1ZSA9IG51bGw7XG4gICAgICAgICAgICBmb3JtLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgICAgICBtZXNzYWdlLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICB9XG4gICAgICAgIC8vIFlvdSBtdXN0IHJldHVybiBmYWxzZSB0byBwcmV2ZW50IHRoZSBkZWZhdWx0IGZvcm0gYmVoYXZpb3JcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH07XG59O1xuXG5zZXRBY3RpdmVOYXZJdGVtcygpO1xubmV3c2xldHRlclN1Ym1pdCgpO1xuIl19
