import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { clientApi } from '../../shared/api';
import { useCartStore } from '../../store/cartStore';
import { formatPrice, formatProductCount } from '../../shared/utils/formatters';
import { useDebounce } from '../../shared/hooks/useDebounce';
import { Plus, Loader2 } from 'lucide-react';
export default function Search() {
    const [searchParams] = useSearchParams();
    const initialQuery = searchParams.get('q') || '';
    const [query, setQuery] = useState(initialQuery);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState(new Set());
    const searchRef = useRef(null);
    const { addItem, removeItem, items } = useCartStore();
    // Синхронизируем selectedProducts с корзиной
    useEffect(() => {
        const cartProductIds = new Set(items.map(item => item.product_id));
        setSelectedProducts(cartProductIds);
    }, [items]);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    // Загружаем результаты при изменении query из URL
    useEffect(() => {
        if (initialQuery && initialQuery !== query) {
            setQuery(initialQuery);
        }
    }, [initialQuery]);
    // Debounce поискового запроса для оптимизации
    const debouncedQuery = useDebounce(query, 300);
    // Загружаем товары при монтировании компонента и при изменении debouncedQuery
    useEffect(() => {
        const searchProducts = async () => {
            setLoading(true);
            try {
                // Если запрос пустой или меньше 2 символов, показываем все товары
                const searchQuery = debouncedQuery.length >= 2 ? debouncedQuery : "";
                const results = await clientApi.searchProducts(searchQuery, 10000); // Увеличен лимит для отображения всех товаров
                setProducts(results);
                // Показываем dropdown только если есть запрос >= 2 символов
                if (debouncedQuery.length >= 2) {
                    setShowDropdown(true);
                }
                else {
                    setShowDropdown(false);
                }
            }
            catch (error) {
                console.error('Ошибка поиска:', error);
                setProducts([]);
                setShowDropdown(false);
            }
            finally {
                setLoading(false);
            }
        };
        searchProducts();
    }, [debouncedQuery]);
    const handleAddToCart = (product) => {
        // Если товар уже в корзине, удаляем его
        if (selectedProducts.has(product.id)) {
            removeItem(product.id);
            const newSelected = new Set(selectedProducts);
            newSelected.delete(product.id);
            setSelectedProducts(newSelected);
        }
        else {
            // Добавляем товар в корзину
            addItem({
                product_id: product.id,
                name: product.name,
                unit: product.unit || 'шт',
                price: product.price,
            });
            setSelectedProducts(new Set([...selectedProducts, product.id]));
        }
    };
    // Группируем товары по категориям
    const groupedProducts = products.reduce((acc, product) => {
        const category = product.category || 'Разное';
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(product);
        return acc;
    }, {});
    const categories = Object.keys(groupedProducts).sort();
    return (_jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { ref: searchRef, className: "relative mb-6", children: [_jsxs("div", { className: "relative", children: [_jsx("input", { type: "text", value: query, onChange: (e) => setQuery(e.target.value), placeholder: "\u041D\u0430\u0447\u043D\u0438\u0442\u0435 \u0432\u0432\u043E\u0434\u0438\u0442\u044C \u043D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u0442\u043E\u0432\u0430\u0440\u0430...", className: "block w-full px-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm" }), loading && (_jsx("div", { className: "absolute inset-y-0 right-0 pr-3 flex items-center", children: _jsx(Loader2, { className: "h-5 w-5 text-gray-400 animate-spin" }) }))] }), showDropdown && products.length > 0 && (_jsx("div", { className: "absolute z-10 mt-1 w-full bg-white shadow-lg max-h-96 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm", children: products.map((product) => (_jsxs("div", { className: "flex items-center gap-3 px-4 py-2 hover:bg-gray-50 text-sm", style: { minHeight: '32px' }, children: [_jsx("div", { className: "flex-1 min-w-0 truncate", children: _jsx("span", { className: "text-gray-900", children: product.name }) }), _jsx("div", { className: "text-gray-600 whitespace-nowrap", style: { minWidth: '50px' }, children: product.unit || 'шт' }), _jsx("div", { className: "text-gray-500 whitespace-nowrap truncate", style: { minWidth: '100px', maxWidth: '150px' }, children: product.country || '-' }), _jsx("div", { className: "text-gray-900 whitespace-nowrap text-right", style: { minWidth: '90px' }, children: formatPrice(product.price) }), _jsx("div", { className: "flex justify-end", style: { minWidth: '36px' }, children: _jsx("button", { onClick: () => handleAddToCart(product), disabled: selectedProducts.has(product.id), className: `p-1.5 rounded transition-colors ${selectedProducts.has(product.id)
                                            ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                            : 'bg-primary-600 text-white hover:bg-primary-700'}`, title: selectedProducts.has(product.id) ? 'Добавлено' : 'Добавить в корзину', children: selectedProducts.has(product.id) ? (_jsx("span", { className: "text-xs", children: "\u2713" })) : (_jsx(Plus, { className: "h-3.5 w-3.5" })) }) })] }, product.id))) })), showDropdown && !loading && query.length >= 2 && products.length === 0 && (_jsx("div", { className: "absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md py-4 text-center text-gray-500", children: "\u0422\u043E\u0432\u0430\u0440\u044B \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B" }))] }), loading && (_jsx("div", { className: "flex justify-center items-center py-12", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary-600" }) })), !showDropdown && !loading && products.length > 0 && (_jsxs("div", { className: "mt-8", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-6", children: query ? `Результаты поиска (${products.length})` : `Товары (${products.length})` }), _jsx("div", { className: "space-y-8", children: categories.map((category) => (_jsxs("div", { className: "bg-white shadow rounded-lg overflow-hidden", children: [_jsx("div", { className: "bg-gray-50 px-6 py-4 border-b border-gray-200", children: _jsxs("h3", { className: "text-lg font-semibold text-gray-900", children: [category, " (", groupedProducts[category].length, " ", formatProductCount(groupedProducts[category].length), ")"] }) }), _jsx("div", { className: "divide-y divide-gray-200", children: groupedProducts[category].map((product) => (_jsxs("div", { className: "px-4 py-1.5 hover:bg-gray-50 transition-colors flex items-center gap-3 text-sm", style: { minHeight: '32px' }, children: [_jsx("div", { className: "flex-1 min-w-0 truncate", children: _jsx("span", { className: "text-gray-900", children: product.name }) }), _jsx("div", { className: "text-gray-600 whitespace-nowrap", style: { minWidth: '50px' }, children: product.unit || 'шт' }), _jsx("div", { className: "text-gray-500 whitespace-nowrap truncate", style: { minWidth: '100px', maxWidth: '150px' }, children: product.country || '-' }), _jsx("div", { className: "text-gray-900 whitespace-nowrap text-right", style: { minWidth: '90px' }, children: formatPrice(product.price) }), _jsx("div", { className: "flex justify-end", style: { minWidth: '36px' }, children: _jsx("button", { onClick: () => handleAddToCart(product), disabled: selectedProducts.has(product.id), className: `p-1.5 rounded transition-colors ${selectedProducts.has(product.id)
                                                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                                                        : 'bg-primary-600 text-white hover:bg-primary-700'}`, title: selectedProducts.has(product.id) ? 'Добавлено' : 'Добавить в корзину', children: selectedProducts.has(product.id) ? (_jsx("span", { className: "text-xs", children: "\u2713" })) : (_jsx(Plus, { className: "h-3.5 w-3.5" })) }) })] }, product.id))) })] }, category))) })] })), !showDropdown && !loading && products.length === 0 && (_jsx("div", { className: "text-center py-12", children: _jsx("p", { className: "text-gray-500", children: "\u0422\u043E\u0432\u0430\u0440\u044B \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D\u044B" }) }))] }));
}
