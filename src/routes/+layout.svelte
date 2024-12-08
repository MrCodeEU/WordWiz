<!-- src/routes/+layout.svelte -->
<script>
    import { ParaglideJS } from '@inlang/paraglide-sveltekit'
	import { i18n } from '$lib/i18n.js'
	import "../app.css"
</script>

<ParaglideJS {i18n}>
    <slot />
</ParaglideJS>