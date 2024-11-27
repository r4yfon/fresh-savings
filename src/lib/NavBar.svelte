<script lang="ts">
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import Sun from "lucide-svelte/icons/sun";
  import Moon from "lucide-svelte/icons/moon";
  import { toggleMode } from "mode-watcher";

  let isMenuOpen: boolean = $state(false);

  const closeMenu = () => {
    isMenuOpen = false;
  };

  const tagsAndRoutes: { tag: string; route: string }[] = [
    { tag: "home", route: "/" },
    { tag: "recipe-generator", route: "/recipe-generator" },
    { tag: "inventory", route: "/inventory" },
    { tag: "marketplace", route: "/marketplace" },
  ];
</script>

<nav class="bg-emerald-800 py-2 text-white md:py-4">
  <div class="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
    <div class="flex items-center">
      <img src="/favicon.png" alt="logo" class="me-2 h-8" />
      <!-- a tags on the left -->
      <div class="hidden md:block">
        {#each tagsAndRoutes as tag}
          <a href={tag.route} class="px-2 hover:underline" onclick={closeMenu}>
            {tag.tag}
          </a>
        {/each}
      </div>
    </div>
    <div>
      <!-- login / sign up button on the right -->
      <div class="hidden md:flex">
        <a href="/login" class="px-2 hover:underline" onclick={closeMenu}>login</a>
        <a href="/signup" class="px-2 hover:underline" onclick={closeMenu}>sign up</a>
        <button
          class="flex rounded-md bg-emerald-800 p-1 hover:bg-emerald-700"
          onclick={toggleMode}>
          <Sun
            class="dark:-rotate-90dark:scale-0 h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          <Moon
            class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </button>
      </div>
    </div>

    <!-- hamburger button -->
    <div class="justify-self-end md:hidden">
      <button
        type="button"
        onclick={() => (isMenuOpen = !isMenuOpen)}
        class="rounded-md p-2 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:ring-offset-2 focus:ring-offset-emerald-800"
        aria-controls="mobile-menu"
        aria-expanded="false">
        <span class="sr-only">Open main menu</span>
        <svg
          class="block h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M4 6h16M4 12h16M4 18h16" />
        </svg>
        <svg
          class="hidden h-6 w-6"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  </div>

  <!-- dropdown menu -->
  {#if isMenuOpen}
    <div class="relative md:hidden" id="mobile-menu">
      <div class="absolute top-2 w-full bg-emerald-800" transition:slide={{ duration: 200 }}>
        <div class="flex flex-col gap-y-2 p-4">
          {#each tagsAndRoutes as tag}
            <a href={tag.route} class="hover:underline" onclick={closeMenu}>{tag.tag}</a>
          {/each}
          <a href="/login" class="hover:underline" onclick={closeMenu}>login</a>
          <a href="/signup" class="hover:underline" onclick={closeMenu}>sign up</a>
        </div>
      </div>
    </div>
  {/if}
</nav>
