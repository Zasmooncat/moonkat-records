import { useState } from 'react';
import { client, urlFor } from '../sanity/client';
import { supabase } from '../lib/supabase';
import FlickeringTitle from '../components/FlickeringTitle';

const SecretSender = () => {
    const [adminKey, setAdminKey] = useState('');
    const [mode, setMode] = useState('release'); // 'release' | 'newsletter'

    // Release Mode State
    const [slug, setSlug] = useState('');
    const [release, setRelease] = useState(null);

    // Newsletter Mode State
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');

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
        if (!adminKey) {
            alert("Please enter the Admin Key.");
            return;
        }

        let bodyPayload = { adminKey, type: mode };

        if (mode === 'release') {
            if (!release) return;
            if (!confirm(`⚠️ RELEASE CAMPAIGN\n\nSend "${release.title}" to ALL subscribers?`)) return;

            bodyPayload.releaseData = {
                title: release.title,
                artist: release.artistName,
                coverUrl: urlFor(release.cover).width(600).url(),
                promoUrl: `https://moonkatrecords.com/promo/${slug}`,
                description: release.promoDescription || "New release out now on Moonkat Records."
            };
        } else {
            if (!subject || !content) {
                alert("Subject and Content are required.");
                return;
            }
            if (!confirm(`⚠️ NEWSLETTER CAMPAIGN\n\nSubject: "${subject}"\n\nSend to ALL subscribers?`)) return;

            bodyPayload.newsletterData = {
                subject,
                content,
                imageUrl // Optional
            };
        }

        setSending(true);
        setLogs(prev => [...prev, `🚀 Starting ${mode.toUpperCase()} campaign...`]);

        try {
            const { data, error } = await supabase.functions.invoke('send-promo-campaign', {
                body: bodyPayload
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
            <div className="max-w-4xl mx-auto">
                <FlickeringTitle text="SECRET SENDER" className="text-4xl text-red-500 mb-10 tracking-widest" />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

                    {/* LEFT: Controls */}
                    <div className="space-y-6">

                        {/* 0. Mode Selector */}
                        <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                            <button
                                onClick={() => setMode('release')}
                                className={`flex-1 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${mode === 'release' ? 'bg-pink-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                            >
                                Promo Release
                            </button>
                            <button
                                onClick={() => setMode('newsletter')}
                                className={`flex-1 py-2 rounded-lg font-bold text-sm uppercase tracking-wider transition-all ${mode === 'newsletter' ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}
                            >
                                Newsletter
                            </button>
                        </div>

                        {/* 1. Admin Key */}
                        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800">
                            <label className="block text-xs uppercase text-zinc-500 mb-2">Admin Key</label>
                            <input
                                type="password"
                                value={adminKey}
                                onChange={(e) => setAdminKey(e.target.value)}
                                className="w-full bg-black border border-zinc-700 p-3 rounded text-white font-mono focus:border-white outline-none"
                                placeholder="Enter secret key..."
                            />
                        </div>

                        {/* 2. Dynamic Form */}
                        <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-4">

                            {mode === 'release' ? (
                                <>
                                    <label className="block text-xs uppercase text-zinc-500">Release Slug</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                            className="w-full bg-black border border-zinc-700 p-3 rounded text-white font-mono focus:border-pink-500 outline-none"
                                            placeholder="e.g. horizons"
                                        />
                                        <button
                                            onClick={fetchRelease}
                                            disabled={loading}
                                            className="bg-zinc-800 text-white px-4 rounded font-bold hover:bg-zinc-700 disabled:opacity-50"
                                        >
                                            {loading ? '...' : 'Fetch'}
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="block text-xs uppercase text-zinc-500 mb-2">Subject Line</label>
                                        <input
                                            type="text"
                                            value={subject}
                                            onChange={(e) => setSubject(e.target.value)}
                                            className="w-full bg-black border border-zinc-700 p-3 rounded text-white focus:border-blue-500 outline-none"
                                            placeholder="Big news..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase text-zinc-500 mb-2">Image URL (Optional)</label>
                                        <input
                                            type="text"
                                            value={imageUrl}
                                            onChange={(e) => setImageUrl(e.target.value)}
                                            className="w-full bg-black border border-zinc-700 p-3 rounded text-white text-sm font-mono focus:border-blue-500 outline-none"
                                            placeholder="https://..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs uppercase text-zinc-500 mb-2">Content (HTML allowed)</label>
                                        <textarea
                                            rows="8"
                                            value={content}
                                            onChange={(e) => setContent(e.target.value)}
                                            className="w-full bg-black border border-zinc-700 p-3 rounded text-white text-sm leading-relaxed focus:border-blue-500 outline-none resize-none"
                                            placeholder="Write your update here..."
                                        ></textarea>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Action Button */}
                        <button
                            onClick={handleSend}
                            disabled={sending || status === 'success' || (mode === 'release' && !release)}
                            className={`w-full py-6 text-xl font-bold uppercase tracking-widest rounded transition-all
                                ${status === 'success'
                                    ? 'bg-green-600 cursor-default'
                                    : sending
                                        ? 'bg-zinc-700 cursor-not-allowed'
                                        : mode === 'release'
                                            ? 'bg-pink-600 hover:bg-pink-500 hover:shadow-[0_0_30px_rgba(236,72,153,0.4)]'
                                            : 'bg-blue-600 hover:bg-blue-500 hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]'
                                }
                            `}
                        >
                            {sending ? 'SENDING...' : status === 'success' ? 'SENT!' : '🚀 LAUNCH CAMPAIGN'}
                        </button>
                    </div>

                    {/* RIGHT: Preview & Logs */}
                    <div>
                        <div className="bg-white text-black border border-zinc-700 rounded-xl overflow-hidden mb-6 shadow-2xl relative">
                            <div className="bg-zinc-100 p-2 border-b text-xs text-zinc-500 flex justify-between">
                                <span>Email Preview</span>
                                <span>To: subscriber@email.com</span>
                            </div>

                            <div className="p-8 max-h-[500px] overflow-y-auto">
                                <div className="max-w-sm mx-auto text-center">
                                    <img src="https://moonkatrecords.com/moonkat-logo.png" className="w-32 mx-auto mb-8 invert filter grayscale contrast-200" alt="Logo" />

                                    {mode === 'release' ? (
                                        release ? (
                                            <>
                                                <img src={urlFor(release.cover).width(400).url()} className="w-full rounded shadow-xl mb-6" />
                                                <h1 className="text-2xl font-bold uppercase tracking-widest mb-2">{release.title}</h1>
                                                <h2 className="text-pink-600 text-lg mb-6">{release.artistName}</h2>
                                                <p className="text-sm text-zinc-600 leading-relaxed mb-6">Hey [Name],</p>
                                                <p className="text-sm text-zinc-600 italic leading-relaxed mb-8 border-l-2 border-pink-200 pl-4 text-left">
                                                    {release.promoDescription || "No description found."}
                                                </p>
                                                <div className="bg-pink-600 text-white font-bold py-3 px-8 rounded uppercase text-sm inline-block">
                                                    Get Promo
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-zinc-400 py-20 italic">Fetch a release to preview...</div>
                                        )
                                    ) : (
                                        <>
                                            {imageUrl && <img src={imageUrl} className="w-full rounded shadow-xl mb-6" />}
                                            <h1 className="text-xl font-bold mb-6 text-left">{subject || "Subject Line"}</h1>
                                            <div className="text-left text-sm text-zinc-800 leading-relaxed whitespace-pre-wrap">
                                                {content || "Your content will appear here..."}
                                            </div>
                                        </>
                                    )}

                                    <div className="mt-12 pt-6 border-t border-zinc-200 text-xs text-zinc-400">
                                        You received this email because you are a Moonkat Records subscriber.<br />
                                        <span className="underline">Unsubscribe</span>
                                    </div>
                                </div>
                            </div>
                        </div>

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
