import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { useToast } from "@/hooks/use-toast";

interface Banner {
  id: string;
  image_url: string;
  redirect_link: string;
  title: string | null;
  order_num: number;
}

export const BannerCarousel = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const { toast } = useToast();
  const autoplayRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    loadBanners();
  }, []);

  useEffect(() => {
    if (!api || banners.length <= 1) return;

    autoplayRef.current = setInterval(() => {
      api.scrollNext();
    }, 4000);

    return () => {
      if (autoplayRef.current) {
        clearInterval(autoplayRef.current);
      }
    };
  }, [api, banners.length]);

  const loadBanners = async () => {
    try {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("is_active", true)
        .order("order_num", { ascending: true });

      if (error) throw error;
      setBanners(data || []);
    } catch (error) {
      console.error("Error loading banners:", error);
      toast({
        title: "Erro ao carregar banners",
        description: "Não foi possível carregar os banners.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBannerClick = (link: string) => {
    if (link.startsWith("http")) {
      window.open(link, "_blank", "noopener,noreferrer");
    } else {
      window.location.href = link;
    }
  };

  if (loading || banners.length === 0) {
    return null;
  }

  return (
    <div className="w-full mb-6">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id}>
              <div
                onClick={() => handleBannerClick(banner.redirect_link)}
                className="relative h-[180px] md:h-[200px] w-full cursor-pointer overflow-hidden rounded-lg shadow-card hover:shadow-glow transition-all duration-300"
              >
                <img
                  src={banner.image_url}
                  alt={banner.title || "Banner"}
                  className="w-full h-full object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {banners.length > 1 && (
          <>
            <CarouselPrevious className="left-2" />
            <CarouselNext className="right-2" />
          </>
        )}
      </Carousel>
    </div>
  );
};
