import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { adminApi } from '../../shared/api';
import { Loader2, Edit, Tag, Percent } from 'lucide-react';
export default function AdminProductPromotions() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [promoForm, setPromoForm] = useState({
        discount_percent: '',
        promotional_price: '',
        is_promotional: false,
    });
    useEffect(() => {
        fetchProducts();
    }, []);
    const fetchProducts = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getProducts(0, 500);
            setProducts(data);
        }
        catch (err) {
            console.error('Ошибка загрузки товаров:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleSetPromotion = (product) => {
        setSelectedProduct(product);
        setPromoForm({
            discount_percent: product.discount_percent?.toString() || '',
            promotional_price: product.promotional_price?.toString() || '',
            is_promotional: product.is_promotional || false,
        });
        setShowModal(true);
    };
    const handleSavePromotion = async () => {
        if (!selectedProduct)
            return;
        try {
            // TODO: Реализовать API endpoint для установки акции
            // await adminApi.setProductPromotion(selectedProduct.id, {
            //   discount_percent: promoForm.discount_percent ? parseFloat(promoForm.discount_percent) : undefined,
            //   promotional_price: promoForm.promotional_price ? parseFloat(promoForm.promotional_price) : undefined,
            //   is_promotional: promoForm.is_promotional,
            // })
            alert('Функция установки акций будет реализована');
            setShowModal(false);
            fetchProducts();
        }
        catch (err) {
            alert(err.response?.data?.detail || 'Ошибка установки акции');
        }
    };
    const calculatePromotionalPrice = (price, discount) => {
        return price * (1 - discount / 100);
    };
    if (loading) {
        return (_jsx("div", { className: "flex justify-center items-center py-12", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary-600" }) }));
    }
    return (_jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "flex justify-between items-center mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0442\u043E\u0432\u0430\u0440\u0430\u043C\u0438" }), _jsxs("div", { className: "flex items-center space-x-2 text-sm text-gray-600", children: [_jsx(Tag, { className: "h-4 w-4" }), _jsx("span", { children: "\u0410\u043A\u0446\u0438\u0438 \u0438 \u043F\u0440\u043E\u043C\u043E-\u0430\u043A\u0446\u0438\u0438" })] })] }), _jsx("div", { className: "bg-white shadow rounded-lg overflow-hidden", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "ID" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u0410\u0440\u0442\u0438\u043A\u0443\u043B" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u0426\u0435\u043D\u0430" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u0410\u043A\u0446\u0438\u044F" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: products.map((product) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: product.id }), _jsx("td", { className: "px-6 py-4 text-sm font-medium text-gray-900", children: product.name }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: product.article || '-' }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: product.promotional_price ? (_jsxs("div", { children: [_jsxs("span", { className: "line-through text-gray-400", children: [product.price, " \u20BD"] }), _jsxs("span", { className: "ml-2 text-red-600 font-semibold", children: [product.promotional_price, " \u20BD"] })] })) : (_jsxs("span", { children: [product.price, " \u20BD"] })) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: product.is_promotional ? (_jsxs("span", { className: "inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800", children: [_jsx(Percent, { className: "h-3 w-3 mr-1" }), product.discount_percent ? `-${product.discount_percent}%` : 'Акция'] })) : (_jsx("span", { className: "text-gray-400", children: "-" })) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm", children: _jsx("button", { onClick: () => handleSetPromotion(product), className: "text-primary-600 hover:text-primary-800", title: "\u0423\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0430\u043A\u0446\u0438\u044E", children: _jsx(Edit, { className: "h-4 w-4" }) }) })] }, product.id))) })] }) }), showModal && selectedProduct && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-md w-full p-6", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-4", children: ["\u0423\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0430\u043A\u0446\u0438\u044E \u0434\u043B\u044F: ", selectedProduct.name] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0421\u043A\u0438\u0434\u043A\u0430 (%)" }), _jsx("input", { type: "number", min: "0", max: "100", value: promoForm.discount_percent, onChange: (e) => {
                                                const discount = parseFloat(e.target.value) || 0;
                                                setPromoForm({
                                                    ...promoForm,
                                                    discount_percent: e.target.value,
                                                    promotional_price: discount > 0
                                                        ? calculatePromotionalPrice(selectedProduct.price, discount).toFixed(2)
                                                        : '',
                                                });
                                            }, className: "w-full px-3 py-2 border border-gray-300 rounded-md", placeholder: "0" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0426\u0435\u043D\u0430 \u0441\u043E \u0441\u043A\u0438\u0434\u043A\u043E\u0439 (\u20BD)" }), _jsx("input", { type: "number", min: "0", step: "0.01", value: promoForm.promotional_price, onChange: (e) => setPromoForm({ ...promoForm, promotional_price: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md", placeholder: selectedProduct.price.toString() })] }), _jsxs("div", { className: "flex items-center", children: [_jsx("input", { type: "checkbox", id: "is_promotional", checked: promoForm.is_promotional, onChange: (e) => setPromoForm({ ...promoForm, is_promotional: e.target.checked }), className: "h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded" }), _jsx("label", { htmlFor: "is_promotional", className: "ml-2 block text-sm text-gray-900", children: "\u0410\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0430\u043A\u0446\u0438\u044E" })] }), _jsxs("div", { className: "flex space-x-2 pt-4", children: [_jsx("button", { onClick: handleSavePromotion, className: "flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700", children: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C" }), _jsx("button", { onClick: () => {
                                                setShowModal(false);
                                                setSelectedProduct(null);
                                            }, className: "px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300", children: "\u041E\u0442\u043C\u0435\u043D\u0430" })] })] })] }) }))] }));
}
