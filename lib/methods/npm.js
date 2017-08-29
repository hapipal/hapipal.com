'use strict';

const Util = require('util');
const Semver = require('semver');
const Helpers = require('../helpers');

module.exports = (srv, options) => ([{
    name: 'npm.version',
    method: Util.callbackify(async (pkg) => {

        const url = `https://registry.npmjs.org/${pkg}/latest`;

        const { payload } = await Helpers.http.get(url, { json: true });

        return payload && payload.version;
    }),
    options: {
        cache: {
            expiresIn: 15 * Helpers.time.oneMinuteInMs,
            generateTimeout: Helpers.time.oneMinuteInMs
        }
    }
},
{
    name: 'npm.versions',
    method: Util.callbackify(async (pkg) => {

        const url = `https://registry.npmjs.org/${pkg}`;

        const { payload } = await Helpers.http.get(url, { json: true });

        return payload && Object.keys(payload.versions || []).sort(Semver.rcompare);
    }),
    options: {
        cache: {
            expiresIn: 15 * Helpers.time.oneMinuteInMs,
            generateTimeout: Helpers.time.oneMinuteInMs
        }
    }
}]);
