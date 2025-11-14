import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { adminApi } from '../../shared/api';
import { formatPrice, formatProductCount } from '../../shared/utils/formatters';
import { Loader2, Edit, Save, X, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDebounce } from '../../shared/hooks/useDebounce';
export default function AdminProducts() {
    const [products, setProducts] = useState([]);
    const [allProducts, setAllProducts] = useState([]); // Все товары без фильтрации
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [editingMarkupId, setEditingMarkupId] = useState(null); // ID товара, у которого редактируется надбавка
    const [editForm, setEditForm] = useState({});
    const [markupValue, setMarkupValue] = useState(''); // Значение надбавки при редактировании
    const { token, init } = useAuthStore();
    // Debounce поискового запроса
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    // Убеждаемся, что токен инициализирован
    useEffect(() => {
        if (!token) {
            console.log('Токен не найден, инициализируем...');
            init();
        }
    }, [token, init]);
    useEffect(() => {
        if (token) {
            fetchProducts();
        }
        else {
            console.warn('Токен отсутствует, ожидаем инициализации...');
            // Попробуем еще раз через небольшую задержку
            const timer = setTimeout(() => {
                if (useAuthStore.getState().token) {
                    fetchProducts();
                }
                else {
                    setLoading(false);
                    alert('Требуется вход в систему');
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [token]);
    const fetchProducts = async () => {
        try {
            setLoading(true);
            console.log('Начинаем загрузку товаров...');
            // Загружаем все товары (лимит 10000)
            const data = await adminApi.getProducts(0, 10000);
            console.log('Загружено товаров:', data.length);
            if (data.length > 0) {
                console.log('Первые товары:', data.slice(0, 3).map(p => p.name));
            }
            setAllProducts(data);
            setProducts(data);
        }
        catch (err) {
            console.error('Ошибка загрузки товаров:', err);
            console.error('Статус ответа:', err.response?.status);
            console.error('Детали ошибки:', err.response?.data);
            // Ошибка 401 обрабатывается в axios interceptor, не показываем alert
            if (err.response?.status === 401) {
                // axios interceptor уже перенаправит на логин
                return;
            }
            else {
                const errorMessage = err.response?.data?.detail || err.message || 'Неизвестная ошибка';
                // Убираем технические детали из сообщения для пользователя
                let userMessage = errorMessage;
                if (errorMessage.includes('401') || errorMessage.includes('учетные данные')) {
                    userMessage = 'Сессия истекла. Пожалуйста, войдите заново.';
                    localStorage.removeItem('auth-storage');
                    window.location.href = '/login';
                    return;
                }
                console.error('Полная ошибка:', errorMessage);
                alert('Ошибка загрузки товаров: ' + userMessage);
            }
        }
        finally {
            setLoading(false);
        }
    };
    const handleEdit = (product) => {
        setEditingId(product.id);
        setEditForm({
            price: product.price,
            is_active: product.is_active,
            category: product.category,
            country: product.country,
        });
    };
    const handleEditMarkup = (product) => {
        setEditingMarkupId(product.id);
        setMarkupValue((product.markup || 0).toString());
    };
    const handleSaveMarkup = async (productId) => {
        try {
            const markup = parseFloat(markupValue) || 0;
            await adminApi.updateProduct(productId, { markup });
            setEditingMarkupId(null);
            setMarkupValue('');
            fetchProducts();
        }
        catch (err) {
            alert(err.response?.data?.detail || 'Ошибка обновления надбавки');
        }
    };
    const handleSave = async (productId) => {
        try {
            await adminApi.updateProduct(productId, editForm);
            setEditingId(null);
            setEditForm({});
            fetchProducts();
        }
        catch (err) {
            alert(err.response?.data?.detail || 'Ошибка обновления товара');
        }
    };
    // Фильтрация товаров по поисковому запросу
    useEffect(() => {
        if (!debouncedSearchQuery.trim()) {
            setProducts(allProducts);
            return;
        }
        const query = debouncedSearchQuery.toLowerCase();
        const filtered = allProducts.filter(product => product.name.toLowerCase().includes(query) ||
            (product.category && product.category.toLowerCase().includes(query)) ||
            (product.supplier_name && product.supplier_name.toLowerCase().includes(query)));
        setProducts(filtered);
    }, [debouncedSearchQuery, allProducts]);
    if (loading) {
        return (_jsx("div", { className: "flex justify-center items-center py-12", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary-600" }) }));
    }
    // Группировка товаров по категориям
    const groupedProducts = products.reduce((acc, product) => {
        const category = product.category || 'Разное';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {});
    const categories = Object.keys(groupedProducts).sort();
    return (_jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsx("div", { className: "mb-8", children: _jsxs("div", { className: "flex items-center justify-between gap-4", children: [_jsxs("div", { className: "flex-1", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "\u0422\u043E\u0432\u0430\u0440\u044B" }), _jsxs("p", { className: "text-sm text-gray-600 mt-2", children: ["\u0412\u0441\u0435\u0433\u043E \u0442\u043E\u0432\u0430\u0440\u043E\u0432: ", _jsx("span", { className: "font-semibold text-gray-900", children: searchQuery ? `${products.length} из ${allProducts.length}` : products.length })] })] }), _jsx("div", { className: "flex-1 max-w-md", children: _jsxs("div", { className: "relative", children: [_jsx("div", { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none", children: _jsx(Search, { className: "h-5 w-5 text-gray-400" }) }), _jsx("input", { type: "text", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), placeholder: "\u041F\u043E\u0438\u0441\u043A \u0442\u043E\u0432\u0430\u0440\u043E\u0432...", className: "block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm" }), loading && (_jsx("div", { className: "absolute inset-y-0 right-0 pr-3 flex items-center", children: _jsx(Loader2, { className: "h-5 w-5 text-gray-400 animate-spin" }) }))] }) })] }) }), _jsx("div", { className: "space-y-8", children: categories.map((category) => (_jsxs("div", { className: "bg-white shadow rounded-lg overflow-hidden", children: [_jsx("div", { className: "bg-gray-50 px-6 py-4 border-b border-gray-200", children: _jsxs("h3", { className: "text-lg font-semibold text-gray-900", children: [category, " (", groupedProducts[category].length, " ", formatProductCount(groupedProducts[category].length), ")"] }) }), _jsxs("div", { className: "bg-gray-100 px-4 py-2 border-b border-gray-200 flex items-center gap-3 text-xs font-semibold text-gray-700", children: [_jsx("div", { className: "flex-1 min-w-0", children: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435" }), _jsx("div", { className: "whitespace-nowrap", style: { minWidth: '60px' }, children: "\u041A\u043E\u043B-\u0432\u043E" }), _jsx("div", { className: "whitespace-nowrap truncate", style: { minWidth: '100px', maxWidth: '150px' }, children: "\u041F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044C" }), _jsx("div", { className: "whitespace-nowrap truncate", style: { minWidth: '120px', maxWidth: '180px' }, children: "\u041F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A" }), _jsx("div", { className: "whitespace-nowrap text-right", style: { minWidth: '100px' }, children: "\u0417\u0430\u043A\u0443\u043F.\u0446\u0435\u043D\u0430" }), _jsx("div", { className: "whitespace-nowrap text-right", style: { minWidth: '100px' }, children: "\u041D\u0430\u0434\u0431\u0430\u0432\u043A\u0430" }), _jsx("div", { className: "whitespace-nowrap text-right", style: { minWidth: '100px' }, children: "\u041F\u0440\u043E\u0434.\u0446\u0435\u043D\u0430" }), _jsx("div", { className: "flex justify-end", style: { minWidth: '36px' } })] }), _jsx("div", { className: "divide-y divide-gray-200", children: groupedProducts[category].map((product) => (_jsxs("div", { className: "px-4 py-1.5 hover:bg-gray-50 transition-colors flex items-center gap-3 text-sm", style: { minHeight: '32px' }, children: [_jsx("div", { className: "flex-1 min-w-0 truncate", children: _jsx("span", { className: "text-gray-900", children: product.name }) }), _jsx("div", { className: "text-gray-600 whitespace-nowrap", style: { minWidth: '60px' }, children: product.unit || 'шт' }), _jsx("div", { className: "text-gray-500 whitespace-nowrap truncate", style: { minWidth: '100px', maxWidth: '150px' }, children: product.country || '-' }), _jsx("div", { className: "text-gray-600 whitespace-nowrap truncate", style: { minWidth: '120px', maxWidth: '180px' }, children: product.supplier_name || '-' }), _jsx("div", { className: "text-gray-700 whitespace-nowrap text-right", style: { minWidth: '100px' }, children: formatPrice(product.purchase_price || product.price) }), _jsx("div", { className: "text-gray-900 whitespace-nowrap text-right", style: { minWidth: '100px' }, children: editingMarkupId === product.id ? (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("input", { type: "number", value: markupValue, onChange: (e) => setMarkupValue(e.target.value), className: "w-16 px-1.5 py-0.5 border border-gray-300 rounded text-xs", step: "0.01", autoFocus: true, onKeyDown: (e) => {
                                                        if (e.key === 'Enter') {
                                                            handleSaveMarkup(product.id);
                                                        }
                                                        else if (e.key === 'Escape') {
                                                            setEditingMarkupId(null);
                                                            setMarkupValue('');
                                                        }
                                                    } }), _jsx("button", { onClick: () => handleSaveMarkup(product.id), className: "p-0.5 bg-green-100 text-green-700 rounded hover:bg-green-200", title: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C", children: _jsx(Save, { className: "h-3 w-3" }) }), _jsx("button", { onClick: () => {
                                                        setEditingMarkupId(null);
                                                        setMarkupValue('');
                                                    }, className: "p-0.5 bg-red-100 text-red-700 rounded hover:bg-red-200", title: "\u041E\u0442\u043C\u0435\u043D\u0430", children: _jsx(X, { className: "h-3 w-3" }) })] })) : (_jsx("span", { className: "cursor-pointer hover:text-primary-600 hover:underline", onClick: () => handleEditMarkup(product), title: "\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u0434\u043B\u044F \u0440\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u044F \u043D\u0430\u0434\u0431\u0430\u0432\u043A\u0438", children: formatPrice(product.markup || 0) })) }), _jsx("div", { className: "text-gray-900 whitespace-nowrap text-right font-semibold", style: { minWidth: '100px' }, children: formatPrice(product.price) }), _jsx("div", { className: "flex justify-end", style: { minWidth: '36px' }, children: editingId === product.id ? (_jsxs("div", { className: "flex space-x-1", children: [_jsx("button", { onClick: () => handleSave(product.id), className: "p-1.5 bg-green-100 text-green-700 rounded hover:bg-green-200", title: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C", children: _jsx(Save, { className: "h-3.5 w-3.5" }) }), _jsx("button", { onClick: () => {
                                                        setEditingId(null);
                                                        setEditForm({});
                                                    }, className: "p-1.5 bg-red-100 text-red-700 rounded hover:bg-red-200", title: "\u041E\u0442\u043C\u0435\u043D\u0430", children: _jsx(X, { className: "h-3.5 w-3.5" }) })] })) : (_jsx("button", { onClick: () => handleEdit(product), className: "p-1.5 bg-primary-600 text-white rounded hover:bg-primary-700", title: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C", children: _jsx(Edit, { className: "h-3.5 w-3.5" }) })) })] }, product.id))) })] }, category))) }), editingId && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-md w-full p-6", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-4", children: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u0438\u0435 \u0442\u043E\u0432\u0430\u0440\u0430" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0426\u0435\u043D\u0430 (\u0441\u043E\u043C)" }), _jsx("input", { type: "number", value: editForm.price, onChange: (e) => setEditForm({ ...editForm, price: parseFloat(e.target.value) }), className: "w-full px-3 py-2 border border-gray-300 rounded-md", step: "0.01" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0438\u044F" }), _jsx("input", { type: "text", value: editForm.category, onChange: (e) => setEditForm({ ...editForm, category: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0421\u0442\u0440\u0430\u043D\u0430 \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0441\u0442\u0432\u0430" }), _jsx("input", { type: "text", value: editForm.country, onChange: (e) => setEditForm({ ...editForm, country: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md", placeholder: "\u041A\u0420, \u0420\u041A, \u0420\u0424, \u041A\u0438\u0442\u0430\u0439..." })] }), _jsx("div", { children: _jsxs("label", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", checked: editForm.is_active, onChange: (e) => setEditForm({ ...editForm, is_active: e.target.checked }), className: "rounded mr-2" }), _jsx("span", { className: "text-sm text-gray-700", children: "\u0422\u043E\u0432\u0430\u0440 \u0430\u043A\u0442\u0438\u0432\u0435\u043D" })] }) }), _jsxs("div", { className: "flex space-x-2 pt-4", children: [_jsx("button", { onClick: () => {
                                                if (editingId)
                                                    handleSave(editingId);
                                            }, className: "flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700", children: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C" }), _jsx("button", { onClick: () => {
                                                setEditingId(null);
                                                setEditForm({});
                                            }, className: "px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300", children: "\u041E\u0442\u043C\u0435\u043D\u0430" })] })] })] }) }))] }));
}
