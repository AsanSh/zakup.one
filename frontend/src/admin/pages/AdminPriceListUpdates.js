import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { adminApi } from '../../shared/api';
import { Loader2, Clock, CheckCircle, XCircle, Edit, Play, Pause } from 'lucide-react';
export default function AdminPriceListUpdates() {
    const [updates, setUpdates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        frequency: 'manual',
        is_active: true,
    });
    useEffect(() => {
        fetchUpdates();
    }, []);
    const fetchUpdates = async () => {
        try {
            setLoading(true);
            const data = await adminApi.getPriceListUpdates();
            // Приводим данные к правильному типу
            setUpdates(data);
        }
        catch (err) {
            console.error('Ошибка загрузки расписания:', err);
        }
        finally {
            setLoading(false);
        }
    };
    const frequencyLabels = {
        daily: 'Ежедневно',
        weekly: 'Еженедельно',
        monthly: 'Ежемесячно',
        manual: 'Вручную',
    };
    const handleEdit = (update) => {
        setEditingId(update.id);
        setFormData({
            frequency: update.frequency,
            is_active: update.is_active,
        });
        setShowModal(true);
    };
    const handleSave = async () => {
        if (!editingId)
            return;
        try {
            await adminApi.updatePriceListUpdate(editingId, formData);
            setShowModal(false);
            setEditingId(null);
            fetchUpdates();
            alert('Настройки обновлены');
        }
        catch (err) {
            alert(err.response?.data?.detail || 'Ошибка обновления настроек');
        }
    };
    const handleRunNow = async (updateId) => {
        if (!confirm('Запустить обновление прайс-листа сейчас?')) {
            return;
        }
        try {
            const result = await adminApi.runPriceListUpdate(updateId);
            if (result.success) {
                alert(`Обновление завершено!\nДобавлено: ${result.imported || 0}\nОбновлено: ${result.updated || 0}`);
                fetchUpdates();
            }
            else {
                alert(`Ошибка: ${result.error || 'Неизвестная ошибка'}`);
            }
        }
        catch (err) {
            alert(err.response?.data?.detail || 'Ошибка запуска обновления');
        }
    };
    const handleToggleActive = async (update) => {
        try {
            await adminApi.updatePriceListUpdate(update.id, {
                is_active: !update.is_active,
            });
            fetchUpdates();
        }
        catch (err) {
            alert(err.response?.data?.detail || 'Ошибка изменения статуса');
        }
    };
    const formatDate = (dateString) => {
        if (!dateString)
            return '-';
        return new Date(dateString).toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };
    if (loading) {
        return (_jsx("div", { className: "flex justify-center items-center py-12", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary-600" }) }));
    }
    return (_jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsx("div", { className: "flex justify-between items-center mb-8", children: _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u0440\u0430\u0439\u0441-\u043B\u0438\u0441\u0442\u043E\u0432" }), _jsx("p", { className: "text-sm text-gray-500 mt-2", children: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u0442\u0435 \u0440\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u043E\u0433\u043E \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F \u043F\u0440\u0430\u0439\u0441-\u043B\u0438\u0441\u0442\u043E\u0432. \u0414\u043E\u0431\u0430\u0432\u044C\u0442\u0435 URL \u0434\u043B\u044F \u0441\u043A\u0430\u0447\u0438\u0432\u0430\u043D\u0438\u044F \u043D\u0430 \u0441\u0442\u0440\u0430\u043D\u0438\u0446\u0435 \"\u041F\u0440\u0430\u0439\u0441-\u043B\u0438\u0441\u0442\u044B\" \u2192 \"\u0421\u043A\u0430\u0447\u0430\u0442\u044C \u043F\u043E URL\"" })] }) }), _jsx("div", { className: "bg-white shadow rounded-lg overflow-hidden", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u041F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "URL" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u0427\u0430\u0441\u0442\u043E\u0442\u0430" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0435\u0435 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0435" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u0420\u0435\u0437\u0443\u043B\u044C\u0442\u0430\u0442" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u0421\u0442\u0430\u0442\u0443\u0441" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase", children: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: updates.map((update) => (_jsxs("tr", { className: "hover:bg-gray-50", children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900", children: update.supplier_name || `ID: ${update.supplier_id}` }), _jsx("td", { className: "px-6 py-4 text-sm text-gray-500 max-w-xs truncate", title: update.download_url, children: update.download_url }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-900", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Clock, { className: "h-4 w-4 text-gray-400" }), _jsx("span", { children: frequencyLabels[update.frequency] || update.frequency })] }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: formatDate(update.last_update) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: formatDate(update.next_update) }), _jsxs("td", { className: "px-6 py-4 whitespace-nowrap text-sm text-gray-500", children: [update.last_imported_count > 0 || update.last_updated_count > 0 ? (_jsxs("div", { className: "text-xs", children: [_jsxs("div", { children: ["+", update.last_imported_count] }), _jsxs("div", { children: ["~", update.last_updated_count] })] })) : ('-'), update.last_error && (_jsx("div", { className: "text-xs text-red-600 mt-1", title: update.last_error, children: "\u041E\u0448\u0438\u0431\u043A\u0430" }))] }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${update.is_active
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-red-100 text-red-800'}`, children: update.is_active ? (_jsxs(_Fragment, { children: [_jsx(CheckCircle, { className: "h-3 w-3 mr-1" }), "\u0410\u043A\u0442\u0438\u0432\u043D\u043E"] })) : (_jsxs(_Fragment, { children: [_jsx(XCircle, { className: "h-3 w-3 mr-1" }), "\u041D\u0435\u0430\u043A\u0442\u0438\u0432\u043D\u043E"] })) }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm", children: _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("button", { onClick: () => handleEdit(update), className: "text-primary-600 hover:text-primary-800", title: "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C", children: _jsx(Edit, { className: "h-4 w-4" }) }), _jsx("button", { onClick: () => handleRunNow(update.id), className: "text-green-600 hover:text-green-800", title: "\u0417\u0430\u043F\u0443\u0441\u0442\u0438\u0442\u044C \u0441\u0435\u0439\u0447\u0430\u0441", children: _jsx(Play, { className: "h-4 w-4" }) }), _jsx("button", { onClick: () => handleToggleActive(update), className: update.is_active ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800', title: update.is_active ? 'Деактивировать' : 'Активировать', children: update.is_active ? _jsx(Pause, { className: "h-4 w-4" }) : _jsx(Play, { className: "h-4 w-4" }) })] }) })] }, update.id))) })] }) }), showModal && editingId && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-md w-full p-6", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-4", children: "\u0418\u0437\u043C\u0435\u043D\u0438\u0442\u044C \u043D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0427\u0430\u0441\u0442\u043E\u0442\u0430 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F" }), _jsxs("select", { value: formData.frequency, onChange: (e) => setFormData({ ...formData, frequency: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md", children: [_jsx("option", { value: "manual", children: "\u0412\u0440\u0443\u0447\u043D\u0443\u044E" }), _jsx("option", { value: "daily", children: "\u0415\u0436\u0435\u0434\u043D\u0435\u0432\u043D\u043E" }), _jsx("option", { value: "weekly", children: "\u0415\u0436\u0435\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u043E" }), _jsx("option", { value: "monthly", children: "\u0415\u0436\u0435\u043C\u0435\u0441\u044F\u0447\u043D\u043E" })] })] }), _jsx("div", { children: _jsxs("label", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: formData.is_active, onChange: (e) => setFormData({ ...formData, is_active: e.target.checked }), className: "rounded border-gray-300 text-primary-600 focus:ring-primary-500" }), _jsx("span", { className: "text-sm font-medium text-gray-700", children: "\u0410\u043A\u0442\u0438\u0432\u043D\u043E" })] }) }), _jsxs("div", { className: "flex space-x-2 pt-4", children: [_jsx("button", { onClick: handleSave, className: "flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700", children: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C" }), _jsx("button", { onClick: () => {
                                                setShowModal(false);
                                                setEditingId(null);
                                            }, className: "px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300", children: "\u041E\u0442\u043C\u0435\u043D\u0430" })] })] })] }) }))] }));
}
