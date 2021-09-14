import clih from "./cli-helpers.js"

export async function cli() {
  const target = clih.getTargetFilename();

  if (target === null) {
    return;
  }
  else {
    const subdir = `dev-js`;
    console.log(`Ok, generating ebuild(s) for ${target}`);
    console.log(`Targetting subdir ${subdir}`)

    const deps = await clih.makeEbuilds(target, subdir);
  }
}
