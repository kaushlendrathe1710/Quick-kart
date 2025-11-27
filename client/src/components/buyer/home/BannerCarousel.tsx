import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight } from 'lucide-react';
import Autoplay from 'embla-carousel-autoplay';

interface Banner {
  id: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
  category?: string | null;
  subcategory?: string | null;
  badgeText?: string | null;
  productId?: number | null;
  position: number;
}

interface BannerCarouselProps {
  banners: Banner[];
  autoplayDelay?: number;
}

export default function BannerCarousel({ banners, autoplayDelay = 3000 }: BannerCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  const getLink = (banner: Banner) => {
    if (banner.productId) {
      return `/products/${banner.productId}`;
    }
    if (banner.category) {
      return `/products?category=${banner.category}`;
    }
    return '/products';
  };

  // Default banner when no banners exist
  if (!banners || banners.length === 0) {
    return (
      <section className="bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--primary)/0.8)] text-primary-foreground">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-2xl">
            <h1 className="mb-4 text-5xl font-bold">Welcome to Quick-kart</h1>
            <p className="mb-8 text-xl">
              Discover amazing products at unbeatable prices. Shop with confidence.
            </p>
            <div className="flex gap-4">
              <Link href="/products">
                <Button size="lg" variant="secondary">
                  Shop Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative w-full">
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          align: 'start',
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: autoplayDelay,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
          }),
        ]}
      >
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id}>
              <div className="relative h-[400px] w-full overflow-hidden md:h-[500px]">
                {/* Background Image */}
                <img
                  src={banner.imageUrl}
                  alt={banner.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30" />

                {/* Content */}
                <div className="container relative mx-auto flex h-full items-center px-4">
                  <div className="max-w-2xl text-white">
                    {banner.badgeText && (
                      <Badge
                        variant="secondary"
                        className="mb-4 bg-primary text-primary-foreground"
                      >
                        {banner.badgeText}
                      </Badge>
                    )}
                    <h1 className="mb-4 text-4xl font-bold md:text-6xl">{banner.title}</h1>
                    {banner.subtitle && (
                      <p className="mb-8 text-lg md:text-2xl">{banner.subtitle}</p>
                    )}
                    <div className="flex gap-4">
                      <Link href={getLink(banner)}>
                        <Button size="lg" variant="default">
                          {banner.buttonText || 'Shop Now'}
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {/* Navigation Arrows */}
        <CarouselPrevious className="left-4 disabled:hidden" />
        <CarouselNext className="right-4 disabled:hidden" />

        {/* Dots Indicator */}
        {count > 1 && (
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === current ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/75'
                }`}
                onClick={() => api?.scrollTo(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </Carousel>
    </section>
  );
}
