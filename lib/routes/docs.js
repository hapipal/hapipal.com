'use strict';

const Joi = require('@hapi/joi');
const Bounce = require('@hapi/bounce');
const Somever = require('@hapi/somever');
const Toys = require('toys');

const internals = {};

module.exports = (srv) => ([
    {
        method: 'get',
        path: '/docs',
        options: {
            handler: {
                view: {
                    template: 'docs-list',
                    context: {
                        packages: srv.services().packages.list()
                    }
                }
            }
        }
    },
    {
        method: 'get',
        path: '/docs/{pkgName}',
        options: {
            validate: {
                params: Joi.object({
                    pkgName: Joi.string().lowercase()
                }),
                query: Joi.object({
                    v: Joi.string()
                })
            },
            pre: Toys.pre([
                {
                    pkg: ({ params }) => srv.services().packages.get(params.pkgName)
                },
                {
                    packages: () => srv.services().packages.list()
                },
                {
                    latest: async ({ params, pre }) => pre.pkg.npm && await srv.services().npm.version(params.pkgName),
                    versions: async ({ params, pre }) => pre.pkg.npm && await srv.services().npm.versions(params.pkgName)
                }
            ]),
            async handler(request, h) {

                const { isValidVersion } = internals;
                const { v } = request.query;
                const { pkg, latest, versions, packages } = request.pre;
                const { owner, name, apisBegin, ref } = pkg;
                const version = (v && isValidVersion(v)) ? v : latest;
                const docsFile = (apisBegin && Somever.version(version).compare(apisBegin) >= 0) ? 'API.md' : 'README.md';

                const html = await request.services().github.markdown(owner, name, docsFile, (ref || !version) ? ref : `v${version}`);

                return h.view('docs-detail', {
                    html,
                    versions,
                    version,
                    packages,
                    pkg
                });
            }
        }
    }
]);

internals.isValidVersion = (ver) => {

    try {
        Somever.version(ver);
    }
    catch (err) {
        Bounce.rethrow(err, 'system');
        return false;
    }

    return true;
};
