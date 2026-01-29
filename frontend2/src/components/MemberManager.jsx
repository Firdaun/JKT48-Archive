import { useState } from 'react';
import { Plus, Trash2, Edit, ChevronDown, Check } from 'lucide-react';

export default function MemberManager({ members }) { // Hapus props setMembers jika belum dipakai
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [sortType, setSortType] = useState('id');

    const sortedMembers = [...members].sort((a, b) => {
        switch (sortType) {
            case 'name-asc': return a.name.localeCompare(b.name);
            case 'name-desc': return b.name.localeCompare(a.name);
            case 'gen-asc': return a.generation - b.generation;
            case 'gen-desc': return b.generation - a.generation;
            case 'id': default: return a.id - b.id;
        }
    });

    const getSortLabel = () => {
        switch(sortType) {
            case 'name-asc': return 'Name (A-Z)';
            case 'name-desc': return 'Name (Z-A)';
            case 'gen-asc': return 'Generation (Old-New)';
            case 'gen-desc': return 'Generation (New-Old)';
            default: return 'ID (Default)';
        }
    }

    const getStatusBadge = (isActive) => {
        if (isActive) {
            return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Active</span>
        }
        return <span className="bg-slate-200 text-slate-600 px-2 py-1 rounded-full text-xs font-bold">Graduated</span>
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible min-h-125">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-lg">Member List</h3>
                
                <div className="flex gap-3">
                    {/* Sort Dropdown */}
                    <div className="relative">
                        <button 
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="flex items-center gap-2 bg-white border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition min-w-40 justify-between"
                        >
                            <span>Sort: <span className="text-slate-900">{getSortLabel()}</span></span>
                            <ChevronDown size={16} className={`transition-transform ${isSortOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {isSortOpen && (
                            <div className="absolute top-full mt-2 right-0 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                <div className="p-1">
                                    {[
                                        { label: 'ID (Default)', value: 'id' },
                                        { label: 'Name (A-Z)', value: 'name-asc' },
                                        { label: 'Name (Z-A)', value: 'name-desc' },
                                        { label: 'Generation (Low-High)', value: 'gen-asc' },
                                        { label: 'Generation (High-Low)', value: 'gen-desc' },
                                    ].map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() => {
                                                setSortType(option.value);
                                                setIsSortOpen(false);
                                            }}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between group transition
                                                ${sortType === option.value ? 'bg-[#EE1D52]/10 text-[#EE1D52] font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            {option.label}
                                            {sortType === option.value && <Check size={16} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700 transition">
                        <Plus size={18} /> Add Member
                    </button>
                </div>
            </div>

            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                    <tr>
                        <th className="p-4 font-semibold">Id</th>
                        <th className="p-4 font-semibold">Name</th>
                        <th className="p-4 font-semibold">Nickname</th>
                        <th className="p-4 font-semibold">Gen</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {sortedMembers.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="p-8 text-center text-slate-400">
                                Belum ada data member.
                            </td>
                        </tr>
                    ) : (
                        sortedMembers.map((member) => (
                            <tr key={member.id} className="hover:bg-slate-50 transition">
                                <td className="p-4 font-medium text-slate-400">#{member.id}</td>
                                <td className="p-4 font-medium">{member.name}</td>
                                <td className="p-4 text-slate-600">{member.nickname}</td>
                                <td className="p-4"><span className="bg-blue-50 px-2 py-1 rounded text-xs font-bold text-blue-600">Gen {member.generation}</span></td>
                                <td className="p-4">{getStatusBadge(member.isActive)}</td>
                                <td className="p-4 text-right space-x-2">
                                    <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit size={18} /></button>
                                    <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}