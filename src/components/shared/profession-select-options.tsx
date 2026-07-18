import {
  SelectGroup,
  SelectItem,
  SelectLabel,
} from "@/components/ui/select";
import type { Profession } from "@/types/database";

const CATEGORY_ORDER = [
  "Mühendislik",
  "Teknoloji",
  "Teknik",
  "İnşaat",
  "Sağlık",
  "Eğitim",
  "Finans",
  "Satış",
  "Tasarım",
  "Lojistik",
  "Hizmet",
  "Perakende",
  "Turizm",
  "Yönetim",
  "Diğer",
] as const;

type ProfessionOption = Pick<Profession, "id" | "name" | "category">;

export function ProfessionSelectOptions({
  professions,
}: {
  professions: ProfessionOption[];
}) {
  const grouped = new Map<string, ProfessionOption[]>();

  for (const profession of professions) {
    const category = profession.category?.trim() || "Diğer";
    const group = grouped.get(category) ?? [];
    group.push(profession);
    grouped.set(category, group);
  }

  const categories = [...grouped.keys()].sort((a, b) => {
    const aIndex = CATEGORY_ORDER.indexOf(a as (typeof CATEGORY_ORDER)[number]);
    const bIndex = CATEGORY_ORDER.indexOf(b as (typeof CATEGORY_ORDER)[number]);
    const aOrder = aIndex === -1 ? CATEGORY_ORDER.length - 1 : aIndex;
    const bOrder = bIndex === -1 ? CATEGORY_ORDER.length - 1 : bIndex;

    return aOrder - bOrder || a.localeCompare(b, "tr");
  });

  return categories.map((category) => (
    <SelectGroup key={category}>
      <SelectLabel className="sticky top-0 z-10 bg-popover px-2 py-2 font-semibold text-foreground">
        {category}
      </SelectLabel>
      {grouped
        .get(category)
        ?.sort((a, b) => a.name.localeCompare(b.name, "tr"))
        .map((profession) => (
          <SelectItem
            key={profession.id}
            value={profession.id}
            className="pl-5"
          >
            {profession.name}
          </SelectItem>
        ))}
    </SelectGroup>
  ));
}
