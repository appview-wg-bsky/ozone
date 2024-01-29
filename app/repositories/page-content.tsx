import { SectionHeader } from '../../components/SectionHeader'
import { RepositoriesTable } from '@/repositories/RepositoriesTable'
import { useSearchParams } from 'next/navigation'
import { useInfiniteQuery } from '@tanstack/react-query'
import client from '@/lib/client'
import { useEffect } from 'react'

export default function RepositoriesListPage() {
  const params = useSearchParams()
  const term = params.get('term') ?? ''
  const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['repositories', { term }],
    queryFn: async ({ pageParam }) => {
      const { data } = await client.api.com.atproto.admin.searchRepos(
        {
          term,
          limit: 25,
          cursor: pageParam,
        },
        { headers: client.adminHeaders() },
      )
      return data
    },
    getNextPageParam: (lastPage) => lastPage.cursor,
  })

  // Change title dynamically, if there's a search term, include that
  useEffect(() => {
    let title = `Repositories`

    if (term) {
      title += ` - ${term}`
    }

    document.title = title
  }, [term])

  const repos = data?.pages.flatMap((page) => page.repos) ?? []
  return (
    <>
      <SectionHeader title="Repositories" tabs={[]} current="all" />

      <RepositoriesTable
        repos={repos}
        onLoadMore={fetchNextPage}
        showLoadMore={!!hasNextPage}
        showEmptySearch={!term?.length && !repos.length}
      />
    </>
  )
}
