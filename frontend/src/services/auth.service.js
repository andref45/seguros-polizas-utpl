import api from './api'

const AuthService = {
    async login(email, password) {
        const response = await api.post('/auth/login', { email, password })
        if (response.data.success) {
            const { token, user } = response.data.data
            localStorage.setItem('token', token)
            localStorage.setItem('user', JSON.stringify(user))
            return user
        }
        throw new Error(response.data.error || 'Login failed')
    },

    logout() {
        localStorage.removeItem('token')
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
