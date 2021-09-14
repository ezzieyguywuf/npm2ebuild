import * as clih from "./cli-helpers.js"
import * as ebuildh from "./ebuild-helpers.js"
import fs from "fs";

export async function cli() {
  const target = clih.getTargetFilename();

  if (target === null) {
    return;
  }
  else {
    const subdir = `dev-js`;
    console.log(`Ok, generating ebuild(s) for ${target}`);
    console.log(`Targetting subdir ${subdir}`)


    // const deps = await clih.getDependencies(target);
    // deps.forEach(({ pkg, ver }) => console.log(`    ${pkg}: ${ver}`))
    const pkmnt = await clih.getPackument(target);
    const ebuild = await ebuildh.makeEbuild(pkmnt, "6.26.2");

    if (!fs.existsSync(subdir)) {
      console.log(`creating subdir ${subdir}`)
      fs.mkdirSync(subdir);
    }

    console.log(ebuild)
  }
}
