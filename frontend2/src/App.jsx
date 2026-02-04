import { useEffect, useState } from 'react'
import { memberApi } from './lib/member-api'
import Sidebar from './components/Sidebar'
import DashboardStats from './components/DashboardStats'
import MemberManager from './components/MemberManager'
import PhotoManager from './components/PhotoManager'
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'

const INITIAL_PHOTOS = [
    { id: 101, src: '/christy1.jpg', caption: 'Semangat hari ini!', member: 'Christy', postedAt: '2023-10-20' },
    { id: 102, src: '/christy1.jpg', caption: 'Oyasumi~', member: 'Freya', postedAt: '2023-10-21' },
]

export default function Admin() {
    const [activeTab, setActiveTab] = useState('dashboard')
    const queryClient = useQueryClient()
    const [selectedMemberForPhotos, setSelectedMemberForPhotos] = useState(null)

    const [queryParams, setQueryParams] = useState({
        page: 1,
        size: 10,
        search: '',
        sort: 'id'
    })

    const {
        data,
        isLoading,
        isError,
        isFetching
    } = useQuery({
        queryKey: ['members', queryParams],
        queryFn: () => memberApi.getAllMembers(queryParams),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 15
    })

    const handleViewPhotos = (member) => {
        setSelectedMemberForPhotos(member)
        setActiveTab('photos')
    }

    const handleBackToMembers = () => {
        setActiveTab('members')
    }

    const handleClearPhotoFilter = () => {
        setSelectedMemberForPhotos(null)
    }

    useEffect(() => {
        if (!isError && !isLoading && data?.paging) {
            const currentPage = data.paging.page
            const totalPage = data.paging.total_page
            if (currentPage < totalPage) {
                const nextPage = currentPage + 1
                queryClient.prefetchQuery({
                    queryKey: ['members', { ...queryParams, page: nextPage }],
                    queryFn: () => memberApi.getAllMembers({ ...queryParams, page: nextPage }),
                    staleTime: 15 * 60 * 1000
                })
            }

        }
    }, [data, isError, isLoading, queryParams, queryClient])

    const members = data?.data || []
    const pagingInfo = data?.paging || { total_page: 1, page: 1, total_item: 0 }

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardStats memberCount={pagingInfo.total_item} photoCount={INITIAL_PHOTOS.length} />
            case 'members':
                return <MemberManager
                    members={members}
                    loading={isFetching}
                    queryParams={queryParams}
                    setQueryParams={setQueryParams}
                    pagingInfo={pagingInfo}
                    onViewPhotos={handleViewPhotos}
                />
            case 'photos':
                return <PhotoManager
                    photos={INITIAL_PHOTOS}
                    selectedMember={selectedMemberForPhotos}
                    onClearFilter={handleClearPhotoFilter}
                    onMemberClick={handleBackToMembers}
                />
            default:
                return <DashboardStats memberCount={members.length} photoCount={INITIAL_PHOTOS.length} />
        }
    }

    return (
        <div className="flex h-screen bg-gray-100 font-sans text-slate-800">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="flex-1 overflow-y-auto">
                <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
                    <div className="flex justify-between items-center max-w-7xl mx-auto">
                        <h2 className="text-xl font-semibold capitalize text-slate-700">{activeTab}</h2>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-[#EE1D52] text-white flex items-center justify-center font-bold">A</div>
                        </div>
                    </div>
                </header>

                <div className="px-8 pt-5 max-w-7xl mx-auto">
                    {renderContent()}
                </div>
            </main>
        </div>
    )
}