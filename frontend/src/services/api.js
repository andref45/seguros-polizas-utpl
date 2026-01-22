import axios from 'axios'

const api = axios.create({
    baseURL: 'http://127.0.0.1:3000/api',
    // headers: { 'Content-Type': 'application/json' } // Removed to let Axios handle FormData
})

// Request Interceptor: Attach Token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response Interceptor: Handle 401 (Auto-Logout)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // [FIX] Ignore 401 on login endpoint to allow UI to show "invalid credentials"
            // config.url might be final full URL or relative, check both safe match
            if (error.config && error.config.url && error.config.url.includes('/auth/login')) {
                return Promise.reject(error)
            }

            // Token expired or invalid for other requests
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default api
