'use strict';

const Joi = require('joi');
const Semver = require('semver');

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
            pre: [
                {
                    assign: 'pkg',
                    method: ({ params }) => srv.services().packages.get(params.pkgName)
                },
                {
                    assign: 'packages',
                    method: () => srv.services().packages.list()
                },
                [
                    {
                        assign: 'latest',
                        method: async ({ params }) => await srv.services().npm.version(params.pkgName)
                    },
                    {
                        assign: 'versions',
                        method: async ({ params }) => await srv.services().npm.versions(params.pkgName)
                    }
                ]
            ],
            async handler(request, h) {

                const { v } = request.query;
                const { pkg, latest, versions, packages } = request.pre;
                const { owner, name, apisBegin } = pkg;
                const version = v || latest;
                const docsFile = (apisBegin && Semver.gte(version, apisBegin)) ? 'API.md' : 'README.md'

                const html = await request.services().github.markdown(owner, name, docsFile, version);

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
