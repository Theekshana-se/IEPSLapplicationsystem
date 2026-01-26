import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    ChevronRight,
    Shield,
    Users,
    Award,
    CheckCircle,
    ArrowRight,
    Menu,
    X
} from 'lucide-react';
import logo from '../assets/IEPSL.png';
import membershipCard from '../assets/membership-card.png';

export default function LandingPage() {
    const navigate = useNavigate();
    const [scrollY, setScrollY] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'About Us', path: '/about' },
        { name: 'Our Work', path: '/work' },
        { name: 'Information', path: '/info' }
    ];

    const features = [
        {
            icon: Shield,
            title: 'Secure & Reliable',
            description: 'Enterprise-grade security with encrypted data protection and secure authentication.'
        },
        {
            icon: Users,
            title: 'Member Management',
            description: 'Comprehensive member directory with advanced search and filtering capabilities.'
        },
        {
            icon: Award,
            title: 'Professional Recognition',
            description: 'Digital membership cards and professional certification management.'
        }
    ];

    const benefits = [
        'Streamlined registration process',
        'Automated approval workflow',
        'Digital membership cards',
        'Secure document management',
        'Email notifications',
        'Mobile-responsive design'
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <img src={logo} alt="IEPSL Logo" className="h-12 w-auto group-hover:scale-105 transition-transform duration-300" />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">IEPSL</h1>
                                <p className="text-xs text-gray-600">Members Portal</p>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className="text-gray-700 hover:text-primary-600 font-medium transition-colors duration-200"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>

                        {/* Desktop Login Button */}
                        <div className="hidden md:flex items-center gap-4">
                            <Link
                                to="/login"
                                className="px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all duration-300 hover:shadow-lg hover:shadow-primary-200"
                            >
                                Login
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="md:hidden text-gray-700 hover:text-primary-600"
                        >
                            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden mt-4 pb-4 space-y-3 animate-fade-in-up">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className="block py-2 text-gray-700 hover:text-primary-600 font-medium transition-colors"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <Link
                                to="/login"
                                className="block w-full text-center px-6 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-all"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Login
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div
                        className="absolute top-20 right-10 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"
                        style={{ transform: `translateY(${scrollY * 0.2}px)` }}
                    />
                    <div
                        className="absolute top-40 left-10 w-72 h-72 bg-success-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"
                        style={{ transform: `translateY(${scrollY * 0.3}px)` }}
                    />
                    <div
                        className="absolute bottom-20 right-1/3 w-72 h-72 bg-info-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"
                        style={{ transform: `translateY(${scrollY * 0.15}px)` }}
                    />
                </div>

                <div className="max-w-7xl mx-auto relative">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8 animate-fade-in-up">
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                                <Award className="w-4 h-4" />
                                Institute of Environmental Professionals Sri Lanka
                            </div>

                            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                Professional
                                <span className="block text-primary-600 mt-2">Membership</span>
                                <span className="block mt-2">Management</span>
                            </h1>

                            <p className="text-xl text-gray-600 leading-relaxed">
                                A comprehensive digital platform for managing environmental professionals'
                                memberships with enterprise-grade security and seamless user experience.
                            </p>

                            <div className="flex flex-wrap gap-4">
                                {(() => {
                                    const userStr = localStorage.getItem('user');
                                    let showContinue = false;
                                    let nextStep = 2;

                                    if (userStr) {
                                        try {
                                            const user = JSON.parse(userStr);
                                            // Check if member and pending
                                            if (user.userType === 'member' && user.status === 'pending') {
                                                const currentStep = user.currentStep || 1;
                                                // If registration complete (8 steps), don't show continue, standard login logic applies
                                                if (currentStep < 8) {
                                                    showContinue = true;
                                                    nextStep = currentStep + 1;
                                                }
                                            }
                                        } catch (e) {
                                            console.error('Error parsing user', e);
                                        }
                                    }

                                    return showContinue ? (
                                        <Link
                                            to={`/registration/step${nextStep}`}
                                            className="group px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all duration-300 hover:shadow-xl hover:shadow-primary-200 flex items-center gap-2"
                                        >
                                            Continue Registration
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    ) : (
                                        <Link
                                            to="/register"
                                            className="group px-8 py-4 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition-all duration-300 hover:shadow-xl hover:shadow-primary-200 flex items-center gap-2"
                                        >
                                            Get Started
                                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </Link>
                                    );
                                })()}

                                <Link
                                    to="/login"
                                    className="px-8 py-4 bg-white text-gray-900 rounded-lg font-semibold border-2 border-gray-200 hover:border-primary-600 hover:text-primary-600 transition-all duration-300"
                                >
                                    Member Login
                                </Link>
                            </div>
                        </div>

                        {/* Animated Membership Card */}
                        <div className="relative animate-fade-in-up animation-delay-200">
                            <div className="relative">
                                <img
                                    src={membershipCard}
                                    alt="IEPSL Membership Card"
                                    className="w-full max-w-lg mx-auto animate-float drop-shadow-2xl"
                                />
                            </div>

                            {/* Floating Stats */}
                            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100 animate-float animation-delay-2000">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-success-100 rounded-lg flex items-center justify-center">
                                        <Users className="w-5 h-5 text-success-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">500+</p>
                                        <p className="text-xs text-gray-600">Active Members</p>
                                    </div>
                                </div>
                            </div>

                            <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100 animate-float animation-delay-4000">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                                        <Award className="w-5 h-5 text-primary-600" />
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">100%</p>
                                        <p className="text-xs text-gray-600">Digital</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 animate-fade-in-up">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">
                            Powerful Features for Modern Management
                        </h2>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            Everything you need to manage professional memberships efficiently and securely
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <div
                                    key={index}
                                    className="group p-8 bg-gray-50 rounded-xl hover:bg-white hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200 animate-fade-in-up"
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className="w-14 h-14 bg-primary-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-600 transition-colors duration-300">
                                        <Icon className="w-7 h-7 text-primary-600 group-hover:text-white transition-colors duration-300" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600">
                                        {feature.description}
                                    </p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 bg-gradient-to-r from-primary-600 to-primary-700">
                <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
                    <h2 className="text-4xl font-bold text-white mb-6">
                        Ready to Join IEPSL?
                    </h2>
                    <p className="text-xl text-primary-100 mb-8">
                        Start your professional membership journey today and connect with
                        environmental professionals across Sri Lanka.
                    </p>
                    <div className="flex flex-wrap gap-4 justify-center">
                        <Link
                            to="/register"
                            className="group px-8 py-4 bg-white text-primary-600 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 hover:shadow-xl flex items-center gap-2"
                        >
                            Register Now
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link
                            to="/login"
                            className="px-8 py-4 bg-primary-800 text-white rounded-lg font-semibold hover:bg-primary-900 transition-all duration-300"
                        >
                            Login to Portal
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-gray-400 py-12 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="IEPSL Logo" className="h-10 w-auto" />
                            <div>
                                <span className="text-xl font-bold text-white">IEPSL</span>
                                <p className="text-sm">Institute of Environmental Professionals Sri Lanka</p>
                            </div>
                        </div>
                        <div className="flex gap-8">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    {link.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-gray-800 text-center">
                        <p className="text-sm">© 2026 IEPSL. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}
