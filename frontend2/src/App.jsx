import React, { useState } from 'react';
import {
    LayoutDashboard,
    Users,
    Image as ImageIcon,
    Settings,
    Plus,
    Trash2,
    Edit,
    Search,
    LogOut
} from 'lucide-react';

const INITIAL_MEMBERS = [
    { id: 1, name: 'Angelina Christy', nickname: 'Christy', generation: 7, isActive: true },
    { id: 2, name: 'Freya Jayawardana', nickname: 'Freya', generation: 7, isActive: true },
    { id: 3, name: 'Marsha Lenathea', nickname: 'Marsha', generation: 9, isActive: true },
];

const INITIAL_PHOTOS = [
    { id: 101, srcUrl: 'https://via.placeholder.com/150', caption: 'Semangat hari ini!', member: 'Christy', postedAt: '2023-10-20' },
    { id: 102, srcUrl: 'https://via.placeholder.com/150', caption: 'Oyasumi~', member: 'Freya', postedAt: '2023-10-21' },
];

export default function Admin() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [members, setMembers] = useState(INITIAL_MEMBERS);

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardStats memberCount={members.length} photoCount={INITIAL_PHOTOS.length} />;
            case 'members':
                return <MemberManager members={members} setMembers={setMembers} />;
            case 'photos':
                return <PhotoManager photos={INITIAL_PHOTOS} />;
            default:
                return <DashboardStats />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans text-slate-800">
            <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl">
                <div className="p-6 border-b border-slate-700">
                    <h1 className="text-2xl font-bold text-[#EE1D52]">JKT48<span className="text-white text-lg font-light">Archive</span></h1>
                    <p className="text-xs text-slate-400 mt-1">Admin Dashboard</p>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <SidebarItem
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        active={activeTab === 'dashboard'}
                        onClick={() => setActiveTab('dashboard')}
                    />
                    <SidebarItem
                        icon={<Users size={20} />}
                        label="Members"
                        active={activeTab === 'members'}
                        onClick={() => setActiveTab('members')}
                    />
                    <SidebarItem
                        icon={<ImageIcon size={20} />}
                        label="Photos"
                        active={activeTab === 'photos'}
                        onClick={() => setActiveTab('photos')}
                    />
                </nav>

                <div className="p-4 border-t border-slate-700">
                    <button className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full p-2 rounded-lg hover:bg-slate-800">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 overflow-y-auto">
                <header className="bg-white shadow-sm p-4 sticky top-0 z-10">
                    <div className="flex justify-between items-center max-w-7xl mx-auto">
                        <h2 className="text-xl font-semibold capitalize text-slate-700">{activeTab}</h2>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-8 rounded-full bg-[#EE1D52] text-white flex items-center justify-center font-bold">A</div>
                        </div>
                    </div>
                </header>

                <div className="p-8 max-w-7xl mx-auto">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}

function SidebarItem({ icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all duration-200 
        ${active ? 'bg-[#EE1D52] text-white shadow-md' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}
        >
            {icon}
            <span className="font-medium">{label}</span>
        </button>
    );
}

function DashboardStats({ memberCount, photoCount }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total Members" value={memberCount} icon={<Users className="text-blue-500" />} />
            <StatCard title="Total Photos" value={photoCount} icon={<ImageIcon className="text-purple-500" />} />
            <StatCard title="Bot Status" value="Active" icon={<Settings className="text-green-500" />} isStatus />
        </div>
    );
}

function StatCard({ title, value, icon, isStatus }) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
            <div>
                <p className="text-slate-500 text-sm font-medium">{title}</p>
                <h3 className={`text-3xl font-bold mt-1 ${isStatus ? 'text-green-600' : 'text-slate-800'}`}>{value}</h3>
            </div>
            <div className="p-3 bg-slate-50 rounded-full">{icon}</div>
        </div>
    );
}

function MemberManager({ members, setMembers }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-lg">Member List</h3>
                <button className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-700 transition">
                    <Plus size={18} /> Add Member
                </button>
            </div>

            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-500 text-sm uppercase tracking-wider">
                    <tr>
                        <th className="p-4 font-semibold">Name</th>
                        <th className="p-4 font-semibold">Nickname</th>
                        <th className="p-4 font-semibold">Gen</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {members.map((member) => (
                        <tr key={member.id} className="hover:bg-slate-50 transition">
                            <td className="p-4 font-medium">{member.name}</td>
                            <td className="p-4 text-slate-600">{member.nickname}</td>
                            <td className="p-4"><span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-600">Gen {member.generation}</span></td>
                            <td className="p-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${member.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {member.isActive ? 'Active' : 'Graduated'}
                                </span>
                            </td>
                            <td className="p-4 text-right space-x-2">
                                <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit size={18} /></button>
                                <button className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function PhotoManager({ photos }) {
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