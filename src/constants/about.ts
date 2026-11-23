export const ABOUT_IMAGES = [
  "/images/about/abt-1.jpg",
  "/images/about/abt-2.jpg",
  "/images/about/abt-3.jpg",
  "/images/about/abt-4.jpg",
  "/images/about/abt-5.jpg",
  "/images/about/abt-6.jpg",
  "/images/about/abt-7.jpg",
  "/images/about/abt-8.jpg",
  "/images/about/abt-9.jpg",
  "/images/about/abt-10.jpg",
  "/images/about/abt-11.jpg",
  "/images/about/abt-12.jpg",
] as const;

export const ABOUT_HERO_IMAGES = ABOUT_IMAGES.slice(0, 4);

export const ABOUT_STORY_IMAGES = ABOUT_IMAGES.slice(1, 5);

export const ABOUT_VALUES = [
  {
    title: "Our Vision",
    description:
      "To be the most trusted name in interior design and home renovation, known for innovation, quality, and customer satisfaction across India.",
    image: ABOUT_IMAGES[4],
  },
  {
    title: "Our Mission",
    description:
      "To transform living and working spaces through exceptional design, skilled craftsmanship, and a customer-first approach that makes every project a success.",
    image: ABOUT_IMAGES[5],
  },
] as const;
