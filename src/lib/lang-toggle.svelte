<script lang="ts">
	import type { AvailableLanguageTag } from '$lib/paraglide/runtime';
	import { i18n } from '$lib/i18n';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
    import { Toggle } from 'flowbite-svelte'

	export function switchToLanguage(newLanguage: AvailableLanguageTag) {
		const canonicalPath = i18n.route($page.url.pathname);
		const localisedPath = i18n.resolveRoute(canonicalPath, newLanguage);
		goto(localisedPath);
	}

	let lang = i18n.getLanguageFromUrl($page.url);

	function handleToggle(e: Event) {
		const target = e.target as HTMLInputElement;
		lang = target.checked ? 'de' : 'en'
		switchToLanguage(lang)
	}

    let checked = $derived(lang === 'de')

</script>

<div class="flex flex-row justify-center items-center gap-4">
    <span class="text-sm text-gray-500">EN</span>
    <Toggle 
        checked={checked}
        on:change={handleToggle}
    >
    </Toggle>
    <span class="text-sm text-gray-500">DE</span>
</div>
