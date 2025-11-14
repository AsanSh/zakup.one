import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { Calendar, DollarSign, Tag } from 'lucide-react';
export default function AdminManagement() {
    const sections = [
        {
            title: 'Обновление прайс-листов',
            description: 'Загрузка и обновление прайс-листов поставщиков',
            href: '/admin/management/price-lists',
            icon: Calendar,
            color: 'bg-blue-500',
        },
        {
            title: 'Управление ценами',
            description: 'Массовое изменение цен на товары',
            href: '/admin/management/prices',
            icon: DollarSign,
            color: 'bg-green-500',
        },
        {
            title: 'Управление товарами',
            description: 'Акции, скидки и промо-акции для товаров',
            href: '/admin/management/products',
            icon: Tag,
            color: 'bg-orange-500',
        },
    ];
    return (_jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-8", children: "\u0423\u043F\u0440\u0430\u0432\u043B\u0435\u043D\u0438\u0435" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: sections.map((section) => {
                    const Icon = section.icon;
                    return (_jsx(Link, { to: section.href, className: "bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow", children: _jsxs("div", { className: "flex items-start space-x-4", children: [_jsx("div", { className: `${section.color} p-3 rounded-lg`, children: _jsx(Icon, { className: "h-6 w-6 text-white" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-2", children: section.title }), _jsx("p", { className: "text-gray-600", children: section.description })] })] }) }, section.href));
                }) })] }));
}
