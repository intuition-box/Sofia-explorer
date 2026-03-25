import { useMemo } from 'react'
import { TOPIC_BY_ID } from '@/config/taxonomy'
import { computeReputationProfile } from '@/services/reputationScoreService'
import type { ConnectionStatus, UserReputationProfile, EthccSofiaSignals } from '@/types/reputation'

export function useReputationScores(
  getStatus: (platformId: string) => ConnectionStatus,
  selectedTopics: string[],
  selectedCategories: string[],
  ethccSignals?: EthccSofiaSignals | null,
  compositeScore?: number | null,
): UserReputationProfile | null {
  return useMemo(
    () => computeReputationProfile(getStatus, selectedTopics, selectedCategories, ethccSignals, compositeScore),
    [getStatus, selectedTopics, selectedCategories, ethccSignals, compositeScore],
  )
}

export function useTopicLabel(topicId: string): string {
  return TOPIC_BY_ID.get(topicId)?.label ?? topicId
}
