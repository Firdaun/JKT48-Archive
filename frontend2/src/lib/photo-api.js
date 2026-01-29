const API_BASE_URL = import.meta.env.API_BACKEND_URL

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || 'Error Server');
    }
    return response.json()
}

export const photoApi = {
    getAllPhotos: async () => {
        const response = await fetch(`${API_BASE_URL}/photos`)
        return handleResponse(response)
    },

    // hapus photo
    deletePhoto: async (id) => {
        const response = await fetch(`${API_BASE_URL}/photos/${id}`, {
            method: 'DELETE',
        })
        return handleResponse(response)
    },
}