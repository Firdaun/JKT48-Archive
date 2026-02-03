import { Users, Image as ImageIcon, Settings } from 'lucide-react'

export default function DashboardStats({ memberCount, photoCount }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Total Members" value={memberCount} icon={<Users className="text-blue-500" />} />
            <StatCard title="Total Photos" value={photoCount} icon={<ImageIcon className="text-purple-500" />} />
            <StatCard title="Bot Status" value="Active" icon={<Settings className="text-green-500" />} isStatus />
        </div>
    )
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
    )
}