<script lang="ts">
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Group, Badge } from 'flowbite-svelte';
	import { DarkMode, Card, Label, Input, Button } from 'flowbite-svelte';
	import { RadioButton, ButtonGroup } from 'flowbite-svelte';
	import { FlagOutline } from 'flowbite-svelte-icons';
	import { Spinner } from 'flowbite-svelte';
	import toast, { Toaster } from 'svelte-french-toast';
	import RangeSlider from 'svelte-range-slider-pips';
	import { onMount } from 'svelte';
	import { i18n } from '$lib/i18n';
	import { page } from '$app/stores';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import logo from '$lib/images/Logo-h.png';
	import * as m from '$lib/paraglide/messages.js';
	import type { AvailableLanguageTag } from '$lib/paraglide/runtime';
	import LangToggle from '$lib/lang-toggle.svelte';

	let letters = $state('');

	/**
	 * @type {string[]}
	 */
	let results = $state<string[]>([]);
	let loading = $state(false);
	let initialLoad = $state(false);
	let selectedLang: AvailableLanguageTag = $state('de');
	let maxLength = $state(0);
	let maxLengths = $state<Map<AvailableLanguageTag, number>>(new Map());
	let wordLengthsMap = $state<Map<number, string[]>>(new Map());
	let minMax = $state([1, 20]);

	onMount(async () => {
		selectedLang = i18n.getLanguageFromUrl($page.url);
		await initMaxWordLengths();
		maxLength = maxLengths.get(selectedLang) || 0;
		minMax[1] = maxLength;
	});

	$effect(() => {
		if (i18n.getLanguageFromUrl($page.url)) {
			maxLength = maxLengths.get(selectedLang) || 0;
			if (minMax[1] > maxLength) {
				minMax[1] = maxLength;
			}
		}
	});

	async function initMaxWordLengths() {
		try {
			const [deResponse, enResponse] = await Promise.all([
				fetch('/api/findwords/de/maxLength'),
				fetch('/api/findwords/en/maxLength')
			]);
			
			if (!deResponse.ok || !enResponse.ok) throw new Error('Failed to fetch max word lengths');
			
			const [deData, enData] = await Promise.all([
				deResponse.json(),
				enResponse.json()
			]);
			
			maxLengths.set('de', deData.maxWordLength);
			maxLengths.set('en', enData.maxWordLength);
		} catch (error) {
			console.error('Error:', error);
			maxLengths.set('de', 20);
			maxLengths.set('en', 20);
		}
	}

	async function getMaxWordLength() {
		return maxLengths.get(selectedLang) || 0;
	}

	async function findWords() {
		// check if no letters are entered
		if (letters.length === 0) {
			toast.error('Please enter some letters', {
				position: 'top-right',
				duration: 3000
			});
			return;
		}
		loading = true;

		//check that letters are single chars separated by commas
		const regex = /^[a-zA-Z](,[a-zA-Z])*$/;
		if (!regex.test(letters)) {
			toast.error('Please enter a comma separated list of letters', {
				position: 'top-right',
				duration: 3000
			});
			return;
		}

		const encodedLetters = encodeURIComponent(letters);

		try {
			const response = await fetch(`/api/findwords/${selectedLang}/${encodedLetters}`);
			if (!response.ok) throw new Error('Failed to fetch words');
			const data = await response.json();
			
			// Filter words based on minMax range
			results = data.words.filter(word => 
				word.length >= minMax[0] && word.length <= minMax[1]
			);

			if (results.length === 0) {
				toast.error('No words found', {
					position: 'top-right',
					duration: 3000
				});
			}
		} catch (error) {
			console.error('Error:', error);
			results = [];
			toast.error('Error finding words: ' + error, {
				position: 'top-right',
				duration: 3000
			});
		}

		loading = false;
		initialLoad = true;
		
		if (results.length !== 0) {
			toast.success('Words found', {
				position: 'top-right',
				duration: 3000
			});
		}

		// map results wordlength -> words with that length
		const wordLengths = results.map((word) => word.length);
		const wordLengthsSet = new Set(wordLengths);
		const wordLengthsArray = Array.from(wordLengthsSet);
		wordLengthsMap = new Map(
			wordLengthsArray
				.sort((a, b) => a - b)
				.map((length) => [length, results.filter((word) => word.length === length)])
		);
	}

	async function unscramble() {
		// check if no letters are entered
		if (letters.length === 0) {
			toast.error('Please enter some letters', {
				position: 'top-right',
				duration: 3000
			});
			return;
		}
		loading = true;

		//check that letters are single chars separated by commas
		const regex = /^[a-zA-Z](,[a-zA-Z])*$/;
		if (!regex.test(letters)) {
			alert('Please enter a comma separated list of letters');
			return;
		}

		const encodedLetters = encodeURIComponent(letters);

		try {
			const response = await fetch(`/api/findwords/${selectedLang}/${encodedLetters}/unscramble`);
			if (!response.ok) throw new Error('Failed to fetch words');
			const data = await response.json();
			results = data.words;
			if (results.length === 0) {
				toast.error('No words found', {
					position: 'top-right',
					duration: 3000
				});
			}
		} catch (error) {
			console.error('Error:', error);
			results = [];
			toast.error('Error finding words: ' + error, {
				position: 'top-right',
				duration: 3000
			});
		}
		loading = false;
		initialLoad = true;
		if (results.length !== 0) {
			toast.success('Words found', {
				position: 'top-right',
				duration: 3000
			});
		}
		// map results wordlength -> words with that length
		const wordLengths = results.map((word) => word.length);
		const wordLengthsSet = new Set(wordLengths);
		const wordLengthsArray = Array.from(wordLengthsSet);
		wordLengthsMap = new Map(
			wordLengthsArray
				.sort((a, b) => a - b)
				.map((length) => [length, results.filter((word) => word.length === length)])
		);
	}

	function addCommas() {
		// add comma between each letter (if not already there)
		letters = letters
			.split('')
			.filter((l) => l !== ',')
			.join(',');
	}

