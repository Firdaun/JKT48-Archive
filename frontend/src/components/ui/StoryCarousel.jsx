import { useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { PhotoProfile } from '../data/galleryData'

export function StoryCarousel({ activeMember, onSelectMember }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: 'center',
        containScroll: 'trimSnaps',
        dragFree: true
    })

    const teamColors = {
        'JKT48': '#EE1D52',
        'Team J': '#EE1D52',
        'dream': '#00D4FF',
        'Team T': '#a855f7',
    }

    useEffect(() => {
        if (emblaApi) {
            if (activeMember) {
                const index = PhotoProfile.findIndex(p => p.name.toLowerCase() === activeMember.toLowerCase())
                if (index !== -1) {
                    emblaApi.scrollTo(index)
                }
            }
        }
    }, [activeMember, emblaApi])

    return (
        <section className="overflow-hidden pt-13 pb-3 h-[357.281px]">
            <div className="flex items-center justify-between">
                    <div className='mb-12'>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[rgba(238,29,82,0.1)] border border-[rgba(238,29,82,0.25)] text-[11px] font-bold text-[#EE1D52] tracking-[0.08em] uppercase">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#EE1D52] shadow-[0_0_8px_#EE1D52] inline-block" />
                                Live Gallery
                            </span>
                            <span className="px-3 py-1.5 rounded-full bg-[rgba(0,212,255,0.08)] border border-[rgba(0,212,255,0.2)] text-[11px] font-semibold text-[#00D4FF] tracking-[0.06em]">
                                Updated Feb 21, 2026
                            </span>
                        </div>

                        <h1 className="text-[36px] font-extrabold tracking-[-0.03em] leading-[1.15] text-white m-0">
                            Media Gallery
                            <br />
                            <span className="bg-[linear-gradient(135deg,#EE1D52_0%,#ff6b9d_50%,#EE1D52_100%)] bg-clip-text text-transparent bg-size-[200%]">
                                JKT48
                            </span>{' '}
                            <span className="text-white/35">Official</span>
                        </h1>
                    </div>

                    <div className="hidden lg:flex items-center gap-6">
                        {[
                            { label: 'Photos', value: '1,240+', color: '#EE1D52', shadow: 'rgba(238,29,82,0.4)' },
                            { label: 'Videos', value: '380+', color: '#00D4FF', shadow: 'rgba(0,212,255,0.4)' },
                            { label: 'Members', value: '48', color: '#a855f7', shadow: 'rgba(168,85,247,0.4)' },
                        ].map(stat => (
                            <div key={stat.label} className="text-center">
                                <div
                                    className="text-[24px] font-extrabold tracking-[-0.02em]"
                                    style={{
                                        color: stat.color,
                                        textShadow: `0 0 20px ${stat.shadow}`,
                                    }}
                                >
                                    {stat.value}
                                </div>
                                <div className="text-[11px] font-semibold text-white/35 tracking-[0.06em] uppercase">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            <div ref={emblaRef}>
                <div className="flex select-none">
                    {PhotoProfile.map((member, index) => {
                        const isActive = activeMember?.toLowerCase() === member.name.toLowerCase()
                        const color = teamColors[member.team] || '#EE1D52'
                        const isCyan = color === '#00D4FF'

                        return (
                            <button
                                key={index}
                                onClick={() => onSelectMember(member.name)}
                                className="flex mr-5 cursor-pointer flex-col items-center gap-2 shrink-0 group min-w-18">
                                <div className={`relative transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${isActive ? 'scale-110' : 'scale-100'}`}>
                                    {/* Glow Ring */}
                                    <div className={`rounded-full p-0.75 ${isActive ? isCyan ? 'animate-glow-pulse-cyan' : 'animate-glow-pulse' : 'bg-white/12'}`}
                                        style={ isActive ? { background: `linear-gradient(135deg, ${color}, ${isCyan ? '#7df9ff' : '#ff6b9d'})` }: undefined }>
                                        <div className={`rounded-full p-0.5 ${isActive ? 'bg-[#07070f]' : 'bg-transparent'}`}>
                                            <img
                                                src={member.src}
                                                alt={member.name}
                                                className={`rounded-full object-cover w-15.5 h-15.5 transition-[opacity,filter] duration-300 ease-in-out ${isActive ? 'opacity-100' : 'opacity-55 grayscale-20'
                                                    }`}
                                            />
                                        </div>
                                    </div>

                                    {/* Online indicator dot for active */}
                                    {isActive && (
                                        <span
                                            className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full border-2 border-[#07070f]"
                                            style={{ background: color }}
                                        />
                                    )}
                                </div>
                                <span className={`text-center block text-[11px] tracking-[0.02em] max-w-16 truncate transition-colors duration-300 ease-in-out ${isActive ? 'font-bold text-white' : 'font-normal text-white/40'}`}>
                                    {member.name}
                                </span>
                                {isActive && member.team !== 'JKT48' && (
                                    <span
                                        className="px-1.5 py-0.5 rounded-full animate-fade-in text-[9px] font-bold tracking-[0.04em]"
                                        style={{
                                            background: `${color}22`,
                                            color: color,
                                            border: `1px solid ${color}44`,
                                        }}>
                                        {member.team}
                                    </span>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}