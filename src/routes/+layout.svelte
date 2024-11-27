<script lang="ts">
  import NavBar from "$lib/NavBar.svelte";
  import "../app.css";
  import { ModeWatcher } from "mode-watcher";

  let { children } = $props();
</script>

<ModeWatcher />
<NavBar />

{@render children()}
