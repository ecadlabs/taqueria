type TestAsyncBody = () => Promise<void>
type TestSyncBody = () => void

type TestBody = TestAsyncBody | TestSyncBody

export type Test = (label: string, fn: TestBody) => void|Promise<void>

export default (cb: (test: Test) => void|Promise<void>) => (test: unknown) => cb(test as Test)