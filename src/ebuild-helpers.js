export function makeEbuild(pckmnt, ver) {
  const {description, homepage, license, versions} = pckmnt;
  const { dependencies } = versions[ver];
  const today = new Date();
  const deps = "TODO";

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
${deps}
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
