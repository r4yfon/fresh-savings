<script lang="ts">
  import * as Accordion from "$lib/components/ui/accordion";
  import * as Popover from "$lib/components/ui/popover";
  import * as Tabs from "$lib/components/ui/tabs";
  import * as Select from "$lib/components/ui/select";
  import { Check, type Icon as IconType } from "lucide-svelte";
  import { categoriesAndIngredients, selectedIngredients } from "$lib/data/ingredients.svelte";
  import { cn } from "$lib/utils";

  let className: { [key: string]: string } = $props();
  export { className as class };

  Object.keys(categoriesAndIngredients).forEach((category) => {
    selectedIngredients[category] = {};
  });

  let measuredValue: number = $state(1);
  let measuredUnit: string = $state("kg");

  // subtract or remove discrete ingredients from selected ingredients object
  const subtractIngredientQuantity = (category: string, ingredient: string) => () => {
    if (typeof selectedIngredients[category][ingredient] === "number") {
      if (selectedIngredients[category][ingredient] > 0) {
        selectedIngredients[category][ingredient]--;
      }
      if (selectedIngredients[category][ingredient] === 0) {
        delete selectedIngredients[category][ingredient];
      }
    }
  };

  // add discrete ingredients to selected ingredients object
  const addIngredientQuantity = (category: string, ingredient: string) => () => {
    if (
      typeof selectedIngredients[category][ingredient] === "number" &&
      selectedIngredients[category][ingredient]
    ) {
      selectedIngredients[category][ingredient]++;
    } else {
      selectedIngredients[category][ingredient] = 1;
    }
  };

  // add measured ingredients to selected ingredients object
  const addIngredientMeasured = (category: string, ingredient: string) => () => {
    if (measuredValue > 0) {
      selectedIngredients[category][ingredient] = `${measuredValue} ${measuredUnit}`;
    }
  };
</script>

<aside class={cn("bg-slate-100 shadow-lg", className.class)}>
  <div class="rounded-md border p-4">
    <h1 class="mb-2">ingredients selecter</h1>
    <button class="rounded-md bg-emerald-800 px-4 py-2 text-left text-white hover:bg-emerald-700"
      >use inventory items</button>
    <p class="mt-4 w-full border-t-2 pt-2">or select ingredients below</p>
    <Accordion.Root>
      {#each Object.keys(categoriesAndIngredients) as category}
        {@const Icon = categoriesAndIngredients[category].icon}
        <Accordion.Item value={category}>
          <Accordion.Trigger>
            <div class="flex items-center gap-2">
              <Icon />
              {category}
            </div>
          </Accordion.Trigger>
          <Accordion.Content class="flex flex-wrap gap-1">
            {#each categoriesAndIngredients[category].ingredients as ingredient}
              <Popover.Root>
                <Popover.Trigger>
                  <button
                    class="flex items-center gap-x-1 rounded-md bg-emerald-800 px-4 py-2 text-white hover:bg-emerald-700">
                    {ingredient}
                    {#if selectedIngredients[category][ingredient]}
                      <Check color="white" size={16} />
                    {/if}
                  </button>
                </Popover.Trigger>
                <Popover.Content class="flex w-[300px] flex-col items-center gap-2">
                  <p class="mb-2">{ingredient}</p>
                  <Tabs.Root
                    value="quantity"
                    class="flex w-full flex-col items-center justify-center">
                    <Tabs.List>
                      <Tabs.Trigger value="quantity">quantity</Tabs.Trigger>
                      <Tabs.Trigger value="measured">measured</Tabs.Trigger>
                    </Tabs.List>
                    <Tabs.Content value="quantity" class="w-full text-center">
                      <button
                        class="rounded-md bg-emerald-800 px-2 py-1 text-white hover:bg-emerald-700"
                        onclick={subtractIngredientQuantity(category, ingredient)}>-</button>
                      <span class="mx-1">
                        {#if typeof selectedIngredients[category][ingredient] === "number"}
                          {selectedIngredients[category][ingredient]}
                        {:else}
                          0
                        {/if}
                      </span>
                      <button
                        class="rounded-md bg-emerald-800 px-2 py-1 text-white hover:bg-emerald-700"
                        onclick={addIngredientQuantity(category, ingredient)}>+</button>
                    </Tabs.Content>
                    <Tabs.Content value="measured">
                      <div class="flex flex-wrap justify-center gap-2">
                        <input
                          type="number"
                          min="0"
                          class="w-1/2 rounded-md border px-1 py-0.5"
                          bind:value={measuredValue} />
                        <Select.Root
                          onSelectedChange={(value) => {
                            if (typeof value.value === "string") {
                              measuredUnit = value.value;
                            }
                          }}>
                          <Select.Trigger class="w-1/4">
                            <Select.Value />
                          </Select.Trigger>
                          <Select.Content>
                            <Select.Item value="g">g</Select.Item>
                            <Select.Item value="kg">kg</Select.Item>
                            <Select.Item value="ml">ml</Select.Item>
                            <Select.Item value="l">l</Select.Item>
                          </Select.Content>
                        </Select.Root>
                        <button
                          class="rounded-md bg-emerald-800 px-4 py-1 text-white hover:bg-emerald-700"
                          onclick={addIngredientMeasured(category, ingredient)}>
                          add
                        </button>
                      </div>
                    </Tabs.Content>
                  </Tabs.Root>
                </Popover.Content>
              </Popover.Root>
            {/each}
          </Accordion.Content>
        </Accordion.Item>
      {/each}
    </Accordion.Root>
  </div>
</aside>
