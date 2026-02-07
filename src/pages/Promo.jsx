import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { client, urlFor } from '../sanity/client';
import { supabase } from '../lib/supabase';
import { Rating } from 'react-simple-star-rating'
import SEO from '../components/SEO';
import FlickeringTitle from '../components/FlickeringTitle';
import logo from '../assets/images/logos/Isotipo2.png';

const Promo = () => {
    const { slug } = useParams();
    const [release, setRelease] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Form State
    const [rating, setRating] = useState(0);
    const [name, setName] = useState('');
    const [feedback, setFeedback] = useState('');
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');


    useEffect(() => {
        const fetchRelease = async () => {
            try {
                const query = `*[_type == "release" && slug.current == $slug][0]{
                    title,
                    promoActive,
                    promoDescription,
                    downloadLink,
                    "audioUrl": audioPreview.asset->url,
                    cover,
                    artist->{name}
                }`;
                const result = await client.fetch(query, { slug });

                if (!result) throw new Error("Release not found");
                if (!result.promoActive) throw new Error("This promo is not currently active.");

                setRelease(result);
            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (slug) fetchRelease();
    }, [slug]);


    const handleRating = (rate) => {
        setRating(rate);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');

        if (rating === 0) {
            setSubmitError("Please provide a rating.");
            return;
        }
        if (name.trim().length < 2) {
            setSubmitError("Please enter your name.");
            return;
        }
        if (feedback.trim().length < 5) {
            setSubmitError("Please provide a bit more feedback.");
            return;
        }

        setIsSubmitting(true);

        try {
            const { error } = await supabase
                .from('promo_feedback')
                .insert([{
                    release_slug: slug,
                    name: name,
                    rating: rating,
                    feedback: feedback,
                    email: email || null // Optional
                }]);

            if (error) throw error;

            setIsSubmitted(true);
        } catch (err) {
            console.error("Error submitting feedback:", err);
            setSubmitError("Failed to submit feedback. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };


    if (loading) return <div className="min-h-screen bg-black text-white flex items-center justify-center font-zen animate-pulse">Loading Promo...</div>;

    if (error) return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-10 text-center">
            <h1 className="text-3xl text-pink-500 font-bold mb-4 font-zen">Oops!</h1>
            <p className="text-zinc-400">{error}</p>
            <Link to="/" className="mt-8 text-white underline hover:text-pink-400">Back to Home</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white font-sans-custom relative overflow-hidden flex flex-col items-center justify-center">
            <SEO title={`Promo: ${release.title}`} description="Exclusive Promo Download" />

            {/* Background */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-purple-900/20 via-black to-black animate-pulse-slow" />

            <div className="relative z-10 w-full max-w-5xl px-6 py-12 md:py-20 flex flex-col items-center">

                <img src={logo} alt="Moonkat Logo" className="w-16 mb-8 opacity-80 hover:opacity-100 transition-opacity duration-300" />

                <FlickeringTitle text="PROMO DOWNLOAD" className="text-2xl md:text-5xl mb-12 tracking-widest text-center" />

                <div className="w-full bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-6 md:p-12 flex flex-col md:flex-row gap-10 md:gap-16 shadow-2xl">

                    {/* Left: Cover & Audio */}
                    <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
                        <div className="relative w-full aspect-square max-w-[320px] rounded-2xl overflow-hidden shadow-2xl mb-8 border border-white/10 group">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10" />
                            <img
                                src={urlFor(release.cover).width(800).url()}
                                alt={release.title}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                        </div>

                        <h2 className="text-3xl font-bold text-white uppercase tracking-wider mb-2 leading-none">{release.title}</h2>
                        <h3 className="text-pink-400 text-xl font-bebas tracking-wide mb-8">{release.artist?.name}</h3>

                        {release.audioUrl && (
                            <div className="w-full bg-black/40 p-5 rounded-xl border border-white/5 mb-6">
                                <p className="text-xs text-zinc-500 mb-3 uppercase tracking-widest font-bold">Preview Track</p>
                                <audio controls className="w-full h-10 custom-audio focus:outline-none">
                                    <source src={release.audioUrl} type="audio/mpeg" />
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                        )}

                        {release.promoDescription && (
                            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm border-l-2 border-pink-500/30 pl-4 italic">
                                "{release.promoDescription}"
                            </p>
                        )}
                    </div>

                    {/* Right: Feedback Form / Download */}
                    <div className="flex-1 border-t md:border-t-0 md:border-l border-white/10 pt-10 md:pt-0 md:pl-10 flex flex-col justify-center">

                        {!isSubmitted ? (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                                <div className="text-center md:text-left mb-2">
                                    <h3 className="text-2xl font-bold text-white mb-2">Unlock Download</h3>
                                    <p className="text-zinc-400 text-sm">Rate & review to access the file.</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-xs uppercase tracking-widest text-zinc-500 font-bold">Rating</label>
                                    <div className="flex justify-center md:justify-start">
                                        <Rating
                                            onClick={handleRating}
                                            initialValue={rating}
                                            size={35}
                                            fillColor="#ec4899"
                                            emptyColor="#27272a"
                                            SVGclassName="inline-block hover:scale-110 transition-transform duration-200"
                                            transition
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="name" className="block text-xs uppercase tracking-widest text-zinc-500 font-bold">Name <span className="text-pink-500">*</span></label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Your Name / Artist Name"
                                        className="w-full bg-black/40 border border-zinc-700/50 rounded-xl p-3 text-white placeholder-zinc-600 focus:border-pink-500 focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all text-sm"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="feedback" className="block text-xs uppercase tracking-widest text-zinc-500 font-bold">Feedback <span className="text-pink-500">*</span></label>
                                    <textarea
                                        id="feedback"
                                        rows="4"
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="What's the vibe? Mix quality? Fav part?"
                                        className="w-full bg-black/40 border border-zinc-700/50 rounded-xl p-4 text-white placeholder-zinc-600 focus:border-pink-500 focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all text-sm leading-relaxed"
                                    ></textarea>
                                </div>

                                <div className="space-y-2">
                                    <label htmlFor="email" className="block text-xs uppercase tracking-widest text-zinc-500 font-bold">Email (Optional)</label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="your@email.com"
                                        className="w-full bg-black/40 border border-zinc-700/50 rounded-xl p-3 text-white placeholder-zinc-600 focus:border-pink-500 focus:bg-black/60 focus:outline-none focus:ring-1 focus:ring-pink-500 transition-all text-sm"
                                    />
                                </div>

                                {submitError && (
                                    <div className="bg-red-900/20 border-l-2 border-red-500 p-3 rounded-r text-red-200 text-xs">
                                        {submitError}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full py-4 mt-4 bg-white text-black font-bold uppercase tracking-widest hover:bg-pink-500 hover:text-white hover:shadow-[0_0_20px_rgba(236,72,153,0.5)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : (
                                        'Submit & Unlock'
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center animate-fade-in-up py-10">
                                <div className="w-20 h-20 bg-green-500/10 border border-green-500/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
                                    <span className="text-4xl">🔓</span>
                                </div>
                                <h3 className="text-3xl font-bold text-white mb-2 tracking-tight">Access Granted</h3>
                                <p className="text-zinc-400 mb-10 max-w-xs text-sm">Thanks for your feedback! Here is your exclusive download.</p>

                                <a
                                    href={release.downloadLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full py-5 bg-pink-600 text-white font-bold uppercase tracking-widest hover:bg-pink-500 hover:scale-105 transition-all duration-300 rounded-xl shadow-[0_0_30px_rgba(236,72,153,0.6)] flex items-center justify-center gap-3 group"
                                >
                                    <span>Download File</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-y-1 transition-transform" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </a>
                                <p className="text-xs text-zinc-600 mt-6 border-t border-white/5 pt-4 w-full">
                                    Link opens in a new tab. Please do not share this link.
                                </p>
                            </div>
                        )}

                    </div>
                </div>

                <footer className="mt-20 text-zinc-600 text-xs uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity">
                    &copy; {new Date().getFullYear()} Moonkat Records
                </footer>
            </div>
        </div>
    );
};

export default Promo;
