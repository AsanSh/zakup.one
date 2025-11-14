import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { formatPrice } from '../../shared/utils/formatters';
import { User, Save, Lock, Trash2, DollarSign, Info, HelpCircle, FileText, CreditCard, Paperclip, X, Upload } from 'lucide-react';
export default function Profile() {
    const { user: authUser, logout } = useAuthStore();
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [formData, setFormData] = useState({
        full_name: authUser?.full_name || '',
        email: authUser?.email || '',
        company: authUser?.company || '',
        phone: authUser?.phone || '',
    });
    const [passwordData, setPasswordData] = useState({
        old_password: '',
        new_password: '',
        confirm_password: '',
    });
    // Финансовые данные (в реальном приложении будут загружаться с сервера)
    const [financialData, setFinancialData] = useState({
        deposit_name: 'Недвижимость, г. Бишкек, ул. Чуй, д. 123', // Наименование залога
        deposit_valuation: 100000, // Оценочная стоимость залога (вводит админ)
        credit_limit: 50000, // Лимит на рассрочку (50% от оценочной стоимости)
        credit_term: 30, // Срок рассрочки в днях
        deposit_files: [], // Файлы залога
        total_products: 1250, // Количество товаров за все время
        total_cash: 150000, // Сумма за наличные
        total_credit: 75000, // Сумма в рассрочку
        credit_balance: 25000, // Остаток по рассрочке
        contract_amount: 200000, // Сумма контракта
        total_payments: 175000, // Сумма выплат
        last_transaction: {
            date: '10.03.2024',
            amount: 5000,
            type: 'Оплата рассрочки',
        },
        status: 'Активен',
        transactions: [
            { id: 1, date: '10.03.2024', amount: 5000, type: 'Оплата рассрочки', status: 'Завершено' },
            { id: 2, date: '05.03.2024', amount: 10000, type: 'Оплата рассрочки', status: 'Завершено' },
            { id: 3, date: '28.02.2024', amount: 15000, type: 'Покупка товаров', status: 'Завершено' },
            { id: 4, date: '20.02.2024', amount: 20000, type: 'Покупка товаров', status: 'Завершено' },
        ],
    });
    const [uploadingFiles, setUploadingFiles] = useState(false);
    useEffect(() => {
        // Загружаем данные пользователя
        const loadUserData = async () => {
            try {
                setLoading(true);
                // Здесь можно добавить API запрос для получения полных данных пользователя
                // const response = await axios.get(`${API_URL}/auth/me`)
                // setUser(response.data)
                // setFormData({ ...formData, ...response.data })
            }
            catch (err) {
                console.error('Ошибка загрузки данных пользователя:', err);
            }
            finally {
                setLoading(false);
            }
        };
        if (authUser) {
            loadUserData();
        }
    }, [authUser]);
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
        setSuccess('');
    };
    const handlePasswordChange = (e) => {
        setPasswordData({
            ...passwordData,
            [e.target.name]: e.target.value,
        });
        setError('');
        setSuccess('');
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);
        try {
            // Здесь можно добавить API запрос для обновления данных пользователя
            // await axios.put(`${API_URL}/auth/profile`, formData)
            setSuccess('Данные профиля успешно обновлены');
            setTimeout(() => setSuccess(''), 3000);
        }
        catch (err) {
            setError(err.response?.data?.detail || 'Ошибка обновления данных. Попробуйте снова.');
        }
        finally {
            setSaving(false);
        }
    };
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (passwordData.new_password !== passwordData.confirm_password) {
            setError('Новый пароль и подтверждение не совпадают');
            return;
        }
        if (passwordData.new_password.length < 6) {
            setError('Пароль должен быть не менее 6 символов');
            return;
        }
        setSaving(true);
        try {
            // Здесь можно добавить API запрос для изменения пароля
            // await axios.post(`${API_URL}/auth/change-password`, {
            //   old_password: passwordData.old_password,
            //   new_password: passwordData.new_password,
            // })
            setSuccess('Пароль успешно изменен');
            setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
            setTimeout(() => setSuccess(''), 3000);
        }
        catch (err) {
            setError(err.response?.data?.detail || 'Ошибка изменения пароля. Проверьте старый пароль.');
        }
        finally {
            setSaving(false);
        }
    };
    const handleDeleteAccount = async () => {
        if (!window.confirm('Вы уверены, что хотите удалить свой аккаунт? Это действие необратимо.')) {
            return;
        }
        setError('');
        setSuccess('');
        setSaving(true);
        try {
            // Здесь можно добавить API запрос для удаления аккаунта
            // await axios.delete(`${API_URL}/auth/profile`)
            setSuccess('Аккаунт успешно удален. Вы будете перенаправлены на страницу входа.');
            setTimeout(() => {
                logout();
            }, 2000);
        }
        catch (err) {
            setError(err.response?.data?.detail || 'Ошибка удаления аккаунта. Попробуйте снова.');
        }
        finally {
            setSaving(false);
        }
    };
    // Обработка загрузки файлов залога
    const handleDepositFileUpload = async (files) => {
        if (!files || files.length === 0)
            return;
        setUploadingFiles(true);
        try {
            // Здесь будет загрузка файлов через API
            // Пока просто добавляем в локальное состояние
            const newFiles = Array.from(files).map((file, index) => ({
                id: Date.now() + index,
                name: file.name,
                url: URL.createObjectURL(file),
                type: file.type,
            }));
            setFinancialData({
                ...financialData,
                deposit_files: [...financialData.deposit_files, ...newFiles],
            });
            alert(`Загружено файлов: ${files.length}`);
        }
        catch (error) {
            alert('Ошибка при загрузке файлов. Попробуйте снова.');
        }
        finally {
            setUploadingFiles(false);
        }
    };
    // Удаление файла залога
    const handleRemoveDepositFile = (fileId) => {
        setFinancialData({
            ...financialData,
            deposit_files: financialData.deposit_files.filter((f) => f.id !== fileId),
        });
    };
    if (loading) {
        return (_jsx("div", { className: "max-w-4xl mx-auto", children: _jsx("div", { className: "bg-white shadow rounded-lg p-6", children: _jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto" }), _jsx("p", { className: "mt-4 text-gray-500", children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0434\u0430\u043D\u043D\u044B\u0445..." })] }) }) }));
    }
    return (_jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "bg-white shadow rounded-lg overflow-hidden", children: [_jsx("div", { className: "bg-gray-50 px-6 py-4 border-b border-gray-200", children: _jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "bg-primary-100 rounded-full p-2", children: _jsx(User, { className: "h-6 w-6 text-primary-600" }) }), _jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-semibold text-gray-900", children: "\u041F\u0440\u043E\u0444\u0438\u043B\u044C \u0438 \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438" }), _jsx("p", { className: "text-sm text-gray-500", children: "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0434\u0430\u043D\u043D\u044B\u043C\u0438 \u0432\u0430\u0448\u0435\u0433\u043E \u043F\u0440\u043E\u0444\u0438\u043B\u044F" })] })] }) }), _jsxs("form", { onSubmit: handleSubmit, className: "p-6", children: [error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4", children: error })), success && (_jsx("div", { className: "bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4", children: success })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "full_name", className: "block text-xs font-medium text-gray-700 mb-1", children: "\u0424\u0418\u041E" }), _jsx("input", { type: "text", id: "full_name", name: "full_name", value: formData.full_name, onChange: handleChange, className: "w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-xs font-medium text-gray-700 mb-1", children: "Email" }), _jsx("input", { type: "email", id: "email", name: "email", value: formData.email, onChange: handleChange, disabled: true, className: "w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "phone", className: "block text-xs font-medium text-gray-700 mb-1", children: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D" }), _jsx("input", { type: "tel", id: "phone", name: "phone", value: formData.phone, onChange: handleChange, placeholder: "+996 XXX XXX XXX", className: "w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "company", className: "block text-xs font-medium text-gray-700 mb-1", children: "\u041A\u043E\u043C\u043F\u0430\u043D\u0438\u044F" }), _jsx("input", { type: "text", id: "company", name: "company", value: formData.company, onChange: handleChange, className: "w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" })] }), _jsx("div", { className: "flex items-end", children: _jsxs("div", { className: "flex items-center space-x-2 w-full", children: [_jsx("div", { className: `h-2 w-2 rounded-full ${authUser?.is_verified ? 'bg-green-500' : 'bg-yellow-500'}` }), _jsx("span", { className: "text-xs text-gray-600", children: authUser?.is_verified ? 'Верифицирован' : 'Не верифицирован' })] }) }), _jsx("div", { className: "flex items-end", children: _jsxs("button", { type: "submit", disabled: saving, className: "w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), saving ? 'Сохранение...' : 'Сохранить'] }) })] })] })] }), _jsxs("div", { className: "bg-white shadow rounded-lg overflow-hidden mt-6", children: [_jsx("div", { className: "bg-gray-50 px-6 py-3 border-b border-gray-200", children: _jsxs("h2", { className: "text-sm font-medium text-gray-900 flex items-center", children: [_jsx(Lock, { className: "h-4 w-4 mr-2 text-gray-500" }), "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u043F\u0430\u0440\u043E\u043B\u044C"] }) }), _jsx("form", { onSubmit: handlePasswordSubmit, className: "p-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "old_password", className: "block text-xs font-medium text-gray-700 mb-1", children: "\u0421\u0442\u0430\u0440\u044B\u0439 \u043F\u0430\u0440\u043E\u043B\u044C" }), _jsx("input", { type: "password", id: "old_password", name: "old_password", value: passwordData.old_password, onChange: handlePasswordChange, className: "w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "new_password", className: "block text-xs font-medium text-gray-700 mb-1", children: "\u041D\u043E\u0432\u044B\u0439 \u043F\u0430\u0440\u043E\u043B\u044C" }), _jsx("input", { type: "password", id: "new_password", name: "new_password", value: passwordData.new_password, onChange: handlePasswordChange, className: "w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "confirm_password", className: "block text-xs font-medium text-gray-700 mb-1", children: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435" }), _jsx("input", { type: "password", id: "confirm_password", name: "confirm_password", value: passwordData.confirm_password, onChange: handlePasswordChange, className: "w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500" })] }), _jsx("div", { className: "flex items-end", children: _jsxs("button", { type: "submit", disabled: saving, className: "w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx(Lock, { className: "h-4 w-4 mr-2" }), saving ? 'Сохранение...' : 'Изменить'] }) })] }) })] }), _jsxs("div", { className: "bg-white shadow rounded-lg overflow-hidden mt-6", children: [_jsx("div", { className: "bg-gray-50 px-6 py-4 border-b border-gray-200", children: _jsxs("h2", { className: "text-lg font-medium text-gray-900 flex items-center", children: [_jsx(DollarSign, { className: "h-5 w-5 mr-2 text-green-600" }), "\u0424\u0438\u043D\u0430\u043D\u0441\u043E\u0432\u0430\u044F \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u044F"] }) }), _jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "border-b border-gray-200 pb-6", children: [_jsxs("h3", { className: "text-md font-semibold text-gray-900 mb-4 flex items-center", children: [_jsx(CreditCard, { className: "h-5 w-5 mr-2 text-blue-600" }), "\u0417\u0430\u043B\u043E\u0433 \u043A\u043B\u0438\u0435\u043D\u0442\u0430"] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-1", children: "\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435 \u0437\u0430\u043B\u043E\u0433\u0430" }), _jsx("input", { type: "text", value: financialData.deposit_name, onChange: (e) => setFinancialData({ ...financialData, deposit_name: e.target.value }), className: "w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500", placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435 \u0437\u0430\u043B\u043E\u0433\u0430" })] }), _jsxs("div", { className: "mb-4", children: [_jsx("label", { className: "block text-xs font-medium text-gray-700 mb-2", children: "\u0414\u043E\u0433\u043E\u0432\u043E\u0440\u044B \u0438 \u0434\u043E\u043A\u0443\u043C\u0435\u043D\u0442\u044B \u043D\u0430 \u0437\u0430\u043B\u043E\u0433" }), _jsx("div", { className: "flex items-center space-x-2", children: _jsxs("label", { className: "flex-1 cursor-pointer", children: [_jsx("input", { type: "file", multiple: true, accept: ".pdf,.doc,.docx,.jpg,.jpeg,.png", onChange: (e) => handleDepositFileUpload(e.target.files), className: "hidden", disabled: uploadingFiles }), _jsxs("div", { className: "flex items-center justify-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-md hover:border-primary-500 transition-colors", children: [_jsx(Upload, { className: "h-4 w-4 mr-2 text-gray-500" }), _jsx("span", { className: "text-sm text-gray-600", children: uploadingFiles ? 'Загрузка...' : 'Выбрать файлы' })] })] }) }), _jsx("p", { className: "mt-1 text-xs text-gray-500", children: "\u041C\u043E\u0436\u043D\u043E \u0437\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043D\u0435\u0441\u043A\u043E\u043B\u044C\u043A\u043E \u0444\u0430\u0439\u043B\u043E\u0432 (PDF, DOC, DOCX, JPG, PNG)" })] }), financialData.deposit_files.length > 0 && (_jsx("div", { className: "mb-4", children: _jsx("div", { className: "space-y-2", children: financialData.deposit_files.map((file) => (_jsxs("div", { className: "flex items-center justify-between bg-gray-50 rounded-md p-3 hover:bg-gray-100 transition-colors", children: [_jsxs("div", { className: "flex items-center space-x-2 flex-1 min-w-0", children: [_jsx(Paperclip, { className: "h-4 w-4 text-gray-500 flex-shrink-0" }), _jsx("a", { href: file.url, target: "_blank", rel: "noopener noreferrer", className: "text-sm text-primary-600 hover:text-primary-800 truncate", children: file.name })] }), _jsx("button", { onClick: () => handleRemoveDepositFile(file.id), className: "ml-2 p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors", title: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C \u0444\u0430\u0439\u043B", children: _jsx(X, { className: "h-4 w-4" }) })] }, file.id))) }) })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200", children: [_jsxs("div", { className: "flex items-center justify-between bg-green-50 rounded-lg px-4 py-3 border border-green-200 h-16", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("p", { className: "text-xs text-gray-600", children: "\u041E\u0446\u0435\u043D\u043E\u0447\u043D\u0430\u044F \u0441\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C" }), _jsx("p", { className: "text-xs text-gray-500", children: "(\u0443\u0441\u0442\u0430\u043D\u0430\u0432\u043B\u0438\u0432\u0430\u0435\u0442 \u0430\u0434\u043C\u0438\u043D)" })] }), _jsx("p", { className: "text-xl font-bold text-green-700 whitespace-nowrap ml-4", children: formatPrice(financialData.deposit_valuation) })] }), _jsxs("div", { className: "flex items-center justify-between bg-primary-50 rounded-lg px-4 py-3 border border-primary-200 h-16", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("p", { className: "text-xs text-gray-600", children: "\u041B\u0438\u043C\u0438\u0442 \u043D\u0430 \u0440\u0430\u0441\u0441\u0440\u043E\u0447\u043A\u0443" }), _jsx("p", { className: "text-xs text-gray-500", children: "(\u0443\u0441\u0442\u0430\u043D\u0430\u0432\u043B\u0438\u0432\u0430\u0435\u0442 \u0430\u0434\u043C\u0438\u043D)" })] }), _jsx("p", { className: "text-xl font-bold text-primary-700 whitespace-nowrap ml-4", children: formatPrice(financialData.credit_limit) })] }), _jsxs("div", { className: "flex items-center justify-between bg-blue-50 rounded-lg px-4 py-3 border border-blue-200 h-16", children: [_jsxs("div", { className: "flex flex-col", children: [_jsx("p", { className: "text-xs text-gray-600", children: "\u0421\u0440\u043E\u043A \u0440\u0430\u0441\u0441\u0440\u043E\u0447\u043A\u0438" }), _jsx("p", { className: "text-xs text-gray-500", children: "(\u0443\u0441\u0442\u0430\u043D\u0430\u0432\u043B\u0438\u0432\u0430\u0435\u0442 \u0430\u0434\u043C\u0438\u043D)" })] }), _jsxs("p", { className: "text-xl font-bold text-blue-700 whitespace-nowrap ml-4", children: [financialData.credit_term, " \u0434\u043D\u0435\u0439"] })] })] })] }), _jsxs("div", { className: "border-t border-gray-200 pt-6", children: [_jsx("h3", { className: "text-md font-semibold text-gray-900 mb-4", children: "\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "\u0422\u043E\u0432\u0430\u0440\u043E\u0432 \u043F\u0440\u0438\u043E\u0431\u0440\u0435\u0442\u0435\u043D\u043E (\u0432\u0441\u0435\u0433\u043E):" }), _jsxs("span", { className: "text-sm font-medium text-gray-900", children: [financialData.total_products, " \u0448\u0442"] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "\u0421\u0443\u043C\u043C\u0430 \u0437\u0430 \u043D\u0430\u043B\u0438\u0447\u043D\u044B\u0435:" }), _jsx("span", { className: "text-sm font-medium text-gray-900", children: formatPrice(financialData.total_cash) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "\u0421\u0443\u043C\u043C\u0430 \u0432 \u0440\u0430\u0441\u0441\u0440\u043E\u0447\u043A\u0443:" }), _jsx("span", { className: "text-sm font-medium text-gray-900", children: formatPrice(financialData.total_credit) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "\u041E\u0441\u0442\u0430\u0442\u043E\u043A \u043F\u043E \u0440\u0430\u0441\u0441\u0440\u043E\u0447\u043A\u0435:" }), _jsx("span", { className: "text-sm font-medium text-red-600", children: formatPrice(financialData.credit_balance) })] })] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "\u0421\u0443\u043C\u043C\u0430 \u043A\u043E\u043D\u0442\u0440\u0430\u043A\u0442\u0430:" }), _jsx("span", { className: "text-sm font-medium text-gray-900", children: formatPrice(financialData.contract_amount) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "\u0421\u0443\u043C\u043C\u0430 \u0432\u044B\u043F\u043B\u0430\u0442:" }), _jsx("span", { className: "text-sm font-medium text-gray-900", children: formatPrice(financialData.total_payments) })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u044F\u044F \u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u044F:" }), _jsxs("span", { className: "text-sm font-medium text-gray-900", children: [financialData.last_transaction.date, ", ", formatPrice(financialData.last_transaction.amount)] })] }), _jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-sm text-gray-600", children: "\u0421\u0442\u0430\u0442\u0443\u0441:" }), _jsx("span", { className: "text-sm font-medium text-green-600", children: financialData.status })] })] })] })] }), _jsxs("div", { className: "border-t border-gray-200 pt-6", children: [_jsx("h3", { className: "text-md font-semibold text-gray-900 mb-4", children: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0442\u0440\u0430\u043D\u0437\u0430\u043A\u0446\u0438\u0439" }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u0414\u0430\u0442\u0430" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u0422\u0438\u043F" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u0421\u0443\u043C\u043C\u0430" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u0421\u0442\u0430\u0442\u0443\u0441" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: financialData.transactions.map((transaction) => (_jsxs("tr", { children: [_jsx("td", { className: "px-4 py-3 whitespace-nowrap text-sm text-gray-900", children: transaction.date }), _jsx("td", { className: "px-4 py-3 whitespace-nowrap text-sm text-gray-600", children: transaction.type }), _jsx("td", { className: "px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900", children: formatPrice(transaction.amount) }), _jsx("td", { className: "px-4 py-3 whitespace-nowrap", children: _jsx("span", { className: "px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800", children: transaction.status }) })] }, transaction.id))) })] }) })] })] })] }), _jsxs("div", { className: "bg-white shadow rounded-lg overflow-hidden mt-6", children: [_jsx("div", { className: "bg-gray-50 px-6 py-4 border-b border-gray-200", children: _jsxs("h2", { className: "text-lg font-medium text-gray-900 flex items-center", children: [_jsx(Info, { className: "h-5 w-5 mr-2 text-blue-600" }), "\u041F\u043E\u043B\u0435\u0437\u043D\u044B\u0435 \u0441\u0441\u044B\u043B\u043A\u0438"] }) }), _jsxs("div", { className: "p-6 space-y-3", children: [_jsxs("a", { href: "/privacy-policy", className: "flex items-center text-primary-600 hover:text-primary-800 hover:underline transition-colors", children: [_jsx(FileText, { className: "h-4 w-4 mr-2" }), "\u041F\u043E\u043B\u0438\u0442\u0438\u043A\u0430 \u043A\u043E\u043D\u0444\u0438\u0434\u0435\u043D\u0446\u0438\u0430\u043B\u044C\u043D\u043E\u0441\u0442\u0438"] }), _jsxs("a", { href: "/terms-of-use", className: "flex items-center text-primary-600 hover:text-primary-800 hover:underline transition-colors", children: [_jsx(FileText, { className: "h-4 w-4 mr-2" }), "\u0423\u0441\u043B\u043E\u0432\u0438\u044F \u0438\u0441\u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u043D\u0438\u044F"] }), _jsxs("a", { href: "/support", className: "flex items-center text-primary-600 hover:text-primary-800 hover:underline transition-colors", children: [_jsx(HelpCircle, { className: "h-4 w-4 mr-2" }), "\u041F\u043E\u0434\u0434\u0435\u0440\u0436\u043A\u0430"] })] })] }), _jsxs("div", { className: "bg-white shadow rounded-lg overflow-hidden mt-6", children: [_jsx("div", { className: "bg-gray-50 px-6 py-4 border-b border-gray-200", children: _jsxs("h2", { className: "text-lg font-medium text-red-700 flex items-center", children: [_jsx(Trash2, { className: "h-5 w-5 mr-2 text-red-600" }), "\u0423\u0434\u0430\u043B\u0435\u043D\u0438\u0435 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430"] }) }), _jsxs("div", { className: "p-6", children: [_jsx("p", { className: "text-sm text-gray-700 mb-4", children: "\u0423\u0434\u0430\u043B\u0435\u043D\u0438\u0435 \u0430\u043A\u043A\u0430\u0443\u043D\u0442\u0430 \u044F\u0432\u043B\u044F\u0435\u0442\u0441\u044F \u043D\u0435\u043E\u0431\u0440\u0430\u0442\u0438\u043C\u044B\u043C \u0434\u0435\u0439\u0441\u0442\u0432\u0438\u0435\u043C. \u0412\u0441\u0435 \u0432\u0430\u0448\u0438 \u0434\u0430\u043D\u043D\u044B\u0435 \u0431\u0443\u0434\u0443\u0442 \u0443\u0434\u0430\u043B\u0435\u043D\u044B \u0431\u0435\u0437 \u0432\u043E\u0437\u043C\u043E\u0436\u043D\u043E\u0441\u0442\u0438 \u0432\u043E\u0441\u0441\u0442\u0430\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F." }), _jsxs("button", { onClick: handleDeleteAccount, disabled: saving, className: "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed", children: [_jsx(Trash2, { className: "h-4 w-4 mr-2" }), saving ? 'Удаление...' : 'Удалить аккаунт'] })] })] })] }));
}
