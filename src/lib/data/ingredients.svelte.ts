export const ingredients: { [key: string]: string[] } = {
  diary: ["milk", "cheese", "yogurt"],
  fish: ["salmon", "tuna", "cod"],
  meats: ["chicken", "beef", "pork"],
  vegetables: ["carrot", "broccoli", "spinach"],
  fruits: ["apple", "banana", "orange"],
  grains: ["rice", "pasta", "bread"],
};

export const selectedIngredients: { [key: string]: { [key: string]: number } } = $state({});
