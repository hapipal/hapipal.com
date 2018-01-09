'use strict';

const Boom = require('boom');
const Content = require('../content');

const internals = {};

module.exports = (srv) => ([
    {
        name: 'packages.get',
        method: (pkgName) => {

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
    },
    {
        name: 'packages.list',
        method: () => {

            const toList = (list, key) => {

                const value = (key !== 'defaults') ? srv.methods.packages.get(key) : null;

                return list.concat(value || []);
            };

            return Object.keys(Content.packages).reduce(toList, []);
        }
    }
]);
