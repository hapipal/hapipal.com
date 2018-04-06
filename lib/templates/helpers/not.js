'use strict';

module.exports = function (x, options) {

    if (arguments.length < 1) {
        throw new Error('Handlebars not helper needs 1 parameter');
    }

    return !x;
};
