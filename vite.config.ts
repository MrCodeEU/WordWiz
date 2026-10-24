import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { paraglide } from "@inlang/paraglide-sveltekit/vite"

export default defineConfig({
	plugins: [
		paraglide({
			//recommended
			project: "./project.inlang",
			outdir: "./src/lib/paraglide",
		}),
		sveltekit()
	],
	// Bundle every dependency into the server build, so the production image
	// needs no node_modules at all (see Dockerfile).
	ssr: {
		noExternal: true
	}
});
