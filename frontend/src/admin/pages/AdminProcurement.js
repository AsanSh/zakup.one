import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
export default function AdminProcurement() {
    const [procurements, setProcurements] = useState([]);
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
        fetchProcurements();
    }, []);
    const fetchProcurements = async () => {
        try {
            setLoading(true);
            // TODO: Заменить на реальный API endpoint для снабженцев
            // const data = await adminApi.getProcurements()
            // setProcurements(data)
            setProcurements([]);
        }
        catch (err) {
            console.error('Ошибка загрузки снабженцев:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const handleCreate = async () => {
        if (!formData.name.trim()) {
            alert('Введите ФИО снабженца');
            return;
        }
        try {
            // TODO: Реализовать создание снабженца
            alert('Функция создания снабженца будет реализована');
            setShowModal(false);
            setFormData({ name: '', contact_email: '', contact_phone: '', is_active: true });
            fetchProcurements();
        }
        catch (err) {
            alert(err.response?.data?.detail || 'Ошибка создания снабженца');
        }
    };
    if (loading) {
        return (_jsx("div", { className: "flex justify-center items-center py-12", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary-600" }) }));
    }
    return (_jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "flex justify-between items-center mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0441\u043D\u0430\u0431\u0436\u0435\u043D\u0446\u0430\u043C\u0438" }), _jsxs("button", { onClick: () => {
                            setEditingId(null);
                            setFormData({ name: '', contact_email: '', contact_phone: '', is_active: true });
                            setShowModal(true);
                        }, className: "flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700", children: [_jsx(Plus, { className: "h-4 w-4" }), _jsx("span", { children: "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0441\u043D\u0430\u0431\u0436\u0435\u043D\u0446\u0430" })] })] }), _jsx("div", { className: "bg-white shadow rounded-lg overflow-hidden", children: _jsx("div", { className: "p-8 text-center text-gray-500", children: _jsx("p", { children: "\u0424\u0443\u043D\u043A\u0446\u0438\u044F \u0443\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u044F \u0441\u043D\u0430\u0431\u0436\u0435\u043D\u0446\u0430\u043C\u0438 \u0431\u0443\u0434\u0435\u0442 \u0440\u0435\u0430\u043B\u0438\u0437\u043E\u0432\u0430\u043D\u0430 \u0432 \u0431\u043B\u0438\u0436\u0430\u0439\u0448\u0435\u0435 \u0432\u0440\u0435\u043C\u044F" }) }) }), showModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-md w-full p-6", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-4", children: editingId ? 'Редактирование снабженца' : 'Добавление снабженца' }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0424\u0418\u041E *" }), _jsx("input", { type: "text", value: formData.name, onChange: (e) => setFormData({ ...formData, name: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md", required: true })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Email" }), _jsx("input", { type: "email", value: formData.contact_email, onChange: (e) => setFormData({ ...formData, contact_email: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D" }), _jsx("input", { type: "tel", value: formData.contact_phone, onChange: (e) => setFormData({ ...formData, contact_phone: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md" })] }), _jsxs("div", { className: "flex space-x-2 pt-4", children: [_jsx("button", { onClick: handleCreate, className: "flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700", children: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C" }), _jsx("button", { onClick: () => {
                                                setShowModal(false);
                                                setEditingId(null);
                                                setFormData({ name: '', contact_email: '', contact_phone: '', is_active: true });
                                            }, className: "px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300", children: "\u041E\u0442\u043C\u0435\u043D\u0430" })] })] })] }) }))] }));
}
