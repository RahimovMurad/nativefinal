import type {
  ActivityCategory,
  DestinationCategory,
  ExpenseCategory,
} from '@/types';

export type CategoryMeta<T extends string> = {
  key: T;
  label: string;
  icon: string;
  color: string;
};

export const DESTINATION_CATEGORIES: CategoryMeta<DestinationCategory>[] = [
  { key: 'All', label: 'Hamısı', icon: 'compass-outline', color: '#2563EB' },
  { key: 'City', label: 'Şəhər', icon: 'city-variant-outline', color: '#3B82F6' },
  { key: 'Mountain', label: 'Dağlıq', icon: 'terrain', color: '#10B981' },
  { key: 'Historical', label: 'Tarixi', icon: 'bank-outline', color: '#8B5CF6' },
  { key: 'Beach', label: 'Sahil', icon: 'beach', color: '#06B6D4' },
  { key: 'Nature', label: 'Təbiət', icon: 'pine-tree', color: '#16A34A' },
];

export const ACTIVITY_CATEGORIES: CategoryMeta<ActivityCategory>[] = [
  { key: 'Sightseeing', label: 'Gəzinti', icon: 'camera-outline', color: '#2563EB' },
  { key: 'Food', label: 'Yemək', icon: 'silverware-fork-knife', color: '#F59E0B' },
  { key: 'Transport', label: 'Nəqliyyat', icon: 'train-car', color: '#6366F1' },
  { key: 'Hotel', label: 'Otel', icon: 'bed-outline', color: '#0EA5E9' },
  { key: 'Adventure', label: 'Macəra', icon: 'hiking', color: '#10B981' },
  { key: 'Shopping', label: 'Alış-veriş', icon: 'shopping-outline', color: '#EC4899' },
];

export const EXPENSE_CATEGORIES: CategoryMeta<ExpenseCategory>[] = [
  { key: 'Accommodation', label: 'Yaşayış', icon: 'bed-outline', color: '#2563EB' },
  { key: 'Food & Drink', label: 'Qida', icon: 'food-outline', color: '#F59E0B' },
  { key: 'Transport', label: 'Nəqliyyat', icon: 'airplane', color: '#6366F1' },
  { key: 'Tickets', label: 'Biletlər', icon: 'ticket-confirmation-outline', color: '#10B981' },
  { key: 'Shopping', label: 'Alış-veriş', icon: 'shopping-outline', color: '#EC4899' },
  { key: 'Other', label: 'Digər', icon: 'dots-horizontal-circle-outline', color: '#64748B' },
];

export function getActivityCategoryMeta(category: ActivityCategory): CategoryMeta<ActivityCategory> {
  return ACTIVITY_CATEGORIES.find((c) => c.key === category) ?? ACTIVITY_CATEGORIES[0];
}

export function getExpenseCategoryMeta(category: ExpenseCategory): CategoryMeta<ExpenseCategory> {
  return EXPENSE_CATEGORIES.find((c) => c.key === category) ?? EXPENSE_CATEGORIES[5];
}
