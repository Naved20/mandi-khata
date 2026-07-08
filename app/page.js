'use client';

import Image from 'next/image';
import Link from 'next/link';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 relative">
                <Image
                  src="/logo01.png"
                  alt="Mandi Khata"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                  unoptimized
                />
              </div>
              <span className="text-xl font-bold text-gray-900">Mandi Khata</span>
            </div>

            {/* Menu */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-gray-600 hover:text-green-700 transition">
                Features
              </a>
              <a href="#pricing" className="text-sm text-gray-600 hover:text-green-700 transition">
                Pricing
              </a>
              <a href="#about" className="text-sm text-gray-600 hover:text-green-700 transition">
                About
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-green-700 transition"
              >
                Login
              </Link>
              <Link
                href="/login"
                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-medium hover:shadow-lg transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Har Len-Den Ka<br />
              <span className="bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                Digital Hisab
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Manage all Udhar, Jama, Kisan Accounts, Mandi Transactions and Reports from one place. The complete digital solution for your agricultural business.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link
                href="/login"
                className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-xl transition transform hover:scale-105"
              >
                Get Started Now
              </Link>
              <button className="px-8 py-4 bg-white text-green-600 border-2 border-gray-200 rounded-lg font-semibold hover:border-green-600 transition">
                Watch Demo
              </button>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative h-96 md:h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl opacity-50"></div>
            <div className="relative w-full h-full flex items-center justify-center p-8">
              <div className="text-center text-gray-400">
                <p className="text-lg">Dashboard Preview Coming Soon</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Powerful Features</h2>
            <p className="text-xl text-gray-600">Everything you need to manage your mandi business</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: '📊',
                title: 'Digital Khata',
                description: 'Complete digital record keeping for all transactions and accounts'
              },
              {
                icon: '💰',
                title: 'Udhar Management',
                description: 'Track and manage all credit transactions with ease'
              },
              {
                icon: '👥',
                title: 'Customer Management',
                description: 'Maintain detailed records of all customers and traders'
              },
              {
                icon: '📈',
                title: 'Profit Analysis',
                description: 'Get detailed insights into your business profitability'
              },
              {
                icon: '📱',
                title: 'Multi-Device Sync',
                description: 'Access your data from any device, anywhere, anytime'
              },
              {
                icon: '🔒',
                title: 'Data Security',
                description: '100% secure cloud backup with enterprise-grade encryption'
              }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 bg-gray-50 rounded-2xl hover:shadow-lg transition">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section id="about" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-16 text-center">Why Choose Mandi Khata?</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                title: '100% Secure',
                description: 'Enterprise-grade security with cloud backup to keep your data safe'
              },
              {
                title: 'Easy to Use',
                description: 'Simple and intuitive interface designed for mandi traders'
              },
              {
                title: 'Made for India',
                description: 'Built specifically for Indian agricultural business needs'
              },
              {
                title: 'Premium Support',
                description: 'Dedicated support team available to help you anytime'
              }
            ].map((item, idx) => (
              <div key={idx} className="p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition">
                <h3 className="text-2xl font-bold text-green-600 mb-4">{item.title}</h3>
                <p className="text-gray-600 text-lg">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that works best for you</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: '₹499',
                period: '/month',
                features: ['Up to 100 transactions', 'Basic reporting', 'Email support'],
                highlighted: false
              },
              {
                name: 'Pro',
                price: '₹999',
                period: '/month',
                features: ['Unlimited transactions', 'Advanced analytics', 'Priority support', 'GST ready'],
                highlighted: true
              },
              {
                name: 'Business',
                price: '₹1,999',
                period: '/month',
                features: ['Everything in Pro', 'Multi-user access', 'API access', 'Dedicated support'],
                highlighted: false
              }
            ].map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-2xl p-8 transition transform hover:scale-105 ${
                  plan.highlighted
                    ? 'bg-gradient-to-br from-green-600 to-emerald-600 text-white shadow-xl'
                    : 'bg-white border border-gray-100 text-gray-900'
                }`}
              >
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-6">
                  {plan.price}
                  <span className={`text-lg ${plan.highlighted ? 'text-white' : 'text-gray-600'}`}>
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, fidx) => (
                    <li key={fidx} className="flex items-center gap-2">
                      <span>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-lg font-semibold transition ${
                    plan.highlighted
                      ? 'bg-white text-green-600 hover:bg-gray-100'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-600 py-16 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-6">Ready to go digital?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of mandi traders using Mandi Khata to manage their business
          </p>
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-white text-green-600 rounded-lg font-semibold hover:shadow-xl transition transform hover:scale-105"
          >
            Start Your Free Trial Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">Mandi Khata</h4>
              <p className="text-sm">Complete digital solution for mandi business</p>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#contact" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Quick Links</h4>
              <ul className="text-sm space-y-2">
                <li><a href="#about" className="hover:text-white transition">About</a></li>
                <li><a href="#features" className="hover:text-white transition">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Contact Us</h4>
              <ul className="text-sm space-y-2">
                <li><a href="tel:8878502349" className="hover:text-white transition">Call: 8878502349</a></li>
                <li><a href="https://wa.me/918878502349" target="_blank" rel="noopener noreferrer" className="hover:text-white transition">WhatsApp: 8878502349</a></li>
                <li><a href="mailto:naved2010m@gmail.com" className="hover:text-white transition">Email: naved2010m@gmail.com</a></li>
              </ul>
            </div>
          </div>
          
          {/* Contact Section */}
          <div id="contact" className="border-t border-gray-800 pt-8 mb-8">
            <div className="bg-gray-800 rounded-xl p-6 mb-8">
              <div className="text-center">
                <h3 className="text-white font-bold text-lg mb-4">Get in Touch</h3>
                <p className="text-gray-400 mb-6">Have questions? We're here to help!</p>
                <div className="grid md:grid-cols-3 gap-4">
                  <a 
                    href="tel:8878502349"
                    className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                  >
                    Call Now
                  </a>
                  <a 
                    href="https://wa.me/918878502349"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                  >
                    WhatsApp
                  </a>
                  <a 
                    href="mailto:naved2010m@gmail.com"
                    className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
                  >
                    Email Us
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="text-center mb-6">
              <p className="text-white font-semibold mb-2">MD Naved Mansoori</p>
              <p className="text-sm text-gray-500">Founder & Developer</p>
            </div>
            <p className="text-center text-sm">
              © 2024 Mandi Khata. All rights reserved. Made with love for Indian mandi traders.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
