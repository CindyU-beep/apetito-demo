import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Leaf, Recycle, MapPin, Package, Certificate, ShieldCheck } from '@phosphor-icons/react';
import { SustainabilityData, FoodSafetyInfo } from '@/lib/types';

interface SustainabilityBadgesProps {
  sustainability?: SustainabilityData;
  foodSafety?: FoodSafetyInfo;
  compact?: boolean;
}

const CERTIFICATION_LABELS: Record<string, { label: string; description: string }> = {
  IFS: { label: 'IFS', description: 'International Featured Standards - Food Safety' },
  BRC: { label: 'BRC', description: 'British Retail Consortium - Global Standard' },
  ISO22000: { label: 'ISO 22000', description: 'Food Safety Management System' },
  HACCP: { label: 'HACCP', description: 'Hazard Analysis Critical Control Points' },
  EUOrganic: { label: 'EU Organic', description: 'European Union Organic Certification' },
  Halal: { label: 'Halal', description: 'Halal Certified' },
  Kosher: { label: 'Kosher', description: 'Kosher Certified' },
};

const getSustainabilityColor = (score: number): string => {
  if (score >= 80) return 'bg-success text-success-foreground';
  if (score >= 60) return 'bg-warning text-warning-foreground';
  return 'bg-muted text-muted-foreground';
};

export function SustainabilityBadges({ sustainability, foodSafety, compact = false }: SustainabilityBadgesProps) {
  if (!sustainability && !foodSafety) return null;

  return (
    <TooltipProvider>
      <div className={`flex flex-wrap ${compact ? 'gap-1.5' : 'gap-2'}`}>
        {sustainability?.sustainabilityScore !== undefined && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className={`${getSustainabilityColor(sustainability.sustainabilityScore)} ${compact ? 'text-xs px-1.5 py-0.5' : ''}`}>
                <Leaf className="w-3 h-3 mr-1" />
                {sustainability.sustainabilityScore}/100
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">Sustainability Score</p>
              <p className="text-sm text-muted-foreground">Overall environmental impact rating</p>
            </TooltipContent>
          </Tooltip>
        )}

        {sustainability?.regionalSourcing && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className={`bg-primary/10 text-primary ${compact ? 'text-xs px-1.5 py-0.5' : ''}`}>
                <MapPin className="w-3 h-3 mr-1" />
                Regional
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">Regional Sourcing</p>
              <p className="text-sm text-muted-foreground">Ingredients sourced from local regions</p>
            </TooltipContent>
          </Tooltip>
        )}

        {sustainability?.organicCertified && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className={`bg-success/10 text-success ${compact ? 'text-xs px-1.5 py-0.5' : ''}`}>
                <Leaf className="w-3 h-3 mr-1" />
                Organic
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">Organic Certified</p>
              <p className="text-sm text-muted-foreground">EU organic farming standards</p>
            </TooltipContent>
          </Tooltip>
        )}

        {sustainability?.co2Footprint !== undefined && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className={compact ? 'text-xs px-1.5 py-0.5' : ''}>
                {sustainability.co2Footprint.toFixed(1)}kg CO₂
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">Carbon Footprint</p>
              <p className="text-sm text-muted-foreground">CO₂ emissions per serving</p>
            </TooltipContent>
          </Tooltip>
        )}

        {sustainability?.packaging?.recyclable && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className={`bg-success/10 text-success ${compact ? 'text-xs px-1.5 py-0.5' : ''}`}>
                <Recycle className="w-3 h-3 mr-1" />
                Recyclable
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">Recyclable Packaging</p>
              <p className="text-sm text-muted-foreground">{sustainability.packaging.type}</p>
              {sustainability.packaging.recycledContent && (
                <p className="text-sm text-muted-foreground">{sustainability.packaging.recycledContent}% recycled content</p>
              )}
            </TooltipContent>
          </Tooltip>
        )}

        {sustainability?.seasonalProduct && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className={`bg-accent/10 text-accent ${compact ? 'text-xs px-1.5 py-0.5' : ''}`}>
                Seasonal
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">Seasonal Product</p>
              <p className="text-sm text-muted-foreground">In season now - fresher and more sustainable</p>
            </TooltipContent>
          </Tooltip>
        )}

        {foodSafety?.certifications && foodSafety.certifications.length > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className={`bg-primary/10 text-primary ${compact ? 'text-xs px-1.5 py-0.5' : ''}`}>
                <ShieldCheck className="w-3 h-3 mr-1" />
                {foodSafety.certifications.length > 1 ? `${foodSafety.certifications.length} Certs` : CERTIFICATION_LABELS[foodSafety.certifications[0]]?.label || foodSafety.certifications[0]}
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">Food Safety Certifications</p>
              {foodSafety.certifications.map((cert) => (
                <p key={cert} className="text-sm text-muted-foreground">
                  • {CERTIFICATION_LABELS[cert]?.description || cert}
                </p>
              ))}
            </TooltipContent>
          </Tooltip>
        )}

        {foodSafety?.euNutritionLabel && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="outline" className={compact ? 'text-xs px-1.5 py-0.5' : ''}>
                <Certificate className="w-3 h-3 mr-1" />
                EU Label
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">EU Nutrition Label</p>
              <p className="text-sm text-muted-foreground">Complies with EU labeling regulation 1169/2011</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
