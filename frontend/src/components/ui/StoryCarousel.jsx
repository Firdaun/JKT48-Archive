import { useEffect } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { PhotoProfile } from '../data/galleryData';

export function StoryCarousel({ activeMember, onSelectMember }) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: true,
        align: 'center',
        containScroll: 'trimSnaps',
        dragFree: true
    });

    const teamColors = {
        'JKT48': '#EE1D52',
        'Team J': '#EE1D52',
        'dream': '#00D4FF',
        'Team T': '#a855f7',
    };

    useEffect(() => {
        if (emblaApi) {
            if (activeMember) {
                const index = PhotoProfile.findIndex(p => p.name.toLowerCase() === activeMember.toLowerCase());
                if (index !== -1) {
                    emblaApi.scrollTo(index);
                }
            } else {
                emblaApi.scrollTo(0);
            }
        }
    }, [activeMember, emblaApi]);

    return (
        <section className="overflow-hidden pt-13 pb-3 h-47">
            <div ref={emblaRef}>
                <div className="flex select-none">
                    {PhotoProfile.map((member, index) => {
                        const isActive = activeMember?.toLowerCase() === member.name.toLowerCase();
                        const color = teamColors[member.team] || '#EE1D52';
                        const isCyan = color === '#00D4FF';

                        return (
                            <button
                                key={index}
                                onClick={() => onSelectMember(member.name)}
                                className="flex mr-5 flex-col items-center gap-2 shrink-0 group min-w-18">
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
                        );
                    })}
                </div>
            </div>
        </section>
    );
}