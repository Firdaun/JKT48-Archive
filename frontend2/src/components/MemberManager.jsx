import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit, ChevronDown, Check, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export default function MemberManager({ members, loading, queryParams, setQueryParams, pagingInfo }) {
    const [isSortOpen, setIsSortOpen] = useState(false);
    const [searchInput, setSearchInput] = useState(queryParams.search)

    const handleSortChange = (value) => {
        setQueryParams(prev => ({ ...prev, sort: value, page: 1 }))
        setIsSortOpen(false)
    }

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagingInfo.total_page) {
            setQueryParams(prev => ({ ...prev, page: newPage }))
        }
    }

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchInput !== queryParams.search) {
                setQueryParams(prev => ({...prev,
                    search: searchInput,
                    page: 1
                }))
            }
        }, 500)
        return () => {
            clearTimeout(handler)
        }
    }, [searchInput, setQueryParams, queryParams.search])

    const getSortLabel = () => {
        switch (queryParams.sort) {
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
        <div className="bg-white flex flex-col h-220.25 rounded-xl shadow-sm border border-slate-200 overflow-visible min-h-125">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-lg">Member List</h3>
                    {loading && (
                        <p className="text-xs absolute text-[#EE1D52] animate-pulse font-medium">
                            Sedang memuat data...
                        </p>
                    )}
                </div>
                <div className="flex gap-3">
                    <div className='relative'>
                        <button
                            onClick={() => setIsSortOpen(!isSortOpen)}
                            className="flex items-center gap-2 bg-white border border-slate-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-50 transition min-w-40 justify-between h-full">
                            <span className="truncate">Sort: {getSortLabel()}</span>
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
                                            onClick={() => handleSortChange(option.value)}
                                            className={`w-full text-left px-3 py-2 rounded-lg text-sm flex items-center justify-between group transition
                                                ${queryParams.sort === option.value ? 'bg-[#EE1D52]/10 text-[#EE1D52] font-semibold' : 'text-slate-600 hover:bg-slate-50'}`}>
                                            {option.label}
                                            {queryParams.sort === option.value && <Check size={16} />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="relative">
                        <div className="relative w-full md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                placeholder="Search member..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none"
                            />
                        </div>
                    </div>

                    <button className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700 transition">
                        <Plus size={18} /> Add Member
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider sticky top-0">
                        <tr>
                            <th className="p-4 w-[110.469px] font-semibold">Id</th>
                            <th className="p-4 w-[345.797px] font-semibold">Name</th>
                            <th className="p-4 w-[213.953px] font-semibold">Nickname</th>
                            <th className="p-4 w-[170.016px] font-semibold">Gen</th>
                            <th className="p-4 w-[163.672px] font-semibold">Status</th>
                            <th className="p-4 w-[210.109px] font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading && members.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-12 text-center text-slate-400">
                                    Loading data...
                                </td>
                            </tr>
                        ) : members.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="p-12 text-center text-slate-400">
                                    Tidak ada member ditemukan.
                                </td>
                            </tr>
                        ) : (
                            members.map((member) => (
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

            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                <span className="text-sm text-slate-500">
                    Total: <span className="font-semibold">{pagingInfo.total_item}</span> members
                </span>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handlePageChange(pagingInfo.page - 1)}
                        disabled={pagingInfo.page === 1}
                        className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition">
                        <ChevronLeft size={18} />
                    </button>

                    <span className="text-sm font-medium px-2">
                        Page {pagingInfo.page} of {pagingInfo.total_page || 1}
                    </span>

                    <button
                        onClick={() => handlePageChange(pagingInfo.page + 1)}
                        disabled={pagingInfo.page >= pagingInfo.total_page}
                        className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition">
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}