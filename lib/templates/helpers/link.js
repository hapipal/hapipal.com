'use strict';

module.exports = function (text, href, isSecure, ctx, options) {

    // {{link "here" "github.com/hapipal/examples/tree/master/paldo-riddles" true}}
    return `<a href=${isSecure ? 'https' : 'http'}://${href} target="_blank" rel="nofollow">${text}</a>`;
};
