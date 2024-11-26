<script lang="ts">
  import { onMount } from "svelte";
  import { inventory } from "$lib/data/inventory.svelte";

  let displayedCategoriesAndIngredients: { [key: string]: { [key: string]: string | number } };
  displayedCategoriesAndIngredients = inventory;
</script>

<section class="container mt-4">
  <h1>inventory</h1>
  {JSON.stringify(inventory)}
  <table>
    <thead>
      <tr>
        <th class="border">Category</th>
        <th class="border">Ingredient</th>
        <th class="border">Quantity</th>
      </tr>
    </thead>
    <tbody>
      {#each Object.keys(displayedCategoriesAndIngredients) as category}
        {#each Object.keys(displayedCategoriesAndIngredients[category]) as ingredient, index}
          <tr class="border">
            {#if index === 0}
              <td
                rowspan={Object.keys(displayedCategoriesAndIngredients[category]).length}
                class="px-1 py-0.5">{category}</td>
            {/if}
            <td class="border px-1 py-0.5">
              {ingredient}
            </td>
            <td class="border px-1 py-0.5">
              {displayedCategoriesAndIngredients[category][ingredient]}
            </td>
          </tr>
        {/each}
      {/each}
    </tbody>
  </table>

  <button class="float-end rounded-md bg-emerald-800 px-4 py-2 text-white hover:bg-emerald-700"
    >add new ingredient</button>
</section>
