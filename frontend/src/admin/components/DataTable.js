import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Универсальный компонент таблицы для админ-панели
 * Поддерживает пагинацию, сортировку, выбор строк
 */
import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Loader2 } from 'lucide-react';
export default function DataTable({ data, columns, loading = false, pagination, sorting, selection, actions, emptyMessage = 'Нет данных', className = '', }) {
    const [hoveredRow, setHoveredRow] = useState(null);
    const handleSort = (column) => {
        if (!sorting)
            return;
        if (sorting.column === column) {
            if (sorting.direction === 'asc') {
                sorting.onSort(column, 'desc');
            }
            else if (sorting.direction === 'desc') {
                sorting.onSort(column, 'asc');
            }
            else {
                sorting.onSort(column, 'asc');
            }
        }
        else {
            sorting.onSort(column, 'asc');
        }
    };
    const getSortIcon = (column) => {
        if (!sorting || sorting.column !== column) {
            return null;
        }
        if (sorting.direction === 'asc') {
            return _jsx(ChevronUp, { className: "h-4 w-4 inline-block ml-1" });
        }
        if (sorting.direction === 'desc') {
            return _jsx(ChevronDown, { className: "h-4 w-4 inline-block ml-1" });
        }
        return null;
    };
    const totalPages = pagination ? Math.ceil(pagination.total / pagination.pageSize) : 1;
    const startIndex = pagination ? (pagination.currentPage - 1) * pagination.pageSize : 0;
    const endIndex = pagination ? startIndex + pagination.pageSize : data.length;
    if (loading) {
        return (_jsx("div", { className: "flex justify-center items-center py-12", children: _jsx(Loader2, { className: "h-8 w-8 animate-spin text-primary-600" }) }));
    }
    if (data.length === 0) {
        return (_jsx("div", { className: "text-center py-12 text-gray-500", children: emptyMessage }));
    }
    return (_jsxs("div", { className: `bg-white shadow rounded-lg overflow-hidden ${className}`, children: [_jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "min-w-full divide-y divide-gray-200", children: [_jsx("thead", { className: "bg-gray-50", children: _jsxs("tr", { children: [selection && (_jsx("th", { className: "px-6 py-3 text-left", children: _jsx("input", { type: "checkbox", checked: data.length > 0 && data.every(item => selection.selected.has(selection.getRowId(item))), onChange: selection.onSelectAll, className: "rounded border-gray-300 text-primary-600 focus:ring-primary-500" }) })), columns.map((column) => (_jsx("th", { className: `px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''} ${column.className || ''}`, onClick: () => column.sortable && handleSort(column.key), children: _jsxs("div", { className: "flex items-center", children: [column.label, column.sortable && getSortIcon(column.key)] }) }, column.key))), actions && _jsx("th", { className: "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider", children: "\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044F" })] }) }), _jsx("tbody", { className: "bg-white divide-y divide-gray-200", children: data.map((item, index) => {
                                const rowId = selection ? selection.getRowId(item) : index;
                                const isSelected = selection ? selection.selected.has(rowId) : false;
                                const isHovered = hoveredRow === rowId;
                                return (_jsxs("tr", { className: `${isSelected ? 'bg-primary-50' : ''} ${isHovered ? 'bg-gray-50' : ''} hover:bg-gray-50 transition-colors`, onMouseEnter: () => setHoveredRow(rowId), onMouseLeave: () => setHoveredRow(null), children: [selection && (_jsx("td", { className: "px-6 py-4 whitespace-nowrap", children: _jsx("input", { type: "checkbox", checked: isSelected, onChange: () => selection.onSelect(rowId), className: "rounded border-gray-300 text-primary-600 focus:ring-primary-500" }) })), columns.map((column) => (_jsx("td", { className: `px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${column.className || ''}`, children: column.render ? column.render(item) : item[column.key] }, column.key))), actions && (_jsx("td", { className: "px-6 py-4 whitespace-nowrap text-sm font-medium", children: actions(item) }))] }, rowId));
                            }) })] }) }), pagination && totalPages > 1 && (_jsxs("div", { className: "bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6", children: [_jsxs("div", { className: "flex-1 flex justify-between sm:hidden", children: [_jsx("button", { onClick: () => pagination.onPageChange(pagination.currentPage - 1), disabled: pagination.currentPage === 1, className: "relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed", children: "\u041D\u0430\u0437\u0430\u0434" }), _jsx("button", { onClick: () => pagination.onPageChange(pagination.currentPage + 1), disabled: pagination.currentPage === totalPages, className: "ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed", children: "\u0412\u043F\u0435\u0440\u0435\u0434" })] }), _jsxs("div", { className: "hidden sm:flex-1 sm:flex sm:items-center sm:justify-between", children: [_jsx("div", { children: _jsxs("p", { className: "text-sm text-gray-700", children: ["\u041F\u043E\u043A\u0430\u0437\u0430\u043D\u043E ", _jsx("span", { className: "font-medium", children: startIndex + 1 }), " -", ' ', _jsx("span", { className: "font-medium", children: Math.min(endIndex, pagination.total) }), " \u0438\u0437", ' ', _jsx("span", { className: "font-medium", children: pagination.total })] }) }), _jsx("div", { children: _jsxs("nav", { className: "relative z-0 inline-flex rounded-md shadow-sm -space-x-px", "aria-label": "Pagination", children: [_jsx("button", { onClick: () => pagination.onPageChange(pagination.currentPage - 1), disabled: pagination.currentPage === 1, className: "relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed", children: _jsx(ChevronLeft, { className: "h-5 w-5" }) }), Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                            let pageNum;
                                            if (totalPages <= 5) {
                                                pageNum = i + 1;
                                            }
                                            else if (pagination.currentPage <= 3) {
                                                pageNum = i + 1;
                                            }
                                            else if (pagination.currentPage >= totalPages - 2) {
                                                pageNum = totalPages - 4 + i;
                                            }
                                            else {
                                                pageNum = pagination.currentPage - 2 + i;
                                            }
                                            return (_jsx("button", { onClick: () => pagination.onPageChange(pageNum), className: `relative inline-flex items-center px-4 py-2 border text-sm font-medium ${pagination.currentPage === pageNum
                                                    ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`, children: pageNum }, pageNum));
                                        }), _jsx("button", { onClick: () => pagination.onPageChange(pagination.currentPage + 1), disabled: pagination.currentPage === totalPages, className: "relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed", children: _jsx(ChevronRight, { className: "h-5 w-5" }) })] }) })] })] }))] }));
}
