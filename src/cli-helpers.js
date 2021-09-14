import { spawn } from "child_process";
import semver from "semver";
import https from "https";

const REGISTRY = "https://registry.npmjs.org/"

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

export async function runCommand(child) {
  let data = "";
  let err = "";

  for await (const chunk of child.stdout) {
    data += chunk;
  }

  for await(const chunk of child.stderr) {
    err += chunk;
  }

  const exitCode = await new Promise((resolve, reject) => {
    child.on('close', resolve);
  });

  if (exitCode) {
    throw new Error(`cmd = ${child.spawnargs.join(' ')}:\n${err}`);
  }

  return data;
}

function getVersions(pkg) {
  const url = REGISTRY + pkg;

  return new Promise((resolve, reject) => {
    const options = {headers: {Accept: "application/vnd.npm.install-v1+json"}}
    const req = https.get(url, options, incomingMessage => {
      let data = "";

      incomingMessage.on("data", d => data += d);
      incomingMessage.on("end", _ => {
        resolve(Object.keys(JSON.parse(data).versions));
      })
    })

    req.on('error', error => reject(error));
    req.end();
  })
}

async function getPackument(pkg) {
  const url = REGISTRY + `${pkg}`;

  return new Promise((resolve, reject) => {
    const options = {headers: {Accept: "application/vnd.npm.install-v1+json"}}
    const req = https.get(url, options, incomingMessage => {
      let data = "";

      incomingMessage.on("data", d => data += d);
      incomingMessage.on("end", _ => {
        const packument = JSON.parse(data);

        resolve(packument);
      })
    })

    req.on('error', error => reject(error));
    req.end();
  })
}

export async function getDependencies(pkg) {
  console.log(`    getting deps for ${pkg}`)
  const packument = await getPackument(pkg);
  const ver = packument["dist-tags"].latest;
  console.log(`    get latest ver = ${ver}`)

  const deps = packument.versions[ver].dependencies;

  return deps;
}
