import { useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { PhotoProfile } from '../data/galleryData'
import { useQuery } from '@tanstack/react-query'
const teamColors = {
    'love': {
        color: '#EE1D52',
        gradientEnd: '#ff6b9d',
        animation: 'animate-glow-pulse-red'
    },
    'passion': {
        color: '#FFD700',
        gradientEnd: '#ffeb73',
        animation: 'animate-glow-pulse-gold'
    },
    'dream': {
        color: '#00D4FF',
        gradientEnd: '#7df9ff',
        animation: 'animate-glow-pulse-cyan'
    },
    'trainee': {
        color: '#94a3b8',
        gradientEnd: '#cbd5e1',
        animation: 'animate-glow-pulse-gray'
    }
}
const sortedProfiles = [...PhotoProfile].sort((a, b) => {
    const teamOrder = { 'dream': 1, 'passion': 2, 'love': 3, 'trainee': 4 }

    const orderA = teamOrder[a.team] || 5
    const orderB = teamOrder[b.team] || 5

    if (orderA !== orderB) return orderA - orderB

    return a.name.localeCompare(b.name)
})

export function StoryCarousel({ activeMember, onSelectMember }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: 'center',
        containScroll: 'trimSnaps',
        dragFree: true
    })

    useEffect(() => {
        if (emblaApi) {
            if (activeMember) {
                const index = sortedProfiles.findIndex(p => p.name.toLowerCase() === activeMember.toLowerCase())
                if (index !== -1) {
                    emblaApi.scrollTo(index)
                }
            }
        }
    }, [activeMember, emblaApi])

    const { data: globalData } = useQuery({
        queryKey: ['globalMediaTotal'],
        queryFn: async () => {
            const API_URL = import.meta.env.VITE_BACKEND_URL
            const response = await fetch(`${API_URL}/api/photos?page=1&size=1`)
            if (!response.ok) return null
            return response.json()
        },
        staleTime: 1000 * 60 * 60
    })

    const globalTotalMedia = globalData?.paging?.total_item || 0

    const statItems = [
        { label: 'Total Media', value: globalTotalMedia ? `${new Intl.NumberFormat('id-ID').format(globalTotalMedia)}` : '...', color: '#00D4FF', shadow: 'rgba(0,212,255,0.4)' },
        { label: 'Members', value: PhotoProfile.length, color: '#a855f7', shadow: 'rgba(168,85,247,0.4)' },
    ]

    const latestDateRaw = globalData?.data?.[0]?.savedAt

    const formattedUpdateDate = latestDateRaw
        ? new Date(latestDateRaw).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        })
        : 'Updating...';

    return (
        <section className="overflow-hidden pt-7 lg:pt-11 pb-3">
            <div className="flex justify-between">
                <div className='mb-7 lg:mb-11'>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1.5 rounded-full bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] text-[8px] md:text-[9.5px] lg:text-[11px] font-semibold text-[#00D4FF] tracking-[0.06em]">
                            Updated {formattedUpdateDate}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-[34px] lg:text-[36px] font-extrabold tracking-[-0.03em] leading-[1.15] text-white m-0">
                        Media Gallery
                        <br />
                        <span className="bg-[linear-gradient(135deg,#EE1D52_0%,#ff6b9d_50%,#EE1D52_100%)] bg-clip-text text-transparent bg-size-[200%]">
                            JKT48
                        </span>{' '}
                        <span className="text-white/35">Official</span>
                    </h1>
                </div>

                <div className="flex flex-row gap-2">
                    {statItems.map(stat => (
                        <div key={stat.label} className="text-center">
                            <div
                                className="text-[20px] md:text-[24px] font-extrabold tracking-[-0.02em]"
                                style={{
                                    color: stat.color,
                                    textShadow: `0 0 20px ${stat.shadow}`,
                                }}>
                                {stat.value}
                            </div>
                            <div className="text-[8px] md:text-[9.5px] lg:text-[11px] font-semibold text-white/35 tracking-[0.06em] uppercase">
                                {stat.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div ref={emblaRef}>
                <div className="flex select-none">
                    {sortedProfiles.map((member, index) => {
                        const isActive = activeMember === member.name
                        const activeStyle = teamColors[member.team] || teamColors['love']

                        return (
                            <button key={index} onClick={() => onSelectMember(member.name)}
                                className="flex mr-3 md:mr-5 cursor-pointer flex-col items-center gap-2 shrink-0 group min-w-18 will-change-transform">
                                <div className={`relative transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isActive ? 'scale-110' : 'scale-100'}`}>
                                    <div className={`rounded-full p-0.75 ${isActive ? activeStyle.animation : 'bg-white/12'}`}
                                        style={isActive ? { background: `linear-gradient(135deg, ${activeStyle.color}, ${activeStyle.gradientEnd})` } : undefined}>
                                        <div className={`rounded-full p-0.5 ${isActive ? 'bg-[#07070f]' : 'bg-transparent'}`}>
                                            <img
                                                src={member.src}
                                                alt={member.name}
                                                className={`rounded-full object-cover w-14 md:w-15.5 h-14 md:h-15.5 transition-[opacity,filter] duration-300 ease-in-out ${isActive ? 'opacity-100' : 'opacity-55 grayscale-20'}`}
                                            />
                                        </div>
                                    </div>

                                    {isActive && (
                                        <span
                                            className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-[#07070f]"
                                            style={{ background: activeStyle.color }}
                                        />
                                    )}
                                </div>
                                <span className={`text-center block text-[11px] tracking-[0.02em] max-w-16 truncate transition-colors duration-300 ease-in-out ${isActive ? 'font-bold text-white' : 'font-normal text-white/40'}`}>
                                    {member.name}
                                </span>
                                <span
                                    className="px-1.5 py-0.5 rounded-full animate-fade-in text-[9px] font-bold tracking-[0.04em]"
                                    style={{
                                        background: `${activeStyle.color}22`,
                                        color: activeStyle.color,
                                        border: `1px solid ${activeStyle.color}44`,
                                    }}>
                                    {member.team}
                                </span>
                            </button>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}