export const typecheckTableOneRow = `
┌────────────────┬──────────────┐
│ Contract       │ Artifact     │
├────────────────┼──────────────┤
│ hello-tacos.tz │ Well typed   │
└────────────────┴──────────────┘
`.trimStart()

export const typecheckTableTwoRows = `
┌────────────────────┬──────────────┐
│ Contract           │ Artifact     │
├────────────────────┼──────────────┤
│ hello-tacos-one.tz │ Well typed   │
├────────────────────┴──────────────┤
│ hello-tacos-two.tz │ Well typed   │
└────────────────────┴──────────────┘
`.trimStart()

export const typecheckNonExistent = `
┌────────────┬──────────────┐
│ Contract   │ Artifact     │
├────────────┼──────────────┤
│ test.tz    │ Not typed    │
└────────────┴──────────────┘
`.trimStart()

export const typecheckIllTyped = `
┌───────────────────────────┬──────────────┐
│ Contract                  │ Artifact     │
├───────────────────────────┼──────────────┤
│ hellow-tacos-ill-typed.tz │ Ill-typed    │
└───────────────────────────┴──────────────┘
`.trimStart()