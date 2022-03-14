import fs from "fs";
import fsPromises from "fs/promises"
import { exec as exec1, execSync } from "child_process"
import util from "util"
const exec = util.promisify(exec1)

const taqueriaProjectPath = './e2e/auto-test'
const taqueriaProjectPathNPM = './e2e/auto-test-npm-fail';
const taqueriaProjectPathNPMSuccess = './e2e/auto-test-npm-success';
const fileContents =
`{
  "devDependencies": {
    "@taqueria/plugin-ligo": "^0.1.2"
  }
}`

describe("E2E Testing for taqueria general functionality", () => {
    test('Verify that taq init creates test folder', () => {

        try {
            const stdout = execSync(`taq init ${taqueriaProjectPath}`).toString();
            expect(stdout.trim()).toEqual("Project taq'ified!")

            const isTaquified = fs.existsSync(taqueriaProjectPath);
            expect(isTaquified).toBeTruthy();

            fs.rmSync(taqueriaProjectPath, { recursive: true })
        } catch(error) {
            throw new Error (`error: ${error}`);
        }
    });

    test('Verify that trying to install a plugin before initializing as an npm project fails', async () => {

        try {
            await exec(`taq init ${taqueriaProjectPathNPM}`);

            const npmError = await exec(`cd ${taqueriaProjectPathNPM} && taq install @taqueria/plugin-ligo`)
            expect(npmError.stderr).toContain(`"kind": "E_NPM_INIT"`)
            expect(npmError.stderr).toContain(`"msg": "This project isn't a valid NPM project. Please run: npm init"`)
            
            expect(npmError.stderr).toContain(`"kind": "E_READ"`)
            expect(npmError.stderr).toContain(`"name": "NotFound"`)
            expect(npmError.stderr).toContain(`"code": "ENOENT"`)

            await fsPromises.rm(`${taqueriaProjectPathNPM}`, {recursive: true})
        } catch(error) {
            throw new Error (`error: ${error}`);
        }
    });

    test('Verify that to install a plugin all you need is a package.json file', async () => {
        try {
            await exec(`taq init ${taqueriaProjectPathNPMSuccess}`);
            await exec(`echo "{}" > ${taqueriaProjectPathNPMSuccess}/package.json`)
            await exec(`taq install @taqueria/plugin-ligo -p ${taqueriaProjectPathNPMSuccess}`)

            const packageContents = await exec(`cat ${taqueriaProjectPathNPMSuccess}/package.json`)
            expect(packageContents.stdout.trim()).toEqual(fileContents)

            await fsPromises.rm(`${taqueriaProjectPathNPMSuccess}`, {recursive: true})
        } catch(error) {
            throw new Error (`error: ${error}`);
        }
    });
});