import { useQuery } from '@tanstack/react-query'
import { fetchTopicCertifications, type TopicCertification } from '@/services/topicCertificationsService'

export function useTopicCertifications(topicId?: string, walletAddress?: string) {
  const { data, isLoading } = useQuery<TopicCertification[]>({
    queryKey: ['topic-certifications', topicId, walletAddress],
    queryFn: () => fetchTopicCertifications(topicId!, walletAddress),
    enabled: !!topicId,
    staleTime: 120_000,
  })

  return {
    certifications: data ?? [],
    loading: isLoading,
  }
}
