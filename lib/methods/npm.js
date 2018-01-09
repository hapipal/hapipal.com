'use strict';

const Semver = require('semver');
const Helpers = require('../helpers');

module.exports = (srv, options) => ([
    {
        name: 'npm.version',
        method: async (pkgName) => {

            const url = `https://registry.npmjs.org/${pkgName}/latest`;

            const { payload } = await Helpers.http.get(url, { json: true });

            return payload && payload.version;
        },
        options: {
            cache: {
                expiresIn: 15 * Helpers.time.oneMinuteInMs,
                generateTimeout: Helpers.time.oneMinuteInMs
            }
        }
    },
    {
        name: 'npm.versions',
        method: async (pkgName) => {

            const url = `https://registry.npmjs.org/${pkgName}`;

            const { payload } = await Helpers.http.get(url, { json: true });

            return payload && Object.keys(payload.versions || []).sort(Semver.rcompare);
        },
        options: {
            cache: {
                expiresIn: 15 * Helpers.time.oneMinuteInMs,
                generateTimeout: Helpers.time.oneMinuteInMs
            }
        }
    }
]);
