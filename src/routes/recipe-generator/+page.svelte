<script lang="ts">
  import RecipeGenerator from "./recipe-generator.svelte";
  import IngredientSelector from "./ingredient-selector.svelte";
</script>

<main class="container mt-4">
  <div class="flex flex-col justify-center gap-x-4 md:flex-row">
    <IngredientSelector class="w-full md:w-1/4" />
    <RecipeGenerator class="w-full md:w-3/4" />
  </div>
</main>
