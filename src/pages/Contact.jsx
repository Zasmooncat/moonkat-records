import React, { useState, useRef } from 'react';
import FlickeringTitle from '../components/FlickeringTitle';
import { HiCheckCircle, HiExclamationCircle } from 'react-icons/hi';

const INQUIRY_TYPES = [
  { value: 'demos',   label: 'Demos',   icon: '🎵', desc: 'Submit your tracks' },
  { value: 'booking', label: 'Booking', icon: '🎤', desc: 'Live shows & events' },
  { value: 'press',   label: 'Press',   icon: '📰', desc: 'Media & interviews' },
  { value: 'general', label: 'General', icon: '💬', desc: 'Everything else' },
];

const MAX_CHARS = 2000;
const MIN_CHARS = 10;

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    inquiry_type: 'general',
    message: '',
  });
  const [honeypot, setHoneypot] = useState(''); // hidden field, must stay empty
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error'
  const [submitMessage, setSubmitMessage] = useState('');
  const formRef = useRef(null);

  const charCount = formData.message.length;
  const charPct = Math.min((charCount / MAX_CHARS) * 100, 100);

  // Determine char counter color
  const charColor =
    charCount < MIN_CHARS
      ? 'text-zinc-500'
      : charCount > MAX_CHARS * 0.9
      ? 'text-red-400'
      : charCount > MAX_CHARS * 0.75
      ? 'text-amber-400'
      : 'text-emerald-400';

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required.';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }
    if (formData.message.trim().length < MIN_CHARS) {
      newErrors.message = `Message must be at least ${MIN_CHARS} characters.`;
    }
    if (formData.message.trim().length > MAX_CHARS) {
      newErrors.message = `Message cannot exceed ${MAX_CHARS} characters.`;
    }
    return newErrors;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const res = await fetch(
        `${SUPABASE_URL}/functions/v1/send-contact-form`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, honeypot }),
        }
      );

      const data = await res.json();

      if (data.success) {
        setSubmitStatus('success');
        setSubmitMessage("Message sent! We'll get back to you within 2–5 business days. Check your inbox for a confirmation.");
        setFormData({ name: '', email: '', inquiry_type: 'general', message: '' });
        setErrors({});
      } else {
        setSubmitStatus('error');
        setSubmitMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      setSubmitStatus('error');
      setSubmitMessage('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="relative min-h-screen border-t border-white/10 px-6 py-20 flex flex-col items-center justify-center bg-zinc-900 overflow-hidden"
    >
      {/* Background ambient glow */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-800/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Title */}
        <FlickeringTitle
          text="CONTACT"
          className="text-5xl md:text-8xl mb-4 tracking-widest justify-center"
        />
        <p className="text-center text-zinc-400 mb-12 font-mono text-sm tracking-widest uppercase">
          For demos, booking, press &amp; general inquiries
        </p>

        {/* ===== SUCCESS STATE ===== */}
        {submitStatus === 'success' ? (
          <div className="flex flex-col items-center justify-center gap-6 py-16 text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-xl animate-pulse" />
              <HiCheckCircle className="relative text-emerald-400 w-20 h-20" />
            </div>
            <h3 className="text-2xl font-bold text-white tracking-wide">Message Sent!</h3>
            <p className="text-zinc-300 max-w-md leading-relaxed text-sm">{submitMessage}</p>
            <button
              onClick={() => setSubmitStatus(null)}
              className="boton-elegante mt-4"
            >
              Send another message
            </button>
          </div>
        ) : (
          /* ===== FORM ===== */
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-6"
          >
            {/* ── Inquiry Type Selector ── */}
            <div>
              <label className="block text-xs font-bold tracking-[0.15em] uppercase text-zinc-400 mb-3">
                Type of Inquiry
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {INQUIRY_TYPES.map((type) => {
                  const active = formData.inquiry_type === type.value;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleChange('inquiry_type', type.value)}
                      className={`
                        flex flex-col items-center gap-1 py-3 px-2 rounded-lg border text-xs font-semibold tracking-wider uppercase transition-all duration-200
                        ${active
                          ? 'border-violet-500 bg-violet-500/10 text-violet-300 shadow-[0_0_16px_rgba(139,92,246,0.25)]'
                          : 'border-white/10 bg-zinc-800/60 text-zinc-500 hover:border-white/25 hover:text-zinc-300'
                        }
                      `}
                    >
                      
                      <span>{type.label}</span>
                      <span className={`text-[10px] font-normal tracking-normal normal-case ${active ? 'text-violet-400' : 'text-zinc-600'}`}>
                        {type.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Name & Email row ── */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-name" className="block text-xs font-bold tracking-[0.15em] uppercase text-zinc-400 mb-2">
                  Name *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  autoComplete="name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Your name"
                  className={`
                    w-full px-4 py-3 bg-zinc-800 text-white rounded-lg border text-sm
                    focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200
                    ${errors.name ? 'border-red-500/70' : 'border-zinc-700 focus:border-violet-500'}
                  `}
                />
                {errors.name && (
                  <p className="mt-1.5 text-red-400 text-xs flex items-center gap-1">
                    <HiExclamationCircle className="shrink-0" /> {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="contact-email" className="block text-xs font-bold tracking-[0.15em] uppercase text-zinc-400 mb-2">
                  Email *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="your@email.com"
                  className={`
                    w-full px-4 py-3 bg-zinc-800 text-white rounded-lg border text-sm
                    focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200
                    ${errors.email ? 'border-red-500/70' : 'border-zinc-700 focus:border-violet-500'}
                  `}
                />
                {errors.email && (
                  <p className="mt-1.5 text-red-400 text-xs flex items-center gap-1">
                    <HiExclamationCircle className="shrink-0" /> {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* ── Message ── */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="contact-message" className="text-xs font-bold tracking-[0.15em] uppercase text-zinc-400">
                  Message *
                </label>
                <span className={`text-xs font-mono transition-colors duration-200 ${charColor}`}>
                  {charCount} / {MAX_CHARS}
                </span>
              </div>
              <div className="relative">
                <textarea
                  id="contact-message"
                  rows={6}
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="Tell us what's on your mind..."
                  maxLength={MAX_CHARS}
                  className={`
                    w-full px-4 py-3 bg-zinc-800 text-white rounded-lg border text-sm resize-none
                    focus:outline-none focus:ring-2 focus:ring-violet-500/50 transition-all duration-200
                    ${errors.message ? 'border-red-500/70' : 'border-zinc-700 focus:border-violet-500'}
                  `}
                />
                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-[2px] rounded-b-lg overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      charCount > MAX_CHARS * 0.9 ? 'bg-red-500' :
                      charCount > MAX_CHARS * 0.75 ? 'bg-amber-400' :
                      charCount >= MIN_CHARS ? 'bg-emerald-400' : 'bg-zinc-600'
                    }`}
                    style={{ width: `${charPct}%` }}
                  />
                </div>
              </div>
              {errors.message && (
                <p className="mt-1.5 text-red-400 text-xs flex items-center gap-1">
                  <HiExclamationCircle className="shrink-0" /> {errors.message}
                </p>
              )}
            </div>

            {/* ── Honeypot (invisible to users, bots fill it) ── */}
            <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }}>
              <label htmlFor="contact-website">Website</label>
              <input
                id="contact-website"
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
              />
            </div>

            {/* ── Error banner ── */}
            {submitStatus === 'error' && (
              <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-3">
                <HiExclamationCircle className="text-red-400 w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm leading-relaxed">{submitMessage}</p>
              </div>
            )}

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="boton-elegante w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Sending...
                </>
              ) : (
                'Send Message →'
              )}
            </button>

            {/* ── Footnote ── */}
            <p className="text-center text-zinc-600 text-xs font-mono tracking-wider">
              We'll reply within 2–5 business days · moonkatrecords@gmail.com
            </p>
          </form>
        )}
      </div>
    </section>
  );
}