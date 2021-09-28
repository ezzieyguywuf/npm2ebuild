import { spawn } from "child_process";
import semver from "semver";
import https from "https";
import ebuildh from "./ebuild-helpers.js"
import fs from "fs";
import fsp from "fs/promises";
import path from "path";

let PKMNT_CACHE = {};

export function getTargetFilename() {
  const args = process.argv;

  if (args.length == 2)
  {
    console.log("Please provide an npm package name as a target");
    return null;
  }
  else if (args.length > 3)
  {
    console.log(`Ignoring arguments: ${args.slice(3).join(' ')}`)
  }

  return args[2]
}

export async function getPackument(pkg) {
  if (PKMNT_CACHE[pkg]) {
    return PKMNT_CACHE[pkg];
  }
  else {
    const url = `https://registry.npmjs.org/${pkg}`;

    return new Promise((resolve, reject) => {
      const req = https.get(url, incomingMessage => {
        let data = "";

        incomingMessage.on("data", d => data += d);
        incomingMessage.on("end", _ => {
          const packument = JSON.parse(data);

          PKMNT_CACHE[pkg] = packument;
          resolve(packument);
        })
      })

      req.on('error', error => reject(error));
      req.end();
    })
  }
}

async function recurseDeps(packument, ver, accumDeps) {
  const deps = packument.versions[ver].dependencies;

  if (deps !== undefined) {
    let promises = [];
    Object.keys(deps).forEach(dep => {
      promises.push(getPackument(dep))
    })

    const results = await Promise.all(promises);

    // reset the array
    promises.length = 0;

    const unpackResult = result => {
      const dep = result.name;
      const vers = Object.keys(result.versions);
      const depVer = semver.maxSatisfying(vers, deps[dep]);
      return {dep: dep, vers: vers, depVer: depVer};
    }

    results.forEach(result => {
      const {dep, vers, depVer} = unpackResult(result);

      const hasDep = ({ pkg, ver }) => pkg === dep && ver === depVer;

      if (!accumDeps.some(hasDep)) {
        accumDeps.push({pkg: dep, ver: depVer});

        promises.push(getPackument(dep).then(pkmnt => {
          return {pkmnt: pkmnt, depVer: depVer};
        }))
      }
    })

    const pkmnts = await Promise.all(promises);

    for (const {pkmnt, depVer} of pkmnts) {
      accumDeps = await recurseDeps(pkmnt, depVer, accumDeps);
    }
  }

  return accumDeps;
}

async function writeEbuild(pkg, subdir, ver) {
  let cleanVer = ver
  if (semver.prerelease(ver)) {
    cleanVer = `${semver.major(ver)}.${semver.minor(ver)}.${semver.patch(ver)}`
  }
  const fpath = `${path.join(subdir, pkg.name.replace("@", "").replace("/", "-"))}-${cleanVer}.ebuild`;
  const h = await fsp.open(fpath, "w");

  await h.write(ebuildh.makeEbuild(pkg, ver));
  await h.close();
}

async function writeMetadata(subdir) {
  const fpath = `${path.join(subdir, "metadata.xml")}`;
  const h = await fsp.open(fpath, "w");

  await h.write(ebuildh.makeMetadata());
  await h.close();
}

async function writePackage(pkmnt, subdir, ver) {
  const targetDir = path.join(subdir, pkmnt.name.replace("@", "").replace("/", "-"));

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, {recursive: true});
  }

  await writeEbuild(pkmnt, targetDir, ver);
  await writeMetadata(targetDir);
}

export async function makeEbuilds(pkg, subdir) {
  const pkmnt = await getPackument(pkg);
  const ver = pkmnt["dist-tags"].latest;

  console.log(`    Building ebuilds for ${pkg} and deps`)
  console.log(`    got latest ver = ${ver}`)

  await writePackage(pkmnt, subdir, ver);

  let keys = Object.keys(pkmnt.versions[ver])
  console.log(`keys = ${keys}`)

  console.log(`    building recursive list of deps...`);
  const deps = await recurseDeps(pkmnt, ver, []);
  console.log(`    ...done, fetched ${deps.length} dependencies`);

  console.log(`    writing ebuilds for each dep`);
  await Promise.all(deps.map( dep => {
    return getPackument(dep.pkg).then( devPkmnt => {
      return writePackage(devPkmnt, subdir, dep.ver);
    })
  }))
}

export default {
  getTargetFilename,
  getPackument,
  makeEbuilds
}
