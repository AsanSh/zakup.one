import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Link } from 'react-router-dom';
import { Building2, Users, Truck, Shield } from 'lucide-react';
export default function AdminCounterparties() {
    const sections = [
        {
            title: 'Поставщики',
            description: 'Управление поставщиками товаров',
            href: '/admin/counterparties/suppliers',
            icon: Building2,
            color: 'bg-blue-500',
        },
        {
            title: 'Снабженцы',
            description: 'Управление снабженцами',
            href: '/admin/counterparties/procurement',
            icon: Users,
            color: 'bg-green-500',
        },
        {
            title: 'Водители',
            description: 'Управление водителями',
            href: '/admin/counterparties/drivers',
            icon: Truck,
            color: 'bg-orange-500',
        },
        {
            title: 'Управление доступом',
            description: 'Настройка прав доступа для контрагентов',
            href: '/admin/counterparties/access',
            icon: Shield,
            color: 'bg-purple-500',
        },
    ];
    return (_jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900 mb-8", children: "\u041A\u043E\u043D\u0442\u0440\u0430\u0433\u0435\u043D\u0442\u044B" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: sections.map((section) => {
                    const Icon = section.icon;
                    return (_jsx(Link, { to: section.href, className: "bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow", children: _jsxs("div", { className: "flex items-start space-x-4", children: [_jsx("div", { className: `${section.color} p-3 rounded-lg`, children: _jsx(Icon, { className: "h-6 w-6 text-white" }) }), _jsxs("div", { className: "flex-1", children: [_jsx("h2", { className: "text-xl font-semibold text-gray-900 mb-2", children: section.title }), _jsx("p", { className: "text-gray-600", children: section.description })] })] }) }, section.href));
                }) })] }));
}
