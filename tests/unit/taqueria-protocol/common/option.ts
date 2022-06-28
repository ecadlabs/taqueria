import runTests, {Test} from "@taqueria/test-helpers"
import should from "should"
import * as Option from "@taqueria/protocol/Option"


export default runTests((test: Test) => {
    test("Protocol::Verb", () => {
        // Test that the module is exporting the desired interface
        should(Option).has.property("schemas")

        // Create should return a typed version of its input
        should(Option.create("test")).equal("test")

        // Create throws when input valid is given
        should.throws(() => {
            Option.create("123") 
        })
    })
})
