<script>
	const tagsAndRoutes = [
		{ tag: 'home', route: '/' },
		{ tag: 'recipe-generator', route: '/recipe-generator' },
		{ tag: 'inventory', route: '/inventory' },
		{ tag: 'marketplace', route: '/marketplace' }
	];
</script>

<nav class="bg-emerald-800 py-4 text-white">
	<div class="container mx-auto flex justify-between px-4 sm:px-6 lg:px-8">
		<!-- a tags on the left -->
		<div>
			{#each tagsAndRoutes as tag}
				<a href={tag.route} class="px-2 hover:underline">{tag.tag}</a>
			{/each}
		</div>

		<!-- login / sign up button on the right -->
		<div>
			<a href="/login" class="px-2 hover:underline">login</a>
			<a href="/signup" class="px-2 hover:underline">sign up</a>
		</div>
	</div>
</nav>
