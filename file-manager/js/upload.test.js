const rewire = require("rewire")
const upload = rewire("./upload")
const testFunction = upload.__get__("testFunction")
// @ponicode
describe("testFunction", () => {
    test("0", () => {
        testFunction("foo bar", 10)
    })

    test("1", () => {
        testFunction(undefined, undefined)
    })
})
