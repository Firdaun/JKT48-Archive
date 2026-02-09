const BASE_URL = import.meta.env.VITE_BACKEND_URL

const handleResponse = async (response) => {
    if (!response.ok) {
        throw new Error('Gagal mengambil data foto');
    }
    return response.json()
}

export const photoApi = {
    getPublicPhotos: async (params = {}) => {
        const query = new URLSearchParams(params).toString()
        const response = await fetch(`${BASE_URL}/api/photos?${query}`)
        return handleResponse(response)
    }
}