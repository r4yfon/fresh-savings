<script lang="ts">
	import NavBar from '$lib/NavBar.svelte';
	import '../app.css';
	let { children } = $props();
</script>

<NavBar />

{@render children()}
