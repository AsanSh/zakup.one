import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../shared/api';
import { Loader2, Upload, FileSpreadsheet, Settings, DollarSign, Users, Calendar, Download, FileDown, Edit, X, CheckCircle, Package, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
export default function AdminPriceLists() {
    const [suppliers, setSuppliers] = useState([]);
    const [priceListsInfo, setPriceListsInfo] = useState([]);
    const [lastUpdate, setLastUpdate] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [showSupplierModal, setShowSupplierModal] = useState(false);
    const [showImportResultModal, setShowImportResultModal] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const [selectedSupplier, setSelectedSupplier] = useState(null);
    const [supplierStats, setSupplierStats] = useState(null);
    const [loadingStats, setLoadingStats] = useState(false);
    const [uploadForm, setUploadForm] = useState({
        supplier_id: '',
        header_row: '7',
        start_row: '8',
        file: null,
    });
    const [downloadForm, setDownloadForm] = useState({
        supplier_id: '',
        download_url: '',
        frequency: 'manual',
        header_row: '7',
        start_row: '8',
    });
    useEffect(() => {
        // Автоматически исправляем constraint при загрузке страницы
        const fixConstraint = async () => {
            try {
                await adminApi.fixFrequencyConstraint();
            }
            catch (err) {
                // Игнорируем ошибки, если constraint уже исправлен
                console.log('Constraint уже исправлен или не требуется');
            }
        };
        fixConstraint();
        fetchSuppliers();
        fetchPriceListsInfo();
        fetchLastUpdate();
    }, []);
    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await adminApi.getSuppliers();
            setSuppliers(data);
        }
        catch (err) {
            console.error('Ошибка загрузки поставщиков:', err);
            const errorMessage = err.response?.data?.detail || err.message || 'Ошибка загрузки поставщиков';
            setError(errorMessage);
            // Показываем пустой список при ошибке, чтобы не блокировать интерфейс
            setSuppliers([]);
        }
        finally {
            setLoading(false);
        }
    };
    const fetchPriceListsInfo = async () => {
        try {
            const data = await adminApi.getSuppliersPriceLists();
            setPriceListsInfo(data);
        }
        catch (err) {
            console.error('Ошибка загрузки информации о прайс-листах:', err);
            // Ошибка 401 обрабатывается в axios interceptor
            if (err.response?.status === 401) {
                return;
            }
        }
    };
    const fetchLastUpdate = async () => {
        try {
            const data = await adminApi.getLastPriceListUpdate();
            if (data.last_update) {
                setLastUpdate(data.last_update);
            }
        }
        catch (err) {
            console.error('Ошибка загрузки последнего обновления:', err);
            // Ошибка 401 обрабатывается в axios interceptor
            if (err.response?.status === 401) {
                return;
            }
        }
    };
    const fetchSupplierStats = async (supplierId) => {
        try {
            setLoadingStats(true);
            const stats = await adminApi.getSupplierStats(supplierId);
            setSupplierStats(stats);
        }
        catch (err) {
            console.error('Ошибка загрузки статистики поставщика:', err);
            if (err.response?.status === 401) {
                return;
            }
            alert('Ошибка загрузки статистики: ' + (err.response?.data?.detail || err.message));
        }
        finally {
            setLoadingStats(false);
        }
    };
    const handleFileUpload = async () => {
        if (!uploadForm.file || !uploadForm.supplier_id) {
            alert('Выберите файл и поставщика');
            return;
        }
        try {
            setUploading(true);
            const result = await adminApi.importPriceList(uploadForm.file, parseInt(uploadForm.supplier_id), parseInt(uploadForm.header_row), parseInt(uploadForm.start_row));
            setImportResult(result);
            setShowUploadModal(false);
            setShowImportResultModal(true);
            setUploadForm({
                supplier_id: '',
                header_row: '7',
                start_row: '8',
                file: null,
            });
            fetchPriceListsInfo();
            fetchLastUpdate();
        }
        catch (err) {
            console.error('Ошибка загрузки прайс-листа:', err);
            if (err.response?.status === 401) {
                alert('Сессия истекла. Пожалуйста, войдите заново.');
                localStorage.removeItem('auth-storage');
                window.location.href = '/login';
                return;
            }
            const errorMessage = err.response?.data?.detail || err.message || 'Ошибка загрузки прайс-листа';
            // Убираем неправильное сообщение о базе данных для ошибок аутентификации
            if (errorMessage.includes('База данных недоступна') && err.response?.status === 401) {
                alert('Сессия истекла. Пожалуйста, войдите заново.');
                localStorage.removeItem('auth-storage');
                window.location.href = '/login';
            }
            else {
                alert(errorMessage);
            }
        }
        finally {
            setUploading(false);
        }
    };
    const handleDownloadAndImport = async () => {
        if (!downloadForm.supplier_id || !downloadForm.file) {
            alert('Выберите поставщика и файл для загрузки');
            return;
        }
        try {
            setUploading(true);
            const result = await adminApi.importPriceList(downloadForm.file, parseInt(downloadForm.supplier_id), parseInt(downloadForm.header_row), parseInt(downloadForm.start_row));
            alert(`Прайс-лист успешно загружен и импортирован!\nДобавлено: ${result.imported}`);
            setShowDownloadModal(false);
            setDownloadForm({
                supplier_id: '',
                file: null,
                header_row: '7',
                start_row: '8',
            });
        }
        catch (err) {
            console.error('Ошибка загрузки и импорта:', err);
            if (err.response?.status === 401) {
                alert('Сессия истекла. Пожалуйста, войдите заново.');
                localStorage.removeItem('auth-storage');
                window.location.href = '/login';
                return;
            }
            const errorMessage = err.response?.data?.detail || err.response?.data?.error || err.message || 'Ошибка загрузки и импорта прайс-листа';
            // Убираем неправильное сообщение о базе данных для ошибок аутентификации
            if (errorMessage.includes('База данных недоступна') && err.response?.status === 401) {
                alert('Сессия истекла. Пожалуйста, войдите заново.');
                localStorage.removeItem('auth-storage');
                window.location.href = '/login';
            }
            else {
                alert(`Ошибка: ${errorMessage}`);
            }
        }
        finally {
            setUploading(false);
        }
    };
    if (loading) {
        return (_jsxs("div", { className: "flex flex-col justify-center items-center py-12", children: [_jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary-600 mb-4" }), _jsx("p", { className: "text-gray-600", children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u043E\u0432..." })] }));
    }
    return (_jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsxs("div", { className: "flex justify-between items-center mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "\u041F\u0440\u0430\u0439\u0441-\u043B\u0438\u0441\u0442\u044B" }), _jsxs("div", { className: "flex space-x-3", children: [_jsxs("button", { onClick: () => setShowDownloadModal(true), className: "flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700", children: [_jsx(Download, { className: "h-5 w-5" }), _jsx("span", { children: "\u0421\u043A\u0430\u0447\u0430\u0442\u044C \u043F\u043E URL" })] }), _jsxs("button", { onClick: () => setShowUploadModal(true), className: "flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700", children: [_jsx(Upload, { className: "h-5 w-5" }), _jsx("span", { children: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0444\u0430\u0439\u043B" })] })] })] }), error && (_jsx("div", { className: "bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { children: error }), _jsx("button", { onClick: () => {
                                setError('');
                                fetchSuppliers();
                            }, className: "text-red-700 hover:text-red-900 underline text-sm", children: "\u041F\u043E\u0432\u0442\u043E\u0440\u0438\u0442\u044C" })] }) })), _jsxs("div", { className: "bg-white shadow rounded-lg p-6 mb-6", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-4 flex items-center", children: [_jsx(Settings, { className: "h-5 w-5 mr-2 text-primary-600" }), "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435"] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4", children: [_jsxs(Link, { to: "/admin/management/price-lists", className: "flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors", children: [_jsx(Calendar, { className: "h-5 w-5 text-primary-600" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: "\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u0440\u0430\u0439\u0441-\u043B\u0438\u0441\u0442\u043E\u0432" }), _jsx("div", { className: "text-xs text-gray-500", children: "\u0420\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u0435 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u0439" })] })] }), _jsxs(Link, { to: "/admin/management/prices", className: "flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors", children: [_jsx(DollarSign, { className: "h-5 w-5 text-primary-600" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u0446\u0435\u043D\u0430\u043C\u0438" }), _jsx("div", { className: "text-xs text-gray-500", children: "\u041C\u0430\u0441\u0441\u043E\u0432\u043E\u0435 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u0438\u0435 \u0446\u0435\u043D" })] })] }), _jsxs(Link, { to: "/admin/counterparties", className: "flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors", children: [_jsx(Users, { className: "h-5 w-5 text-primary-600" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u043A\u043E\u043D\u0442\u0440\u0430\u0433\u0435\u043D\u0442\u0430\u043C\u0438" }), _jsx("div", { className: "text-xs text-gray-500", children: "\u0414\u043E\u0441\u0442\u0443\u043F \u0438 \u043F\u0440\u0430\u0432\u0430" })] })] }), _jsxs(Link, { to: "/admin/counterparties/suppliers", className: "flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors", children: [_jsx(FileSpreadsheet, { className: "h-5 w-5 text-primary-600" }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435 \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u0430\u043C\u0438" }), _jsx("div", { className: "text-xs text-gray-500", children: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438 \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u043E\u0432" })] })] })] })] }), lastUpdate && (_jsxs("div", { className: "bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6", children: [_jsxs("h2", { className: "text-xl font-semibold text-gray-900 mb-4 flex items-center", children: [_jsx(Download, { className: "h-5 w-5 mr-2 text-blue-600" }), "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0439 \u0437\u0430\u0433\u0440\u0443\u0436\u0435\u043D\u043D\u044B\u0439 \u043F\u0440\u0430\u0439\u0441-\u043B\u0438\u0441\u0442"] }), _jsxs("div", { className: "space-y-2", children: [_jsxs("p", { className: "text-sm text-gray-700", children: [_jsx("span", { className: "font-semibold", children: "\u041F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A:" }), " ", lastUpdate.supplier.name] }), lastUpdate.last_update && (_jsxs("p", { className: "text-sm text-gray-700", children: [_jsx("span", { className: "font-semibold", children: "\u0414\u0430\u0442\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438:" }), ' ', new Date(lastUpdate.last_update).toLocaleString('ru-RU')] })), _jsxs("p", { className: "text-sm text-gray-700", children: [_jsx("span", { className: "font-semibold", children: "URL:" }), " ", lastUpdate.download_url] }), _jsxs("p", { className: "text-sm text-gray-700", children: [_jsx("span", { className: "font-semibold", children: "\u0418\u043C\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u043E:" }), " ", lastUpdate.last_imported_count, " \u0442\u043E\u0432\u0430\u0440\u043E\u0432"] }), _jsxs("p", { className: "text-sm text-gray-700", children: [_jsx("span", { className: "font-semibold", children: "\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E:" }), " ", lastUpdate.last_updated_count, " \u0442\u043E\u0432\u0430\u0440\u043E\u0432"] }), lastUpdate.frequency && (_jsxs("p", { className: "text-sm text-gray-700", children: [_jsx("span", { className: "font-semibold", children: "\u0427\u0430\u0441\u0442\u043E\u0442\u0430 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F:" }), " ", lastUpdate.frequency === 'daily' ? 'Ежедневно' :
                                        lastUpdate.frequency === 'weekly' ? 'Еженедельно' :
                                            lastUpdate.frequency === 'monthly' ? 'Ежемесячно' :
                                                'Вручную'] }))] })] })), _jsxs("div", { className: "bg-white shadow rounded-lg overflow-hidden", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: _jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "\u041F\u0440\u0430\u0439\u0441-\u043B\u0438\u0441\u0442\u044B \u0432\u0441\u0435\u0445 \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u043E\u0432" }) }), _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [_jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "Email" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u041A\u043E\u043B-\u0432\u043E \u0442\u043E\u0432\u0430\u0440\u043E\u0432" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u041F\u043E\u0441\u043B\u0435\u0434\u043D\u0438\u0439 \u043F\u0440\u0430\u0439\u0441-\u043B\u0438\u0441\u0442" }), _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u0421\u0442\u0430\u0442\u0443\u0441" }), _jsx("th", { className: "px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: priceListsInfo.length > 0 ? (priceListsInfo.map((info) => (_jsxs("tr", { className: "hover:bg-gray-50 cursor-pointer", onClick: () => {
                                            setSelectedSupplier(info);
                                            setShowSupplierModal(true);
                                            fetchSupplierStats(info.id);
                                        }, children: [_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm font-medium text-gray-900", children: info.name }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-600", children: info.contact_email || '-' }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("div", { className: "text-sm text-gray-600", children: info.contact_phone || '-' }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsxs("div", { className: "text-sm text-gray-900", children: [info.product_count, " (", info.active_product_count, " \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445)"] }) }), _jsx("td", { className: "px-6 py-4", children: _jsx("div", { className: "text-sm text-gray-600", children: info.last_price_list_update ? (_jsxs("div", { children: [_jsx("div", { className: "font-medium text-gray-900", children: info.last_price_list_update.file_name || 'Прайс-лист' }), info.last_price_list_update.last_update && (_jsx("div", { className: "text-xs text-gray-500", children: new Date(info.last_price_list_update.last_update).toLocaleDateString('ru-RU') }))] })) : (_jsx("span", { className: "text-gray-400", children: "\u041D\u0435 \u0437\u0430\u0433\u0440\u0443\u0436\u0430\u043B\u0441\u044F" })) }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("span", { className: `px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${info.is_active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'}`, children: info.is_active ? 'Активен' : 'Неактивен' }) }), _jsx("td", { className: "px-6 py-4 whitespace-nowrap text-right text-sm font-medium", children: _jsxs("button", { onClick: (e) => {
                                                        e.stopPropagation();
                                                        setSelectedSupplier(info);
                                                        setShowSupplierModal(true);
                                                        fetchSupplierStats(info.id);
                                                    }, className: "text-primary-600 hover:text-primary-900 flex items-center gap-1", children: [_jsx(Edit, { className: "h-4 w-4" }), "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C"] }) })] }, info.id)))) : (_jsx("tr", { children: _jsx("td", { colSpan: 7, className: "px-6 py-4 text-center text-gray-500", children: "\u041D\u0435\u0442 \u0438\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0438\u0438 \u043E \u043F\u0440\u0430\u0439\u0441-\u043B\u0438\u0441\u0442\u0430\u0445" }) })) })] }) })] }), showUploadModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-2xl w-full p-6", children: [_jsx("h2", { className: "text-2xl font-semibold text-gray-900 mb-4", children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u043F\u0440\u0430\u0439\u0441-\u043B\u0438\u0441\u0442\u0430" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u041F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A" }), _jsxs("select", { value: uploadForm.supplier_id, onChange: (e) => {
                                                const selectedSupplier = suppliers.find(s => s.id.toString() === e.target.value);
                                                setUploadForm({
                                                    ...uploadForm,
                                                    supplier_id: e.target.value,
                                                    // Автоматически подставляем сохраненные значения для выбранного поставщика
                                                    header_row: selectedSupplier?.default_header_row?.toString() || '7',
                                                    start_row: selectedSupplier?.default_start_row?.toString() || '8',
                                                });
                                            }, className: "w-full px-3 py-2 border border-gray-300 rounded-md", children: [_jsx("option", { value: "", children: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u0430" }), suppliers.map((supplier) => (_jsx("option", { value: supplier.id, children: supplier.name }, supplier.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0424\u0430\u0439\u043B (Excel)" }), _jsx("input", { type: "file", accept: ".xlsx,.xls", onChange: (e) => setUploadForm({
                                                ...uploadForm,
                                                file: e.target.files?.[0] || null,
                                            }), className: "w-full px-3 py-2 border border-gray-300 rounded-md" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0421\u0442\u0440\u043E\u043A\u0430 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043A\u0430" }), _jsx("input", { type: "number", value: uploadForm.header_row, onChange: (e) => setUploadForm({ ...uploadForm, header_row: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0421\u0442\u0440\u043E\u043A\u0430 \u043D\u0430\u0447\u0430\u043B\u0430 \u0434\u0430\u043D\u043D\u044B\u0445" }), _jsx("input", { type: "number", value: uploadForm.start_row, onChange: (e) => setUploadForm({ ...uploadForm, start_row: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md" })] })] }), _jsxs("div", { className: "flex space-x-2 pt-4", children: [_jsx("button", { onClick: handleFileUpload, disabled: uploading, className: "flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50", children: uploading ? 'Загрузка...' : 'Загрузить' }), _jsx("button", { onClick: () => {
                                                setShowUploadModal(false);
                                                setUploadForm({
                                                    supplier_id: '',
                                                    header_row: '7',
                                                    start_row: '8',
                                                    file: null,
                                                });
                                            }, className: "px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300", children: "\u041E\u0442\u043C\u0435\u043D\u0430" })] })] })] }) })), showSupplierModal && selectedSupplier && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between", children: [_jsxs("h2", { className: "text-2xl font-semibold text-gray-900", children: ["\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430 \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u0430: ", selectedSupplier.name] }), _jsx("button", { onClick: () => {
                                        setShowSupplierModal(false);
                                        setSelectedSupplier(null);
                                        setSupplierStats(null);
                                    }, className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "h-6 w-6" }) })] }), _jsx("div", { className: "p-6", children: loadingStats ? (_jsx("div", { className: "flex justify-center items-center py-12", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary-600" }) })) : supplierStats ? (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Email" }), _jsx("p", { className: "text-lg font-semibold text-gray-900", children: selectedSupplier.contact_email || '-' })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "\u0422\u0435\u043B\u0435\u0444\u043E\u043D" }), _jsx("p", { className: "text-lg font-semibold text-gray-900", children: selectedSupplier.contact_phone || '-' })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "\u0422\u043E\u0432\u0430\u0440\u043E\u0432 \u0432 \u0431\u0430\u0437\u0435" }), _jsxs("p", { className: "text-lg font-semibold text-gray-900", children: [selectedSupplier.product_count, " (", selectedSupplier.active_product_count, " \u0430\u043A\u0442\u0438\u0432\u043D\u044B\u0445)"] })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsx("p", { className: "text-sm text-gray-600", children: "\u0421\u0442\u0430\u0442\u0443\u0441" }), _jsx("p", { className: "text-lg font-semibold", children: _jsx("span", { className: selectedSupplier.is_active ? 'text-green-600' : 'text-red-600', children: selectedSupplier.is_active ? 'Активен' : 'Неактивен' }) })] })] }), supplierStats.sales_stats && (_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "\u0421\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430 \u043F\u043E \u043F\u0440\u043E\u0434\u0430\u0436\u0430\u043C" }), _jsxs("div", { className: "grid grid-cols-3 gap-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "\u0412\u0441\u0435\u0433\u043E \u0437\u0430\u043A\u0430\u0437\u043E\u0432" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: supplierStats.sales_stats.total_orders || 0 })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "\u041E\u0431\u0449\u0430\u044F \u0441\u0443\u043C\u043C\u0430" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: supplierStats.sales_stats.total_revenue ?
                                                                    new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KGS', minimumFractionDigits: 0 }).format(supplierStats.sales_stats.total_revenue) :
                                                                    '0 сом' })] }), _jsxs("div", { children: [_jsx("p", { className: "text-sm text-gray-600", children: "\u041F\u0440\u043E\u0434\u0430\u043D\u043D\u044B\u0445 \u0442\u043E\u0432\u0430\u0440\u043E\u0432" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: supplierStats.sales_stats.total_items_sold || 0 })] })] })] })), _jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "\u0418\u0441\u0442\u043E\u0440\u0438\u044F \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438 \u043F\u0440\u0430\u0439\u0441-\u043B\u0438\u0441\u0442\u043E\u0432" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("button", { onClick: () => {
                                                                    setShowSupplierModal(false);
                                                                    setShowDownloadModal(true);
                                                                    setDownloadForm({
                                                                        ...downloadForm,
                                                                        supplier_id: selectedSupplier.id.toString(),
                                                                    });
                                                                }, className: "flex items-center gap-1.5 px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700", children: [_jsx(Download, { className: "h-4 w-4" }), _jsx("span", { children: "\u0421\u043A\u0430\u0447\u0430\u0442\u044C \u043F\u043E URL" })] }), _jsxs("button", { onClick: () => {
                                                                    setShowSupplierModal(false);
                                                                    setShowUploadModal(true);
                                                                    setUploadForm({
                                                                        ...uploadForm,
                                                                        supplier_id: selectedSupplier.id.toString(),
                                                                    });
                                                                }, className: "flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700", children: [_jsx(Upload, { className: "h-4 w-4" }), _jsx("span", { children: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u0444\u0430\u0439\u043B" })] })] })] }), selectedSupplier.price_list_updates.length > 0 ? (_jsx("div", { className: "space-y-2", children: selectedSupplier.price_list_updates.map((update, idx) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-gray-50 rounded border border-gray-200", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: update.file_name || update.download_url || 'Прайс-лист' }), update.last_update && (_jsx("p", { className: "text-xs text-gray-500", children: new Date(update.last_update).toLocaleString('ru-RU') })), _jsxs("div", { className: "flex gap-4 mt-1 text-xs text-gray-600", children: [update.last_imported_count > 0 && (_jsxs("span", { children: ["\u0418\u043C\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u043D\u043E: ", update.last_imported_count] })), update.last_updated_count > 0 && (_jsxs("span", { children: ["\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E: ", update.last_updated_count] }))] })] }), update.file_path && (_jsxs("button", { onClick: async (e) => {
                                                                e.stopPropagation();
                                                                try {
                                                                    await adminApi.downloadPriceListFile(update.id || null, update.file_path || undefined);
                                                                }
                                                                catch (err) {
                                                                    alert('Ошибка скачивания файла: ' + (err.response?.data?.detail || err.message));
                                                                }
                                                            }, className: "ml-3 px-3 py-1.5 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 flex items-center gap-1", children: [_jsx(FileDown, { className: "h-4 w-4" }), "\u0421\u043A\u0430\u0447\u0430\u0442\u044C"] }))] }, update.id || idx))) })) : (_jsx("p", { className: "text-sm text-gray-500", children: "\u041F\u0440\u0430\u0439\u0441-\u043B\u0438\u0441\u0442\u044B \u0435\u0449\u0435 \u043D\u0435 \u0437\u0430\u0433\u0440\u0443\u0436\u0430\u043B\u0438\u0441\u044C" }))] }), supplierStats.top_products && supplierStats.top_products.length > 0 && (_jsxs("div", { className: "bg-white border border-gray-200 rounded-lg p-4", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900 mb-4", children: "\u0422\u043E\u043F \u043F\u0440\u043E\u0434\u0430\u0432\u0430\u0435\u043C\u044B\u0445 \u0442\u043E\u0432\u0430\u0440\u043E\u0432" }), _jsx("div", { className: "space-y-2", children: supplierStats.top_products.map((product, idx) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-gray-900", children: product.name }), _jsxs("p", { className: "text-xs text-gray-500", children: ["\u041F\u0440\u043E\u0434\u0430\u043D\u043E: ", product.quantity_sold, " \u0448\u0442."] })] }), _jsx("p", { className: "text-sm font-semibold text-gray-900", children: new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KGS', minimumFractionDigits: 0 }).format(product.total_revenue || 0) })] }, idx))) })] }))] })) : (_jsx("p", { className: "text-gray-500", children: "\u0417\u0430\u0433\u0440\u0443\u0437\u043A\u0430 \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0438..." })) })] }) })), showDownloadModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto", children: [_jsx("h2", { className: "text-2xl font-semibold text-gray-900 mb-4", children: "\u0421\u043A\u0430\u0447\u0430\u0442\u044C \u043F\u0440\u0430\u0439\u0441-\u043B\u0438\u0441\u0442 \u043F\u043E URL" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u041F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A *" }), _jsxs("select", { value: downloadForm.supplier_id, onChange: (e) => {
                                                const selectedSupplier = suppliers.find(s => s.id.toString() === e.target.value);
                                                setDownloadForm({
                                                    ...downloadForm,
                                                    supplier_id: e.target.value,
                                                    // Автоматически подставляем сохраненные значения для выбранного поставщика
                                                    header_row: selectedSupplier?.default_header_row?.toString() || '7',
                                                    start_row: selectedSupplier?.default_start_row?.toString() || '8',
                                                });
                                            }, className: "w-full px-3 py-2 border border-gray-300 rounded-md", required: true, children: [_jsx("option", { value: "", children: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u0430" }), suppliers.map((supplier) => (_jsx("option", { value: supplier.id, children: supplier.name }, supplier.id)))] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "URL \u0434\u043B\u044F \u0441\u043A\u0430\u0447\u0438\u0432\u0430\u043D\u0438\u044F *" }), _jsx("input", { type: "url", value: downloadForm.download_url, onChange: (e) => setDownloadForm({ ...downloadForm, download_url: e.target.value }), placeholder: "https://stroydvor.kg/wp-content/uploads/\u043F\u0440\u0430\u0439\u0441-\u043B\u0438\u0441\u0442.xlsx", className: "w-full px-3 py-2 border border-gray-300 rounded-md", required: true }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "\u041F\u0440\u0438\u043C\u0435\u0440: https://stroydvor.kg/wp-content/uploads/\u043F\u0440\u0430\u0439\u0441-\u043B\u0438\u0441\u0442-10.11.25-.xlsx" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0427\u0430\u0441\u0442\u043E\u0442\u0430 \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u0438\u044F" }), _jsxs("select", { value: downloadForm.frequency, onChange: (e) => setDownloadForm({ ...downloadForm, frequency: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md", children: [_jsx("option", { value: "manual", children: "\u0412\u0440\u0443\u0447\u043D\u0443\u044E" }), _jsx("option", { value: "daily", children: "\u0415\u0436\u0435\u0434\u043D\u0435\u0432\u043D\u043E" }), _jsx("option", { value: "weekly", children: "\u0415\u0436\u0435\u043D\u0435\u0434\u0435\u043B\u044C\u043D\u043E" }), _jsx("option", { value: "monthly", children: "\u0415\u0436\u0435\u043C\u0435\u0441\u044F\u0447\u043D\u043E" })] }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "\u0421\u0438\u0441\u0442\u0435\u043C\u0430 \u0431\u0443\u0434\u0435\u0442 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u0441\u043A\u0430\u0447\u0438\u0432\u0430\u0442\u044C \u0438 \u043E\u0431\u043D\u043E\u0432\u043B\u044F\u0442\u044C \u043F\u0440\u0430\u0439\u0441-\u043B\u0438\u0441\u0442 \u043F\u043E \u0440\u0430\u0441\u043F\u0438\u0441\u0430\u043D\u0438\u044E" })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0421\u0442\u0440\u043E\u043A\u0430 \u0437\u0430\u0433\u043E\u043B\u043E\u0432\u043A\u0430" }), _jsx("input", { type: "number", value: downloadForm.header_row, onChange: (e) => setDownloadForm({ ...downloadForm, header_row: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md" })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "\u0421\u0442\u0440\u043E\u043A\u0430 \u043D\u0430\u0447\u0430\u043B\u0430 \u0434\u0430\u043D\u043D\u044B\u0445" }), _jsx("input", { type: "number", value: downloadForm.start_row, onChange: (e) => setDownloadForm({ ...downloadForm, start_row: e.target.value }), className: "w-full px-3 py-2 border border-gray-300 rounded-md" })] })] }), _jsxs("div", { className: "flex space-x-2 pt-4", children: [_jsx("button", { onClick: handleDownloadAndImport, disabled: uploading, className: "flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center justify-center", children: uploading ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "\u0421\u043A\u0430\u0447\u0438\u0432\u0430\u043D\u0438\u0435 \u0438 \u0438\u043C\u043F\u043E\u0440\u0442..."] })) : (_jsxs(_Fragment, { children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "\u0421\u043A\u0430\u0447\u0430\u0442\u044C \u0438 \u0438\u043C\u043F\u043E\u0440\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C"] })) }), _jsx("button", { onClick: () => {
                                                setShowDownloadModal(false);
                                                setDownloadForm({
                                                    supplier_id: '',
                                                    download_url: '',
                                                    frequency: 'manual',
                                                    header_row: '7',
                                                    start_row: '8',
                                                });
                                            }, className: "px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300", children: "\u041E\u0442\u043C\u0435\u043D\u0430" })] })] })] }) })), showImportResultModal && importResult && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-2xl w-full p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-6", children: [_jsxs("div", { className: "flex items-center space-x-3", children: [_jsx("div", { className: "bg-green-100 p-3 rounded-full", children: _jsx(CheckCircle, { className: "h-6 w-6 text-green-600" }) }), _jsx("h2", { className: "text-2xl font-bold text-gray-900", children: "\u0418\u043C\u043F\u043E\u0440\u0442 \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D \u0443\u0441\u043F\u0435\u0448\u043D\u043E" })] }), _jsx("button", { onClick: () => setShowImportResultModal(false), className: "text-gray-400 hover:text-gray-600", children: _jsx(X, { className: "h-6 w-6" }) })] }), _jsxs("div", { className: "space-y-4 mb-6", children: [_jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx(Package, { className: "h-5 w-5 text-primary-600" }), _jsx("span", { className: "font-semibold text-gray-900", children: "\u041F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A:" })] }), _jsx("p", { className: "text-gray-700 text-lg", children: importResult.supplier_name })] }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx(Calendar, { className: "h-5 w-5 text-primary-600" }), _jsx("span", { className: "font-semibold text-gray-900", children: "\u0414\u0430\u0442\u0430 \u0437\u0430\u0433\u0440\u0443\u0437\u043A\u0438:" })] }), _jsx("p", { className: "text-gray-700", children: new Date(importResult.import_date).toLocaleString('ru-RU', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            }) })] }), _jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "bg-blue-50 rounded-lg p-4 text-center", children: [_jsx("div", { className: "flex items-center justify-center mb-2", children: _jsx(Package, { className: "h-5 w-5 text-blue-600" }) }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: importResult.total_processed || 0 }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "\u0412\u0441\u0435\u0433\u043E \u0442\u043E\u0432\u0430\u0440\u043E\u0432 \u0432 \u043F\u0440\u0430\u0439\u0441-\u043B\u0438\u0441\u0442\u0435" })] }), _jsxs("div", { className: "bg-green-50 rounded-lg p-4 text-center", children: [_jsx("div", { className: "flex items-center justify-center mb-2", children: _jsx(TrendingUp, { className: "h-5 w-5 text-green-600" }) }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: importResult.imported || 0 }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "\u0414\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u043E \u043D\u043E\u0432\u044B\u0445" })] }), _jsxs("div", { className: "bg-yellow-50 rounded-lg p-4 text-center", children: [_jsx("div", { className: "flex items-center justify-center mb-2", children: _jsx(Edit, { className: "h-5 w-5 text-yellow-600" }) }), _jsx("p", { className: "text-2xl font-bold text-yellow-600", children: importResult.updated || 0 }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "\u041E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u043E" })] }), _jsxs("div", { className: "bg-red-50 rounded-lg p-4 text-center", children: [_jsx("div", { className: "flex items-center justify-center mb-2", children: _jsx(TrendingDown, { className: "h-5 w-5 text-red-600" }) }), _jsx("p", { className: "text-2xl font-bold text-red-600", children: importResult.deactivated || 0 }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: "\u0414\u0435\u0430\u043A\u0442\u0438\u0432\u0438\u0440\u043E\u0432\u0430\u043D\u043E" })] })] }), importResult.errors && importResult.errors.length > 0 && (_jsxs("div", { className: "bg-red-50 border border-red-200 rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center space-x-2 mb-2", children: [_jsx(AlertCircle, { className: "h-5 w-5 text-red-600" }), _jsx("span", { className: "font-semibold text-red-900", children: "\u041E\u0448\u0438\u0431\u043A\u0438 \u043F\u0440\u0438 \u0438\u043C\u043F\u043E\u0440\u0442\u0435:" })] }), _jsxs("ul", { className: "list-disc list-inside text-sm text-red-700 space-y-1", children: [importResult.errors.slice(0, 5).map((error, index) => (_jsxs("li", { children: [error.product, ": ", error.error] }, index))), importResult.errors.length > 5 && (_jsxs("li", { className: "text-gray-600", children: ["... \u0438 \u0435\u0449\u0435 ", importResult.errors.length - 5, " \u043E\u0448\u0438\u0431\u043E\u043A"] }))] })] }))] }), _jsx("div", { className: "flex justify-end", children: _jsx("button", { onClick: () => setShowImportResultModal(false), className: "px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors", children: "\u0417\u0430\u043A\u0440\u044B\u0442\u044C" }) })] }) }))] }));
}
