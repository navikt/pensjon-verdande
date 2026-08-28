/**
 * @react-router/node og @react-router/express deklarerer typescript som en
 * (optional) peerDependency. Siden typescript uansett finnes som
 * devDependency i prosjektet, hoister pnpm den likevel inn - også ved
 * `pnpm install --prod` (kun i Docker-imaget). TypeScript 7 sin native
 * tsc-binær er skrevet i Go, og drar dermed med seg sårbare versjoner av
 * Go-standardbiblioteket og eksterne Go-moduler (f.eks. golang.org/x/text)
 * inn i produksjonsavhengighetene.
 * Siden pakkene ikke bruker typescript i runtime, fjerner vi
 * peerDependency-deklarasjonen her slik at pnpm aldri binder den.
 */
function readPackage(pkg) {
	if (pkg.name === "@react-router/node" || pkg.name === "@react-router/express") {
		if (pkg.peerDependencies) {
			delete pkg.peerDependencies.typescript
		}
		if (pkg.peerDependenciesMeta) {
			delete pkg.peerDependenciesMeta.typescript
		}
	}
	return pkg
}

module.exports = {
	hooks: {
		readPackage,
	},
}
