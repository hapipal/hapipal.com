'use strict';

const Wreck = require('wreck');

const internals = {};

exports.get = (uri, options = {}) => {

    return new Promise((resolve, reject) => {

        internals.wreck.get(uri, options, (err, res, payload) => {

            if (err) {
                return reject(err);
            }

            return resolve({ res, payload });
        });
    });
};

internals.wreck = Wreck.defaults({
    headers: {
        'user-agent': 'hapipal.com'
    }
});
