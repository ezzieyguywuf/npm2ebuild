import { spawn } from "child_process";

export function getTargetFilename() {
  const args = process.argv;

  if (args.length == 2)
  {
    console.log("Please provide an npm package name as a target");
    return null;
  }
  else if (args.length > 3)
  {
    console.log(`Ignoring arguements: ${args.slice(3).join(' ')}`)
  }

  return args[2]
}

export async function getDependencies(pkg) {
  const child = spawn("npm", ["--json", "view", `${pkg}`, "dependencies"]);

  let data = "";
  for await (const chunk of child.stdout) {
    data += chunk;
  }

  let err = "";
  for await(const chunk of child.stderr) {
    err += chunk;
  }

  const exitCode = await new Promise((resolve, reject) => {
    child.on('close', resolve);
  });

  if (exitCode) {
    throw new Error(err);
  }

  return JSON.parse(data);
}
