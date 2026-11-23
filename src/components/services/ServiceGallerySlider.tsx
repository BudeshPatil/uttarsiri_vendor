import GallerySlider from "@/components/ui/GallerySlider";

interface ServiceGallerySliderProps {
  images: string[];
  title: string;
}

export default function ServiceGallerySlider(props: ServiceGallerySliderProps) {
  return <GallerySlider {...props} />;
}
