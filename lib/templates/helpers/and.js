'use strict';

module.exports = function (a, b, options) {

    if (arguments.length < 3) {
        throw new Error('Handlebars and helper needs 2 parameters');
    }

    return a && b;
};
