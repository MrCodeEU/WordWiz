<script>
	import { Navbar, NavBrand, NavLi, NavUl, NavHamburger } from 'flowbite-svelte';
	import { DarkMode, Card, Label, Input, Button } from 'flowbite-svelte';
</script>

<Navbar>
	<NavBrand href="/">
		<img src="/images/flowbite-svelte-icon-logo.svg" class="me-3 h-6 sm:h-9" alt="Flowbite Logo" />
		<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">Flowbite</span
		>
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
		<h2 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{m}</h2>
		<div class="mb-6">
			<Label for="large-input" class="block mb-2">Large input</Label>
			<Input id="large-input" size="lg" placeholder="Large input" />
		  </div>
		  <div class="mb-6">
			<Label for="default-input" class="block mb-2">Default input</Label>
			<Input id="default-input" placeholder="Default input" />
		  </div>
		  <div class="mb-6">
			<Label for="small-input" class="block mb-2">Small input</Label>
			<Input id="small-input" size="sm" placeholder="Small input" />
		  </div>
		  <Button>Default</Button>
	</Card>
</div>