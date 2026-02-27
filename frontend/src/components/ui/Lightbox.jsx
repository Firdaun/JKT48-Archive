import { useEffect, useCallback, useState, useRef } from 'react'
import { X, ChevronLeft, ChevronRight, Share2, ExternalLink } from 'lucide-react'

const platformColors = {
    Instagram: '#E1306C',
    TikTok: '#EE1D52',
    X: '#1DA1F2',
}

export function Lightbox({ item, allItems, onClose, onNavigate }) {
    const currentIndex = allItems.findIndex(i => i.id === item.id)
    const [showCaption, setShowCaption] = useState(true)
    const [isClosing, setIsClosing] = useState(false)
    const handleClose = useCallback(() => {
        setIsClosing(true)
        setTimeout(() => {
            onClose()
        }, 260)
    }, [onClose])
    const hideTimer = useRef(null)

    const resetAndStartTimer = useCallback(() => {
        if (hideTimer.current) clearTimeout(hideTimer.current)
        setShowCaption(true)
        hideTimer.current = setTimeout(() => {
            setShowCaption(false)
        }, 2000)
    }, [])

    const handleMouseEnter = () => {
        if (hideTimer.current) clearTimeout(hideTimer.current)
        setShowCaption(true)
    }

    const handleMouseLeave = () => {
        resetAndStartTimer()
    }

    useEffect(() => {
        resetAndStartTimer()
        return () => {
            if (hideTimer.current) clearTimeout(hideTimer.current)
        }
    }, [resetAndStartTimer])

    const goPrev = useCallback(() => {
        if (currentIndex > 0) onNavigate(allItems[currentIndex - 1])
    }, [currentIndex, allItems, onNavigate])

    const goNext = useCallback(() => {
        if (currentIndex < allItems.length - 1) onNavigate(allItems[currentIndex + 1])
    }, [currentIndex, allItems, onNavigate])

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === 'Escape') handleClose()
            if (e.key === 'ArrowLeft') goPrev()
            if (e.key === 'ArrowRight') goNext()
        }
        window.addEventListener('keydown', handleKey)
        document.body.style.overflow = 'hidden'

        return () => {
            window.removeEventListener('keydown', handleKey)
            document.body.style.overflow = ''
        }
    }, [handleClose, goPrev, goNext])

    const platformColor = platformColors[item.platform] || '#EE1D52'

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center animate-fade-in backdrop-blur-xl bg-[#04040a]/80 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
            {/* Ambient glow */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(238,29,82,0.06)_0%,transparent_70%)]" />

            {/* Main content container */}
            <div onClick={handleClose} className={`relative z-10 flex flex-col items-center animate-scale-in w-full max-w-[90vw] max-h-[90vh] ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}>
                {/* Close button */}
                <button onClick={handleClose} className="absolute -top-12 right-0 flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200 bg-white/10 border border-white/10 text-white/70 backdrop-blur-md text-[13px] font-semibold hover:bg-[#EE1D52]/20 hover:border-[#EE1D52]/40 hover:text-white">
                    <X size={14} />
                    Close
                </button>

                {/* Image / Video container */}
                <div onClick={e => e.stopPropagation()} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="relative rounded-2xl overflow-hidden max-h-[75vh]">
                    {item.isVideo ? (
                        // Jika Video, render pemutar video asli
                        <video
                            ref={(el) => { if (el) el.volume = 0.3 }}
                            src={item.image}
                            autoPlay
                            playsInline
                            loop
                            className="block max-h-[75vh] max-w-[85vw] w-auto h-auto object-contain rounded-[20px] shadow-[0_32px_80px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.06)]"
                        />
                    ) : (
                        // Jika Foto, render gambar
                        <img
                            src={item.image}
                            alt={item.caption}
                            className="block max-h-[75vh] max-w-[85vw] w-auto h-auto object-contain rounded-[20px] shadow-[0_32px_80px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.06)]"
                        />
                    )}

                    {/* Frosted glass caption box */}
                    <div className={`absolute left-4 right-4 bottom-4 rounded-xl p-4 bg-[#0a0a14]/65 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]
                        ${showCaption ? 'opacity-100' : 'opacity-0 pointer-events-none'} transition-all duration-500 ease-in-out`}>
                        {/* Top row */}
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                {/* Platform badge */}
                                <span
                                    className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-[0.06em]"
                                    style={{
                                        background: `${platformColor}22`,
                                        color: platformColor,
                                        border: `1px solid ${platformColor}44`,
                                    }}
                                >
                                    {item.platform}
                                </span>
                                <span className="text-[11px] text-white/40 font-medium">
                                    @{item.member.toLowerCase()}
                                </span>
                            </div>
                            <span className="text-[10px] text-white/35 font-semibold tracking-[0.06em] uppercase">
                                {item.date}
                            </span>
                        </div>

                        {/* Caption */}
                        <p className="text-[13px] text-white leading-relaxed font-normal">
                            {item.caption ? item.caption.substring(0, 150) + (item.caption.length > 150 ? "..." : "") : ""}
                        </p>

                        {/* Stats & Action buttons */}
                        <div className="flex items-center justify-between gap-4 mt-3 pt-3 border-t border-white/10">
                            <button className=" flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 bg-white/10 border border-white/10 text-white/60 text-[11px] font-semibold hover:bg-white/20 hover:text-white">
                                <Share2 size={11} />
                                Share
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 bg-[#EE1D52]/10 border border-[#EE1D52]/30 text-[#EE1D52] text-[11px] font-semibold hover:bg-[#EE1D52]/20">
                                <ExternalLink size={11} />
                                View Post
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation arrow - Previous */}
                {currentIndex > 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            goPrev()
                        }}
                        className="absolute left-0 cursor-pointer top-1/2 -translate-y-1/2 -translate-x-16 flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 bg-white/10 border border-white/15 backdrop-blur-md text-white hover:bg-[#EE1D52]/20 hover:border-[#EE1D52]/40"
                    >
                        <ChevronLeft size={22} />
                    </button>
                )}

                {/* Navigation arrow - Next */}
                {currentIndex < allItems.length - 1 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation()
                            goNext()
                        }}
                        className="absolute right-0 cursor-pointer top-1/2 -translate-y-1/2 translate-x-16 flex items-center justify-center w-12 h-12 rounded-full transition-all duration-200 bg-white/10 border border-white/15 backdrop-blur-md text-white hover:bg-[#EE1D52]/20 hover:border-[#EE1D52]/40"
                    >
                        <ChevronRight size={22} />
                    </button>
                )}

                {/* Dot indicators */}
                <div className="mt-4 flex items-center gap-1.5">
                    {allItems
                        .slice(Math.max(0, currentIndex - 3), Math.min(allItems.length, currentIndex + 4))
                        .map((i, dotIdx) => {
                            const actualIdx = Math.max(0, currentIndex - 3) + dotIdx
                            const isCurrent = actualIdx === currentIndex
                            return (
                                <button
                                    key={i.id}
                                    onClick={() => onNavigate(i)}
                                    className={`h-1.5 rounded-full transition-all duration-300 border-none cursor-pointer ${isCurrent ? 'w-6 bg-[#EE1D52]' : 'w-1.5 bg-white/20'}`}
                                />
                            )
                        })}
                </div>
            </div>
        </div>
    )
}