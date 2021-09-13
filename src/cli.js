import {
  getTargetFilename,
  getDependencies
} from "./cli-helpers.js"

export function cli() {
  const target = getTargetFilename();

  if (target === null) {
    return;
  }
  else {
    console.log(`Ok, generating ebuild(s) for ${target}`);

    getDependencies(target).then(deps => {
      console.log(`\ngot deps:`);
      Object.keys(deps).forEach((key) => console.log(`  ${key}: ${deps[key]}`));
    }).catch(err => {
      console.log(`Could not get info from NPM, see detailed error below\n`)
      console.log(`${err}`);
    });
  }
}
