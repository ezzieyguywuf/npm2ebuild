import { getTargetFilename } from "./cli-helpers.js"
export function cli() {
  const target = getTargetFilename();

  if (target === null) {
    return;
  }
  else {
    console.log(`Ok, generating ebuild(s) for ${target}`)
  }
}
