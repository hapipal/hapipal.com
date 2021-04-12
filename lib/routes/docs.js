'use strict';

const Joi = require('joi');
const Bounce = require('@hapi/bounce');
const Somever = require('@hapi/somever');
const Toys = require('@hapipal/toys');

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
                    latest: async ({ pre }) => pre.pkg.npm && await srv.services().npm.version(pre.pkg),
                    versions: async ({ pre }) => pre.pkg.npm && await srv.services().npm.versions(pre.pkg)
                }
            ]),
            async handler(request, h) {

                const { isValidVersion } = internals;
                const { npm, github } = request.services();
                const { v } = request.query;
                const { pkg, latest, versions, packages } = request.pre;
                const { owner, name, apisBegin, ref } = pkg;
                const version = (v && isValidVersion(v)) ? v : latest;
                const docsFiles = (apisBegin && Somever.version(version).compare(apisBegin) >= 0) ? ['README.md', 'API.md'] : ['README.md'];

                const getDocs = async (file) => {

                    return await github.markdown(owner, name, file, (ref || !version) ? ref : `v${version}`);
                };

                const htmls = await Promise.all(docsFiles.map(getDocs));
                const versionedPackageName = pkg.npm && npm.packageName(pkg, (ref || !version) ? 'latest' : version);

                return h.view('docs-detail', {
                    html: internals.fixApiLinks(htmls.join('\n')),
                    versions: !ref && versions, // Don't include a version list of we can't fetch docs for them anyway
                    version,
                    packages,
                    pkg,
                    versionedPackageName
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

internals.fixApiLinks = (html) => {

    const [apiAnchorHref] = html.match(/href="#api(?:-reference)?"/i) || [];

    if (apiAnchorHref) {
        return html
            .replace(/href="API\.md"/ig, apiAnchorHref) // href="API.md" -> href="#api"
            .replace(/href="API\.md#/ig, 'href="#');    // href="API.md#some-method" -> href="#some-method"
    }

    return html;
};
