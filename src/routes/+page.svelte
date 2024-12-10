<script lang="ts">
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger, Group, Badge } from 'flowbite-svelte';
	import { DarkMode, Card, Label, Input, Button } from 'flowbite-svelte';
	import { RadioButton, ButtonGroup } from 'flowbite-svelte';
	import { FlagOutline, InfoCircleOutline } from 'flowbite-svelte-icons';
	import { Spinner } from 'flowbite-svelte';
	import { Toast } from 'flowbite-svelte';
	import { blur } from 'svelte/transition';
	import { onMount } from 'svelte';
	import { i18n } from '$lib/i18n';
	import { page } from '$app/stores';
	import { Tabs, TabItem } from 'flowbite-svelte';
	import logo from '$lib/images/Logo-h.png';
	import * as m from '$lib/paraglide/messages.js';
	import type { AvailableLanguageTag } from '$lib/paraglide/runtime';
	import LangToggle from '$lib/lang-toggle.svelte';

	let letters = $state('');
	let toastMessage = $state('');
	let toastStatus = $state(false);
	let toastCounter = $state(0);

	/**
	 * @type {string[]}
	 */
	let results = $state<string[]>([]);
	let loading = $state(false);
	let initialLoad = $state(false);
	let selectedLang: AvailableLanguageTag = $state('de');
	let maxLength = $state(Promise.resolve(0));
	let wordLengthsMap = $state<Map<number, string[]>>(new Map());
	onMount(() => {
		maxLength = getMaxWordLength();
		selectedLang = i18n.getLanguageFromUrl($page.url);
	});

	$effect(() => {
		if (i18n.getLanguageFromUrl($page.url)) {
			maxLength = getMaxWordLength();
		}
	});

	let showNoWordsMessage = $derived(initialLoad && results.length === 0);

	$effect(() => {
		if (showNoWordsMessage) {
			trigger('No words found');
		}
	});

	async function findWords() {
		// check if no letters are entered
		if (letters.length === 0) {
			trigger('Please enter some letters');
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
			const response = await fetch(`/api/findwords/${selectedLang}/${encodedLetters}`);
			if (!response.ok) throw new Error('Failed to fetch words');
			const data = await response.json();
			results = data.words;
		} catch (error) {
			console.error('Error:', error);
			results = [];
		}
		loading = false;
		initialLoad = true;
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
			trigger('Please enter some letters');
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
		} catch (error) {
			console.error('Error:', error);
			results = [];
		}
		loading = false;
		initialLoad = true;
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

	async function getMaxWordLength() {
		try {
			const response = await fetch(`/api/findwords/${selectedLang}/maxLength`);
			if (!response.ok) throw new Error('Failed to fetch max word length');
			const data = await response.json();
			return data.maxWordLength;
		} catch (error) {
			console.error('Error:', error);
			return 0;
		}
	}

	function addCommas() {
		// add comma between each letter (if not already there)
		letters = letters
			.split('')
			.filter((l) => l !== ',')
			.join(',');
	}

	function trigger(message: string) {
		toastMessage = message ?? '';
		toastStatus = true;
		toastCounter = 6;
		timeout();
	}

	function timeout() {
		if (--toastCounter > 0) return setTimeout(timeout, 1000);
		toastStatus = false;
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

<Toast
	transition={blur}
	params={{ amount: 10 }}
	position="top-right"
	bind:toastStatus
	class="mr-5 mt-16"
	dismissable={false}
>
	<InfoCircleOutline
		slot="icon"
		class="h-6 w-6 bg-primary-100 text-primary-500 dark:bg-primary-800 dark:text-primary-200"
	/>
	{toastMessage}
</Toast>

<div class="w-1/2 ml-auto mr-auto pt-20">
	<Tabs divider={false} contentClass="mt-0">
		<TabItem open class="bg-stone-700 rounded-md">
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
		<TabItem  class="bg-stone-700 rounded-md">
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
	<div class="card w1/2">
		{#if loading}
			<div class="flex w-screen justify-center">
				<div class="flex h-96 w-1/2 justify-center pt-24">
					<Spinner size="20" />
				</div>
			</div>
		{:else if results.length > 0}
			<div class="flex w-screen justify-center">
				<div class="flex w-3/4 flex-wrap pt-16">
					{#each wordLengthsMap as group}
						<div class="flex w-full flex-col">
							<h3 class="pt-5 text-lg font-bold">{group[0]} letter words</h3>
							<div class="flex flex-row flex-wrap justify-items-center">
								{#each group[1] as word}
									<div
										class="type-scale4 mx-2 my-1 w-min rounded-md bg-orange-400 px-2 py-1 text-center"
									>
										{word}
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
		{:else if showNoWordsMessage}
			<p>No words found</p>
		{/if}
	</div>
</div>
