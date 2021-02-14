'use strict';

const { Service } = require('schmervice');
const Somever = require('@hapi/somever');
const Helpers = require('../helpers');

module.exports = class Npm extends Service {

    packageName(pkg, version) {

        if (!pkg.scopedBegin) {
            return pkg.name;
        }

        if (version === 'latest' || Somever.version(version).compare(pkg.scopedBegin) >= 0) {
            return `@hapipal/${pkg.name}`;
        }

        return pkg.name;
    }

    async version(pkg) {

        const pkgName = this.packageName(pkg, 'latest');
        const url = `https://registry.npmjs.org/${pkgName}/latest`;

        const { payload } = await Helpers.http.get(url, { json: true });

        return payload.version;
    }

    async versions(pkg) {

        const getVersions = async (name) => {

            const url = `https://registry.npmjs.org/${name}`;
            const { payload } = await Helpers.http.get(url, { json: true });

            return Object.keys(payload.versions);
        };

        const pkgName = pkg.name;
        const maybeScopedPkgName = this.packageName(pkg, 'latest');

        const versions = await Promise.all([
            getVersions(pkgName),
            pkgName !== maybeScopedPkgName ? getVersions(maybeScopedPkgName) : []
        ]);

        const byVersionDescending = (a, b) => Somever.version(b).compare(a);

        return versions.flat().sort(byVersionDescending);
    }

    static get caching() {

        return {
            version: {
                expiresIn: 15 * Helpers.time.oneMinuteInMs,
                generateTimeout: Helpers.time.oneMinuteInMs,
                generateKey: (pkg) => pkg.name
            },
            versions: {
                expiresIn: 15 * Helpers.time.oneMinuteInMs,
                generateTimeout: Helpers.time.oneMinuteInMs,
                generateKey: (pkg) => pkg.name
            }
        };
    }
};
