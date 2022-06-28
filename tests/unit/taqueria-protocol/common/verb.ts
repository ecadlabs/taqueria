import runTests, {Test} from "@taqueria/test-helpers"
import should from "should"
import * as Verb from "@taqueria/protocol/Verb"


export default runTests((test: Test) => {
    test("Protocol::Verb", () => {
        // Test that the module is exporting the desired interface
        should(Verb).has.property("schemas")

        // Create should return a typed version of its input
        should(Verb.create("test")).equal("test")

        // Create throws when input valid is given
        should.throws(() => {
            Verb.create("123")    
        })
    })
})
