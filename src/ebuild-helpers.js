import semver from "semver";

export async function makeEbuild(pckmnt, ver) {
  const {description, homepage, license, versions} = pckmnt;
  const { dependencies } = versions[ver];
  const today = new Date();
  const promises = [];

  const deps = Object.keys(dependencies).map( dep => {
    const depVer = dependencies[dep];
    const vers = semver.toComparators(depVer)[0];
    console.log(`    for dep = ${dep}, depVer = ${depVer}, vers = ${vers}`)
    let out = null;
    if (vers.length === 1) {
      out = `    dev-js/${dep}-${depVer}`
    }
    else {
      const pattern = /(?<left>[<>=]+)(?<right>\d(\.\d(\.\d)?)?)/;
      const lower = vers[0].match(pattern).groups;
      const upper = vers[1].match(pattern).groups;

      out = `    ${lower.left}dev-js/${dep}-${lower.right} ${upper.left}dev-js/${dep}-${upper.right}`
    }

    return out;
  })

  return `# Copyright ${today.getFullYear()} Gentoo Authors
# Distributed under the terms of the GNU General Public License v2

EAPI=8

DESCRIPTION="${description}"
HOMEPAGE="${homepage}"
SRC_URI="https://registry.npmjs.org/\${PN}/-/\${P}.tgz"

LICENSE="${license}"
SLOT="0"
KEYWORDS="~amd64 ~x86"

RDEPEND="
${deps.join('\n')}
"

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

export default { makeEbuild }
