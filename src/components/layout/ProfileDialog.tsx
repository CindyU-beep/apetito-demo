import { useState } from 'react';
import { useKV } from '@github/spark/hooks';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OrganizationProfile, AllergenType, DietaryPreference, OrderHistory } from '@/lib/types';
import { X, Building, ShoppingCart, ForkKnife, ShieldWarning } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

type ProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ALLERGEN_OPTIONS: { value: AllergenType; label: string }[] = [
  { value: 'nuts', label: 'Nuts' },
  { value: 'dairy', label: 'Dairy' },
  { value: 'gluten', label: 'Gluten' },
  { value: 'eggs', label: 'Eggs' },
  { value: 'soy', label: 'Soy' },
  { value: 'fish', label: 'Fish' },
  { value: 'shellfish', label: 'Shellfish' },
  { value: 'sesame', label: 'Sesame' },
];

const DIETARY_OPTIONS: { value: DietaryPreference; label: string }[] = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'pescatarian', label: 'Pescatarian' },
  { value: 'halal', label: 'Halal' },
  { value: 'kosher', label: 'Kosher' },
];

const ORGANIZATION_TYPES = [
  { value: 'hospital', label: 'Hospital' },
  { value: 'school', label: 'School' },
  { value: 'care-home', label: 'Care Home' },
  { value: 'university', label: 'University' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'other', label: 'Other' },
];

const DEFAULT_PROFILE: OrganizationProfile = {
  id: 'default',
  name: '',
  type: 'hospital',
  contactEmail: '',
  contactPhone: '',
  address: '',
  servingCapacity: undefined,
  preferences: {
    dietaryRestrictions: [],
    allergenExclusions: [],
    budgetPerServing: undefined,
    specialRequirements: '',
  },
  orderHistory: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const [profile, setProfile] = useKV<OrganizationProfile>('organization-profile', DEFAULT_PROFILE);
  const [orderHistory] = useKV<OrderHistory[]>('order-history', []);
  
  const [formData, setFormData] = useState<OrganizationProfile>(profile || DEFAULT_PROFILE);

  const handleSave = () => {
    const updated = {
      ...formData,
      updatedAt: Date.now(),
    };
    setProfile(updated);
    toast.success('Organization profile updated successfully');
    onOpenChange(false);
  };

  const toggleAllergen = (allergen: AllergenType) => {
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        allergenExclusions: prev.preferences.allergenExclusions.includes(allergen)
          ? prev.preferences.allergenExclusions.filter((a) => a !== allergen)
          : [...prev.preferences.allergenExclusions, allergen],
      },
    }));
  };

  const toggleDietaryPref = (pref: DietaryPreference) => {
    setFormData((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        dietaryRestrictions: prev.preferences.dietaryRestrictions.includes(pref)
          ? prev.preferences.dietaryRestrictions.filter((p) => p !== pref)
          : [...prev.preferences.dietaryRestrictions, pref],
      },
    }));
  };

  const recentOrders = (orderHistory || []).slice(0, 5);
  const totalSpent = (orderHistory || []).reduce((sum, order) => sum + order.total, 0);
  const totalOrders = (orderHistory || []).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Organization Profile
          </DialogTitle>
          <DialogDescription>
            Manage your organization's details, dietary preferences, and allergen restrictions
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Information</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="history">Order History</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] pr-4">
            <TabsContent value="info" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="org-name">Organization Name *</Label>
                  <Input
                    id="org-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="St. Mary's Hospital"
                  />
                </div>

                <div>
                  <Label htmlFor="org-type">Organization Type *</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      setFormData({ ...formData, type: value as OrganizationProfile['type'] })
                    }
                  >
                    <SelectTrigger id="org-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ORGANIZATION_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="capacity">Daily Serving Capacity</Label>
                  <Input
                    id="capacity"
                    type="number"
                    value={formData.servingCapacity || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, servingCapacity: Number(e.target.value) || undefined })
                    }
                    placeholder="500"
                  />
                </div>

                <div>
                  <Label htmlFor="email">Contact Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="procurement@hospital.com"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Contact Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.contactPhone || ''}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address || ''}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="123 Medical Center Dr, City, State 12345"
                  />
                </div>

                <div>
                  <Label htmlFor="budget">Budget Per Serving ($)</Label>
                  <Input
                    id="budget"
                    type="number"
                    step="0.01"
                    value={formData.preferences.budgetPerServing || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferences: {
                          ...formData.preferences,
                          budgetPerServing: Number(e.target.value) || undefined,
                        },
                      })
                    }
                    placeholder="5.00"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-6 mt-4">
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <ShieldWarning className="w-4 h-4" />
                  Allergen Exclusions
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Select allergens to exclude from all meal suggestions
                </p>
                <div className="flex flex-wrap gap-2">
                  {ALLERGEN_OPTIONS.map((allergen) => (
                    <Badge
                      key={allergen.value}
                      variant={
                        formData.preferences.allergenExclusions.includes(allergen.value)
                          ? 'default'
                          : 'outline'
                      }
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() => toggleAllergen(allergen.value)}
                    >
                      {allergen.label}
                      {formData.preferences.allergenExclusions.includes(allergen.value) && (
                        <X className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <ForkKnife className="w-4 h-4" />
                  Dietary Preferences
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Select dietary preferences for your organization
                </p>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map((pref) => (
                    <Badge
                      key={pref.value}
                      variant={
                        formData.preferences.dietaryRestrictions.includes(pref.value)
                          ? 'default'
                          : 'outline'
                      }
                      className="cursor-pointer hover:bg-primary/10"
                      onClick={() => toggleDietaryPref(pref.value)}
                    >
                      {pref.label}
                      {formData.preferences.dietaryRestrictions.includes(pref.value) && (
                        <X className="w-3 h-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="special-requirements">Special Requirements</Label>
                <Textarea
                  id="special-requirements"
                  value={formData.preferences.specialRequirements || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        specialRequirements: e.target.value,
                      },
                    })
                  }
                  placeholder="E.g., Texture-modified diets for elderly patients, low-sodium requirements, cultural preferences..."
                  rows={4}
                />
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4 mt-4">
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-xs">Total Orders</span>
                  </div>
                  <p className="text-2xl font-bold">{totalOrders}</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-xs">Total Spent</span>
                  </div>
                  <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 text-muted-foreground mb-1">
                    <ShoppingCart className="w-4 h-4" />
                    <span className="text-xs">Avg Order</span>
                  </div>
                  <p className="text-2xl font-bold">
                    ${totalOrders > 0 ? (totalSpent / totalOrders).toFixed(2) : '0.00'}
                  </p>
                </Card>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Recent Orders</h3>
                {recentOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No order history yet. Complete your first order to see it here.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {recentOrders.map((order) => (
                      <Card key={order.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(order.date).toLocaleDateString()} • {order.items.length} items
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold">${order.total.toFixed(2)}</p>
                            <Badge
                              variant={
                                order.status === 'completed'
                                  ? 'default'
                                  : order.status === 'pending'
                                  ? 'secondary'
                                  : 'destructive'
                              }
                              className="text-xs"
                            >
                              {order.status}
                            </Badge>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
