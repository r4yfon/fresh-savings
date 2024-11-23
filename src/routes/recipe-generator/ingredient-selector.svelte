<script lang="ts">
	import * as Accordion from '$lib/components/ui/accordion';

	const ingredients: { [key: string]: string[] } = {
		diary: ['cheese', 'bread', 'butter', 'milk', 'eggs'],
		fish: ['salmon', 'tuna', 'cod', 'mackerel', 'trout'],
		meats: ['beef', 'pork', 'chicken', 'lamb', 'turkey'],
		vegetables: ['carrots', 'potatoes', 'onions', 'tomatoes', 'lettuce'],
		fruits: ['apples', 'oranges', 'bananas', 'grapes', 'strawberries'],
		grains: ['rice', 'oats', 'barley', 'wheat', 'corn']
	};

	let selectedIngredients: { [key: string]: { [key: string]: number } } = $state({
		diary: {},
		fish: {},
		meats: {},
		vegetables: {},
		fruits: {},
		grains: {}
	});
</script>

<aside class="w-1/4 bg-slate-100">
	<div class="rounded-md border p-4">
		<h1 class="mb-2 text-2xl font-bold">ingredient-selecter</h1>
		<button class="rounded-md bg-emerald-800 px-4 py-2 text-white hover:bg-emerald-700"
			>use ingredients from inventory</button
		>
		<p class="mt-4 w-full border-t-2 pt-2">select ingredients from dropdown</p>
		<Accordion.Root>
			{#each Object.keys(ingredients) as category}
				<Accordion.Item value={category}>
					<Accordion.Trigger>{category}</Accordion.Trigger>
					<Accordion.Content>
						{#each ingredients[category] as ingredient}
							<button
								class="rounded-md bg-emerald-800 px-4 py-2 text-white hover:bg-emerald-700"
								onclick={() => (selectedIngredients[category][ingredient] = 1)}
							>
								{ingredient}
								{#if selectedIngredients[category][ingredient]}
									<span class="ml-2 rounded-md bg-white px-2 py-0.5 text-emerald-800">
										{selectedIngredients[category][ingredient]}
									</span>
								{/if}
							</button>
						{/each}
					</Accordion.Content>
				</Accordion.Item>
			{/each}
		</Accordion.Root>
	</div>
</aside>

<style>
	:global(.recipe-generator-content) {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem;
	}
</style>
