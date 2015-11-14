import ensure from "../../../index.js"; // eslint-disable-line import/default

// React router route
export const path = "/import-async-example";

// Lazy loaded components
export function getComponents(location, cb) {
    return ensure([
        "./array/AsyncErrorExampleOne.fixture.js",
        "./array/AsyncErrorExampleTwo.fixture.js"
    ], module, (err, modules) => {
        return cb(err, modules);
    });
}
