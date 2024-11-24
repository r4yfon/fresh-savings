<script lang="ts">
  import { selectedIngredients } from "$lib/data/ingredients.svelte";
</script>

<section class="w-3/4">
  <div class="w-full">
    {#if Object.values(selectedIngredients).some((category) => Object.keys(category).length > 0)}
      selected ingredients:
      <table class="mx-auto mt-2 w-1/2 border text-center">
        <thead>
          <tr>
            <th class="border p-0.5">category</th>
            <th class="border p-0.5">ingredient</th>
            <th class="border p-0.5">quantity</th>
          </tr>
        </thead>
        <tbody>
          {#each Object.keys(selectedIngredients) as category}
            {#each Object.keys(selectedIngredients[category]) as ingredient, index}
              <tr class="border">
                {#if index === 0}
                  <td rowspan={Object.keys(selectedIngredients[category]).length}>{category}</td>
                {/if}
                <td class="border">
                  {ingredient}
                </td>
                <td class="border">
                  {selectedIngredients[category][ingredient]}
                </td>
              </tr>
            {/each}
          {/each}
        </tbody>
      </table>

      <button
        class="float-right rounded-md bg-emerald-800 px-4 py-2 text-white hover:bg-emerald-700">
        generate recipes
      </button>
    {:else}
      <div>
        <p class="text-center">no ingredient selected</p>
      </div>
    {/if}
  </div>
</section>
