<script lang="ts">
  import RecipeGenerator from "./recipe-generator.svelte";
  import IngredientSelector from "./ingredient-selector.svelte";
</script>

<main class="container mx-auto mt-4">
  <div class="flex justify-center gap-x-4">
    <IngredientSelector />
    <RecipeGenerator />
  </div>
</main>
