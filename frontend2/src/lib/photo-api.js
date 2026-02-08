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
        const cleanParams = {}

        Object.keys(params).forEach(key => { params[key] && (cleanParams[key] = params[key]) })

        const query = new URLSearchParams(cleanParams).toString()
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