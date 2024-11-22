<script>
	import RecipeGenerator from './recipe-generator.svelte';
	import Sidebar from './sidebar.svelte';
</script>

<main class="container mx-auto mt-4">
	<h1 class="text-2xl font-bold">Recipe Generator</h1>
	<div class="flex justify-center gap-x-4">
		<Sidebar />
		<RecipeGenerator />
	</div>
</main>
