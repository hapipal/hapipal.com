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

var palToClipboard = function palToClipboard() {

    var element = document.getElementById('codeBox');
    if (!element) {
        return;
    }
    element.onclick = function () {

        var codeElement = document.getElementById('code');
        document.getElementById('codeCopied').classList.add('code__copied--success');
        codeElement.select();
        document.execCommand('Copy');
    };
};

window.onhashchange = function () {

    document.querySelector('a[href="' + window.location.hash + '"]').scrollIntoView();
};

window.onload = function () {

    if (window.location.hash) {
        document.querySelector('a[href="' + window.location.hash + '"]').scrollIntoView();
    }
};

setActiveNavItems();
newsletterSubmit();
palToClipboard();

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvcHVibGljL2pzL21haW4uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBOztBQUVBLFFBQVEsR0FBUixDQUFZLGNBQVo7O0FBRUEsSUFBTSxvQkFBb0IsU0FBcEIsaUJBQW9CLEdBQU07O0FBRTVCLFFBQU0sT0FBTyxTQUFTLHNCQUFULENBQWdDLFdBQWhDLENBQWI7QUFDQSxRQUFNLGNBQWMsT0FBTyxRQUFQLENBQWdCLElBQXBDOztBQUVBLFNBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxLQUFLLE1BQXpCLEVBQWlDLEVBQUUsQ0FBbkMsRUFBc0M7QUFDbEMsWUFBTSxPQUFPLEtBQUssQ0FBTCxDQUFiO0FBQ0EsWUFBSSxLQUFLLElBQUwsS0FBYyxXQUFsQixFQUErQjtBQUMzQixpQkFBSyxTQUFMLENBQWUsR0FBZixDQUFtQixtQkFBbkI7QUFDSDtBQUNKO0FBQ0osQ0FYRDs7QUFhQSxJQUFNLG1CQUFtQixTQUFuQixnQkFBbUIsR0FBTTs7QUFFM0IsUUFBTSxPQUFPLFNBQVMsY0FBVCxDQUF3QixnQkFBeEIsQ0FBYjs7QUFFQSxRQUFJLENBQUMsSUFBTCxFQUFXO0FBQ1A7QUFDSDs7QUFFRCxTQUFLLFFBQUwsR0FBZ0IsVUFBQyxDQUFELEVBQU87O0FBRW5CLFVBQUUsY0FBRjs7QUFFQSxZQUFNLGFBQWEsU0FBUyxjQUFULENBQXdCLGlCQUF4QixDQUFuQjtBQUNBLFlBQU0sVUFBVSxTQUFTLGNBQVQsQ0FBd0IsbUJBQXhCLENBQWhCOztBQUVBLFlBQUksV0FBVyxRQUFYLENBQW9CLEtBQXhCLEVBQStCO0FBQzNCLGdCQUFNLFVBQVUsS0FBSyxTQUFMLENBQWU7QUFDM0IsdUJBQU8sV0FBVztBQURTLGFBQWYsQ0FBaEI7QUFHQSxnQkFBTSxNQUFNLElBQUksY0FBSixFQUFaO0FBQ0EsZ0JBQUksSUFBSixDQUFTLE1BQVQsRUFBaUIsWUFBakI7QUFDQSxnQkFBSSxnQkFBSixDQUFxQixjQUFyQixFQUFxQyxrQkFBckM7QUFDQSxnQkFBSSxNQUFKLEdBQWEsWUFBTTs7QUFFZixvQkFBSSxJQUFJLE1BQUosS0FBZSxHQUFuQixFQUF3QjtBQUNwQiw0QkFBUSxTQUFSLEdBQW9CLHlCQUF5QixXQUFXLEtBQXBDLEdBQTRDLGlDQUFoRTtBQUNBLCtCQUFXLEtBQVgsR0FBbUIsSUFBbkI7QUFDQSx5QkFBSyxLQUFMLENBQVcsT0FBWCxHQUFxQixNQUFyQjtBQUNBLDRCQUFRLEtBQVIsQ0FBYyxPQUFkLEdBQXdCLE9BQXhCO0FBQ0gsaUJBTEQsTUFNSyxJQUFJLElBQUksTUFBSixLQUFlLEdBQW5CLEVBQXdCO0FBQ3pCLDRCQUFRLFNBQVIsR0FBb0Isd0JBQXdCLFdBQVcsS0FBbkMsR0FBMkMsbURBQS9EO0FBQ0EsK0JBQVcsS0FBWCxHQUFtQixJQUFuQjtBQUNBLCtCQUFXLFNBQVgsQ0FBcUIsR0FBckIsQ0FBeUIsNEJBQXpCO0FBQ0EseUJBQUssS0FBTCxDQUFXLE9BQVgsR0FBcUIsT0FBckI7QUFDQSw0QkFBUSxLQUFSLENBQWMsT0FBZCxHQUF3QixPQUF4QjtBQUNILGlCQU5JLE1BT0E7QUFDRCw0QkFBUSxTQUFSLEdBQW9CLHdCQUF3QixXQUFXLEtBQW5DLEdBQTJDLHlEQUEvRDtBQUNBLCtCQUFXLEtBQVgsR0FBbUIsSUFBbkI7QUFDQSwrQkFBVyxTQUFYLENBQXFCLEdBQXJCLENBQXlCLDRCQUF6QjtBQUNBLHlCQUFLLEtBQUwsQ0FBVyxPQUFYLEdBQXFCLE9BQXJCO0FBQ0EsNEJBQVEsS0FBUixDQUFjLE9BQWQsR0FBd0IsT0FBeEI7QUFDSDtBQUNKLGFBdEJEO0FBdUJBLGdCQUFJLElBQUosQ0FBUyxPQUFUO0FBQ0g7QUFDSixLQXZDRDtBQXdDSCxDQWhERDs7QUFrREEsSUFBTSxpQkFBaUIsU0FBakIsY0FBaUIsR0FBTTs7QUFFekIsUUFBTSxVQUFVLFNBQVMsY0FBVCxDQUF3QixTQUF4QixDQUFoQjtBQUNBLFFBQUksQ0FBQyxPQUFMLEVBQWE7QUFDVDtBQUNIO0FBQ0QsWUFBUSxPQUFSLEdBQWtCLFlBQU07O0FBRXBCLFlBQU0sY0FBYyxTQUFTLGNBQVQsQ0FBd0IsTUFBeEIsQ0FBcEI7QUFDQSxpQkFBUyxjQUFULENBQXdCLFlBQXhCLEVBQXNDLFNBQXRDLENBQWdELEdBQWhELENBQW9ELHVCQUFwRDtBQUNBLG9CQUFZLE1BQVo7QUFDQSxpQkFBUyxXQUFULENBQXFCLE1BQXJCO0FBRUgsS0FQRDtBQVFILENBZEQ7O0FBZ0JBLE9BQU8sWUFBUCxHQUFzQixZQUFNOztBQUV4QixhQUFTLGFBQVQsQ0FBdUIsYUFBYSxPQUFPLFFBQVAsQ0FBZ0IsSUFBN0IsR0FBb0MsSUFBM0QsRUFBaUUsY0FBakU7QUFDSCxDQUhEOztBQUtBLE9BQU8sTUFBUCxHQUFnQixZQUFNOztBQUVsQixRQUFJLE9BQU8sUUFBUCxDQUFnQixJQUFwQixFQUEwQjtBQUN0QixpQkFBUyxhQUFULENBQXVCLGFBQWEsT0FBTyxRQUFQLENBQWdCLElBQTdCLEdBQW9DLElBQTNELEVBQWlFLGNBQWpFO0FBQ0g7QUFDSixDQUxEOztBQU9BO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG4vKiBnbG9iYWwgZG9jdW1lbnQsIHdpbmRvdyAqL1xuXG5jb25zb2xlLmxvZygnSGVsbG8sIHBhbHMhJyk7XG5cbmNvbnN0IHNldEFjdGl2ZU5hdkl0ZW1zID0gKCkgPT4ge1xuXG4gICAgY29uc3QgbGlzdCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ25hdl9faXRlbScpO1xuICAgIGNvbnN0IGN1cnJlbnRQYWdlID0gd2luZG93LmxvY2F0aW9uLmhyZWY7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IGxpc3RbaV07XG4gICAgICAgIGlmIChpdGVtLmhyZWYgPT09IGN1cnJlbnRQYWdlKSB7XG4gICAgICAgICAgICBpdGVtLmNsYXNzTGlzdC5hZGQoJ25hdl9faXRlbS0tYWN0aXZlJyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5jb25zdCBuZXdzbGV0dGVyU3VibWl0ID0gKCkgPT4ge1xuXG4gICAgY29uc3QgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXdzbGV0dGVyRm9ybScpO1xuXG4gICAgaWYgKCFmb3JtKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3JtLm9uc3VibWl0ID0gKGUpID0+IHtcblxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgY29uc3QgZW1haWxJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXdzbGV0dGVyRW1haWwnKTtcbiAgICAgICAgY29uc3QgbWVzc2FnZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXdzbGV0dGVyTWVzc2FnZScpO1xuXG4gICAgICAgIGlmIChlbWFpbElucHV0LnZhbGlkaXR5LnZhbGlkKSB7XG4gICAgICAgICAgICBjb25zdCBwYXlsb2FkID0gSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICAgICAgICAgIGVtYWlsOiBlbWFpbElucHV0LnZhbHVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgeGhyLm9wZW4oJ1BPU1QnLCAnL21haWxjaGltcCcpO1xuICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XG4gICAgICAgICAgICB4aHIub25sb2FkID0gKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLmlubmVySFRNTCA9ICdZb3VyIGVtYWlsIGFkZHJlc3M6ICcgKyBlbWFpbElucHV0LnZhbHVlICsgJywgaXMgbm93IHNpZ25lZCB1cC4gVGhhbmtzIHBhbCEnO1xuICAgICAgICAgICAgICAgICAgICBlbWFpbElucHV0LnZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgZm9ybS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh4aHIuc3RhdHVzID09PSA0MDApIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSAnVGhlIGVtYWlsIGFkZHJlc3M6ICcgKyBlbWFpbElucHV0LnZhbHVlICsgJyBpcyBlaXRoZXIgaW52YWxpZCwgb3IgbWF5IGFscmVhZHkgYmUgc3Vic2NyaWJlZC4nO1xuICAgICAgICAgICAgICAgICAgICBlbWFpbElucHV0LnZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgZW1haWxJbnB1dC5jbGFzc0xpc3QuYWRkKCduZXdzbGV0dGVyX19pbnB1dC0taW52YWxpZCcpO1xuICAgICAgICAgICAgICAgICAgICBmb3JtLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZS5pbm5lckhUTUwgPSAnVGhlIGVtYWlsIGFkZHJlc3M6ICcgKyBlbWFpbElucHV0LnZhbHVlICsgJyBtYXkgYmUgaW52YWxpZCwgb3IgeW91ciBuZXR3b3JrIGNvbm5lY3Rpb24gaXMgaW5hY3RpdmUnO1xuICAgICAgICAgICAgICAgICAgICBlbWFpbElucHV0LnZhbHVlID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgZW1haWxJbnB1dC5jbGFzc0xpc3QuYWRkKCduZXdzbGV0dGVyX19pbnB1dC0taW52YWxpZCcpO1xuICAgICAgICAgICAgICAgICAgICBmb3JtLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgICAgICBtZXNzYWdlLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICB4aHIuc2VuZChwYXlsb2FkKTtcbiAgICAgICAgfVxuICAgIH07XG59O1xuXG5jb25zdCBwYWxUb0NsaXBib2FyZCA9ICgpID0+IHtcblxuICAgIGNvbnN0IGVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY29kZUJveCcpO1xuICAgIGlmICghZWxlbWVudCl7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgZWxlbWVudC5vbmNsaWNrID0gKCkgPT4ge1xuXG4gICAgICAgIGNvbnN0IGNvZGVFbGVtZW50ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvZGUnKTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2NvZGVDb3BpZWQnKS5jbGFzc0xpc3QuYWRkKCdjb2RlX19jb3BpZWQtLXN1Y2Nlc3MnKTtcbiAgICAgICAgY29kZUVsZW1lbnQuc2VsZWN0KCk7XG4gICAgICAgIGRvY3VtZW50LmV4ZWNDb21tYW5kKCdDb3B5Jyk7XG5cbiAgICB9O1xufTtcblxud2luZG93Lm9uaGFzaGNoYW5nZSA9ICgpID0+IHtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2FbaHJlZj1cIicgKyB3aW5kb3cubG9jYXRpb24uaGFzaCArICdcIl0nKS5zY3JvbGxJbnRvVmlldygpO1xufTtcblxud2luZG93Lm9ubG9hZCA9ICgpID0+IHtcblxuICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaCkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdhW2hyZWY9XCInICsgd2luZG93LmxvY2F0aW9uLmhhc2ggKyAnXCJdJykuc2Nyb2xsSW50b1ZpZXcoKTtcbiAgICB9XG59O1xuXG5zZXRBY3RpdmVOYXZJdGVtcygpO1xubmV3c2xldHRlclN1Ym1pdCgpO1xucGFsVG9DbGlwYm9hcmQoKTtcbiJdfQ==
