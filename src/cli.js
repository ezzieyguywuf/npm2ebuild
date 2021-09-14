import * as clih from "./cli-helpers.js"
import * as ebuildh from "./ebuild-helpers.js"

export async function cli() {
  const target = clih.getTargetFilename();

  if (target === null) {
    return;
  }
  else {
    console.log(`Ok, generating ebuild(s) for ${target}`);


    // const deps = await clih.getDependencies(target);
    // deps.forEach(({ pkg, ver }) => console.log(`    ${pkg}: ${ver}`))
    const pkmnt = await clih.getPackument(target);
    const ebuild = ebuildh.makeEbuild(pkmnt, "6.26.2");

    console.log(ebuild)
  }
}
