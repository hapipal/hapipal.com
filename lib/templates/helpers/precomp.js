'use strict';

const Hbs = require('handlebars');

module.exports = (content, noEscape, ctx) => {

    // {{{precomp html true }}}
    return Hbs.compile(content, { noEscape })(ctx);
};
