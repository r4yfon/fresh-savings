import { Apple, Fish, Ham, Milk, Salad, Sprout, type Icon as IconType } from "lucide-svelte";

export let inventory: {
  [key: string]: { [key: string]: { quantity: string | number; expiry: string } };
} = $state({
  diary: {
    milk: { quantity: "2 l", expiry: "2023-12-01" },
    yogurt: { quantity: "50 g", expiry: "2023-11-15" },
  },
  fish: {
    salmon: { quantity: "100 g", expiry: "2023-11-20" },
  },
  meats: {
    chicken: { quantity: "100 g", expiry: "2023-11-25" },
    beef: { quantity: "100 g", expiry: "2023-12-05" },
    pork: { quantity: "100 g", expiry: "2023-12-10" },
  },
});

type categoriesAndIcons = {
  category: string;
  icon: typeof IconType;
}[];

export const categoriesAndIcons: categoriesAndIcons = [
  { category: "diary", icon: Milk },
  { category: "fish", icon: Fish },
  { category: "meats", icon: Ham },
  { category: "vegetables", icon: Salad },
  { category: "fruits", icon: Apple },
  { category: "grains", icon: Sprout },
];
