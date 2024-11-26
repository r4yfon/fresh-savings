export const inventory: { [key: string]: { [key: string]: string | number } } = $state({
  diary: {
    milk: "2 l",
    yogurt: "50 g",
  },
  fish: {
    salmon: "100 g",
  },
  meats: {
    chicken: "100 g",
    beef: "100 g",
    pork: "100 g",
  },
});
