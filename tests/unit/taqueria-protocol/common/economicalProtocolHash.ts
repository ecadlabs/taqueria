import runTests, {Test} from "@taqueria/test-helpers"
import should from "should"
import * as Option from "@taqueria/protocol/Option"
import * as SingleChar from "@taqueria/protocol/SingleChar"
import * as EconomicalProtocolHash from "@taqueria/protocol/EconomicalProtocolHash"


export default runTests((test: Test) => {
    test("Protocol::Verb", () => {
        // Test that the module is exporting the desired interface
        should(Option).has.property("schemas")

        const optionObjectMake = Option.make({
            boolean: true,
            shortFlag: SingleChar.create("d"),
            flag: EconomicalProtocolHash.create("debug"),
            description: ""
        })

        // 1. Assure that the type is Option type using expect-type library
        // expectTypeOf(optionObject).toMatchTypeOf(Option.t)

        // 2. Assert properties of the object
        // e.g. should(optionObject).has.property("schemas")
        // including that we did not specify in make - they should be either undefined or have default values.


        // At least 3 tests for each object
        // Only required fields
        // All fields
        // At least one negative test - e. g. commit one required field + give a wrong type
        //

        // All same tests should be repeated for of
        // The difference that will try to cast type for you - no need to specify type of passed property
        const optionObjectOf = Option.of({
            boolean: true,
            shortFlag: 'd', // Expected value - but we have to test for unexpected value 'da' or
            flag: 'debug' //
        })

        // All same tests for create too - create == make, expect it create object/throw instead of creating future
        const optionObjectCreate = Option.create({
            boolean: true,
            shortFlag: SingleChar.create("d"),
            flag: EconomicalProtocolHash.create("debug"),
            description: ""
        })


        // For schema
        // 1. Verify that it is a property of the object
        // 2. Verify that it has type z.schema
        // should(Option.schema).instanceOf(ZodSchema)

        // for rawSchema
        // 1. Verify that it is a property of the object
        // 2. Verify that it has type z.schema
        // should(Option.rawSchema).instanceOf(ZodSchema)

        // factory is also an object
        should(Option).has.property("factory")
        should(Option.factory).has.property("make")
        should(Option.factory).has.property("create")
        // Also validate that make and create are the functions.

        // Create should return a typed version of its input
        should(Option.create("test")).equal("test")

        // Create throws when input valid is given
        // should.throws(() => {
        //     Option.create("123")
        // })
    })
})
