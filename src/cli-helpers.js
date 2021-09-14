import { spawn } from "child_process";
import semver from "semver";
import https from "https";

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

export async function getDependencies(pkg) {
  console.log(`    getting deps for ${pkg}`)
  const packument = await getPackument(pkg);
  const ver = packument["dist-tags"].latest;
  console.log(`    got latest ver = ${ver}`)
  console.log(`    building recursive list of deps...`);

  const deps = await recurseDeps(packument, ver, []);
  console.log(`    ...done, fetched ${deps.length} dependencies`)

  return deps;
}

export default {
  getTargetFilename,
  getPackument,
  getDependencies
}
