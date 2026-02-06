const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const dashboardApi = {
    getStats: async () => {
        const response = await fetch(`${API_BASE_URL}/stats`);
        if (!response.ok) throw new Error('Gagal mengambil statistik');
        return response.json();
    }
};