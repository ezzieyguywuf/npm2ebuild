import {
  getTargetFilename,
  getDependencies
} from "./cli-helpers.js"

export async function cli() {
  const target = getTargetFilename();

  if (target === null) {
    return;
  }
  else {
    console.log(`Ok, generating ebuild(s) for ${target}`);

    const deps = await getDependencies(target);

    console.log(JSON.stringify(deps))
    deps.forEach(({ pkg, ver }) => console.log(`    ${pkg}: ${ver}`))
  }
}
