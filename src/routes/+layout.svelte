<!-- src/routes/+layout.svelte -->
<script>
    import { ParaglideJS } from '@inlang/paraglide-sveltekit'
	import { i18n } from '$lib/i18n.js'

	const { children } = $props()
</script>

<ParaglideJS {i18n}>
	{@render children}
</ParaglideJS>
