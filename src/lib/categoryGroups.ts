// Maps each homepage "bucket" to the real category strings in your database
// that should count as belonging to it. Add more raw category names here
// as your product catalog grows — this is the one place to update.
export const CATEGORY_GROUPS: Record<string, string[]> = {
  "Medicines": ["Medicines", "medicine", "Medicine"],
  "Skin Care": ["Skin Care", "Facewash", "Soaps", "Skincare" ,"Cream" , "Soap"],
  "Baby Care": ["Baby Care", "Baby"],
  "Healthcare Devices": ["Healthcare Devices", "Devices", "Healthcare"],
};

export function getCategoriesInGroup(groupName: string): string[] {
  return CATEGORY_GROUPS[groupName] || [groupName];
}