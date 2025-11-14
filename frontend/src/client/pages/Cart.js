import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { clientApi } from '../../shared/api';
import { formatPrice } from '../../shared/utils/formatters';
import { Trash2, Plus, Minus, Upload, FileText, Camera, X, Loader2 } from 'lucide-react';
export default function Cart() {
    const { items, removeItem, updateQuantity, clearCart, getTotal, addItem } = useCartStore();
    const [showManualModal, setShowManualModal] = useState(false);
    const [manualText, setManualText] = useState('');
    const [processingManual, setProcessingManual] = useState(false);
    const [uploadingFile, setUploadingFile] = useState(false);
    const formatPrice = (price) => {
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(price) + ' сом';
    };
    // Скачать шаблон Excel (CSV формат)
    const downloadTemplate = () => {
        const csvContent = `Наименование товара,Количество,Единица измерения
Арматура А18,10,м
Проволока вязальная,5,кг
Цемент М500,20,мешок`;
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'шаблон_номенклатуры.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    // Обработка загрузки файла
    const handleFileUpload = async (file) => {
        setUploadingFile(true);
        try {
            // Здесь будет обработка файла через API
            // Пока просто показываем сообщение
            alert(`Файл "${file.name}" загружен. Обработка файла будет реализована через API.`);
        }
        catch (error) {
            alert('Ошибка при обработке файла. Попробуйте снова.');
        }
        finally {
            setUploadingFile(false);
        }
    };
    // Обработка текстового ввода
    const handleManualSubmit = async () => {
        if (!manualText.trim()) {
            alert('Введите текст с товарами');
            return;
        }
        setProcessingManual(true);
        try {
            // Парсим текст: формат "Товар - количество единица" или "Товар количество единица"
            const lines = manualText.split('\n').filter(line => line.trim());
            const products = [];
            for (const line of lines) {
                // Пытаемся найти паттерн: название - количество единица
                const match1 = line.match(/^(.+?)\s*[-–]\s*(\d+(?:[.,]\d+)?)\s*(.+?)$/i);
                // Или: название количество единица
                const match2 = line.match(/^(.+?)\s+(\d+(?:[.,]\d+)?)\s+(.+?)$/i);
                if (match1) {
                    const [, name, qty, unit] = match1;
                    products.push({
                        name: name.trim(),
                        quantity: parseFloat(qty.replace(',', '.')),
                        unit: unit.trim() || 'шт',
                    });
                }
                else if (match2) {
                    const [, name, qty, unit] = match2;
                    products.push({
                        name: name.trim(),
                        quantity: parseFloat(qty.replace(',', '.')),
                        unit: unit.trim() || 'шт',
                    });
                }
            }
            if (products.length === 0) {
                alert('Не удалось распознать товары. Используйте формат:\nТовар - 10 шт\nили\nТовар 10 шт');
                setProcessingManual(false);
                return;
            }
            // Ищем товары в базе и добавляем в корзину
            let foundCount = 0;
            for (const product of products) {
                try {
                    const searchResults = await clientApi.searchProducts(product.name, 5);
                    if (searchResults.length > 0) {
                        // Берем первый найденный товар
                        const foundProduct = searchResults[0];
                        addItem({
                            product_id: foundProduct.id,
                            name: foundProduct.name,
                            unit: foundProduct.unit || product.unit,
                            price: foundProduct.price,
                        });
                        // Обновляем количество если нужно
                        if (product.quantity > 1) {
                            for (let i = 1; i < product.quantity; i++) {
                                addItem({
                                    product_id: foundProduct.id,
                                    name: foundProduct.name,
                                    unit: foundProduct.unit || product.unit,
                                    price: foundProduct.price,
                                });
                            }
                        }
                        foundCount++;
                    }
                }
                catch (error) {
                    console.error(`Ошибка поиска товара "${product.name}":`, error);
                }
            }
            if (foundCount > 0) {
                alert(`Добавлено товаров: ${foundCount} из ${products.length}`);
                setShowManualModal(false);
                setManualText('');
            }
            else {
                alert('Не найдено ни одного товара. Проверьте названия товаров.');
            }
        }
        catch (error) {
            alert('Ошибка при обработке текста. Попробуйте снова.');
        }
        finally {
            setProcessingManual(false);
        }
    };
    return (_jsxs("div", { className: "max-w-4xl mx-auto", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-6 text-center", children: "\u0421\u043F\u043E\u0441\u043E\u0431\u044B \u0441\u043E\u0437\u0434\u0430\u043D\u0438\u044F \u0437\u0430\u044F\u0432\u043A\u0438" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsx("div", { className: "bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col", style: { minHeight: '320px' }, children: _jsxs("div", { className: "flex flex-col items-center text-center flex-1", children: [_jsx("div", { className: "bg-primary-100 rounded-full p-4 mb-4", children: _jsx(Upload, { className: "h-8 w-8 text-primary-600" }) }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u044C \u043D\u043E\u043C\u0435\u043D\u043A\u043B\u0430\u0442\u0443\u0440\u0443" }), _jsx("p", { className: "text-sm text-gray-500 mb-4 flex-1", children: "\u0417\u0430\u0433\u0440\u0443\u0437\u0438\u0442\u0435 Excel \u0444\u0430\u0439\u043B \u0441 \u0442\u043E\u0432\u0430\u0440\u0430\u043C\u0438 \u0438 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E\u043C. \u0421\u0438\u0441\u0442\u0435\u043C\u0430 \u0430\u0432\u0442\u043E\u043C\u0430\u0442\u0438\u0447\u0435\u0441\u043A\u0438 \u043E\u043F\u0440\u0435\u0434\u0435\u043B\u0438\u0442 \u0442\u043E\u0432\u0430\u0440\u044B \u0438 \u0441\u043E\u0437\u0434\u0430\u0441\u0442 \u0441\u0447\u0435\u0442." }), _jsxs("div", { className: "w-full mt-auto", style: { marginTop: 'auto' }, children: [_jsx("button", { onClick: () => {
                                                        const input = document.createElement('input');
                                                        input.type = 'file';
                                                        input.accept = '.xlsx,.xls,.csv';
                                                        input.onchange = (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                handleFileUpload(file);
                                                            }
                                                        };
                                                        input.click();
                                                    }, disabled: uploadingFile, className: "w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center", style: { height: '40px' }, children: uploadingFile ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430..."] })) : ('Выбрать файл') }), _jsx("button", { onClick: downloadTemplate, className: "w-full text-sm text-primary-600 hover:text-primary-700 py-1 mt-2", style: { height: '32px' }, children: "\u0421\u043A\u0430\u0447\u0430\u0442\u044C \u0448\u0430\u0431\u043B\u043E\u043D" })] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col", style: { minHeight: '320px' }, children: _jsxs("div", { className: "flex flex-col items-center text-center flex-1", children: [_jsx("div", { className: "bg-primary-100 rounded-full p-4 mb-4", children: _jsx(FileText, { className: "h-8 w-8 text-primary-600" }) }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443 \u0432\u0440\u0443\u0447\u043D\u0443\u044E" }), _jsx("p", { className: "text-sm text-gray-500 mb-4 flex-1", children: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u043D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435 \u0442\u043E\u0432\u0430\u0440\u0430 \u0438 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u0432 \u0442\u0435\u043A\u0441\u0442\u043E\u0432\u043E\u043C \u0444\u043E\u0440\u043C\u0430\u0442\u0435." }), _jsxs("div", { className: "w-full mt-auto", style: { marginTop: 'auto' }, children: [_jsx("button", { onClick: () => setShowManualModal(true), className: "w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors", style: { height: '40px' }, children: "\u0412\u0432\u0435\u0441\u0442\u0438 \u0442\u0435\u043A\u0441\u0442" }), _jsx("div", { style: { height: '32px' } })] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow flex flex-col", style: { minHeight: '320px' }, children: _jsxs("div", { className: "flex flex-col items-center text-center flex-1", children: [_jsx("div", { className: "bg-primary-100 rounded-full p-4 mb-4", children: _jsx(Camera, { className: "h-8 w-8 text-primary-600" }) }), _jsx("h3", { className: "text-lg font-medium text-gray-900 mb-2", children: "\u0421\u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0440\u043E\u0432\u0430\u0442\u044C \u0442\u0435\u043A\u0441\u0442" }), _jsx("p", { className: "text-sm text-gray-500 mb-4 flex-1", children: "\u0421\u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0440\u0443\u0439\u0442\u0435 \u0442\u0435\u043A\u0441\u0442 \u043D\u0430 \u0431\u0443\u043C\u0430\u0433\u0435. \u0421\u0438\u0441\u0442\u0435\u043C\u0430 \u0440\u0430\u0441\u043F\u043E\u0437\u043D\u0430\u0435\u0442 \u0442\u043E\u0432\u0430\u0440\u044B \u0438 \u043A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E." }), _jsxs("div", { className: "w-full mt-auto", style: { marginTop: 'auto' }, children: [_jsx("button", { onClick: () => {
                                                        const input = document.createElement('input');
                                                        input.type = 'file';
                                                        input.accept = 'image/*';
                                                        input.capture = 'environment';
                                                        input.onchange = (e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                // TODO: Обработка фотографии и OCR
                                                                alert(`Фотография ${file.name} будет обработана. Функция в разработке.`);
                                                            }
                                                        };
                                                        input.click();
                                                    }, className: "w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors", style: { height: '40px' }, children: "\u0421\u0444\u043E\u0442\u043E\u0433\u0440\u0430\u0444\u0438\u0440\u043E\u0432\u0430\u0442\u044C" }), _jsx("div", { style: { height: '32px' } })] })] }) })] })] }), items.length > 0 && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mb-8 mt-8 flex justify-between items-center", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "\u0421\u0431\u043E\u0440\u043A\u0430 \u0437\u0430\u044F\u0432\u043A\u0438" }), _jsx("button", { onClick: clearCart, className: "text-sm text-red-600 hover:text-red-700", children: "\u041E\u0447\u0438\u0441\u0442\u0438\u0442\u044C \u043A\u043E\u0440\u0437\u0438\u043D\u0443" })] }), _jsxs("div", { className: "bg-white shadow rounded-lg overflow-hidden", children: [_jsx("div", { className: "divide-y divide-gray-200", children: items.map((item) => (_jsx(CartItemRow, { item: item, onRemove: removeItem, onUpdateQuantity: updateQuantity }, item.product_id))) }), _jsx("div", { className: "bg-gray-50 px-6 py-4", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("span", { className: "text-lg font-medium text-gray-900", children: "\u0418\u0442\u043E\u0433\u043E:" }), _jsx("span", { className: "text-2xl font-bold text-gray-900", children: formatPrice(getTotal()) })] }) })] }), _jsx("div", { className: "mt-6 flex justify-end", children: _jsx(Link, { to: "/orders/create", className: "inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500", children: "\u041E\u0444\u043E\u0440\u043C\u0438\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443" }) })] })), showManualModal && (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4", children: _jsxs("div", { className: "bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto", children: [_jsxs("div", { className: "sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900", children: "\u0421\u043E\u0437\u0434\u0430\u0442\u044C \u0437\u0430\u044F\u0432\u043A\u0443 \u0432\u0440\u0443\u0447\u043D\u0443\u044E" }), _jsx("button", { onClick: () => {
                                        setShowManualModal(false);
                                        setManualText('');
                                    }, className: "text-gray-400 hover:text-gray-600 transition-colors", children: _jsx(X, { className: "h-6 w-6" }) })] }), _jsxs("div", { className: "p-6", children: [_jsxs("div", { className: "mb-4", children: [_jsx("label", { htmlFor: "manual-text", className: "block text-sm font-medium text-gray-700 mb-2", children: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0442\u043E\u0432\u0430\u0440\u044B \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435:" }), _jsxs("div", { className: "bg-gray-50 border border-gray-200 rounded-md p-3 mb-3 text-sm text-gray-600", children: [_jsx("p", { className: "mb-1", children: "\u041F\u0440\u0438\u043C\u0435\u0440\u044B:" }), _jsx("p", { children: "\u0410\u0440\u043C\u0430\u0442\u0443\u0440\u0430 \u041018 - 10 \u043C" }), _jsx("p", { children: "\u041F\u0440\u043E\u0432\u043E\u043B\u043E\u043A\u0430 \u0432\u044F\u0437\u0430\u043B\u044C\u043D\u0430\u044F - 5 \u043A\u0433" }), _jsx("p", { children: "\u0426\u0435\u043C\u0435\u043D\u0442 \u041C500 20 \u043C\u0435\u0448\u043E\u043A" })] }), _jsx("textarea", { id: "manual-text", value: manualText, onChange: (e) => setManualText(e.target.value), placeholder: "\u0412\u0432\u0435\u0434\u0438\u0442\u0435 \u0442\u043E\u0432\u0430\u0440\u044B, \u043A\u0430\u0436\u0434\u044B\u0439 \u0441 \u043D\u043E\u0432\u043E\u0439 \u0441\u0442\u0440\u043E\u043A\u0438...", className: "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500", rows: 10 })] }), _jsxs("div", { className: "flex justify-end space-x-3", children: [_jsx("button", { onClick: () => {
                                                setShowManualModal(false);
                                                setManualText('');
                                            }, className: "px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors", children: "\u041E\u0442\u043C\u0435\u043D\u0430" }), _jsx("button", { onClick: handleManualSubmit, disabled: processingManual || !manualText.trim(), className: "px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center", children: processingManual ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "h-4 w-4 mr-2 animate-spin" }), "\u041E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0430..."] })) : ('Добавить товары') })] })] })] }) }))] }));
}
function CartItemRow({ item, onRemove, onUpdateQuantity, }) {
    return (_jsxs("div", { className: "px-4 py-1.5 flex items-center gap-3 text-sm hover:bg-gray-50 transition-colors", style: { minHeight: '32px' }, children: [_jsx("div", { className: "flex-1 min-w-0 truncate", children: _jsx("span", { className: "text-gray-900", children: item.name }) }), _jsx("div", { className: "text-gray-600 whitespace-nowrap", style: { minWidth: '50px' }, children: item.unit }), _jsxs("div", { className: "flex items-center space-x-2", style: { minWidth: '100px' }, children: [_jsx("button", { onClick: () => onUpdateQuantity(item.product_id, item.quantity - 1), className: "p-1 rounded-md hover:bg-gray-100", children: _jsx(Minus, { className: "h-3.5 w-3.5" }) }), _jsx("span", { className: "w-8 text-center text-gray-900", children: item.quantity }), _jsx("button", { onClick: () => onUpdateQuantity(item.product_id, item.quantity + 1), className: "p-1 rounded-md hover:bg-gray-100", children: _jsx(Plus, { className: "h-3.5 w-3.5" }) })] }), _jsx("div", { className: "text-gray-500 whitespace-nowrap text-right", style: { minWidth: '90px' }, children: formatPrice(item.price) }), _jsx("div", { className: "text-gray-900 whitespace-nowrap text-right", style: { minWidth: '90px' }, children: formatPrice(item.price * item.quantity) }), _jsx("div", { className: "flex justify-end", style: { minWidth: '36px' }, children: _jsx("button", { onClick: () => onRemove(item.product_id), className: "p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors", children: _jsx(Trash2, { className: "h-4 w-4" }) }) })] }));
}
