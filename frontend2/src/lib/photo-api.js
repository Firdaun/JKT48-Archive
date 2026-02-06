const VITE_BASE_URL = import.meta.env.VITE_BACKEND_URL

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || 'Error Server');
    }
    return response.json()
}

export const photoApi = {
    getAllPhotos: async (params = {}) => {
        const query = new URLSearchParams(params).toString()
        const response = await fetch(`${VITE_BASE_URL}/api/photos?${query}`)
        return handleResponse(response)
    },

    deletePhoto: async (id) => {
        const response = await fetch(`${VITE_BASE_URL}/api/photos/${id}`, {
            method: 'DELETE',
        })
        return handleResponse(response)
    },
}