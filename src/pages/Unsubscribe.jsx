import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import FlickeringTitle from '../components/FlickeringTitle';
import logo from '../assets/images/logos/Isotipo2.png';

const Unsubscribe = () => {
    const [searchParams] = useSearchParams();
    const id = searchParams.get('id');

    // Status: 'idle' | 'loading' | 'success' | 'error'
    const [status, setStatus] = useState('loading');
    const [message, setMessage] = useState('Processing your request...');

    useEffect(() => {
        const performUnsubscribe = async () => {
            if (!id) {
                setStatus('error');
                setMessage('Invalid link. Please check the URL.');
                return;
            }

            try {
                // We use the RPC function "unsubscribe_user" defined in Supabase
                const { error } = await supabase.rpc('unsubscribe_user', { target_id: id });

                if (error) throw error;

                setStatus('success');
                setMessage('You have been successfully unsubscribed from the promo list.');
            } catch (err) {
                console.error("Unsubscribe error:", err);
                setStatus('error');
                setMessage('Could not process request. You might already be unsubscribed or the link is invalid.');
            }
        };

        performUnsubscribe();
    }, [id]);

    return (
        <div className="min-h-screen bg-black text-white font-sans-custom flex flex-col items-center justify-center p-6 relative overflow-hidden">

            <div className="absolute inset-0 z-0 bg-gradient-to-b from-purple-900/10 to-black pointer-events-none" />

            <div className="relative z-10 w-full max-w-md text-center">
                <Link to="/">
                    <img src={logo} alt="Moonkat Logo" className="w-16 mx-auto mb-8 opacity-80 hover:opacity-100 transition-opacity" />
                </Link>

                <h1 className="text-2xl font-bold uppercase tracking-widest mb-8 text-white">Unsubscribe</h1>

                <div className="bg-zinc-900/80 border border-white/10 p-8 rounded-2xl backdrop-blur-md shadow-2xl">

                    {status === 'loading' && (
                        <div className="flex flex-col items-center animate-pulse">
                            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                            <p className="text-zinc-400 text-sm tracking-wide">Processing...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="animate-fade-in-up">
                            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-green-500 text-3xl">✓</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Unsubscribed</h3>
                            <p className="text-zinc-400 mb-8 text-sm">{message}</p>
                            <Link
                                to="/"
                                className="inline-block w-full py-3 bg-white text-black font-bold uppercase tracking-widest hover:bg-pink-500 hover:text-white transition-all rounded shadow-lg"
                            >
                                Back to Home
                            </Link>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="animate-fade-in-up">
                            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <span className="text-red-500 text-3xl">✕</span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Error</h3>
                            <p className="text-zinc-400 mb-8 text-sm">{message}</p>
                            <Link
                                to="/"
                                className="text-zinc-500 hover:text-white underline text-xs uppercase tracking-widest"
                            >
                                Return to Home
                            </Link>
                        </div>
                    )}

                </div>

                <footer className="mt-12 text-zinc-800 text-xs uppercase tracking-widest">
                    &copy; {new Date().getFullYear()} Moonkat Records
                </footer>
            </div>
        </div>
    );
};

export default Unsubscribe;
