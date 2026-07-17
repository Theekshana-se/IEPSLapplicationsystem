import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { logout } from '../../api/authApi';
import {
    LayoutDashboard,
    User,
    FileText,
    CreditCard,
    Bell,
    LogOut,
    Menu,
    X,
    WalletCards,
    Pencil
} from 'lucide-react';
import logo from '../../assets/IEPSL.png';

export default function MemberLayout() {
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = async () => {
        await logout();
    };

    const menuItems = [
        { path: '/member/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/member/profile', icon: User, label: 'My Profile' },
        { path: '/member/update-details', icon: Pencil, label: 'Update Details' },
        { path: '/member/payments', icon: WalletCards, label: 'My Payments' },
        { path: '/member/registration-details', icon: FileText, label: 'Registration Details' },
        { path: '/member/membership-card', icon: CreditCard, label: 'Membership Card' },
        { path: '/member/notifications', icon: Bell, label: 'Notifications' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden text-gray-600 hover:text-gray-900"
                        >
                            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="IEPSL Logo" className="h-10 w-auto" />
                            <div>
                                <h1 className="text-xl font-bold text-primary-600">IEPSL Member Portal</h1>
                                <p className="text-xs text-gray-600">Institute of Environmental Professionals</p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="btn btn-ghost text-error hover:bg-error-light"
                    >
                        <LogOut className="w-4 h-4 mr-2" />
                        Logout
                    </button>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside
                    className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            fixed lg:sticky lg:translate-x-0 top-[73px] left-0 z-20
            w-64 h-[calc(100vh-73px)] bg-white border-r border-gray-200
            transition-transform duration-300 ease-in-out
            overflow-y-auto scrollbar-thin
          `}
                >
                    <nav className="p-4 space-y-2">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${isActive(item.path)
                                            ? 'bg-primary-600 text-white'
                                            : 'text-gray-700 hover:bg-gray-100'
                                        }
                  `}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6 lg:p-8">
                    <Outlet />
                </main>
            </div>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
}
