"use client";

import Link from "next/link";
import {
  Bell,
  BookOpen,
  Box,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Folder,
  Heart,
  Home,
  House,
  ImagePlus,
  Laptop,
  Leaf,
  Lightbulb,
  ListChecks,
  Menu,
  Milk,
  MoreHorizontal,
  Apple,
  Cookie,
  CupSoda,
  Egg,
  Fish,
  Package,
  PawPrint,
  PenLine,
  Pill,
  Plus,
  Search,
  Salad,
  Settings,
  Shirt,
  ShoppingCart,
  Sparkles,
  Star,
  Trash2,
  WalletCards,
  Wheat,
  X,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import {
  ListCategory,
  ListItem,
  PersonalList,
  WishlistItem,
  useListsData,
} from "../_data/use-lists-data";

export type ListsView = "shopping" | "wishlist" | "my-lists";
const tabs: { id: ListsView; label: string; href: string }[] = [
  { id: "shopping", label: "Shopping", href: "/lists" },
  { id: "wishlist", label: "Wishlist", href: "/lists/wishlist" },
  { id: "my-lists", label: "My lists", href: "/lists/my-lists" },
];
const navigation = [
  { label: "Today", icon: Home, href: "/" },
  { label: "Planner", icon: CalendarDays, href: "/planner/calendar" },
  { label: "Lifestyle", icon: Leaf, href: "/lifestyle/habits" },
  { label: "Studio", icon: Shirt, href: "/studio/outfits" },
  { label: "Money", icon: WalletCards, href: "/money" },
  { label: "Journal", icon: BookOpen, href: "/journal" },
  { label: "Lists", icon: ListChecks, href: "/lists", active: true },
];
const categories: ("All" | ListCategory)[] = [
  "All",
  "Groceries",
  "Household",
  "Beauty",
  "Office",
  "Pets",
  "Protein",
  "Snacks",
  "Fruits",
  "Vegetables",
  "Other",
];
const fallbackIdeas: [string, ListCategory][] = [
  ["Leche", "Groceries"],
  ["Fresas", "Fruits"],
  ["Brócoli", "Vegetables"],
  ["Atún", "Groceries"],
  ["Pan integral", "Groceries"],
  ["Yogurt", "Groceries"],
  ["Huevos", "Groceries"],
  ["Galletas", "Snacks"],
];
const currency = new Intl.NumberFormat("es-GT", {
  style: "currency",
  currency: "GTQ",
  maximumFractionDigits: 2,
});
function money(value: number) {
  return currency.format(value).replace("GTQ", "Q");
}
async function compressWishImage(file: File) {
  const source = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = reject; reader.readAsDataURL(file); });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => { const element = new Image(); element.onload = () => resolve(element); element.onerror = reject; element.src = source; });
  const maxSide = 720;
  const ratio = Math.min(1, maxSide / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * ratio));
  canvas.height = Math.max(1, Math.round(image.height * ratio));
  canvas.getContext("2d")?.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/webp", .78);
}
function ListIcon({ icon }: { icon: string }) {
  const Icon =
    icon === "pill"
      ? Pill
      : icon === "home"
        ? House
        : icon === "office"
          ? Laptop
          : icon === "heart"
            ? Heart
            : icon === "pets"
              ? PawPrint
              : icon === "beauty"
                ? Package
                : icon === "star"
                  ? Star
                  : icon === "box"
                    ? Box
                    : ShoppingCart;
  return <Icon />;
}
function IdeaIcon({ name, category }: { name: string; category: ListCategory }) {
  const normalized = name.toLocaleLowerCase("es");
  const Icon = normalized.includes("leche")
    ? Milk
    : normalized.includes("huevo")
      ? Egg
      : normalized.includes("pan")
        ? Wheat
        : normalized.includes("yogurt")
          ? CupSoda
          : normalized.includes("galleta")
            ? Cookie
            : category === "Fruits"
              ? Apple
              : category === "Vegetables"
                ? Salad
                : category === "Protein" || normalized.includes("atún")
                  ? Fish
                  : category === "Household"
                    ? House
                    : category === "Office"
                      ? Laptop
                      : category === "Pets"
                        ? PawPrint
                        : category === "Beauty"
                          ? Sparkles
                          : Package;
  return <Icon />;
}

