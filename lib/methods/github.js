'use strict';

const Util = require('util');
const Helpers = require('../helpers');

const internals = {};

module.exports = (srv, options) => ([
    {
        name: 'github.markdown',
        method: Util.callbackify(async (user, repo, version, file) => {

            const url = `https://api.github.com/repos/${user}/${repo}/contents/${file}?ref=v${version}`;

            const headers = internals.auth(options, {
                accept: 'application/vnd.github.3.html'
            });

            const { payload } = await Helpers.http.get(url, { headers });

            return payload.toString();
        }),
        options: {
            cache: {
                expiresIn: Helpers.time.oneYearInMs,
                generateTimeout: Helpers.time.oneMinuteInMs
            }
        }
    }
]);

internals.auth = (options, additional = {}) => {

    const headers = {
        authorization: `token ${options.githubToken}`
    };

    return Object.assign(headers, additional);
};
