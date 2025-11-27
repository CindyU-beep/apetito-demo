import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';

type CarouselSlide = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaAction?: () => void;
};

const SLIDES: CarouselSlide[] = [
  {
    id: 'slide-1',
    title: 'How About Going Meatless Today?',
    subtitle: 'Discover Vegetarian Variety',
    description: 'Occasionally forgoing meat benefits everyone: the climate, your health, and your budget. For comparison: A meat-eater\'s CO2 emissions amount to 1.92 tons, while a vegetarian\'s is just 1.1 tons. Let\'s embrace delicious vegetarian enjoyment and variety together.',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=400&fit=crop',
    ctaText: 'View Details',
  },
  {
    id: 'slide-2',
    title: 'Christmas Menu 2024',
    subtitle: 'Festive Delights for Your Facility',
    description: 'Discover our exclusive Christmas menu featuring traditional classics and modern creations. Perfectly curated for the festive season.',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=1200&h=400&fit=crop',
    ctaText: 'View Christmas Menu',
  },
  {
    id: 'slide-3',
    title: '1, 2, or 3?',
    subtitle: 'How Much Meat Per Week Makes Sense?',
    description: 'How much meat per week makes sense for your facility? Whether you plan 2 meat meals per week or 1 to 3, balanced with 2 vegetable-based meals, your health and the environment will thank you.',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=400&fit=crop',
    ctaText: 'Learn More',
  },
];

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const goToSlide = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
  };

  const currentSlide = SLIDES[currentIndex];

  return (
    <Card className="relative overflow-hidden bg-card shadow-lg">
      <div className="grid md:grid-cols-2 gap-6 p-8 md:p-12">
        <div className="flex flex-col justify-center space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
              {currentSlide.title}
            </h1>
            <p className="text-lg font-medium text-primary">
              {currentSlide.subtitle}
            </p>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
            {currentSlide.description}
          </p>

          <div className="flex items-center gap-4 pt-2">
            <Button 
              size="lg" 
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
              onClick={currentSlide.ctaAction}
            >
              {currentSlide.ctaText}
            </Button>
          </div>

          <div className="flex items-center gap-2 pt-4">
            {SLIDES.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'w-8 bg-primary'
                    : 'w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="relative aspect-video md:aspect-auto rounded-lg overflow-hidden bg-muted">
          <img
            src={currentSlide.imageUrl}
            alt={currentSlide.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full p-2 shadow-lg transition-colors"
        aria-label="Previous slide"
      >
        <CaretLeft className="w-6 h-6" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background text-foreground rounded-full p-2 shadow-lg transition-colors"
        aria-label="Next slide"
      >
        <CaretRight className="w-6 h-6" />
      </button>
    </Card>
  );
}
