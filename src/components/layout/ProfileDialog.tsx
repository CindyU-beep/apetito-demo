import { useState, useEffect } from 'react';
import { useKV } from '@/hooks/use-kv';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { OrganizationProfile, DietaryPreference, AllergenType, OrderHistory } from '@/lib/types';
import { Buildings, Envelope, Phone, MapPin, Users, CurrencyDollar, ClockCounterClockwise, ShieldCheck } from '@phosphor-icons/react';
import { toast } from 'sonner';
import { MOCK_ORGANIZATION_PROFILE } from '@/lib/mockData';

type ProfileDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const ALLERGEN_OPTIONS: AllergenType[] = ['nuts', 'dairy', 'gluten', 'eggs', 'soy', 'fish', 'shellfish', 'sesame'];
const DIETARY_OPTIONS: DietaryPreference[] = ['vegetarian', 'vegan', 'pescatarian', 'halal', 'kosher'];
const ORG_TYPES = ['hospital', 'school', 'care-home', 'university', 'corporate', 'other'];

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const [profile, setProfile] = useKV<OrganizationProfile>('organization-profile', MOCK_ORGANIZATION_PROFILE);
  const [orderHistory] = useKV<OrderHistory[]>('order-history', []);
  const [editedProfile, setEditedProfile] = useState<OrganizationProfile>(profile || MOCK_ORGANIZATION_PROFILE);

  useEffect(() => {
    if (profile) {
      setEditedProfile(profile);
    }
  }, [profile]);

  const handleSave = () => {
    setProfile(editedProfile);
    toast.success('Profile updated successfully');
    onOpenChange(false);
  };

  const handleLoadDefaults = () => {
    setEditedProfile(MOCK_ORGANIZATION_PROFILE);
    toast.success('Loaded sample hospital profile');
  };

  const toggleAllergenExclusion = (allergen: AllergenType) => {
    setEditedProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        allergenExclusions: prev.preferences.allergenExclusions.includes(allergen)
          ? prev.preferences.allergenExclusions.filter(a => a !== allergen)
          : [...prev.preferences.allergenExclusions, allergen],
      },
    }));
  };

  const toggleDietaryRestriction = (restriction: DietaryPreference) => {
    setEditedProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        dietaryRestrictions: prev.preferences.dietaryRestrictions.includes(restriction)
          ? prev.preferences.dietaryRestrictions.filter(r => r !== restriction)
          : [...prev.preferences.dietaryRestrictions, restriction],
      },
    }));
  };

  const totalSpent = (orderHistory || [])
    .filter(o => o.status === 'completed')
    .reduce((sum, order) => sum + order.total, 0);

  const totalOrders = (orderHistory || []).length;
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Buildings className="w-5 h-5 text-primary" weight="fill" />
            Organization Profile
          </DialogTitle>
          <DialogDescription>
            Manage your organization's information, dietary preferences, and allergen restrictions. This data helps our AI agents provide personalized recommendations.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="ai-context">AI Context</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="org-name" className="flex items-center gap-2">
                  <Buildings className="w-4 h-4" />
                  Organization Name
                </Label>
                <Input
                  id="org-name"
                  value={editedProfile.name}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., St. Mary's Hospital"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="org-type">Organization Type</Label>
                <Select
                  value={editedProfile.type}
                  onValueChange={(value: any) => setEditedProfile(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger id="org-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ORG_TYPES.map(type => (
                      <SelectItem key={type} value={type} className="capitalize">
                        {type.replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact-email" className="flex items-center gap-2">
                <Envelope className="w-4 h-4" />
                Contact Email
              </Label>
              <Input
                id="contact-email"
                type="email"
                value={editedProfile.contactEmail}
                onChange={(e) => setEditedProfile(prev => ({ ...prev, contactEmail: e.target.value }))}
                placeholder="contact@organization.com"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact-phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Contact Phone
                </Label>
                <Input
                  id="contact-phone"
                  value={editedProfile.contactPhone || ''}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, contactPhone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="servings" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Daily Servings
                </Label>
                <Input
                  id="servings"
                  type="number"
                  value={editedProfile.servings || ''}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, servings: parseInt(e.target.value) || undefined }))}
                  placeholder="e.g., 500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Address
              </Label>
              <Input
                id="address"
                value={editedProfile.address || ''}
                onChange={(e) => setEditedProfile(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Street, City, State ZIP"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="budget-per-serving" className="flex items-center gap-2">
                <CurrencyDollar className="w-4 h-4" />
                Target Budget per Serving
              </Label>
              <Input
                id="budget-per-serving"
                type="number"
                step="0.01"
                value={editedProfile.preferences.budgetPerServing || ''}
                onChange={(e) => setEditedProfile(prev => ({
                  ...prev,
                  preferences: {
                    ...prev.preferences,
                    budgetPerServing: parseFloat(e.target.value) || undefined,
                  },
                }))}
                placeholder="e.g., 3.50"
              />
            </div>

            <Button onClick={handleLoadDefaults} variant="outline" className="w-full">
              Load Sample Hospital Profile
            </Button>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4 mt-4">
            <div className="space-y-3">
              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4" />
                  Allergen Exclusions
                </Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Select allergens to exclude from all product recommendations
                </p>
                <div className="flex flex-wrap gap-2">
                  {ALLERGEN_OPTIONS.map(allergen => (
                    <Badge
                      key={allergen}
                      variant={editedProfile.preferences.allergenExclusions.includes(allergen) ? 'default' : 'outline'}
                      className="cursor-pointer capitalize px-3 py-1.5"
                      onClick={() => toggleAllergenExclusion(allergen)}
                    >
                      {allergen}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4" />
                  Dietary Restrictions
                </Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Select dietary preferences for your organization
                </p>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map(dietary => (
                    <Badge
                      key={dietary}
                      variant={editedProfile.preferences.dietaryRestrictions.includes(dietary) ? 'default' : 'outline'}
                      className="cursor-pointer capitalize px-3 py-1.5"
                      onClick={() => toggleDietaryRestriction(dietary)}
                    >
                      {dietary}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <Label className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="w-4 h-4" />
                  Dietary Enforcement Requirements
                </Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Set mandatory dietary requirements for meal planning (e.g., ensure vegetarian options are available)
                </p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="require-veg-daily" className="text-sm font-normal cursor-pointer">
                        Require at least one vegetarian meal per day
                      </Label>
                    </div>
                    <input
                      id="require-veg-daily"
                      type="checkbox"
                      checked={editedProfile.preferences.dietaryEnforcement?.requireVegetarianDaily || false}
                      onChange={(e) => setEditedProfile(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          dietaryEnforcement: {
                            ...prev.preferences.dietaryEnforcement,
                            requireVegetarianDaily: e.target.checked,
                          },
                        },
                      }))}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="require-vegan-daily" className="text-sm font-normal cursor-pointer">
                        Require at least one vegan meal per day
                      </Label>
                    </div>
                    <input
                      id="require-vegan-daily"
                      type="checkbox"
                      checked={editedProfile.preferences.dietaryEnforcement?.requireVeganDaily || false}
                      onChange={(e) => setEditedProfile(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          dietaryEnforcement: {
                            ...prev.preferences.dietaryEnforcement,
                            requireVeganDaily: e.target.checked,
                          },
                        },
                      }))}
                      className="w-4 h-4 cursor-pointer"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min-veg-weekly" className="text-sm">
                      Minimum vegetarian meals per week
                    </Label>
                    <Input
                      id="min-veg-weekly"
                      type="number"
                      min="0"
                      max="21"
                      value={editedProfile.preferences.dietaryEnforcement?.minimumVegetarianPerWeek || ''}
                      onChange={(e) => setEditedProfile(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          dietaryEnforcement: {
                            ...prev.preferences.dietaryEnforcement,
                            minimumVegetarianPerWeek: parseInt(e.target.value) || undefined,
                          },
                        },
                      }))}
                      placeholder="e.g., 7"
                      className="w-32"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="min-vegan-weekly" className="text-sm">
                      Minimum vegan meals per week
                    </Label>
                    <Input
                      id="min-vegan-weekly"
                      type="number"
                      min="0"
                      max="21"
                      value={editedProfile.preferences.dietaryEnforcement?.minimumVeganPerWeek || ''}
                      onChange={(e) => setEditedProfile(prev => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          dietaryEnforcement: {
                            ...prev.preferences.dietaryEnforcement,
                            minimumVeganPerWeek: parseInt(e.target.value) || undefined,
                          },
                        },
                      }))}
                      placeholder="e.g., 3"
                      className="w-32"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="special-requirements">Special Requirements</Label>
                <Textarea
                  id="special-requirements"
                  value={editedProfile.preferences.specialRequirements || ''}
                  onChange={(e) => setEditedProfile(prev => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      specialRequirements: e.target.value,
                    },
                  }))}
                  placeholder="e.g., Halal certification required, organic ingredients preferred, etc."
                  rows={4}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ClockCounterClockwise className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Total Orders</span>
                </div>
                <p className="text-2xl font-bold">{totalOrders}</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CurrencyDollar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Total Spent</span>
                </div>
                <p className="text-2xl font-bold">${totalSpent.toFixed(2)}</p>
              </Card>

              <Card className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CurrencyDollar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Avg Order</span>
                </div>
                <p className="text-2xl font-bold">${avgOrderValue.toFixed(2)}</p>
              </Card>
            </div>

            {(orderHistory || []).length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ClockCounterClockwise className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No order history yet</p>
                <p className="text-xs mt-1">Complete orders to see your purchase history</p>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Recent Orders</Label>
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {(orderHistory || []).slice(0, 10).map(order => (
                    <Card key={order.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Order #{order.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(order.date).toLocaleDateString()} • {order.items.length} items
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">${order.total.toFixed(2)}</p>
                          <Badge variant={order.status === 'completed' ? 'default' : 'secondary'} className="text-xs capitalize">
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="ai-context" className="space-y-4 mt-4">
            <Card className="p-4 bg-primary/5">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                How AI Uses Your Profile
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Our multi-agent AI system uses your profile to provide personalized recommendations:
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Budget Agent:</strong> Considers your budget per serving (${editedProfile.preferences.budgetPerServing?.toFixed(2) || 'not set'}) and servings ({editedProfile.servings || 'not set'}) to optimize costs</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Dietary Agent:</strong> Automatically filters out {editedProfile.preferences.allergenExclusions.length} allergen(s) and accommodates {editedProfile.preferences.dietaryRestrictions.length} dietary restriction(s)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Nutrition Agent:</strong> Tailors recommendations based on your organization type ({editedProfile.type})</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Meal Planning Agent:</strong> Creates menus that respect all your preferences and requirements</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Order History:</strong> Learns from your {totalOrders} previous order(s) to suggest familiar products</span>
                </li>
              </ul>
            </Card>

            <Card className="p-4">
              <h3 className="font-semibold mb-3">Current Profile Summary</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Organization:</span>
                  <p className="font-medium">{editedProfile.name || 'Not set'}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Type:</span>
                  <p className="font-medium capitalize">{editedProfile.type.replace('-', ' ')}</p>
                </div>
                {editedProfile.preferences.allergenExclusions.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Allergen Exclusions:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {editedProfile.preferences.allergenExclusions.map(a => (
                        <Badge key={a} variant="destructive" className="text-xs capitalize">{a}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {editedProfile.preferences.dietaryRestrictions.length > 0 && (
                  <div>
                    <span className="text-muted-foreground">Dietary Restrictions:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {editedProfile.preferences.dietaryRestrictions.map(d => (
                        <Badge key={d} variant="secondary" className="text-xs capitalize">{d}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {editedProfile.preferences.specialRequirements && (
                  <div>
                    <span className="text-muted-foreground">Special Requirements:</span>
                    <p className="font-medium mt-1">{editedProfile.preferences.specialRequirements}</p>
                  </div>
                )}
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
