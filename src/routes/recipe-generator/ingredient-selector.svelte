<script lang="ts">
  import * as Accordion from "$lib/components/ui/accordion";
  import * as Popover from "$lib/components/ui/popover";
  import { categoriesAndIngredients, selectedIngredients } from "$lib/data/ingredients.svelte";
  import { cn } from "$lib/utils";

  let className: string = "";
  export { className as class };

  Object.keys(categoriesAndIngredients).forEach((category) => {
    selectedIngredients[category] = {};
  });

  const subtractIngredient = (category: string, ingredient: string) => () => {
    if (selectedIngredients[category][ingredient] > 0) {
      selectedIngredients[category][ingredient]--;
    }
    if (selectedIngredients[category][ingredient] === 0) {
      delete selectedIngredients[category][ingredient];
    }
  };

  const addIngredient = (category: string, ingredient: string) => () => {
    if (selectedIngredients[category][ingredient]) {
      selectedIngredients[category][ingredient]++;
    } else {
      selectedIngredients[category][ingredient] = 1;
    }
  };
</script>

<aside class={cn("bg-slate-100", className)}>
  <div class="rounded-md border p-4">
    <h1 class="mb-2">ingredients selecter</h1>
    <button class="rounded-md bg-emerald-800 px-4 py-2 text-left text-white hover:bg-emerald-700"
      >use inventory items</button>
    <p class="mt-4 w-full border-t-2 pt-2">or select ingredients below</p>
    <Accordion.Root>
      {#each Object.keys(categoriesAndIngredients) as category}
        <Accordion.Item value={category}>
          <Accordion.Trigger>
            <div class="flex items-center gap-2">
              <svelte:component
                this={categoriesAndIngredients[category].icon}
                size={24}
                strokeWidth={1.5} />
              {category}
            </div>
          </Accordion.Trigger>
          <Accordion.Content class="flex flex-wrap gap-1">
            {#each categoriesAndIngredients[category].ingredients as ingredient}
              <Popover.Root>
                <Popover.Trigger>
                  <button
                    class="rounded-md bg-emerald-800 px-4 py-2 text-white hover:bg-emerald-700">
                    {ingredient}
                    {#if selectedIngredients[category][ingredient]}
                      <span class="ml-2 rounded-md bg-white px-2 py-0.5 text-emerald-800">
                        {selectedIngredients[category][ingredient]}
                      </span>
                    {/if}
                  </button>
                </Popover.Trigger>
                <Popover.Content class="w-max">
                  <span>{ingredient}: </span>
                  <button
                    class="rounded-md bg-emerald-800 px-2 py-1 text-white hover:bg-emerald-700"
                    onclick={subtractIngredient(category, ingredient)}>-</button>
                  <span class="mx-1">
                    {#if selectedIngredients[category][ingredient]}
                      {selectedIngredients[category][ingredient]}
                    {:else}
                      0
                    {/if}
                  </span>
                  <button
                    class="rounded-md bg-emerald-800 px-2 py-1 text-white hover:bg-emerald-700"
                    onclick={addIngredient(category, ingredient)}>+</button>
                </Popover.Content>
              </Popover.Root>
            {/each}
          </Accordion.Content>
        </Accordion.Item>
      {/each}
    </Accordion.Root>
  </div>
</aside>
