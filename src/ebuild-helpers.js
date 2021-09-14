import semver from "semver";

export function makeEbuild(pckmnt, ver) {
  const {description, homepage, license, versions} = pckmnt;
  const { dependencies } = versions[ver];
  const today = new Date();
  const promises = [];

  let depString = ""

  if (dependencies) {
    const deps = Object.keys(dependencies).map( dep => {
      const depVer = dependencies[dep];
      const vers = semver.toComparators(depVer)[0];
      let out = null;
      if (vers.length === 1) {
        out = `	dev-js/${dep}-${depVer}`
      }
      else {
        const pattern = /(?<left>[<>=]+)(?<right>\d(\.\d(\.\d)?)?)/;
        const lower = vers[0].match(pattern).groups;
        const upper = vers[1].match(pattern).groups;

        out = `	${lower.left}dev-js/${dep}-${lower.right} ${upper.left}dev-js/${dep}-${upper.right}`
      }

      return out;
    }).join('\n');

    depString = `\nRDEPEND="${deps}"\n`
  }
  else {
    console.log(`    pkg ${pckmnt.name} has zero deps`);
  }

  return `# Copyright ${today.getFullYear()} Gentoo Authors
# Distributed under the terms of the GNU General Public License v2

EAPI=8

DESCRIPTION="${description}"
HOMEPAGE="${homepage}"
SRC_URI="https://registry.npmjs.org/\${PN}/-/\${P}.tgz"

LICENSE="${license}"
SLOT="0"
KEYWORDS="~amd64 ~x86"
${depString}
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

	einstalldocs
}`;
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
