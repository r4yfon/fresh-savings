<script lang="ts">
  import { selectedIngredients } from "$lib/data/ingredients.svelte";
  import { BadgeAlert } from "lucide-svelte";

  let className: { [key: string]: string } = $props();
  export { className as class };

  const clearSelectedIngredients = () => {
    Object.keys(selectedIngredients).forEach((category) => {
      selectedIngredients[category] = {};
    });
  };
</script>

<section class={className.class}>
  {#if Object.values(selectedIngredients).some((category) => Object.keys(category).length > 0)}
    selected ingredients:
    <table class="mx-auto my-4 w-1/2 border text-left">
      <thead>
        <tr>
          <th class="border px-1 py-0.5">category</th>
          <th class="border px-1 py-0.5">ingredient</th>
          <th class="border px-1 py-0.5">quantity</th>
        </tr>
      </thead>
      <tbody>
        {#each Object.keys(selectedIngredients) as category}
          {#each Object.keys(selectedIngredients[category]) as ingredient, index}
            <tr class="border">
              {#if index === 0}
                <td rowspan={Object.keys(selectedIngredients[category]).length} class="px-1 py-0.5"
                  >{category}</td>
              {/if}
              <td class="border px-1 py-0.5">
                {ingredient}
              </td>
              <td class="border px-1 py-0.5">
                {selectedIngredients[category][ingredient]}
              </td>
            </tr>
          {/each}
        {/each}
      </tbody>
    </table>

    <button
      class="float-right ml-2 rounded-md bg-emerald-800 px-4 py-2 text-white hover:bg-emerald-700">
      generate recipes
    </button>
    <button
      class="float-right rounded-md bg-red-800 px-4 py-2 text-white hover:bg-red-700"
      onclick={clearSelectedIngredients}>
      remove selected ingredients
    </button>
  {:else}
    <div
      class="mt-36 flex h-full flex-col items-center justify-center gap-y-2 text-center lg:mt-auto">
      <BadgeAlert size={80} strokeWidth={2} />
      <p class="text-balance">select some ingredients to continue</p>
    </div>
  {/if}
</section>
