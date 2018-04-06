'use strict';

module.exports = function (a, b, options) {

    if (arguments.length < 3) {
        throw new Error('Handlebars equal helper needs 2 parameters');
    }

    return (a === b) ? options.fn(this) : options.inverse(this);
};
