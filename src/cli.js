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
      Object.keys(deps).forEach((key) => {
        let out = `    ${key}: `;

        if (typeof(deps[key]) === 'object') {
          out += JSON.stringify(deps[key])
        }
        else {
          out += deps[key]
        }
        console.log(out);
      })
    }).catch(err => {
      console.log(`${err}`);
    });
  }
}
