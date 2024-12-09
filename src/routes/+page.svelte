<script>
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';
	import { DarkMode, Card, Label, Input, Button } from 'flowbite-svelte';
	import { RadioButton, ButtonGroup } from 'flowbite-svelte';
	import { FlagOutline } from 'flowbite-svelte-icons';
	import logo from '$lib/images/Logo-h.png';
	import * as m from '$lib/paraglide/messages.js'

	let letters = $state('');
    /**
     * @type {string[]}
     */
    let results = $state([]);
    let loading = $state(false);
    let initialLoad = $state(false);
    let selectedLang = $state("de")

    async function findWords() {
        loading = true;
        if (!letters) return;
        // check if no letters are entered
        if (letters.length === 0) {
            // TODO Notify user that no letters were entered (also other places)
            return;
        }

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

    function addCommas(){
        // add comma between each letter (if not already there)
        letters = letters.split('').filter(l => l !== ',').join(',');
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
</Navbar>

<div class="flex justify-center pt-20">
	<Card id="input" size="lg">
		<label class="label">
			<span class="label-text type-scale-8">{m.search()}</span>
			<input
				class="input p-2 type-scale-5"
				type="text"
				placeholder="b,n,h,g"
				bind:value={letters}
                oninput={addCommas}
			/>
		</label>
		<Button onclick={findWords}> Find Words </Button>	  
		  <ButtonGroup>
			<RadioButton value="de" bind:group={selectedLang}><FlagOutline class="w-7 h-7"/>Deutsch</RadioButton>
			<RadioButton value="en" bind:group={selectedLang}><FlagOutline class="w-7 h-7"/>English</RadioButton>
		  </ButtonGroup>
	</Card>
</div>

<div class="width-screen flex justify-center pt-10">
    <div class="card w1/2">
        {#if loading}
            <div class="flex w-screen justify-center">
                <div class="grid w-1/2 grid-cols-4 gap-4 pt-16">
                    <div class="placeholder animate-pulse"></div>
                    <div class="placeholder animate-pulse"></div>
                    <div class="placeholder animate-pulse col-span-2"></div>
                    <div class="placeholder animate-pulse"></div>
                    <div class="placeholder animate-pulse"></div>
                    <div class="placeholder animate-pulse "></div>
                    <div class="placeholder animate-pulse col-span-3"></div>
                    <div class="placeholder animate-pulse"></div>
                    <div class="placeholder animate-pulse"></div>
                    <div class="placeholder animate-pulse"></div>
                    <div class="placeholder animate-pulse"></div>
                    <div class="placeholder animate-pulse"></div>
                </div>
            </div>
        {:else}
            {#if results.length > 0}
            <div class="flex w-screen justify-center">
            <div class="flex flex-wrap w-3/4 pt-16">
                {#each results as word}
                    <div class="m-3 p-5 badge preset-filled-primary-500 type-scale-3">{word}</div>
                {/each}
            </div>
            </div>
            {:else}
                {#if initialLoad}
                    <p>No words found</p>
                {/if}
            {/if}
        {/if}
    </div>
</div>