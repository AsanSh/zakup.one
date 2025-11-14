import { create } from 'zustand';
import apiClient from '../shared/api/axiosConfig';
import { authApi } from '../shared/api';
export const useAuthStore = create()((set) => ({
    user: null,
    token: null,
    isAuthenticated: false,
    isInitialized: false,
    login: async (email, password) => {
        try {
            console.log('🔍 authStore.login: Starting login for', email);
            const response = await authApi.login(email, password);
            const { access_token, user } = response;
            if (!access_token) {
                throw new Error('Токен не получен от сервера');
            }
            if (!user) {
                throw new Error('Данные пользователя не получены от сервера');
            }
            console.log('✅ authStore.login: Login successful', {
                hasToken: !!access_token,
                user: { id: user.id, email: user.email, is_admin: user.is_admin }
            });
            // Устанавливаем токен в axios
            apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
            // Сохраняем в localStorage
            const authData = {
                token: access_token,
                isAuthenticated: true,
                user: user,
            };
            localStorage.setItem('auth-storage', JSON.stringify({ state: authData }));
            console.log('💾 authStore.login: Auth data saved to localStorage');
            // Обновляем состояние
            set(authData);
            console.log('✅ authStore.login: State updated');
        }
        catch (error) {
            console.error('❌ authStore.login: Error occurred', error);
            // Пробрасываем ошибку дальше, чтобы Login.tsx мог её обработать
            throw error;
        }
    },
    register: async (data) => {
        await authApi.register(data);
        // После регистрации НЕ входим автоматически - пользователь должен быть верифицирован
    },
    logout: () => {
        delete apiClient.defaults.headers.common['Authorization'];
        set({
            user: null,
            token: null,
            isAuthenticated: false,
        });
        localStorage.removeItem('auth-storage');
    },
    init: () => {
        // Предотвращаем повторную инициализацию
        const state = useAuthStore.getState();
        if (state.isInitialized) {
            return;
        }
        const stored = localStorage.getItem('auth-storage');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                const token = data.state?.token;
                if (token) {
                    // Устанавливаем токен в apiClient
                    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    console.log('Токен восстановлен из localStorage');
                    set({
                        token: token,
                        user: data.state.user || null,
                        isAuthenticated: data.state.isAuthenticated || false,
                        isInitialized: true,
                    });
                }
                else {
                    console.warn('Токен не найден в localStorage');
                    set({ isInitialized: true });
                }
            }
            catch (e) {
                console.error('Error loading auth state:', e);
                // Очищаем поврежденные данные
                localStorage.removeItem('auth-storage');
                set({ isInitialized: true });
            }
        }
        else {
            // Нет сохраненных данных - это нормально для первого входа
            set({ isInitialized: true });
        }
    },
}));
