const RANK_CLASS_VALUES = new Map([
  [1, "font-bold text-amber-5"],
  [2, "font-bold text-bluegray-6 dark:text-bluegray-4"],
  [3, "font-bold text-amber-7"],
])

export function getRankClass(rank: number): string {
  return RANK_CLASS_VALUES.get(rank) || ""
}
