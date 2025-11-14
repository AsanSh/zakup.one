import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { adminApi } from '../../shared/api';
import { Loader2, Plus, Edit } from 'lucide-react';
export default function AdminSuppliersManagement() {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        contact_email: '',
        contact_phone: '',
        is_active: true,
    });
    useEffect(() => {
        fetchSuppliers();
    }, []);
    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getSuppliers();
            setSuppliers(data);
        }
        catch (err) {
            console.error('Ошибка загрузки поставщиков:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreate = async () => {
        if (!formData.name.trim()) {
            alert('Введите название поставщика');
            return;
        }
        try {
            await adminApi.createSupplier({
                name: formData.name.trim(),
                contact_email: formData.contact_email?.trim() || undefined,
                contact_phone: formData.contact_phone?.trim() || undefined,
            });
            setShowModal(false);
            setFormData({ name: '', contact_email: '', contact_phone: '', is_active: true });
            fetchSuppliers();
            alert('Поставщик успешно добавлен');
        }
        catch (err) {
            alert(err.response?.data?.detail || 'Ошибка создания поставщика');
        }
    };
    const handleUpdate = async () => {
        if (!editingId)
            return;
        if (!formData.name.trim()) {
            alert('Введите название поставщика');
            return;
        }
        try {
            await adminApi.updateSupplier(editingId, {
                name: formData.name.trim(),
                contact_email: formData.contact_email?.trim() || undefined,
                contact_phone: formData.contact_phone?.trim() || undefined,
            });
            setShowModal(false);
            setEditingId(null);
            setFormData({ name: '', contact_email: '', contact_phone: '', is_active: true });
            fetchSuppliers();
            alert('Поставщик успешно обновлен');
        }
        catch (err) {
            alert(err.response?.data?.detail || 'Ошибка обновления поставщика');
        }
    };
    const handleToggleActive = async (supplierId) => {
        try {
            await adminApi.toggleSupplierActive(supplierId);
            fetchSuppliers();
        }
        catch (err) {
            alert(err.response?.data?.detail || 'Ошибка изменения статуса');
        }
    };
    const handleEdit = (supplier) => {
        setEditingId(supplier.id);
        setFormData({
            name: supplier.name,
            contact_email: supplier.contact_email || '',
            contact_phone: supplier.contact_phone || '',
            is_active: supplier.is_active,
        });
        setShowModal(true);
    };
    if (loading) {
        return (_jsx("div", { className: "flex justify-center items-center py-12", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary-600" }) }));
    }
    return (_jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "flex justify-between items-center mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u0430\u043C\u0438" }), _jsxs("button", { onClick: () => {
                            setEditingId(null);
                            setFormData({ name: '', contact_email: '', contact_phone: '', is_active: true });
                            setShowModal(true);
                        }, className: "flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700", children: [_jsx(Plus, { className: "h-4 w-4" }), _jsx("span", { children: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u0430" })] })] }), _jsx("div", { className: "bg-white shadow rounded-lg overflow-hidden", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "ID" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "Email" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u0421\u0442\u0430\u0442\u0443\u0441" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: suppliers.map((supplier) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: supplier.id }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: supplier.name }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: supplier.contact_email || '-' }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: supplier.contact_phone || '-' }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${supplier.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'}`, children: supplier.is_active ? 'Активен' : 'Неактивен' }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm", children: _jsxs("div", { className: "flex space-x-2", children: [_jsx("button", { onClick: () => handleEdit(supplier), className: "text-primary-600 hover:text-primary-800", title: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C", children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx("button", { onClick: () => handleToggleActive(supplier.id), className: `${supplier.is_active
                                                        ? 'text-red-600 hover:text-red-800'
                                                        : 'text-green-600 hover:text-green-800'}`, title: supplier.is_active ? 'Деактивировать' : 'Активировать', children: supplier.is_active ? 'Деакт.' : 'Акт.' })] }) })] }, supplier.id))) })] }) }), showModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-md w-full p-6", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-4", children: editingId ? 'Редактирование поставщика' : 'Добавление поставщика' }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 *" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }), _jsx("input", { type: "email", value: formData.contact_email, onChange: (e) => setFormData({ ...formData, contact_email: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D" }), _jsx("input", { type: "tel", value: formData.contact_phone, onChange: (e) => setFormData({ ...formData, contact_phone: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md" })] }), _jsxs("div", { className: "flex space-x-2 pt-4", children: [_jsx("button", { onClick: editingId ? handleUpdate : handleCreate, className: "flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700", children: editingId ? 'Сохранить' : 'Создать' }), _jsx("button", { onClick: () => {
                                                setShowModal(false);
                                                setEditingId(null);
                                                setFormData({ name: '', contact_email: '', contact_phone: '', is_active: true });
                                            }, className: "px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300", children: "\u041E\u0442\u043C\u0435\u043D\u0430" })] })] })] }) }))] }));
}
