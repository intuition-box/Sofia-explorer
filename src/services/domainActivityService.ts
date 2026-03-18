import { fetchAllActivity } from './activityService'
import type { CircleItem } from './circleService'

/**
 * Filter activity items by user wallet address (certifier)
 */
export function filterItemsByUser(items: CircleItem[], address: string): CircleItem[] {
  const lower = address.toLowerCase()
  return items.filter((item) => item.certifierAddress.toLowerCase() === lower)
}

/**
 * Fetch all activity then filter for a specific user
 */
export async function fetchUserActivity(
  walletAddress: string,
  limit: number = 200,
  offset: number = 0,
): Promise<CircleItem[]> {
  const all = await fetchAllActivity(limit, offset)
  return filterItemsByUser(all, walletAddress)
}
