'use strict';

const Joi = require('joi');

module.exports = (srv) => ([
    {
        method: 'get',
        path: '/docs',
        options: {
            handler: {
                view: {
                    template: 'docs-list',
                    context: {
                        list: srv.services().packages.list()
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
                const { pkg, latest, versions } = request.pre;
                const { owner, name, docsFile } = pkg;
                const tag = v || latest;

                const html = await request.services().github.markdown(owner, name, docsFile, tag);

                return h.view('docs-detail', { html, versions });
            }
        }
    }
]);