</script>

<Navbar>
	<NavBrand href="/">
		<img src={logo} class="me-3 h-6 sm:h-9" alt="Flowbite Logo" />
	</NavBrand>
	<NavHamburger />
	<NavUl>
		<NavLi href="/">Home</NavLi>
		<NavLi href="#input">Input</NavLi>
	</NavUl>
	<DarkMode />
	<LangToggle />
</Navbar>

<Toaster containerClassName="mt-20 mr-5" />
<div class="ml-auto mr-auto w-1/2 pt-20">
	<Tabs
		divider={false}
		contentClass="mt-0"
		defaultClass="flex flex-wrap space-x-0 rtl:space-x-reverse"
	>
		<TabItem open class="rounded-md bg-stone-700">
			<span slot="title">Known Letters</span>
			<Card id="input" size="lg" class="rounded-t-none">
				<h2 class="m-auto mb-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
					{m.cardHeader()}
				</h2>
				<Label for="large-input" class="mb-2 block">{m.search()}</Label>
				<Input
					id="default-input"
					size="lg"
					placeholder="b,n,h,g"
					type="text"
					bind:value={letters}
					oninput={addCommas}
					class="mb-5"
				/>
				<div class="w-full">
					<RangeSlider id="always" all="label" float range pips pipstep={maxLength>25 ? 2: 1} min={1} max={maxLength} bind:values={minMax} />
				</div>
				<div class="flex w-full flex-row justify-between">
					<Button onclick={findWords} class="w-1/3">Find Words</Button>
					{#await maxLength}
						<Spinner size="10" />
					{:then maxLength}
						<p class="text-gray-500 dark:text-gray-400">Max word length: {maxLength}</p>
					{:catch error}
						<p class="text-red-500 dark:text-red-400">Error: {error.message}</p>
					{/await}
					<ButtonGroup>
						<RadioButton value="de" bind:group={selectedLang}
							><FlagOutline class="h-7 w-7" />Deutsch</RadioButton
						>
						<RadioButton value="en" bind:group={selectedLang}
							><FlagOutline class="h-7 w-7" />English</RadioButton
						>
					</ButtonGroup>
				</div>
			</Card>
		</TabItem>
		<TabItem class="rounded-md bg-stone-700">
			<span slot="title">Unscramble</span>
			<Card id="input" size="lg" class="rounded-t-none">
				<h2 class="m-auto mb-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
					{m.cardHeader()}
				</h2>
				<Label for="large-input" class="mb-2 block">Title todo</Label>
				<Input
					id="default-input"
					size="lg"
					placeholder="b,n,h,g"
					type="text"
					bind:value={letters}
					oninput={addCommas}
					class="mb-5"
				/>
				<div class="flex w-full flex-row justify-between">
					<Button onclick={unscramble} class="w-1/3">Find Words</Button>
				</div>
			</Card>
		</TabItem>
	</Tabs>
</div>

<div class="width-screen flex flex-col justify-center pt-10">
	<div class="flex w-screen justify-center">
		<div class="flex w-3/4 flex-wrap pt-16">
			{#if loading}
				<div class="flex w-full justify-center">
					<div class="flex h-96 justify-center pt-24">
						<Spinner size="20" />
					</div>
				</div>
			{:else if initialLoad}
				{#if wordLengthsMap.size > 0}
					{#each [...wordLengthsMap] as [length, words]}
						<div class="flex w-full flex-col">
							<h3 class="pt-5 text-lg font-bold">{length} letter words</h3>
							<div class="flex flex-row flex-wrap justify-items-center">
								{#each words as word}
									<div
										class="type-scale4 mx-2 my-1 w-min text-nowrap rounded-md bg-orange-400 px-2 py-1 text-center"
									>
										{word}
									</div>
								{/each}
							</div>
						</div>
					{/each}
				{:else}
					<div class="flex w-full justify-center pt-5">
						<p class="text-lg">No words found</p>
					</div>
				{/if}
			{/if}
		</div>
	</div>
</div>




<style>
	:global(#always .rangeFloat) {
	  opacity: 1;
	}
</style>