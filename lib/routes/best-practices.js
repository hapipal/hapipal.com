'use strict';

const Joi = require('joi');

module.exports = (srv) => ([
    {
        method: 'get',
        path: '/best-practices',
        options: {
            handler: {
                view: {
                    template: 'best-practices-list',
                    context: {
                        bestPractices: srv.services().bestPractices.list()
                    }
                }
            }
        }
    },
    {
        method: 'get',
        path: '/best-practices/{slug}',
        options: {
            validate: {
                params: {
                    slug: Joi.string().lowercase()
                }
            },
            pre: [
                {
                    assign: 'bp',
                    method: ({ params }) => srv.services().bestPractices.get(params.slug)
                },
                {
                    assign: 'bestPractices',
                    method: () => srv.services().bestPractices.list()
                }
            ],
            async handler(request, h) {

                const { bp, bestPractices } = request.pre;

                const html = await request.services().github.markdownFromFile(bp.filename);

                return h.view('best-practices-detail', { html, bp, bestPractices });
            }
        }
    }
]);
