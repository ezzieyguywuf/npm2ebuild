import semver from "semver";

export function makeEbuild(pckmnt, ver) {
  const {description, homepage, versions} = pckmnt;
  const { dependencies } = versions[ver];
  const today = new Date();
  const promises = [];
  const licensePattern = /(BSD-\d).*/

  let license = versions[ver].license

  if (license.match(/BSD-3.*/)) {
    license = "BSD";
  }
  else if (license.match(/(BSD-\d).*/)) {
    license = license.replace(licensePattern, "$1")
  }

  let deps = null;
  if (dependencies) {
    deps = Object.keys(dependencies).map( dep => {
      const depVer = dependencies[dep];
      const vers = semver.toComparators(depVer)[0];
      const pattern = /(?<left>[<>=]+)?(?<right>\d+(\.\d+(\.\d+)?)?)/;
      const cleanDep = dep.replace("@", "").replace("/", "-");

      let out = null;

      if (vers.length === 1) {
        const match = vers[0].match(pattern).groups;
        out = `${match.left ? match.left : ">="}dev-js/${cleanDep}-${match.right}`
      }
      else {
        const lower = vers[0].match(pattern).groups;
        const upper = vers[1].match(pattern).groups;

        out = `${lower.left}dev-js/${cleanDep}-${lower.right} ${upper.left}dev-js/${cleanDep}-${upper.right}`
      }

      return out;
    });
  }
  else {
    console.log(`    pkg ${pckmnt.name} has zero deps`);
  }

  let INSTALL_BIN = ""
  if (versions[ver].bin) {
    if (deps !== null) {
      deps = ["net-libs/nodejs", ...deps]
    }
    else {
      deps = ["net-libs/nodejs"]
    }
    INSTALL_BIN = `\n
	
`
  }

  let depString = "";
  if (deps !== null) {
    if (deps.length === 1) {
      depString = `RDEPEND="${deps[0]}"`
    }
    else {
      console.log(`deps = ${deps}`)
      depString = `RDEPEND="\n\t${deps.join('\n\t')}\n"`
    }
  }

  let descriptionString = description;
  if (!descriptionString) {
    descriptionString = "The ${pckmnt.name} npm package."
  }
  else {
    if (description.length > 79) {
      console.log(`WARNING WARNING WARNING description for ${pckmnt.name} is too long!!!`)
    }

    descriptionString = descriptionString.replaceAll("`", "'")
  }

  let src = "";
  let MY_Ps = "";
  let MY_PV = "";
  let MY_P = `MY_P="\${MY_SUB}-\${MY_PV}"`;

  if (semver.prerelease(ver)) {
    MY_PV = `\nMY_PV="${ver}"`
    MY_P = `MY_P="\${PN}-\${MY_PV}"`
  }

  if (pckmnt.name.includes("@")) {
    MY_Ps = `
MY_SUB="\$(ver_cut 2- \${PN})"
MY_PN="@\$(ver_cut 1 \${PN})/\${MY_SUB}"${MY_PV}
${MY_P}
`
    src = `https://registry.npmjs.org/\${MY_PN}/-/\${MY_P}.tgz -> \${P}.tgz`
  }
  else if (MY_PV !== "") {
    MY_Ps = `\n${MY_PV}\n${MY_P}\n`
    src = `https://registry.npmjs.org/\${PN}/-/\${MY_P}.tgz -> \${P}.tgz`
  }
  else {
    src = "https://registry.npmjs.org/\${PN}/-/\${P}.tgz"
  }

  let INSTALL_BIN = "";

  return `# Copyright ${today.getFullYear()} Gentoo Authors
# Distributed under the terms of the GNU General Public License v2

EAPI=8
${MY_Ps}
DESCRIPTION="${descriptionString}"
HOMEPAGE="${homepage}"
SRC_URI="${src}"

LICENSE="${license}"
SLOT="0"
KEYWORDS="~amd64 ~x86"
${depString}
BDEPEND=">=net-libs/nodejs-16[npm]"
src_compile() {
	# nothing to compile here
	:
}

S="\${WORKDIR}/package"

src_install() {
	npm \\
		--audit false \\
		--color false \\
		--foreground-scripts \\
		--global \\
		--offline \\
		--omit dev \\
		--prefix "\${ED}"/usr \\
		--progress false \\
		--verbose \\
		install "\${DISTDIR}/\${P}".tgz || die "npm install failed"

	einstalldocs${INSTALL_BIN}
}
`;
}

function makeMetadata() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE pkgmetadata SYSTEM "http://www.gentoo.org/dtd/metadata.dtd">
<pkgmetadata>
	<maintainer type="person">
		<email>ezzieyguywuf@gmail.com</email>
		<name>Wolfgang E. Sanyer</name>
	</maintainer>
</pkgmetadata>`
}

export default { makeEbuild, makeMetadata }
