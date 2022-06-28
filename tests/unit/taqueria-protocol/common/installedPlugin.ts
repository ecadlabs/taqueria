import runTests, {Test} from "@taqueria/test-helpers"
import should from "should"
import * as Verb from "@taqueria/protocol/Verb"

// create
// of
// make
// t
// schemas
// factory
// rawSchema

export default runTests((test: Test) => {
    test("Protocol::Verb", () => {
        // Test that the module is exporting the desired interface
        should(Verb).has.property("schemas")


        should(Verb).has.property("factory")

        // they will be all properties of z-schema

        // make and create are functions

        // t is a runtime type - cannot use typeof
        // https://www.npmjs.com/package/expect-type

        // Create should return a typed version of its input
        should(Verb.create("test")).equal("test") // as it is inputs expects

        // of it does not throw - it returns future

        // make also does not throw - it also returns future.

        // Difference between of and make is at off the input is an unknown type and the future that it returns
        // will be either rejected and resovoled. (e. g. we can use approach that we used for deno tests see there
        // convert it to promise and resolve

        // make on the other hand - the input will be more gradual -> build-in types + custom defined types

        Verb.

        // Create throws when input valid is given
        should.throws(() => {
            Verb.create("123")    // -> if we pass not valid type
        })
    })
})
