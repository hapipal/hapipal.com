'use strict';

const Util = require('util');
const Wreck = require('wreck');
const Helpers = require('../helpers');

const internals = {};

module.exports = (srv, options) => ([{
    name: 'github.markdown',
    method: Util.callbackify(async (repo, version) => {

        const url = `https://api.github.com/repos/${repo}/contents/API.md?ref=v${version}`;

        const headers = internals.headers(options, {
            accept: 'application/vnd.github.3.html'
        });

        return await internals.get(url, { headers });
    }),
    options: {
        cache: {
            expiresIn: Helpers.time.oneYearInMs,
            generateTimeout: Helpers.time.oneMinuteInMs
        }
    }
}]);

internals.get = Util.promisify(Wreck.get);

internals.headers = (options, additional = {}) => {

    const headers = {
        'user-agent': 'hapipal.com',
        authorization: `token ${options.githubToken}`
    };

    return Object.assign(headers, additional);
};
