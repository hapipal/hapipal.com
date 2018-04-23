'use strict';

const Joi = require('joi');
const Semver = require('semver');
const Toys = require('toys');

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
                params: {
                    pkgName: Joi.string().lowercase()
                },
                query: {
                    v: Joi.string()
                }
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

                const { v } = request.query;
                const { pkg, latest, versions, packages } = request.pre;
                const { owner, name, apisBegin, ref } = pkg;
                const version = v || latest;
                const docsFile = (apisBegin && Semver.gte(version, apisBegin)) ? 'API.md' : 'README.md';

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
