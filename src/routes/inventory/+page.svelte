<script lang="ts">
  import { inventory, categoriesAndIcons } from "$lib/data/inventory.svelte";
  import { BadgeAlert, Sigma } from "lucide-svelte";
  import * as Tabs from "$lib/components/ui/tabs";
  import * as Popover from "$lib/components/ui/popover";
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
      class="fixed bottom-8 right-8 rounded-md bg-emerald-800 px-4 py-2 text-white shadow-xl hover:bg-emerald-700">
      add new ingredient
      <!-- <button
        class="fixed bottom-8 right-8 rounded-md bg-emerald-800 px-4 py-2 text-white shadow-xl hover:bg-emerald-700"
        >add new ingredient</button> -->
    </Popover.Trigger>
    <Popover.Content>
      <h3>new ingredient</h3>
      
    </Popover.Content>
  </Popover.Root>
</section>
