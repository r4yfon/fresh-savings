<script lang="ts">
  import { inventory, categoriesAndIcons } from "$lib/data/inventory.svelte";
  import { BadgeAlert, Sigma } from "lucide-svelte";
  import * as Tabs from "$lib/components/ui/tabs";
  import * as Popover from "$lib/components/ui/popover";
  import * as Select from "$lib/components/ui/select";
  import type { Selected } from "bits-ui";

  let ingredientName: string = $state("");
  let selectedTab: string = $state("");
  let ingredientExpiry: Date = $state(new Date());
  let ingredientQuantity: number = $state(0);
  let ingredientMeasured: number = $state(0);
  let ingredientMeasuredUnit: Selected<string> = $state({
    value: "kg",
    label: "kg",
  });

  let ingredientCategory: Selected<string> = $state({
    value: "",
    label: "Select a category",
  });

  const returnTabValue = (value: string) => {
    selectedTab = value;
  };

  const decreaseIngredientQuantity = () => {
    if (typeof ingredientQuantity === "number" && ingredientQuantity > 0) {
      ingredientQuantity--;
    }
  };

  const increaseIngredientQuantity = () => {
    if (typeof ingredientQuantity === "number") {
      ingredientQuantity++;
    }
  };

  const addIngredient = () => {
    if (selectedTab === "quantity") {
      inventory[ingredientCategory.value][ingredientName] = {
        quantity: ingredientQuantity,
        expiry: String(ingredientExpiry),
      };
    } else if (selectedTab === "measured") {
      inventory[ingredientCategory.value][ingredientName] = {
        quantity: `${ingredientMeasured} ${ingredientMeasuredUnit.value}`,
        expiry: String(ingredientExpiry),
      };
    }
  };
</script>

<section class="container my-4">
  <h1 class="mb-4">inventory</h1>

  <Tabs.Root class="text-center">
    <Tabs.List
      class="flex h-max justify-start gap-2 overflow-x-auto text-start md:mx-auto md:w-max md:flex-nowrap lg:justify-center">
      <Tabs.Trigger value="all">
        <div class="flex items-center gap-2">
          <Sigma />
          all
        </div>
      </Tabs.Trigger>
      {#each categoriesAndIcons as category}
        {@const Icon = category.icon}
        <Tabs.Trigger value={category.category}>
          <div class="flex items-center gap-2">
            <Icon />
            {category.category}
          </div>
        </Tabs.Trigger>
      {/each}
    </Tabs.List>
    <Tabs.Content value="all">
      <div
        class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {#each Object.values(inventory) as ingredientQuantityAndExpiry}
          {#each Object.entries(ingredientQuantityAndExpiry) as [ingredient, quantityAndExpiry]}
            <div
              class="ring:color-emerald-700 ring:ring-emerald-800 flex h-32 flex-col items-end justify-between rounded-md border p-4 hover:outline-none hover:ring-2 hover:ring-emerald-700 hover:ring-offset-0">
              <div class="text-end">
                {quantityAndExpiry.quantity}
              </div>
              <div class="self-start text-start">
                <div class="font-bold">
                  {ingredient}
                </div>
                <div>
                  expires {quantityAndExpiry.expiry}
                </div>
              </div>
            </div>
          {/each}
        {/each}
      </div>
    </Tabs.Content>
    {#each categoriesAndIcons as category}
      <Tabs.Content value={category.category}>
        {#if inventory[category.category]}
          <div
            class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {#each Object.entries(inventory[category.category] ?? {}) as [ingredient, quantityAndExpiry]}
              <div
                class="ring:color-emerald-700 ring:ring-emerald-800 flex h-32 flex-col items-end justify-between rounded-md border p-4 hover:outline-none hover:ring-2 hover:ring-emerald-700 hover:ring-offset-0">
                <div class="text-end">
                  {quantityAndExpiry.quantity}
                </div>
                <div class="self-start text-start">
                  <div class="font-bold">
                    {ingredient}
                  </div>
                  <div>
                    expires {quantityAndExpiry.expiry}
                  </div>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="mt-36 flex h-full flex-col items-center justify-center gap-y-2 text-center">
            <BadgeAlert size={80} strokeWidth={2} />
            <p class="text-balance">add more ingredients to your inventory</p>
          </div>
        {/if}
      </Tabs.Content>
    {/each}
  </Tabs.Root>

  <Popover.Root>
    <Popover.Trigger
      class="fixed bottom-8 right-8 rounded-md bg-emerald-800 px-4 py-2 text-white shadow-2xl hover:bg-emerald-700">
      add new ingredient
    </Popover.Trigger>
    <Popover.Content class="relative flex w-96 flex-col gap-2">
      <h3>add new ingredient</h3>
      <Select.Root
        selected={ingredientCategory}
        onSelectedChange={(value) => {
          if (value && typeof value.value === "string") {
            ingredientCategory = {
              value: value.value,
              label: value.value,
            };
          }
        }}>
        <Select.Trigger>
          <Select.Value />
        </Select.Trigger>
        <Select.Content>
          {#each categoriesAndIcons as category}
            {@const Icon = category.icon}
            <Select.Item value={category.category}>
              <Icon strokeWidth={1} class="me-4" />
              {category.category}
            </Select.Item>
          {/each}
        </Select.Content>
      </Select.Root>
      <input
        bind:value={ingredientName}
        class="rounded-md border p-2"
        type="text"
        placeholder="enter ingredient name" />
      <Tabs.Root
        onValueChange={(value) => value && returnTabValue(value)}
        class="flex w-full flex-col items-center">
        <Tabs.List>
          <Tabs.Trigger value="quantity">quantity</Tabs.Trigger>
          <Tabs.Trigger value="measured">measured</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="quantity">
          <button
            class="rounded-md bg-emerald-800 px-2 py-1 text-white hover:bg-emerald-700"
            onclick={decreaseIngredientQuantity}>
            -
          </button>
          <input
            type="number"
            class="w-max rounded-md border p-2"
            bind:value={ingredientQuantity} />
          <!-- <span class="mx-1">
            {#if typeof ingredientQuantity === "number"}
              {ingredientQuantity}
            {:else}
              0
            {/if}
          </span> -->
          <button
            class="rounded-md bg-emerald-800 px-2 py-1 text-white hover:bg-emerald-700"
            onclick={increaseIngredientQuantity}>
            +
          </button>
        </Tabs.Content>
        <Tabs.Content value="measured">
          <div class="flex justify-center gap-2">
            <input
              type="number"
              min="0"
              class="w-1/2 rounded-md border px-1 py-0.5"
              bind:value={ingredientMeasured} />
            <Select.Root
              selected={ingredientMeasuredUnit}
              onSelectedChange={(value) => {
                if (value && typeof value.value === "string") {
                  ingredientMeasuredUnit = {
                    value: value.value,
                    label: value.value,
                  };
                }
              }}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="g">g</Select.Item>
                <Select.Item value="kg">kg</Select.Item>
                <Select.Item value="ml">ml</Select.Item>
                <Select.Item value="l">l</Select.Item>
              </Select.Content>
            </Select.Root>
          </div>
        </Tabs.Content>
      </Tabs.Root>
      <input type="date" bind:value={ingredientExpiry} class="rounded-md border p-2" />
      <button
        class="rounded-md bg-emerald-800 px-4 py-1 text-white hover:bg-emerald-700"
        onclick={addIngredient}>
        add
      </button>
    </Popover.Content>
  </Popover.Root>
</section>
