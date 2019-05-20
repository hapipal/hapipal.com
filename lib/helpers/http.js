'use strict';

const Wreck = require('@hapi/wreck');

const internals = {};

module.exports = Wreck.defaults({
    headers: {
        'user-agent': 'hapipal.com'
    }
});
