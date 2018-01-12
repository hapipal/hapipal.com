'use strict';

const { Service } = require('schmervice');
const Boom = require('boom');
const Content = require('../content');

module.exports = class Packages extends Service {

    get(pkgName) {

        const pkg = Content.packages[pkgName];

        if (!pkg || (pkgName === 'defaults')) {
            throw Boom.notFound('Package not found');
        }

        return {
            name: pkgName,
            ...Content.packages.defaults,
            ...pkg
        };
    }

    list() {

        const toList = (list, key) => {

            const value = (key !== 'defaults') ? this.get(key) : null;

            return list.concat(value || []);
        };

        return Object.keys(Content.packages).reduce(toList, []);
    }
};
