'use strict';

const Joi = require('@hapi/joi');
const Somever = require('@hapi/somever');
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

                let version = latest;
                if (v) {
                    try {
                        // Throws if v is an invalid semver value
                        // We don't assign the Somever-validated object representation
                        // to stay consistent with our templates
                        Somever.version(v);
                        version = v;
                    }
                    catch (e) {
                        console.error(`Invalid version supplied via query param: ${v}`);
                    }
                }

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
