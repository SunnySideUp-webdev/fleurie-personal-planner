import {
  Flower2,
  Footprints,
  Handbag,
  Heart,
  Shirt,
  ShoppingBag,
  Sparkles,
  Star,
} from "lucide-react";
import type {
  ClosetItem,
  OutfitCanvasElement,
  OutfitPlacement,
} from "../_data/use-studio-data";

export type OutfitMiniatureItem = Pick<
  ClosetItem,
  "id" | "label" | "kind" | "color" | "imageDataUrl"
>;

type OutfitMiniatureProps = {
  items: OutfitMiniatureItem[];
  placements?: OutfitPlacement[];
  canvasElements?: OutfitCanvasElement[];
  className?: string;
};

function miniatureSize(size: number) {
  return `${Math.max(8, Math.min(60, size / 5.8))}%`;
}

function ItemVisual({ item }: { item: OutfitMiniatureItem }) {
  if (item.imageDataUrl) {
    return <img src={item.imageDataUrl} alt="" draggable={false} />;
  }
  if (item.kind === "shoes") return <Footprints />;
  if (item.kind === "bag") return <Handbag />;
  if (item.kind === "bottom") return <ShoppingBag />;
  if (item.kind === "accessory") return <Sparkles />;
  return <Shirt />;
}

function StickerVisual({ variant }: { variant: OutfitCanvasElement["variant"] }) {
  if (variant === "heart") return <Heart />;
  if (variant === "star") return <Star />;
  if (variant === "flower") return <Flower2 />;
  return <Sparkles />;
}

export function OutfitMiniature({
  items,
  placements = [],
  canvasElements = [],
  className = "",
}: OutfitMiniatureProps) {
  const effectivePlacements = placements.length
    ? placements
    : items.map((item, index): OutfitPlacement => ({
        itemId: item.id,
        x: 5 + index * 18,
        y: 31 + (index % 2 ? 3 : -3),
        size: 110,
        z: index + 1,
        rotation: 0,
      }));

  return (
    <div className={`outfit-miniature ${className}`.trim()} aria-hidden="true">
      {effectivePlacements.map((placement) => {
        const item = items.find((candidate) => candidate.id === placement.itemId);
        if (!item) return null;
        return (
          <span
            className={`outfit-miniature-item ${placement.whiteBorder ? "white-border" : ""}`}
            key={placement.itemId}
            style={{
              left: `${placement.x}%`,
              top: `${placement.y}%`,
              width: miniatureSize(placement.size),
              zIndex: placement.z,
              color: item.color,
              transform: `rotate(${placement.rotation ?? 0}deg)`,
            }}
          >
            <ItemVisual item={item} />
          </span>
        );
      })}

      {canvasElements.map((element) => (
        <span
          className={`outfit-miniature-decoration type-${element.type}`}
          key={element.id}
          style={{
            left: `${element.x}%`,
            top: `${element.y}%`,
            width: miniatureSize(element.size),
            zIndex: element.z,
            color: element.color,
            transform: `rotate(${element.rotation}deg)`,
          }}
        >
          {element.type === "sticker" && <StickerVisual variant={element.variant} />}
          {element.type === "shape" && <i style={{ backgroundColor: element.color }} />}
          {element.type === "text" && (
            <b
              className={`font-${element.font ?? "serif"}`}
              style={{
                color: element.color,
                fontSize: Math.max(7, (element.fontSize ?? 28) * 0.4),
                fontWeight: element.bold ? 700 : 400,
                fontStyle: element.italic ? "italic" : "normal",
                textDecoration: element.underline ? "underline" : "none",
                textAlign: element.align ?? "center",
              }}
            >
              {element.text}
            </b>
          )}
        </span>
      ))}
    </div>
  );
}
