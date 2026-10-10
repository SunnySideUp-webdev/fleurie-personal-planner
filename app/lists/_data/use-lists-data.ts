"use client";

import {
  createContext,
  createElement,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type ListCategory =
  | "Groceries"
  | "Household"
  | "Beauty"
  | "Office"
  | "Pets"
  | "Protein"
  | "Snacks"
  | "Fruits"
  | "Vegetables"
  | "Other";
export type ListItem = {
  id: string;
  name: string;
  category: ListCategory;
  checked: boolean;
  createdAt: string;
  completedAt?: string;
};
export type PersonalList = {
  id: string;
  name: string;
  kind: "shopping" | "custom";
  icon: string;
  notes: string;
  items: ListItem[];
};
export type WishlistItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  priority: "Low" | "Medium" | "High";
  url: string;
  note: string;
  purchased: boolean;
  imageDataUrl?: string;
};

const baseItems: ListItem[] = [
  ["Huevos", "Groceries", true],
  ["Pan integral", "Groceries", true],
  ["Leche", "Groceries", false],
  ["Yogurt", "Groceries", false],
  ["Fresas", "Fruits", false],
  ["Brócoli", "Vegetables", false],
  ["Pechuga de pollo", "Protein", false],
  ["Arroz", "Groceries", false],
  ["Atún", "Groceries", false],
  ["Galletas saladas", "Snacks", false],
  ["Fruta (banano, manzana)", "Fruits", false],
  ["Vegetales (zanahoria, pepino)", "Vegetables", false],
].map(([name, category, checked], index) => ({
  id: `item-${index}`,
  name: String(name),
  category: category as ListCategory,
  checked: Boolean(checked),
  createdAt: "2026-10-06",
  completedAt: checked ? "2026-10-03" : undefined,
}));

const initialLists: PersonalList[] = [
  {
    id: "supermarket",
    name: "Supermercado",
    kind: "shopping",
    icon: "cart",
    notes:
      "Ver si hay descuento en pollo\nComprar marcas que le gusten a Hani\nRevisar fecha de vencimiento",
    items: baseItems,
  },
  {
    id: "pharmacy",
    name: "Farmacia",
    kind: "shopping",
    icon: "pill",
    notes: "",
    items: [
      {
        id: "vitamins",
        name: "Vitaminas",
        category: "Other",
        checked: false,
        createdAt: "2026-10-06",
      },
    ],
  },
  {
    id: "home",
    name: "Hogar",
    kind: "shopping",
    icon: "home",
    notes: "",
    items: [
      {
        id: "detergent",
        name: "Detergente",
        category: "Household",
        checked: false,
        createdAt: "2026-10-06",
      },
    ],
  },
  {
    id: "skincare",
    name: "Skincare",
    kind: "shopping",
    icon: "beauty",
    notes: "",
    items: [],
  },
  {
    id: "office",
    name: "Para la oficina",
    kind: "shopping",
    icon: "office",
    notes: "",
    items: [],
  },
  {
    id: "hani",
    name: "Para Hani",
    kind: "shopping",
    icon: "heart",
    notes: "",
    items: [],
  },
  {
    id: "pets",
    name: "Mascotas",
    kind: "shopping",
    icon: "pets",
    notes: "",
    items: [],
  },
  {
    id: "movies",
    name: "Movies to watch",
    kind: "custom",
    icon: "star",
    notes: "Cozy movie nights",
    items: [
      {
        id: "movie-1",
        name: "Little Women",
        category: "Other",
        checked: false,
        createdAt: "2026-10-01",
      },
    ],
  },
  {
    id: "packing",
    name: "Travel packing",
    kind: "custom",
    icon: "box",
    notes: "",
    items: [
      {
        id: "passport",
        name: "Passport",
        category: "Other",
        checked: true,
        createdAt: "2026-10-01",
        completedAt: "2026-10-05",
      },
    ],
  },
];

const initialWishlist: WishlistItem[] = [
  {
    id: "keyboard",
    name: "Teclado oficina",
    category: "Office",
    price: 600,
    priority: "Medium",
    url: "",
    note: "Compact and quiet",
    purchased: false,
  },
  {
    id: "boots",
    name: "Botas",
    category: "Fashion",
    price: 900,
    priority: "High",
    url: "",
    note: "Black platform boots",
    purchased: false,
  },
  {
    id: "trip",
    name: "Viaje",
    category: "Travel",
    price: 5000,
    priority: "High",
    url: "",
    note: "Weekend getaway",
    purchased: false,
  },
  {
    id: "lamp",
    name: "Lámpara de escritorio",
    category: "Home",
    price: 350,
    priority: "Low",
    url: "",
    note: "Warm light",
    purchased: false,
  },
];

