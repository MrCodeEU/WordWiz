<script lang="ts">
	import '../app.css';
	import { StyleFromScheme } from "m3-svelte";
	import { Button } from "m3-svelte";
	import { NavList } from "m3-svelte";
	import { Card } from "m3-svelte";
	import { TextField } from "m3-svelte";
	import { TextFieldMultiline } from "m3-svelte";
</script>

<StyleFromScheme
  lightScheme={{"primary":4286205824,"onPrimary":4294967295,"primaryContainer":4294891263,"onPrimaryContainer":4284561255,"inversePrimary":4293572078,"secondary":4285225323,"onSecondary":4294967295,"secondaryContainer":4294237170,"onSecondaryContainer":4283580755,"tertiary":4286730827,"onTertiary":4294967295,"tertiaryContainer":4294957781,"onTertiaryContainer":4284955445,"error":4290386458,"onError":4294967295,"errorContainer":4294957782,"onErrorContainer":4287823882,"background":4294965242,"onBackground":4280228383,"surface":4294965242,"onSurface":4280228383,"surfaceVariant":4293713897,"onSurfaceVariant":4283253836,"inverseSurface":4281610036,"inverseOnSurface":4294569717,"outline":4286477437,"outlineVariant":4291871692,"shadow":4278190080,"scrim":4278190080,"surfaceDim":4293056478,"surfaceBright":4294965242,"surfaceContainerLowest":4294967295,"surfaceContainerLow":4294766840,"surfaceContainer":4294372338,"surfaceContainerHigh":4293977580,"surfaceContainerHighest":4293582822,"surfaceTint":4286205824}}
  darkScheme={{"primary":4293572078,"onPrimary":4282916943,"primaryContainer":4284561255,"onPrimaryContainer":4294891263,"inversePrimary":4286205824,"secondary":4292329429,"onSecondary":4282067772,"secondaryContainer":4283580755,"onSecondaryContainer":4294237170,"tertiary":4294359215,"onTertiary":4283180320,"tertiaryContainer":4284955445,"onTertiaryContainer":4294957781,"error":4294948011,"onError":4285071365,"errorContainer":4287823882,"onErrorContainer":4294957782,"background":4279702039,"onBackground":4293582822,"surface":4279702039,"onSurface":4293582822,"surfaceVariant":4283253836,"onSurfaceVariant":4291871692,"inverseSurface":4293582822,"inverseOnSurface":4281610036,"outline":4288253334,"outlineVariant":4283253836,"shadow":4278190080,"scrim":4278190080,"surfaceDim":4279702039,"surfaceBright":4282201917,"surfaceContainerLowest":4279307537,"surfaceContainerLow":4280228383,"surfaceContainer":4280491555,"surfaceContainerHigh":4281215021,"surfaceContainerHighest":4281938744,"surfaceTint":4293572078}} />

<div class="app">
	<NavList type="bar">
		<img src="placeholder.jpg" alt="Logo" style="height: 40px;" />
		<h1 style="margin: 0 auto;">WordWiz</h1>
	</NavList>
	<Card type="elevated">
		<h2>Contact Form</h2>
		<TextField name="Name" required/>
		<TextField name="Email" required />
		<TextFieldMultiline name="Message" required  />
		<Button type="filled">Submit</Button>
	</Card>
</div>
