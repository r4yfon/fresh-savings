import { Apple, Fish, Ham, Milk, Salad, Sprout, type Icon as IconType } from "lucide-svelte";

type categoriesAndIngredientsType = {
  [key: string]: {
    icon: typeof IconType;
    ingredients: string[];
  };
};

export const categoriesAndIngredients: categoriesAndIngredientsType = {
  diary: {
    icon: Milk,
    ingredients: ["milk", "cheese", "yogurt"],
  },
  fish: {
    icon: Fish,
    ingredients: ["salmon", "tuna", "cod"],
  },
  meats: {
    icon: Ham,
    ingredients: ["chicken", "beef", "pork"],
  },
  vegetables: {
    icon: Salad,
    ingredients: ["carrot", "broccoli", "spinach"],
  },
  fruits: {
    icon: Apple,
    ingredients: ["apple", "banana", "orange"],
  },
  grains: {
    icon: Sprout,
    ingredients: ["rice", "pasta", "bread"],
  },
};

export const selectedIngredients: { [key: string]: { [key: string]: number | string } } = $state(
  {},
);
