import { X, Calendar } from 'lucide-react'

export default function PreviewMedia({ media, onClose }) {
    if (!media) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-8 animate-in fade-in duration-200" onClick={onClose}>
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 sm:top-6 sm:right-6 text-white/70 hover:text-white bg-black/50 hover:bg-black/70 p-2 rounded-full transition z-50">
                <X size={24} />
            </button>
            
            <div 
                className="bg-slate-900 rounded-xl overflow-hidden max-w-5xl w-full max-h-[90vh] flex flex-col relative shadow-2xl border border-slate-800 animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex-1 overflow-hidden flex items-center justify-center bg-black min-h-[50vh]">
                    {media.isVideo ? (
                        <video 
                            src={media.media} 
                            controls
                            autoPlay
                            className="max-w-full max-h-[75vh] object-contain"
                        />
                    ) : (
                        <img 
                            src={media.media} 
                            alt={media.caption} 
                            className="max-w-full max-h-[75vh] object-contain"
                            onError={(e) => {
                                e.target.src = "https://placehold.co/800?text=Image+Error"
                            }}
                        />
                    )}
                </div>

                <div className="bg-slate-900 text-white p-5 border-t border-slate-800 shrink-0">
                    <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                            <span className="inline-block px-2 py-1 bg-[#EE1D52] text-white text-xs font-bold rounded mb-2">
                                {media.member}
                            </span>
                            <p className="text-slate-200 text-sm md:text-base leading-relaxed max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                {media.caption || "Tidak ada caption."}
                            </p>
                        </div>
                        <div className="flex items-center text-slate-400 text-xs md:text-sm gap-1 whitespace-nowrap shrink-0 mt-1">
                            <Calendar size={14} />
                            {media.date}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}