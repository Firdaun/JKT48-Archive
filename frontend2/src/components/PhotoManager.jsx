import { Search } from 'lucide-react';

export default function PhotoManager({ photos }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-lg">Scraped Photos</h3>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input type="text" placeholder="Search caption..." className="pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#EE1D52]" />
                </div>
            </div>
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {photos.map((photo) => (
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