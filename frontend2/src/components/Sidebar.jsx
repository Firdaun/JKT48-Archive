import { LayoutDashboard, Users, Image as ImageIcon, LogOut } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab }) {
    return (
        <aside className="w-64 bg-slate-900 text-white flex flex-col shadow-xl h-screen sticky top-0">
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
    );
}

// Sub-component (Hanya dipakai di Sidebar, jadi simpan di sini saja)
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