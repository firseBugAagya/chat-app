import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/router'

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null)
    const router = useRouter()

    const login = (email, password) => {
        setUser({ email })
        router.push('/chat')
    }

    const signup = (email, password, name) => {
        setUser({ email, name })
        router.push('/chat')
    }

    const logout = () => {
        setUser(null)
        router.push('/')
    }

    return (
        <AuthContext.Provider value={{ user, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}