type ListInput = Omit<PersonalList, "id" | "items"> & { items?: ListItem[] };
type WishlistInput = Omit<WishlistItem, "id">;
type ListsContextValue = {
  lists: PersonalList[];
  wishlist: WishlistItem[];
  addList: (value: ListInput) => string;
  updateList: (id: string, value: Partial<Omit<PersonalList, "id">>) => void;
  removeList: (id: string) => void;
  addItem: (listId: string, value: Omit<ListItem, "id">) => void;
  updateItem: (
    listId: string,
    itemId: string,
    value: Partial<Omit<ListItem, "id">>,
  ) => void;
  removeItem: (listId: string, itemId: string) => void;
  moveItem: (listId: string, itemId: string, direction: -1 | 1) => void;
  addWishlistItem: (value: WishlistInput) => void;
  updateWishlistItem: (id: string, value: Partial<WishlistInput>) => void;
  removeWishlistItem: (id: string) => void;
};
const ListsContext = createContext<ListsContextValue | null>(null);
const STORAGE_KEY = "noa-lists-data-v1";

export function ListsDataProvider({ children }: { children: ReactNode }) {
  const [lists, setLists] = useState(initialLists);
  const [wishlist, setWishlist] = useState(initialWishlist);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<{
          lists: PersonalList[];
          wishlist: WishlistItem[];
        }>;
        if (parsed.lists) setLists(parsed.lists);
        if (parsed.wishlist) setWishlist(parsed.wishlist);
      }
    } catch {}
    setReady(true);
  }, []);
  useEffect(() => {
    if (ready) {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ lists, wishlist }),
        );
      } catch {}
    }
  }, [lists, wishlist, ready]);
  const value: ListsContextValue = {
    lists,
    wishlist,
    addList(value) {
      const id = crypto.randomUUID();
      setLists((current) => [
        ...current,
        { ...value, id, items: value.items ?? [] },
      ]);
      return id;
    },
    updateList(id, value) {
      setLists((current) =>
        current.map((list) => (list.id === id ? { ...list, ...value } : list)),
      );
    },
    removeList(id) {
      setLists((current) => current.filter((list) => list.id !== id));
    },
    addItem(listId, value) {
      setLists((current) =>
        current.map((list) =>
          list.id === listId
            ? {
                ...list,
                items: [...list.items, { ...value, id: crypto.randomUUID() }],
              }
            : list,
        ),
      );
    },
    updateItem(listId, itemId, value) {
      setLists((current) =>
        current.map((list) =>
          list.id === listId
            ? {
                ...list,
                items: list.items.map((item) =>
                  item.id === itemId ? { ...item, ...value } : item,
                ),
              }
            : list,
        ),
      );
    },
    removeItem(listId, itemId) {
      setLists((current) =>
        current.map((list) =>
          list.id === listId
            ? {
                ...list,
                items: list.items.filter((item) => item.id !== itemId),
              }
            : list,
        ),
      );
    },
    moveItem(listId, itemId, direction) {
      setLists((current) =>
        current.map((list) => {
          if (list.id !== listId) return list;
          const index = list.items.findIndex((item) => item.id === itemId);
          const target = index + direction;
          if (index < 0 || target < 0 || target >= list.items.length)
            return list;
          const items = [...list.items];
          [items[index], items[target]] = [items[target], items[index]];
          return { ...list, items };
        }),
      );
    },
    addWishlistItem(value) {
      setWishlist((current) => [
        { ...value, id: crypto.randomUUID() },
        ...current,
      ]);
    },
    updateWishlistItem(id, value) {
      setWishlist((current) =>
        current.map((item) => (item.id === id ? { ...item, ...value } : item)),
      );
    },
    removeWishlistItem(id) {
      setWishlist((current) => current.filter((item) => item.id !== id));
    },
  };
  return createElement(ListsContext.Provider, { value }, children);
}
export function useListsData() {
  const context = useContext(ListsContext);
  if (!context)
    throw new Error("useListsData must be used inside ListsDataProvider");
  return context;
}
