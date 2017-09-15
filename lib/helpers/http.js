'use strict';

const Wreck = require('wreck');

const internals = {};

module.exports = Wreck.defaults({
    headers: {
        'user-agent': 'hapipal.com'
    }
});
