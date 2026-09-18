export interface GalleryItem {
  file: string;
  alt: string;
  /** Lightbox WebP quality override for high-texture photos that blow the size budget. */
  quality?: number;
}

export const GALLERY: GalleryItem[] = [
  { file: "1.jpg", alt: "TIG welded stainless steel bracket: a machined, bored block fillet welded to a drilled mounting plate" },
  { file: "2.jpg", alt: "Production run of identical TIG welded stainless block-and-plate brackets lined up in the shop" },
  { file: "3.jpg", alt: "Rear view of a TIG welded stainless mounting bracket showing consistent fillet welds around the machined block" },
  { file: "4.jpg", alt: "Stainless steel V-blender with sanitary clamp ports installed in a production room" },
  { file: "5.jpg", alt: "Close-up of a TIG weld joining a stainless stiffener bar to a perforated stainless screen" },
  { file: "6.jpg", alt: "Fabricated stainless steel tank enclosure with welded ports and a lid, on the shop floor" },
  { file: "7.jpg", alt: "Custom fabricated laptop kiosk stands and an illuminated charging station set up for a corporate event" },
  { file: "8.jpg", alt: "Tablet press installed in a pharmaceutical cleanroom with stainless ductwork overhead" },
  { file: "9.jpg", alt: "Tablet press being installed beneath stainless steel ceiling ducts in a cleanroom" },
  { file: "10.jpg", alt: "Capsule filling machine with a stainless feed hopper in a pharmaceutical cleanroom" },
  { file: "11.jpg", alt: "Bent and TIG welded stainless tube ring assembly laid out on cardboard" },
  { file: "12.jpg", alt: "Stainless steel sanitary tubing run with an inline valve beside cleanroom equipment" },
  { file: "13.jpg", alt: "Stainless steel equipment stand with a welded square base on a production line" },
  { file: "14.jpg", alt: "Stainless steel hopper with a perforated cone, angled inlet pipe and sanitary clamp fittings" },
  { file: "15.jpg", alt: "Side view of a stainless hopper with a perforated cone and tri-clamp outlet mounted on equipment" },
  { file: "16.jpg", alt: "Three fabricated stainless steel hoppers with perforated cones and side inlets on a stainless workbench" },
  { file: "17.jpg", alt: "Large fabricated stainless steel frame panel with welded mounting brackets standing in the shop" },
  { file: "18.jpg", alt: "Fabricated stainless steel enclosure and frame sections on a pallet ready for delivery", quality: 55 },
];
