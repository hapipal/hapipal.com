'use strict';

const { Service } = require('schmervice');
const Semver = require('semver');
const Helpers = require('../helpers');

module.exports = class Npm extends Service {

    async version(pkgName) {

        const url = `https://registry.npmjs.org/${pkgName}/latest`;

        const { payload } = await Helpers.http.get(url, { json: true });

        return payload && payload.version;
    }

    async versions(pkgName) {

        const url = `https://registry.npmjs.org/${pkgName}`;

        const { payload } = await Helpers.http.get(url, { json: true });

        return payload && Object.keys(payload.versions || []).sort(Semver.rcompare);
    }

    static get caching() {

        return {
            version: {
                expiresIn: 15 * Helpers.time.oneMinuteInMs,
                generateTimeout: Helpers.time.oneMinuteInMs
            },
            versions: {
                expiresIn: 15 * Helpers.time.oneMinuteInMs,
                generateTimeout: Helpers.time.oneMinuteInMs
            }
        };
    }
};
