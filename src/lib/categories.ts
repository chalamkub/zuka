import type { Category } from "@/types"

export function flattenCategories(tree: Category[]): Category[] {
  const out: Category[] = []
  const walk = (cats: Category[]) => {
    for (const cat of cats) {
      out.push(cat)
      if (cat.children?.length) walk(cat.children)
    }
  }
  walk(tree)
  return out
}
