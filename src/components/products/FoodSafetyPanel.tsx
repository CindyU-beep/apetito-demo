import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShieldCheck, Leaf, Barcode, Calendar, ThermometerSimple, Package, MapPin, Factory } from '@phosphor-icons/react';
import { FoodSafetyInfo, SustainabilityData } from '@/lib/types';

interface FoodSafetyPanelProps {
  foodSafety?: FoodSafetyInfo;
  sustainability?: SustainabilityData;
  productName: string;
}

const CERTIFICATION_INFO = {
  IFS: {
    name: 'IFS Food',
    description: 'International Featured Standards for food safety and quality',
    icon: ShieldCheck,
  },
  BRC: {
    name: 'BRC Global Standard',
    description: 'British Retail Consortium certification for food safety',
    icon: ShieldCheck,
  },
  ISO22000: {
    name: 'ISO 22000',
    description: 'International standard for food safety management systems',
    icon: ShieldCheck,
  },
  HACCP: {
    name: 'HACCP',
    description: 'Hazard Analysis and Critical Control Points system',
    icon: ShieldCheck,
  },
  EUOrganic: {
    name: 'EU Organic',
    description: 'Certified organic according to EU regulations',
    icon: Leaf,
  },
  Halal: {
    name: 'Halal Certified',
    description: 'Meets Islamic dietary requirements',
    icon: ShieldCheck,
  },
  Kosher: {
    name: 'Kosher Certified',
    description: 'Meets Jewish dietary laws',
    icon: ShieldCheck,
  },
};

export function FoodSafetyPanel({ foodSafety, sustainability, productName }: FoodSafetyPanelProps) {
  if (!foodSafety && !sustainability) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            Food Safety & Sustainability
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No additional information available for this product.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          Food Safety & Sustainability Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {foodSafety && (
          <>
            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                Food Safety Certifications
              </h3>
              {foodSafety.certifications.length > 0 ? (
                <div className="space-y-3">
                  {foodSafety.certifications.map((cert) => {
                    const info = CERTIFICATION_INFO[cert];
                    const Icon = info?.icon || ShieldCheck;
                    return (
                      <div key={cert} className="flex items-start gap-3 p-3 bg-muted/50 rounded-md">
                        <Icon className="w-5 h-5 text-primary mt-0.5 shrink-0" weight="fill" />
                        <div>
                          <p className="font-medium text-sm">{info?.name || cert}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{info?.description || 'Certified food safety standard'}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No certifications listed</p>
              )}
            </div>

            {foodSafety.euNutritionLabel && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    EU Nutrition Labeling
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Complies with EU Regulation No 1169/2011 on food information to consumers. 
                    All nutritional information is provided according to European standards.
                  </p>
                </div>
              </>
            )}

            {(foodSafety.traceabilityCode || foodSafety.productionDate || foodSafety.bestBefore) && (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm mb-2">Product Information</h3>
                  {foodSafety.traceabilityCode && (
                    <div className="flex items-center gap-2 text-sm">
                      <Barcode className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Traceability Code:</span>
                      <span className="font-medium">{foodSafety.traceabilityCode}</span>
                    </div>
                  )}
                  {foodSafety.productionDate && (
                    <div className="flex items-center gap-2 text-sm">
                      <Factory className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Production Date:</span>
                      <span className="font-medium">{foodSafety.productionDate}</span>
                    </div>
                  )}
                  {foodSafety.bestBefore && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Best Before:</span>
                      <span className="font-medium">{foodSafety.bestBefore}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {foodSafety.storageConditions && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                    <ThermometerSimple className="w-4 h-4 text-primary" />
                    Storage Conditions
                  </h3>
                  <p className="text-sm text-muted-foreground">{foodSafety.storageConditions}</p>
                </div>
              </>
            )}
          </>
        )}

        {sustainability && (
          <>
            {foodSafety && <Separator />}
            <div>
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Leaf className="w-4 h-4 text-success" />
                Sustainability Information
              </h3>
              <div className="space-y-3">
                {sustainability.sustainabilityScore !== undefined && (
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                    <span className="text-sm font-medium">Overall Sustainability Score</span>
                    <Badge 
                      className={
                        sustainability.sustainabilityScore >= 80 
                          ? 'bg-success text-success-foreground' 
                          : sustainability.sustainabilityScore >= 60 
                          ? 'bg-warning text-warning-foreground'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {sustainability.sustainabilityScore}/100
                    </Badge>
                  </div>
                )}

                {sustainability.co2Footprint !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">CO₂ Footprint per serving</span>
                    <span className="text-sm font-medium">{sustainability.co2Footprint.toFixed(2)} kg CO₂</span>
                  </div>
                )}

                {sustainability.transportDistance !== undefined && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      Transport Distance
                    </span>
                    <span className="text-sm font-medium">{sustainability.transportDistance} km</span>
                  </div>
                )}

                {sustainability.packaging && (
                  <div className="space-y-2">
                    <span className="text-sm font-medium flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" />
                      Packaging
                    </span>
                    <div className="pl-5 space-y-1 text-sm text-muted-foreground">
                      <p>Type: {sustainability.packaging.type}</p>
                      <p>Recyclable: {sustainability.packaging.recyclable ? '✓ Yes' : '✗ No'}</p>
                      {sustainability.packaging.recycledContent !== undefined && (
                        <p>Recycled content: {sustainability.packaging.recycledContent}%</p>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2">
                  {sustainability.regionalSourcing && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      <MapPin className="w-3 h-3 mr-1" />
                      Regional Sourcing
                    </Badge>
                  )}
                  {sustainability.organicCertified && (
                    <Badge variant="secondary" className="bg-success/10 text-success">
                      <Leaf className="w-3 h-3 mr-1" />
                      Organic Certified
                    </Badge>
                  )}
                  {sustainability.seasonalProduct && (
                    <Badge variant="secondary" className="bg-accent/10 text-accent">
                      Seasonal Product
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-md p-3 mt-3">
              <p className="text-xs text-muted-foreground">
                <strong>Apetito's Commitment:</strong> We prioritize regional suppliers, sustainable farming practices, 
                and environmentally friendly packaging. Our goal is to reduce our carbon footprint while maintaining 
                the highest food safety standards.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
