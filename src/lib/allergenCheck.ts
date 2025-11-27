import { AllergenType, OrganizationProfile, Product } from './types';

export type AllergenCheckResult = {
  hasViolation: boolean;
  violatedAllergens: AllergenType[];
  warningMessage: string;
};

export function checkAllergenViolation(
  product: Product,
  profile: OrganizationProfile | null
): AllergenCheckResult {
  if (!profile || !profile.preferences.allergenExclusions.length) {
    return {
      hasViolation: false,
      violatedAllergens: [],
      warningMessage: '',
    };
  }

  const violatedAllergens = product.allergens.filter((allergen) =>
    profile.preferences.allergenExclusions.includes(allergen)
  );

  if (violatedAllergens.length === 0) {
    return {
      hasViolation: false,
      violatedAllergens: [],
      warningMessage: '',
    };
  }

  const allergenList = violatedAllergens
    .map((a) => a.charAt(0).toUpperCase() + a.slice(1))
    .join(', ');

  const orgType = profile.type;
  const orgName = profile.name;

  let contextMessage = '';
  switch (orgType) {
    case 'hospital':
      contextMessage = `This could pose serious health risks to patients with ${allergenList.toLowerCase()} allergies.`;
      break;
    case 'school':
      contextMessage = `This could endanger students with ${allergenList.toLowerCase()} allergies.`;
      break;
    case 'care-home':
      contextMessage = `This could pose health risks to residents with ${allergenList.toLowerCase()} allergies.`;
      break;
    default:
      contextMessage = `This contains ${allergenList.toLowerCase()}, which is excluded from your organization's dietary requirements.`;
  }

  const warningMessage = `⚠️ Allergen Warning for ${orgName}\n\n"${product.name}" contains: ${allergenList}\n\n${contextMessage}\n\nAre you sure you want to add this item?`;

  return {
    hasViolation: true,
    violatedAllergens,
    warningMessage,
  };
}
