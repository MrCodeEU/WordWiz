<script>
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';
	import { DarkMode, Card, Label, Input, Button } from 'flowbite-svelte';
	import { RadioButton, ButtonGroup } from 'flowbite-svelte';
	import { FlagOutline, InfoCircleOutline } from 'flowbite-svelte-icons';
	import { Spinner } from 'flowbite-svelte';
	import { Toast } from 'flowbite-svelte';
	import { blur } from 'svelte/transition';
	import langToggle from '$lib/lang-toggle.svelte';
	import logo from '$lib/images/Logo-h.png';
	import * as m from '$lib/paraglide/messages.js';
	import LangToggle from '$lib/lang-toggle.svelte';

	let letters = $state('');
	let toastMessage = $state('');
	let toastStatus = $state(false);
	let toastCounter = $state(0);

	/**
	 * @type {string[]}
	 */
	let results = $state([]);
	let loading = $state(false);
	let initialLoad = $state(false);
	let selectedLang = $state('de');

	let showNoWordsMessage = $derived(initialLoad && results.length === 0);

	$effect(() => {
		if (showNoWordsMessage) {
			trigger("No words found");
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
	}

	function addCommas() {
		// add comma between each letter (if not already there)
		letters = letters
			.split('')
			.filter((l) => l !== ',')
			.join(',');
	}

	/**
	 * @param {string} [message]
	 */
	function trigger(message) {
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

<Toast transition={blur} params={{ amount: 10 }} position="top-right" bind:toastStatus class="mr-5 mt-16" dismissable={false}>
	<InfoCircleOutline
		slot="icon"
		class="text-primary-500 bg-primary-100 dark:bg-primary-800 dark:text-primary-200 h-6 w-6"
	/>
	{toastMessage}
</Toast>

<div class="flex justify-center pt-20">
	<Card id="input" size="lg">
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
</div>

<div class="width-screen flex justify-center pt-10">
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
					{#each results as word}
						<div
							class="m-2 rounded-xl border-2 border-cyan-400 border-opacity-50 bg-orange-500 bg-opacity-30 px-2 py-1 backdrop-blur-sm"
						>
							{word}
						</div>
					{/each}
				</div>
			</div>
		{:else if showNoWordsMessage}
			<p>No words found</p>
		{/if}
	</div>
</div>
