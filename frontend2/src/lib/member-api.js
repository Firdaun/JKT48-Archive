const API_BASE_URL = import.meta.env.VITE_BACKEND_URL
const API_KEY = import.meta.env.VITE_API_KEY

const getHeaders = () => ({
    'Content-Type': 'application/json',
    'X-API-KEY': API_KEY
});

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.message || 'Error Server');
    }
    return response.json()
}

export const memberApi = {
    getAllMembers: async (params = {}) => {
        const query = new URLSearchParams(params).toString()
        const response = await fetch(`${API_BASE_URL}/members?${query}`)
        return handleResponse(response)
    },

    // tambah member
    createMember: async (data) => {
        const response = await fetch(`${API_BASE_URL}/admin/members`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        })
        return handleResponse(response)
    },

    // update member
    updateMember: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/admin/members/${id}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        })
        return handleResponse(response)
    },

    // hapus member
    deleteMember: async (id) => {
        const response = await fetch(`${API_BASE_URL}/admin/members/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        })
        return handleResponse(response)
    },
}