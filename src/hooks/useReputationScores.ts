import { useMemo } from 'react'
import { useTaxonomy } from '@/hooks/useTaxonomy'
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
  const { topicById } = useTaxonomy()
  return topicById(topicId)?.label ?? topicId
}
