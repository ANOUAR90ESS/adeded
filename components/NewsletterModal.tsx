import React, { useState, useEffect } from 'react';
import { X, Mail, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { supabase, isSupabaseConfigured } from '../services/supabase';

interface NewsletterModalProps {
  delay?: number; // Delay in milliseconds before showing modal
}

const NewsletterModal: React.FC<NewsletterModalProps> = ({ delay = 5000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    'AI Tools',
    'Machine Learning',
    'Content Creation',
    'Development',
    'Design',
    'Marketing',
    'Productivity',
    'Data Science'
  ];

  useEffect(() => {
    // Check if user has already subscribed or dismissed
    const hasSubscribed = localStorage.getItem('newsletterSubscribed');
    const hasDismissed = localStorage.getItem('newsletterDismissed');

    if (!hasSubscribed && !hasDismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [delay]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isSupabaseConfigured && supabase) {
        // Save to Supabase
        const { error } = await supabase
          .from('newsletter_subscribers')
          .insert([
            {
              email: email.trim(),
              categories: selectedCategories,
              subscribed_at: new Date().toISOString()
            }
          ]);

        if (error) {
          // Check if email already exists
          if (error.code === '23505') {
            toast.info('You are already subscribed!');
          } else {
            throw error;
          }
        } else {
          toast.success('🎉 Successfully subscribed to our newsletter!');
        }
      } else {
        // Fallback: Just save to localStorage if no DB
        console.log('Newsletter subscription:', { email, categories: selectedCategories });
        toast.success('🎉 Successfully subscribed! (Demo mode - no DB)');
      }

      localStorage.setItem('newsletterSubscribed', 'true');
      setIsVisible(false);
    } catch (error: any) {
      console.error('Newsletter subscription error:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem('newsletterDismissed', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-gradient-to-br from-zinc-900 to-black border-2 border-orange-500/50 rounded-3xl max-w-lg w-full p-8 shadow-2xl relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl"></div>

        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors z-10"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 rounded-full mb-4">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span className="text-orange-500 font-semibold text-sm">150K+ Subscribers</span>
        </div>

        {/* Header */}
        <h2 className="text-3xl font-bold text-white mb-3 relative z-10">
          Hack Future with VETORRE
        </h2>

        <p className="text-zinc-300 mb-6 leading-relaxed relative z-10">
          Choose Your Industry To Get Instant Access To Customized Tools, Tutorials, And Our Daily 5-Minute AI Digest - All Free In Your Inbox.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-orange-500 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full pl-12 pr-4 py-3.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 transition-colors"
              required
            />
          </div>

          {/* Categories Dropdown */}
          <div className="relative">
            <select
              multiple
              className="w-full px-4 py-3.5 bg-zinc-800/50 border border-zinc-700 rounded-xl text-white focus:outline-none focus:border-orange-500 transition-colors appearance-none cursor-pointer"
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setSelectedCategories(selected);
              }}
              size={4}
            >
              <option value="" disabled className="text-zinc-500">
                Select Your Favorite Categories
              </option>
              {categories.map(category => (
                <option
                  key={category}
                  value={category}
                  className="py-2 hover:bg-orange-500/20"
                >
                  {selectedCategories.includes(category) ? '✓ ' : ''}{category}
                </option>
              ))}
            </select>
            <p className="text-xs text-zinc-500 mt-1">
              Hold Ctrl/Cmd to select multiple categories
            </p>
          </div>

          {/* Selected Categories Display */}
          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map(category => (
                <span
                  key={category}
                  className="px-3 py-1 bg-orange-500/20 text-orange-500 rounded-full text-sm flex items-center gap-2"
                >
                  {category}
                  <button
                    type="button"
                    onClick={() => handleCategoryToggle(category)}
                    className="hover:text-orange-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-4 bg-orange-500 text-black font-bold rounded-xl hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
          >
            {isSubmitting ? 'Subscribing...' : 'Get Free Resources'}
          </button>

          {/* Privacy Note */}
          <p className="text-center text-sm text-orange-500/80">
            We respect your inbox — 100% value, 0% spam.
          </p>
        </form>
      </div>
    </div>
  );
};

export default NewsletterModal;