export default function ListsDashboard({ view }: { view: ListsView }) {
  const {
    lists,
    wishlist,
    addList,
    updateList,
    removeList,
    addItem,
    updateItem,
    removeItem,
    moveItem,
    addWishlistItem,
    updateWishlistItem,
    removeWishlistItem,
  } = useListsData();
  const [mobileNav, setMobileNav] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const shoppingLists = lists.filter((list) => list.kind === "shopping");
  const customLists = lists.filter((list) => list.kind === "custom");
  const [activeShoppingId, setActiveShoppingId] = useState("supermarket");
  const [activeCustomId, setActiveCustomId] = useState("movies");
  const [category, setCategory] = useState<ListCategory>("Groceries");
  const [newItem, setNewItem] = useState("");
  const [completedOpen, setCompletedOpen] = useState(true);
  const activeShopping =
    shoppingLists.find((list) => list.id === activeShoppingId) ??
    shoppingLists[0];
  const activeCustom =
    customLists.find((list) => list.id === activeCustomId) ?? customLists[0];
  const [listModal, setListModal] = useState(false);
  const [editingList, setEditingList] = useState<string | null>(null);
  const [listName, setListName] = useState("");
  const [listKind, setListKind] = useState<"shopping" | "custom">("shopping");
  const [listIcon, setListIcon] = useState("cart");
  const [itemModal, setItemModal] = useState(false);
  const [itemListId, setItemListId] = useState("");
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [itemName, setItemName] = useState("");
  const [itemCategory, setItemCategory] = useState<ListCategory>("Groceries");
  const [wishlistModal, setWishlistModal] = useState(false);
  const [editingWish, setEditingWish] = useState<string | null>(null);
  const [wishName, setWishName] = useState("");
  const [wishCategory, setWishCategory] = useState("Other");
  const [wishPrice, setWishPrice] = useState("");
  const [wishPriority, setWishPriority] =
    useState<WishlistItem["priority"]>("Medium");
  const [wishUrl, setWishUrl] = useState("");
  const [wishNote, setWishNote] = useState("");
  const [wishImage, setWishImage] = useState<string | undefined>();
  const [wishFilter, setWishFilter] = useState("All");

  const activeList = view === "my-lists" ? activeCustom : activeShopping;
  const visibleItems = (activeList?.items ?? []).filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()),
  );
  const openItems = visibleItems.filter((item) => !item.checked);
  const completedItems = visibleItems.filter((item) => item.checked);
  const purchased = useMemo(
    () =>
      lists
        .flatMap((list) =>
          list.items
            .filter((item) => item.checked)
            .map((item) => ({ ...item, listName: list.name })),
        )
        .sort((a, b) =>
          (b.completedAt ?? "").localeCompare(a.completedAt ?? ""),
        ),
    [lists],
  );
  const recentIdeas = useMemo(() => {
    const seen = new Set<string>();
    return [
      ...purchased.map((item) => ({ name: item.name, category: item.category })),
      ...fallbackIdeas.map(([name, itemCategory]) => ({ name, category: itemCategory })),
    ].filter((item) => {
      const key = item.name.trim().toLocaleLowerCase("es");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 8);
  }, [purchased]);
  const visibleWishlist = wishlist.filter(
    (item) =>
      (wishFilter === "All" ||
        (wishFilter === "Purchased" && item.purchased) ||
        (wishFilter === "Active" && !item.purchased) ||
        item.category === wishFilter) &&
      `${item.name} ${item.category} ${item.note}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );

  function openListModal(kind: "shopping" | "custom", list?: PersonalList) {
    setAddOpen(false);
    setEditingList(list?.id ?? null);
    setListName(list?.name ?? "");
    setListKind(list?.kind ?? kind);
    setListIcon(list?.icon ?? (kind === "shopping" ? "cart" : "star"));
    setListModal(true);
  }
  function submitList(event: FormEvent) {
    event.preventDefault();
    if (!listName.trim()) return;
    if (editingList)
      updateList(editingList, {
        name: listName.trim(),
        kind: listKind,
        icon: listIcon,
      });
    else {
      const id = addList({
        name: listName.trim(),
        kind: listKind,
        icon: listIcon,
        notes: "",
      });
      if (listKind === "shopping") setActiveShoppingId(id);
      else setActiveCustomId(id);
    }
    setListModal(false);
  }
  function openItemModal(listId: string, item?: ListItem) {
    setAddOpen(false);
    setItemListId(listId);
    setEditingItem(item?.id ?? null);
    setItemName(item?.name ?? "");
    setItemCategory(
      item?.category ?? category,
    );
    setItemModal(true);
  }
  function submitItem(event: FormEvent) {
    event.preventDefault();
    if (!itemName.trim() || !itemListId) return;
    if (editingItem)
      updateItem(itemListId, editingItem, {
        name: itemName.trim(),
        category: itemCategory,
      });
    else
      addItem(itemListId, {
        name: itemName.trim(),
        category: itemCategory,
        checked: false,
        createdAt: "2026-10-06",
      });
    setItemModal(false);
    setNewItem("");
  }
  function quickAdd(event?: FormEvent) {
    event?.preventDefault();
    if (!activeList || !newItem.trim()) return;
    addItem(activeList.id, {
      name: newItem.trim(),
      category,
      checked: false,
      createdAt: "2026-10-06",
    });
    setNewItem("");
  }
  function toggleItem(listId: string, item: ListItem) {
    updateItem(listId, item.id, {
      checked: !item.checked,
      completedAt: !item.checked ? "2026-10-06" : undefined,
    });
  }
  function openWish(item?: WishlistItem) {
    setAddOpen(false);
    setEditingWish(item?.id ?? null);
    setWishName(item?.name ?? "");
    setWishCategory(item?.category ?? "Other");
    setWishPrice(item ? String(item.price) : "");
    setWishPriority(item?.priority ?? "Medium");
    setWishUrl(item?.url ?? "");
    setWishNote(item?.note ?? "");
    setWishImage(item?.imageDataUrl);
    setWishlistModal(true);
  }
  async function uploadWishImage(file?: File) {
    if (!file) return;
    try { setWishImage(await compressWishImage(file)); }
    catch { window.alert("The image could not be processed. Try another PNG, JPG or WEBP file."); }
  }
  function submitWish(event: FormEvent) {
    event.preventDefault();
    if (!wishName.trim()) return;
    const value = {
      name: wishName.trim(),
      category: wishCategory,
      price: Number(wishPrice) || 0,
      priority: wishPriority,
      url: wishUrl.trim(),
      note: wishNote.trim(),
      imageDataUrl: wishImage,
      purchased:
        wishlist.find((item) => item.id === editingWish)?.purchased ?? false,
    };
    if (editingWish) updateWishlistItem(editingWish, value);
    else addWishlistItem(value);
    setWishlistModal(false);
  }

  function ItemRows({
    list,
    items,
  }: {
    list: PersonalList;
    items: ListItem[];
  }) {
    return (
      <div className="active-shopping-items">
        {items.map((item, index) => (
          <div className={item.checked ? "checked" : ""} key={item.id}>
            <span className="drag-dots">⠿</span>
            <button
              className="item-check"
              onClick={() => toggleItem(list.id, item)}
            >
              {item.checked && <Check size={15} />}
            </button>
            <span>{item.name}</span>
            <i className={`tag-${item.category.toLowerCase()}`}>
              {item.category}
            </i>
            <div className="list-item-actions">
              <button
                disabled={index === 0}
                onClick={() => moveItem(list.id, item.id, -1)}
              >
                <ChevronLeft />
              </button>
              <button
                disabled={index === items.length - 1}
                onClick={() => moveItem(list.id, item.id, 1)}
              >
                <ChevronRight />
              </button>
              <button onClick={() => openItemModal(list.id, item)}>
                <PenLine />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(`Delete “${item.name}”?`))
                    removeItem(list.id, item.id);
                }}
              >
                <Trash2 />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <main className="app-shell lists-shell">
      <aside className={`sidebar lists-sidebar ${mobileNav ? "is-open" : ""}`}>
        <div className="brand-row">
          <img className="brand-logo" src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/daylily-logo.png`} alt="Daylily" />
          <button className="mobile-close" onClick={() => setMobileNav(false)}>
            <X />
          </button>
        </div>
        <nav>
          {navigation.map(({ label, icon: Icon, href, active }) => (
            <div key={label}>
              <Link
                href={href}
                className={`nav-item ${active ? "active" : ""}`}
              >
                <Icon size={24} />
                <span>{label}</span>
              </Link>
              {label === "Lists" && (
                <div className="studio-subnav lists-subnav">
                  {tabs.map((tab) => (
                    <Link
                      key={tab.id}
                      className={view === tab.id ? "active" : ""}
                      href={tab.href}
                    >
                      {tab.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
        <div className="sidebar-art-slot lists-sidebar-art">
          <Heart /> Floral collage
        </div>
        <Link className="profile-button" href="/">
          <span className="avatar">S</span>
          <span>Sunny</span>
          <Settings size={20} />
        </Link>
      </aside>
      {mobileNav && (
        <button className="nav-scrim" onClick={() => setMobileNav(false)} />
      )}
      <section className="lists-workspace">
        <header className="lists-header">
          <button
            className="mobile-menu lists-mobile-menu"
            onClick={() => setMobileNav(true)}
          >
            <Menu />
          </button>
          <div>
            <h1>
              Lists <ListChecks />
            </h1>
            <p>/ {tabs.find((tab) => tab.id === view)?.label}</p>
          </div>
          <div className="lists-actions">
            <div className="add-wrapper">
              <button
                className="add-button"
                onClick={() => setAddOpen((value) => !value)}
              >
                <Plus size={20} /> Add <ChevronDown size={15} />
              </button>
              {addOpen && (
                <div className="add-menu">
                  <button
                    onClick={() => activeList && openItemModal(activeList.id)}
                  >
                    List item
                  </button>
                  <button onClick={() => openWish()}>Wishlist item</button>
                  <button onClick={() => openListModal("shopping")}>
                    Shopping list
                  </button>
                  <button onClick={() => openListModal("custom")}>
                    Custom list
                  </button>
                </div>
              )}
            </div>
            <button
              className="icon-button"
              onClick={() => setSearchOpen((value) => !value)}
            >
              <Search />
            </button>
            <Link className="icon-button" href="/planner/reminders">
              <Bell />
            </Link>
            <button
              className="icon-button"
              onClick={() => setSettingsOpen((value) => !value)}
            >
              <Settings />
            </button>
            {settingsOpen && (
              <div className="calendar-header-panel settings lists-settings-panel">
                <strong>Lists summary</strong>
                <small>
                  {lists.length} lists ·{" "}
                  {lists.reduce((sum, list) => sum + list.items.length, 0)}{" "}
                  items
                </small>
                <small>
                  {wishlist.filter((item) => !item.purchased).length} wishlist
                  items active
                </small>
              </div>
            )}
          </div>
        </header>
        <div className="lists-tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              className={view === tab.id ? "active" : ""}
              href={tab.href}
            >
              {tab.label}
            </Link>
          ))}
        </div>
        {searchOpen && (
          <label className="lists-search">
            <Search />
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search lists and items..."
            />
            <button
              onClick={() => {
                setQuery("");
                setSearchOpen(false);
              }}
            >
              <X />
            </button>
          </label>
        )}

        {view === "shopping" && (
          <>
            <div className="lists-layout">
              <div className="lists-left-column">
                <section className="lists-panel quick-add-panel">
                  <h2>
                    <Sparkles size={20} /> Quick add
                  </h2>
                  <form onSubmit={quickAdd}>
                    <input
                      id="quick-item"
                      value={newItem}
                      onChange={(event) => setNewItem(event.target.value)}
                      placeholder="Add an item..."
                    />
                    <button>
                      <Plus />
                    </button>
                  </form>
                  <div>
                    {categories.filter((item): item is ListCategory => item !== "All").map((item) => (
                      <button
                        className={category === item ? "active" : ""}
                        key={item}
                        onClick={() => setCategory(item)}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </section>
                <section className="lists-panel shopping-lists-panel">
                  <div className="lists-panel-heading">
                    <h2>
                      <Folder size={20} /> Shopping lists
                    </h2>
                    <button onClick={() => openListModal("shopping")}>
                      <Plus size={18} />
                    </button>
                  </div>
                  <div className="shopping-lists">
                    {shoppingLists.map((list) => (
                      <button
                        className={
                          activeShopping?.id === list.id ? "active" : ""
                        }
                        key={list.id}
                        onClick={() => {
                          setActiveShoppingId(list.id);
                        }}
                      >
                        <ListIcon icon={list.icon} />
                        <span>
                          <strong>{list.name}</strong>
                          <small>{list.items.length} items</small>
                        </span>
                        <MoreHorizontal size={16} />
                      </button>
                    ))}
                  </div>
                </section>
              </div>
              {activeShopping ? (
                <section className="lists-panel active-shopping-panel">
                  <div className="active-list-heading">
                    <ListIcon icon={activeShopping.icon} />
                    <span>
                      <h2>{activeShopping.name}</h2>
                      <p>
                        {activeShopping.items.length} items •{" "}
                        {
                          activeShopping.items.filter((item) => item.checked)
                            .length
                        }{" "}
                        completed
                      </p>
                    </span>
                    <div className="active-list-menu">
                      <button
                        onClick={() =>
                          openListModal("shopping", activeShopping)
                        }
                      >
                        <PenLine />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(`Delete “${activeShopping.name}”?`)
                          ) {
                            removeList(activeShopping.id);
                            setActiveShoppingId("");
                          }
                        }}
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </div>
                  <ItemRows list={activeShopping} items={openItems} />
                  <button
                    className="completed-toggle"
                    onClick={() => setCompletedOpen((value) => !value)}
                  >
                    <ChevronDown className={completedOpen ? "open" : ""} />{" "}
                    Completed ({completedItems.length})
                  </button>
                  {completedOpen && (
                    <ItemRows list={activeShopping} items={completedItems} />
                  )}{" "}
                  {!visibleItems.length && (
                    <div className="lists-empty">
                      <ShoppingCart />
                      <p>No items match this filter.</p>
                      <button onClick={() => openItemModal(activeShopping.id)}>
                        <Plus /> Add item
                      </button>
                    </div>
                  )}
                </section>
              ) : (
                <section className="lists-panel lists-empty">
                  <Folder />
                  <p>Create your first shopping list.</p>
                  <button onClick={() => openListModal("shopping")}>
                    <Plus /> New list
                  </button>
                </section>
              )}
              <div className="lists-right-column">
                <section className="lists-panel list-notes-panel">
                  <div className="lists-panel-heading">
                    <h2>
                      <PenLine size={20} /> Notes
                    </h2>
                  </div>
                  <textarea
                    key={activeShopping?.id}
                    defaultValue={activeShopping?.notes}
                    onBlur={(event) =>
                      activeShopping &&
                      updateList(activeShopping.id, {
                        notes: event.currentTarget.value,
                      })
                    }
                    placeholder="Add a little note..."
                  />
                  <span className="notes-flower">
                    <Sparkles />
                  </span>
                </section>
                <section className="lists-panel ideas-panel">
                  <h2>
                    <Lightbulb size={20} /> Ideas / Recent items
                  </h2>
                  <div className="idea-grid">
                    {recentIdeas.map(({ name, category: itemCategory }) => (
                      <button
                        key={name}
                        onClick={() =>
                          activeShopping &&
                          !activeShopping.items.some(
                            (item) => item.name === name && !item.checked,
                          ) &&
                          addItem(activeShopping.id, {
                            name,
                            category: itemCategory,
                            checked: false,
                            createdAt: "2026-10-06",
                          })
                        }
                      >
                        <span>
                          <IdeaIcon name={name} category={itemCategory} />
                          <i>
                            <Plus size={13} />
                          </i>
                        </span>
                        <strong>{name}</strong>
                      </button>
                    ))}
                  </div>
                </section>
                <section className="lists-panel purchased-panel">
                  <div className="lists-panel-heading">
                    <h2>
                      <Clock3 size={20} /> Recently purchased
                    </h2>
                  </div>
                  <div>
                    {purchased.slice(0, 5).map((item) => (
                      <article key={`${item.listName}-${item.id}`}>
                        <span>✓</span>
                        <p>
                          <strong>{item.name}</strong>
                          <small>
                            {item.completedAt} · {item.listName}
                          </small>
                        </p>
                        <i>
                          <Check size={13} />
                        </i>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </>
        )}

        {view === "wishlist" && (
          <>
            <section className="lists-summary-strip">
              <article>
                <span>Active wishes</span>
                <strong>
                  {wishlist.filter((item) => !item.purchased).length}
                </strong>
              </article>
              <article>
                <span>Estimated total</span>
                <strong>
                  {money(
                    wishlist
                      .filter((item) => !item.purchased)
                      .reduce((sum, item) => sum + item.price, 0),
                  )}
                </strong>
              </article>
              <article>
                <span>High priority</span>
                <strong>
                  {
                    wishlist.filter(
                      (item) => !item.purchased && item.priority === "High",
                    ).length
                  }
                </strong>
              </article>
              <article>
                <span>Purchased</span>
                <strong>
                  {wishlist.filter((item) => item.purchased).length}
                </strong>
              </article>
            </section>
            <section className="wishlist-toolbar">
              <div>
                {[
                  "All",
                  "Active",
                  "Purchased",
                  "Fashion",
                  "Office",
                  "Home",
                  "Travel",
                  "Other",
                ].map((filter) => (
                  <button
                    className={wishFilter === filter ? "active" : ""}
                    onClick={() => setWishFilter(filter)}
                    key={filter}
                  >
                    {filter}
                  </button>
                ))}
              </div>
              <button onClick={() => openWish()}>
                <Plus /> Add wish
              </button>
            </section>
            {visibleWishlist.length ? (
              <div className="wishlist-grid">
                {visibleWishlist.map((item) => (
                  <article
                    className={`lists-panel ${item.purchased ? "purchased" : ""}`}
                    key={item.id}
                  >
                    <div className="wishlist-art">
                      {item.imageDataUrl ? <img src={item.imageDataUrl} alt={item.name} /> : <Heart />}
                    </div>
                    <div className="wishlist-content">
                      <header>
                        <span className={item.priority.toLowerCase()}>
                          {item.priority}
                        </span>
                        <button
                          onClick={() =>
                            updateWishlistItem(item.id, {
                              purchased: !item.purchased,
                            })
                          }
                        >
                          {item.purchased ? "Purchased ✓" : "Mark purchased"}
                        </button>
                      </header>
                      <h2>{item.name}</h2>
                      <p>
                        {item.category} · {money(item.price)}
                      </p>
                      <small>{item.note || "No notes"}</small>
                      {item.url && (
                        <a href={item.url} target="_blank" rel="noreferrer">
                          Open product link
                        </a>
                      )}
                      <footer>
                        <button onClick={() => openWish(item)}>
                          <PenLine /> Edit
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete “${item.name}”?`))
                              removeWishlistItem(item.id);
                          }}
                        >
                          <Trash2 />
                        </button>
                      </footer>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <section className="lists-panel lists-empty">
                <Heart />
                <p>No wishlist items match this filter.</p>
                <button onClick={() => openWish()}>
                  <Plus /> Add wish
                </button>
              </section>
            )}
          </>
        )}

        {view === "my-lists" && (
          <div className="custom-lists-layout">
            <aside className="lists-panel custom-list-sidebar">
              <div className="lists-panel-heading">
                <h2>
                  <Folder /> My lists
                </h2>
                <button onClick={() => openListModal("custom")}>
                  <Plus />
                </button>
              </div>
              {customLists.map((list) => (
                <button
                  className={activeCustom?.id === list.id ? "active" : ""}
                  key={list.id}
                  onClick={() => setActiveCustomId(list.id)}
                >
                  <ListIcon icon={list.icon} />
                  <span>
                    <strong>{list.name}</strong>
                    <small>
                      {list.items.filter((item) => item.checked).length}/
                      {list.items.length} complete
                    </small>
                  </span>
                </button>
              ))}
            </aside>
            {activeCustom ? (
              <section className="lists-panel custom-list-main">
                <header>
                  <div>
                    <ListIcon icon={activeCustom.icon} />
                    <span>
                      <h2>{activeCustom.name}</h2>
                      <p>{activeCustom.items.length} items</p>
                    </span>
                  </div>
                  <div>
                    <button onClick={() => openItemModal(activeCustom.id)}>
                      <Plus /> Add item
                    </button>
                    <button
                      onClick={() => openListModal("custom", activeCustom)}
                    >
                      <PenLine />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Delete “${activeCustom.name}”?`)) {
                          removeList(activeCustom.id);
                          setActiveCustomId("");
                        }
                      }}
                    >
                      <Trash2 />
                    </button>
                  </div>
                </header>
                <form onSubmit={quickAdd}>
                  <input
                    value={newItem}
                    onChange={(event) => setNewItem(event.target.value)}
                    placeholder="Add something to this list..."
                  />
                  <button>
                    <Plus />
                  </button>
                </form>
                <ItemRows list={activeCustom} items={visibleItems} />
                <textarea
                  key={activeCustom.id}
                  defaultValue={activeCustom.notes}
                  onBlur={(event) =>
                    updateList(activeCustom.id, {
                      notes: event.currentTarget.value,
                    })
                  }
                  placeholder="Notes for this list..."
                />
              </section>
            ) : (
              <section className="lists-panel lists-empty">
                <Folder />
                <p>Create a custom list for anything you want.</p>
                <button onClick={() => openListModal("custom")}>
                  <Plus /> New custom list
                </button>
              </section>
            )}
          </div>
        )}
      </section>

      {listModal && (
        <div
          className="planner-modal-backdrop"
          onMouseDown={() => setListModal(false)}
        >
          <form
            className="planner-modal"
            onSubmit={submitList}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div>
              <h2>{editingList ? "Edit list" : "New list"}</h2>
              <button type="button" onClick={() => setListModal(false)}>
                ×
              </button>
            </div>
            <label>
              Name
              <input
                required
                autoFocus
                value={listName}
                onChange={(event) => setListName(event.target.value)}
              />
            </label>
            <div className="modal-field-grid">
              <label>
                Type
                <select
                  value={listKind}
                  onChange={(event) =>
                    setListKind(event.target.value as typeof listKind)
                  }
                >
                  <option value="shopping">Shopping</option>
                  <option value="custom">Custom</option>
                </select>
              </label>
              <label>
                Icon
                <select
                  value={listIcon}
                  onChange={(event) => setListIcon(event.target.value)}
                >
                  <option value="cart">Cart</option>
                  <option value="pill">Pharmacy</option>
                  <option value="home">Home</option>
                  <option value="office">Office</option>
                  <option value="heart">Heart</option>
                  <option value="pets">Pets</option>
                  <option value="star">Star</option>
                  <option value="box">Box</option>
                </select>
              </label>
            </div>
            <button className="modal-submit">
              <Plus /> {editingList ? "Save changes" : "Create list"}
            </button>
          </form>
        </div>
      )}
      {itemModal && (
        <div
          className="planner-modal-backdrop"
          onMouseDown={() => setItemModal(false)}
        >
          <form
            className="planner-modal"
            onSubmit={submitItem}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div>
              <h2>{editingItem ? "Edit item" : "New item"}</h2>
              <button type="button" onClick={() => setItemModal(false)}>
                ×
              </button>
            </div>
            <label>
              Item
              <input
                required
                autoFocus
                value={itemName}
                onChange={(event) => setItemName(event.target.value)}
              />
            </label>
            <label>
              Category
              <select
                value={itemCategory}
                onChange={(event) =>
                  setItemCategory(event.target.value as ListCategory)
                }
              >
                {categories
                  .filter((item) => item !== "All")
                  .map((item) => (
                    <option key={item}>{item}</option>
                  ))}
              </select>
            </label>
            <button className="modal-submit">
              <Plus /> {editingItem ? "Save item" : "Add item"}
            </button>
          </form>
        </div>
      )}
      {wishlistModal && (
        <div
          className="planner-modal-backdrop"
          onMouseDown={() => setWishlistModal(false)}
        >
          <form
            className="planner-modal"
            onSubmit={submitWish}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div>
              <h2>{editingWish ? "Edit wish" : "New wish"}</h2>
              <button type="button" onClick={() => setWishlistModal(false)}>
                ×
              </button>
            </div>
            <label>
              Name
              <input
                required
                autoFocus
                value={wishName}
                onChange={(event) => setWishName(event.target.value)}
              />
            </label>
            <label className="wish-image-field">
              Reference image
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => void uploadWishImage(event.target.files?.[0])}
              />
              {wishImage ? (
                <span>
                  <img src={wishImage} alt="Wishlist preview" />
                  <button type="button" onClick={() => setWishImage(undefined)}><Trash2 size={15} /> Remove image</button>
                </span>
              ) : (
                <small><ImagePlus size={18} /> Optional · PNG, JPG or WEBP</small>
              )}
            </label>
            <div className="modal-field-grid">
              <label>
                Category
                <select
                  value={wishCategory}
                  onChange={(event) => setWishCategory(event.target.value)}
                >
                  <option>Fashion</option>
                  <option>Office</option>
                  <option>Home</option>
                  <option>Travel</option>
                  <option>Beauty</option>
                  <option>Other</option>
                </select>
              </label>
              <label>
                Estimated price
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={wishPrice}
                  onChange={(event) => setWishPrice(event.target.value)}
                />
              </label>
            </div>
            <label>
              Priority
              <select
                value={wishPriority}
                onChange={(event) =>
                  setWishPriority(
                    event.target.value as WishlistItem["priority"],
                  )
                }
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </label>
            <label>
              Product link
              <input
                type="url"
                value={wishUrl}
                onChange={(event) => setWishUrl(event.target.value)}
                placeholder="https://..."
              />
            </label>
            <label>
              Notes
              <textarea
                value={wishNote}
                onChange={(event) => setWishNote(event.target.value)}
              />
            </label>
            <button className="modal-submit">
              <Heart /> {editingWish ? "Save wish" : "Add to wishlist"}
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
