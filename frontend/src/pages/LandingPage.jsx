import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-5">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800">
              <span className="text-blue-600">Invoice</span> Sathi
            </h1>
            <div className="space-x-6">
              <Link
                to="/login"
                className="px-6 py-2.5 text-gray-600 hover:text-blue-600 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-6 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-200"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6">
        {/* Hero Section - Updated with new layout */}
        <div className="flex flex-col-reverse md:flex-row items-center justify-between py-24 gap-12">
          <div className="flex-1 text-left">
            <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Modern Invoicing for the
              <span className="text-blue-600 block">Digital Age</span>
            </h2>
            <p className="text-xl text-gray-600 mb-10">
              Transform your billing process with our intelligent invoicing
              solution. Designed for modern businesses, built for efficiency.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/register"
                className="px-8 py-4 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all text-lg font-semibold text-center hover:shadow-lg hover:shadow-blue-200"
              >
                Register
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 border-2 border-blue-600 text-blue-600 rounded-full hover:bg-blue-50 transition-all text-lg font-semibold text-center"
              >
                Login
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-full h-96 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl shadow-xl"></div>
          </div>
        </div>

        {/* Features Section - Redesigned */}
        <div className="py-24">
          <h3 className="text-4xl font-bold text-center mb-16">
            Everything you need to manage invoices
          </h3>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "Smart Automation",
                description:
                  "Automate recurring invoices and payment reminders",
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
              },
              {
                title: "Beautiful Templates",
                description:
                  "Professional templates that make your brand shine",
                icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2",
              },
              {
                title: "Bank-Grade Security",
                description:
                  "Your financial data is protected with the highest security standards",
                icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <svg
                    className="w-7 h-7 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d={feature.icon}
                    />
                  </svg>
                </div>
                <h4 className="text-2xl font-semibold mb-4">{feature.title}</h4>
                <p className="text-gray-600 text-lg">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section - Updated design */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-16 my-24">
          <div className="relative z-10">
            <h3 className="text-4xl font-bold text-white mb-8 max-w-2xl">
              Ready to transform your invoicing process?
            </h3>
            <p className="text-blue-100 mb-10 text-xl max-w-2xl">
              Join over 10,000+ businesses that trust Invoice Sathi for their
              invoicing needs
            </p>
            <Link
              to="/register"
              className="inline-block px-8 py-4 bg-white text-blue-600 rounded-full hover:shadow-xl transition-all text-lg font-semibold hover:bg-gray-50"
            >
              Get Started Free
            </Link>
          </div>
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-indigo-500/20 to-transparent"></div>
        </div>
      </main>

      {/* Simplified & Modern Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Main Footer Content */}
          <div className="flex flex-col md:flex-row justify-between items-start gap-12">
            {/* Brand Section */}
            <div className="max-w-sm">
              <h2 className="text-2xl font-bold text-gray-900">
                <span className="text-blue-600">Invoice</span> Sathi
              </h2>
              <p className="mt-4 text-gray-600">
                Simplifying invoicing for modern businesses. Get started today
                and experience the difference.
              </p>
              <div className="flex gap-6 mt-6">
                <a
                  href="#"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-12">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Product</h3>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Features
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      API
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      About
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Blog
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Careers
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
                <ul className="space-y-3">
                  <li>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Contact
                    </a>
                  </li>
                  <li>
                    <a
                      href="#"
                      className="text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      Privacy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-100 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} Invoice Sathi. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Terms
              </a>
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
