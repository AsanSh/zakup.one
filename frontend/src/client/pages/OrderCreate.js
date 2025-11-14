import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { clientApi } from '../../shared/api';
import { formatPrice } from '../../shared/utils/formatters';
import { CheckCircle, AlertCircle } from 'lucide-react';
export default function OrderCreate() {
    const { items, getTotal, clearCart } = useCartStore();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        delivery_address: '',
        delivery_comment: '',
        delivery_date: '',
        contact_person: '',
        contact_phone: '',
    });
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await clientApi.createOrder({
                items: items.map((item) => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                })),
                delivery_address: formData.delivery_address,
                delivery_comment: formData.delivery_comment,
                delivery_date: formData.delivery_date || undefined,
                contact_person: formData.contact_person,
                contact_phone: formData.contact_phone,
            });
            setSuccess(true);
            clearCart();
            setTimeout(() => {
                navigate('/orders');
            }, 2000);
        }
        catch (err) {
            setError(err.response?.data?.detail || 'Ошибка создания заявки');
        }
        finally {
            setLoading(false);
        }
    };
    if (success) {
        return (_jsxs("div", { className: "max-w-2xl mx-auto text-center py-12", children: [_jsx(CheckCircle, { className: "mx-auto h-12 w-12 text-green-500" }), _jsx("h3", { className: "mt-2 text-lg font-medium text-gray-900", children: "\u0417\u0430\u044F\u0432\u043A\u0430 \u0443\u0441\u043F\u0435\u0448\u043D\u043E \u0441\u043E\u0437\u0434\u0430\u043D\u0430!" }), _jsx("p", { className: "mt-1 text-sm text-gray-500", children: "\u041F\u0435\u0440\u0435\u043D\u0430\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u043D\u0430 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0443 \u0437\u0430\u044F\u0432\u043E\u043A..." })] }));
    }
    return (_jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-8", children: "\u041E\u0444\u043E\u0440\u043C\u043B\u0435\u043D\u0438\u0435 \u0437\u0430\u044F\u0432\u043A\u0438" }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-3 gap-8", children: [_jsx("div", { className: "lg:col-span-2", children: _jsxs("form", { onSubmit: handleSubmit, className: "space-y-6", children: [error && (_jsx("div", { className: "rounded-md bg-red-50 p-4", children: _jsxs("div", { className: "flex", children: [_jsx(AlertCircle, { className: "h-5 w-5 text-red-400" }), _jsx("div", { className: "ml-3", children: _jsx("p", { className: "text-sm font-medium text-red-800", children: error }) })] }) })), _jsxs("div", { className: "bg-white shadow rounded-lg p-6 space-y-6", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "delivery_address", className: "block text-sm font-medium text-gray-700", children: "\u0410\u0434\u0440\u0435\u0441 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438 *" }), _jsx("input", { type: "text", name: "delivery_address", id: "delivery_address", required: true, value: formData.delivery_address, onChange: handleChange, className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "delivery_date", className: "block text-sm font-medium text-gray-700", children: "\u0416\u0435\u043B\u0430\u0435\u043C\u0430\u044F \u0434\u0430\u0442\u0430 \u0434\u043E\u0441\u0442\u0430\u0432\u043A\u0438" }), _jsx("input", { type: "date", name: "delivery_date", id: "delivery_date", value: formData.delivery_date, onChange: handleChange, className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "contact_person", className: "block text-sm font-medium text-gray-700", children: "\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u043D\u043E\u0435 \u043B\u0438\u0446\u043E \u043D\u0430 \u043E\u0431\u044A\u0435\u043A\u0442\u0435" }), _jsx("input", { type: "text", name: "contact_person", id: "contact_person", value: formData.contact_person, onChange: handleChange, className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "contact_phone", className: "block text-sm font-medium text-gray-700", children: "\u041A\u043E\u043D\u0442\u0430\u043A\u0442\u043D\u044B\u0439 \u0442\u0435\u043B\u0435\u0444\u043E\u043D" }), _jsx("input", { type: "tel", name: "contact_phone", id: "contact_phone", value: formData.contact_phone, onChange: handleChange, className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" })] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "delivery_comment", className: "block text-sm font-medium text-gray-700", children: "\u041A\u043E\u043C\u043C\u0435\u043D\u0442\u0430\u0440\u0438\u0439" }), _jsx("textarea", { name: "delivery_comment", id: "delivery_comment", rows: 4, value: formData.delivery_comment, onChange: handleChange, className: "mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm" })] })] }), _jsx("div", { className: "flex justify-end", children: _jsx("button", { type: "submit", disabled: loading, className: "px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed", children: loading ? 'Создание заявки...' : 'Создать заявку' }) })] }) }), _jsx("div", { className: "lg:col-span-1", children: _jsxs("div", { className: "bg-white shadow rounded-lg p-6 sticky top-4", children: [_jsx("h2", { className: "text-lg font-medium text-gray-900 mb-4", children: "\u0421\u043E\u0441\u0442\u0430\u0432 \u0437\u0430\u044F\u0432\u043A\u0438" }), _jsx("div", { className: "space-y-3 mb-4", children: items.map((item) => (_jsxs("div", { className: "text-sm", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "text-gray-900", children: item.name }), _jsxs("span", { className: "text-gray-600", children: [item.quantity, " ", item.unit] })] }), _jsxs("div", { className: "text-gray-500", children: [formatPrice(item.price), " \u00D7 ", item.quantity] })] }, item.product_id))) }), _jsx("div", { className: "border-t border-gray-200 pt-4", children: _jsxs("div", { className: "flex justify-between text-lg font-medium", children: [_jsx("span", { children: "\u0418\u0442\u043E\u0433\u043E:" }), _jsx("span", { children: formatPrice(getTotal()) })] }) })] }) })] })] }));
}
