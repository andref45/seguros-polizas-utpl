import api from './api'

const AuthService = {
    async login(email, password) {
        const response = await api.post('/auth/login', { email, password })
        if (response.data.success) {
            const { token, refreshToken, user } = response.data.data
            localStorage.setItem('token', token)
            if (refreshToken) localStorage.setItem('refreshToken', refreshToken)
            localStorage.setItem('user', JSON.stringify(user))
            return user
        }
        throw new Error(response.data.error || 'Login failed')
    },

    async register(email, password, userData) {
        try {
            const response = await api.post('/auth/register', {
                email,
                password,
                ...userData
            })
            return response.data
        } catch (error) {
            console.error('Registration failed service', error)
            throw error.response?.data?.error || 'Registration failed'
        }
    },

    logout() {
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        // Optional: Call API to invalidate session
        // api.post('/auth/logout').catch(console.error)
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user')
        return userStr ? JSON.parse(userStr) : null
    }
}

export default AuthService
