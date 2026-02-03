import { Search, X, User, Filter } from 'lucide-react'

export default function PhotoManager({ photos, selectedMember, onClearFilter, onMemberClick }) {

    const displayedPhotos = selectedMember 
        ? photos.filter(p => p.member === selectedMember.nickname || p.member === selectedMember.name)
        : photos;

    return (
        <div className="bg-white h-220.25 rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-lg">Scraped Photos</h3>
                <div className={`flex items-center border rounded-lg overflow-hidden transition-all duration-300 ${selectedMember ? 'bg-blue-50 border-blue-200' : 'bg-white border-slate-300 border-dashed'}`}>
                        
                        {/* Bagian Label (Selalu Muncul) */}
                        <button 
                            onClick={onMemberClick} // Hanya bisa diklik balik kalau ada member
                            className={`px-3 py-1.5 hover:bg-blue-100 hover:cursor-pointer flex items-center gap-2 text-sm font-medium transition 
                                ${selectedMember 
                                    ? 'text-blue-700 hover:bg-blue-100 cursor-pointer' 
                                    : 'text-slate-500 cursor-default' // Kalau filter mati, jadi teks biasa
                                }`}
                            title={selectedMember ? "Back to Member List" : "No filter active"}>
                            {selectedMember ? (
                                <>
                                    <User size={14} />
                                    {selectedMember.nickname}
                                </>
                            ) : (
                                <>
                                    <Filter size={14} />
                                    Filter Member
                                </>
                            )}
                        </button>

                        {/* Bagian Tombol X (Hanya Muncul Jika Filter Aktif) */}
                        {selectedMember && (
                            <button 
                                onClick={onClearFilter}
                                className="px-2 py-1.5 border-l border-blue-200 hover:bg-blue-100 text-blue-500 hover:text-blue-700 transition"
                                title="Clear Filter"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Search caption..." className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none" />
                </div>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {displayedPhotos.map((photo) => (
                    <div key={photo.id} className="group relative rounded-lg overflow-hidden border border-slate-200">
                        <img src={photo.srcUrl} alt="" className="w-full aspect-square object-cover bg-slate-100" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-3">
                            <p className="text-white text-xs font-bold">{photo.member}</p>
                            <p className="text-white/80 text-[10px] truncate">{photo.postedAt}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}