import { useEffect, useState } from 'react';
import { memberApi } from './lib/member-api';
import Sidebar from './components/Sidebar';
import DashboardStats from './components/DashboardStats';
import MemberManager from './components/MemberManager';
import PhotoManager from './components/PhotoManager';

const INITIAL_PHOTOS = [
    { id: 101, srcUrl: 'https://via.placeholder.com/150', caption: 'Semangat hari ini!', member: 'Christy', postedAt: '2023-10-20' },
    { id: 102, srcUrl: 'https://via.placeholder.com/150', caption: 'Oyasumi~', member: 'Freya', postedAt: '2023-10-21' },
];

export default function Admin() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const response = await memberApi.getAllMembers();
            setMembers(response.data);
        } catch (err) {
            console.error("Error fetching data:", err);
        } finally {
            setLoading(false);
        }
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <DashboardStats memberCount={members.length} photoCount={INITIAL_PHOTOS.length} />;
            case 'members':
                return <MemberManager members={members} />;
            case 'photos':
                return <PhotoManager photos={INITIAL_PHOTOS} />;
            default:
                return <DashboardStats memberCount={members.length} photoCount={INITIAL_PHOTOS.length} />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 font-sans text-slate-800">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

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