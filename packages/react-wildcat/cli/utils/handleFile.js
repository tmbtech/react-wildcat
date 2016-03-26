"use strict";

const resolve = require("resolve");

// Use project babel if found
let projectBabel;

function findBabel(root) {
    if (projectBabel) {
        return projectBabel;
    }

    try {
        const babelPath = resolve.sync("babel", {
            basedir: root
        });

        projectBabel = require(babelPath);
    } catch (e) {
        if (!e.message.startsWith("Cannot find module")) {
            throw e;
        }

        projectBabel = require("babel");
    }

    return projectBabel;
}

module.exports = function handleFile(commander, wildcatOptions) {
    "use strict";

    const root = wildcatOptions.root;
    const logger = wildcatOptions.logger;

    const outDir = wildcatOptions.outDir;
    const sourceDir = wildcatOptions.sourceDir;

    const transpiler = require("./transpiler")(commander, wildcatOptions);
    const copyFiles = require("./copyFiles")(commander, wildcatOptions);

    // Worker processes strip functions out of objects
    // So here I'm making sure Babel is defined. If not, I need to find it again.
    const babel = wildcatOptions.babel || findBabel(root);
    const util = babel.util;

    function log(msg) {
        "use strict";

        if (!commander.quiet) {
            logger.meta(msg);
        }
    }

    return function (filename, done) {
        "use strict";

        const transpiledFilename = filename.replace(sourceDir, outDir);

        if (util.canCompile(filename, commander.extensions)) {
            return transpiler(filename, (err) => {
                log(`${filename} -> ${transpiledFilename}`);
                return done && done(err);
            });
        } else if (commander.copyFiles) {
            return copyFiles(filename, (err) => {
                log(`${filename} -> ${transpiledFilename}`);
                return done && done(err);
            });
        }

        return done && done();
    };
};
