import { useState } from 'react';
import { client, urlFor } from '../sanity/client';
import { supabase } from '../lib/supabase';
import FlickeringTitle from '../components/FlickeringTitle';

const SecretSender = () => {
    const [adminKey, setAdminKey] = useState('');
    const [slug, setSlug] = useState('');
    const [release, setRelease] = useState(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [status, setStatus] = useState(''); // 'idle', 'success', 'error'
    const [logs, setLogs] = useState([]);

    const fetchRelease = async () => {
        if (!slug) return;
        setLoading(true);
        setStatus('');
        setRelease(null);

        try {
            const query = `*[_type == "release" && slug.current == $slug][0]{
                title,
                "artistName": artist->name,
                cover,
                promoDescription
            }`;
            const result = await client.fetch(query, { slug });

            if (result) {
                setRelease(result);
            } else {
                setStatus('error');
                setLogs(prev => [...prev, `❌ Release not found: ${slug}`]);
            }
        } catch (err) {
            console.error(err);
            setStatus('error');
            setLogs(prev => [...prev, `❌ Error fetching release: ${err.message}`]);
        } finally {
            setLoading(false);
        }
    };

    const handleSend = async () => {
        if (!release || !adminKey) return;
        if (!confirm(`⚠️ ARE YOU SURE?\n\nThis will send emails to ALL subscribers for "${release.title}".`)) return;

        setSending(true);
        setLogs(prev => [...prev, `🚀 Starting campaign for: ${release.title}...`]);

        try {
            const { data, error } = await supabase.functions.invoke('send-promo-campaign', {
                body: {
                    adminKey: adminKey,
                    title: release.title,
                    artist: release.artistName,
                    coverUrl: urlFor(release.cover).width(600).url(),
                    promoUrl: `https://moonkatrecords.com/promo/${slug}`,
                    description: release.promoDescription || "New release out now on Moonkat Records."
                }
            });

            if (error) throw error;

            console.log("Function Response:", data);
            setLogs(prev => [...prev, `✅ SUCCESS! ${data.message}`]);
            setStatus('success');

        } catch (err) {
            console.error(err);
            setLogs(prev => [...prev, `🔥 FAILED: ${err.message || "Unknown error"}`]);
            setStatus('error');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans-custom p-6 md:p-20">
            <div className="max-w-3xl mx-auto">
                <FlickeringTitle text="SECRET SENDER" className="text-4xl text-red-500 mb-10 tracking-widest" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                    {/* LEFT: Controls */}
                    <div className="space-y-6">
                        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                            <label className="block text-xs uppercase text-zinc-500 mb-2">1. Admin Key</label>
                            <input
                                type="password"
                                value={adminKey}
                                onChange={(e) => setAdminKey(e.target.value)}
                                className="w-full bg-black border border-zinc-700 p-3 rounded text-white font-mono"
                                placeholder="Enter secret key..."
                            />
                        </div>

                        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                            <label className="block text-xs uppercase text-zinc-500 mb-2">2. Release Slug</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    className="w-full bg-black border border-zinc-700 p-3 rounded text-white font-mono"
                                    placeholder="e.g. horizons"
                                />
                                <button
                                    onClick={fetchRelease}
                                    disabled={loading}
                                    className="bg-white text-black px-4 rounded font-bold hover:bg-zinc-200 disabled:opacity-50"
                                >
                                    {loading ? '...' : 'Fetch'}
                                </button>
                            </div>
                        </div>

                        {release && (
                            <button
                                onClick={handleSend}
                                disabled={sending || status === 'success'}
                                className={`w-full py-6 text-xl font-bold uppercase tracking-widest rounded transition-all
                                    ${status === 'success' ? 'bg-green-600 cursor-default' : 'bg-red-600 hover:bg-red-500 animate-pulse'}
                                `}
                            >
                                {sending ? 'SENDING...' : status === 'success' ? 'SENT!' : '🚀 LAUNCH CAMPAIGN'}
                            </button>
                        )}
                    </div>

                    {/* RIGHT: Preview & Logs */}
                    <div>
                        {release ? (
                            <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-6">
                                <h3 className="text-zinc-500 text-xs uppercase mb-4">Email Preview</h3>
                                <div className="flex gap-4 items-center mb-4">
                                    <img src={urlFor(release.cover).width(100).url()} className="w-20 h-20 rounded shadow" />
                                    <div>
                                        <div className="font-bold text-lg leading-none">{release.title}</div>
                                        <div className="text-pink-500">{release.artistName}</div>
                                    </div>
                                </div>
                                <div className="text-sm text-zinc-400 italic border-l-2 border-zinc-700 pl-3">
                                    "{release.promoDescription || "No description found."}"
                                </div>
                                <div className="mt-4 text-xs text-zinc-600">
                                    Link: <span className="text-blue-400">moonkatrecords.com/promo/{slug}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="h-40 border-2 border-dashed border-zinc-800 rounded-xl flex items-center justify-center text-zinc-600 mb-6">
                                Preview Area
                            </div>
                        )}

                        <div className="bg-black border border-zinc-800 p-4 rounded-xl font-mono text-xs h-60 overflow-y-auto">
                            <h4 className="text-zinc-500 mb-2 sticky top-0 bg-black pb-2 border-b border-zinc-800">System Logs:</h4>
                            {logs.length === 0 && <span className="text-zinc-700">Waiting for actions...</span>}
                            {logs.map((log, i) => (
                                <div key={i} className="mb-1 border-b border-zinc-900 pb-1">{log}</div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default SecretSender;
