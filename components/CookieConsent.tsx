import React, { useState, useEffect } from 'react';
import { X, Cookie } from 'lucide-react';

const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already accepted/rejected cookies
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Show banner after a short delay
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setIsVisible(false);
    // You can add analytics tracking here
    console.log('Cookies accepted');
  };

  const handleReject = () => {
    localStorage.setItem('cookieConsent', 'rejected');
    setIsVisible(false);
    console.log('Cookies rejected');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-zinc-900 border border-orange-500/30 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={handleReject}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cookie Icon */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center">
            <Cookie className="w-6 h-6 text-orange-500" />
          </div>
          <h2 className="text-xl font-bold text-white">Cookie Consent</h2>
        </div>

        {/* Content */}
        <p className="text-zinc-300 mb-4 leading-relaxed">
          We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept", you consent to our use of cookies.
        </p>

        {/* Terms Link */}
        <a
          href="#terms"
          className="text-orange-500 hover:text-orange-400 text-sm underline mb-6 inline-block"
        >
          Read our Terms & Conditions
        </a>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleReject}
            className="flex-1 px-6 py-3 bg-zinc-800 text-white rounded-lg hover:bg-zinc-700 transition-colors border border-zinc-700"
          >
            Reject
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 px-6 py-3 bg-orange-500 text-black font-semibold rounded-lg hover:bg-orange-600 transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
