import { useEffect, useState } from 'react'
import { memberApi } from './lib/member-api'
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query'
import { photoApi } from './lib/photo-api'
import Sidebar from './components/Sidebar'
import DashboardStats from './components/DashboardStats'
import MemberManager from './components/MemberManager'
import PhotoManager from './components/PhotoManager'

export default function Admin() {
    const [activeTab, setActiveTab] = useState('dashboard')
    const queryClient = useQueryClient()
    const [selectedMemberForPhotos, setSelectedMemberForPhotos] = useState(null)

    const [photoQueryParams, setPhotoQueryParams] = useState({
        page: 1,
        size: 32,
    })

    const [queryParams, setQueryParams] = useState({
        page: 1,
        size: 10,
        search: '',
        sort: 'id'
    })

    const membersQuery = useQuery({
        queryKey: ['members', queryParams],
        queryFn: () => memberApi.getAllMembers(queryParams),
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 15
    })

    const photosQuery = useQuery({
        queryKey: ['photos', selectedMemberForPhotos?.id, photoQueryParams],
        queryFn: () => photoApi.getAllPhotos({
            ...photoQueryParams,
            ...(selectedMemberForPhotos ? { member_id: selectedMemberForPhotos.id } : {})
        })
    })

    const handleViewPhotos = (member) => {
        setSelectedMemberForPhotos(member)
        setPhotoQueryParams(prev => ({ ...prev, page: 1 }))
        setActiveTab('photos')
    }
    
    const handleClearPhotoFilter = () => {
        setSelectedMemberForPhotos(null)
        setPhotoQueryParams(prev => ({ ...prev, page: 1 }))
    }

    const handleBackToMembers = () => {
        setActiveTab('members')
    }

    useEffect(() => {
        if (!membersQuery.isError && !membersQuery.isLoading && membersQuery.data?.paging) {
            const currentPage = membersQuery.data.paging.page
            const totalPage = membersQuery.data.paging.total_page
            if (currentPage < totalPage) {
                const nextPage = currentPage + 1
                queryClient.prefetchQuery({
                    queryKey: ['members', { ...queryParams, page: nextPage }],
                    queryFn: () => memberApi.getAllMembers({ ...queryParams, page: nextPage }),
                    staleTime: 15 * 60 * 1000
                })
            }

        }
    }, [membersQuery.data, membersQuery.isError, membersQuery.isLoading, queryParams, queryClient])

    const members = membersQuery.data?.data || []
    const memberPagingInfo = membersQuery.data?.paging || { total_page: 1, page: 1, total_item: 0 }

    const photos = photosQuery.data?.data || []
    const photoPagingInfo = photosQuery.data?.paging || { total_page: 1, page: 1, total_item: 0 }

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardStats
                    memberCount={memberPagingInfo.total_item}
                    photoCount={photoPagingInfo.total_item}
                />
            case 'members':
                return <MemberManager
                    members={members}
                    loading={membersQuery.isFetching}
                    queryParams={queryParams}
                    setQueryParams={setQueryParams}
                    pagingInfo={memberPagingInfo}
                    onViewPhotos={handleViewPhotos}
                />
            case 'photos':
                return <PhotoManager
                    photos={photos}
                    loading={photosQuery.isLoading}
                    pagingInfo={photoPagingInfo}
                    setQueryParams={setPhotoQueryParams}
                    selectedMember={selectedMemberForPhotos}
                    onClearFilter={handleClearPhotoFilter}
                    onMemberClick={handleBackToMembers}
                />
            default:
                return <DashboardStats memberCount={members.length} photoCount={memberPagingInfo.total_item} />
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

                <div className="px-8 pt-3 max-w-425 mx-auto">
                    {renderContent()}
                </div>
            </main>
        </div>
    )
}