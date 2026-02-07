import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const Terms = () => {
    return (
        <div className="min-h-screen bg-black text-white p-8 md:p-20 font-sans-custom">
            <SEO
                title="Terms & Conditions"
                description="Privacy Policy and Terms of Conditions for Moonkat Records subscription."
            />

            <div className="max-w-3xl mx-auto">
                <Link to="/" className="text-pink-400 hover:text-white transition-colors mb-10 inline-block">
                    ← Back to Home
                </Link>

                <h1 className="text-4xl md:text-6xl font-bold mb-8 text-pink-500 uppercase tracking-tighter">
                    Terms & Conditions
                </h1>

                <div className="space-y-6 text-lg text-zinc-300 leading-relaxed">
                    <p>
                        <strong>Last Updated: {new Date().toLocaleDateString()}</strong>
                    </p>

                    <p>
                        By subscribing to the Moonkat Records promo list, you acknowledge and agree to the following terms regarding your personal data:
                    </p>

                    <ul className="list-disc pl-6 space-y-2">
                        <li>
                            <strong>Data Collection:</strong> We collect and store your <strong>Name</strong>, <strong>Email Address</strong>, and <strong>IP Address</strong>.
                        </li>
                        <li>
                            <strong>Purpose:</strong> This information is used solely to send you newsletters, promotional updates, and exclusive content related to Moonkat Records releases and artists.
                        </li>
                        <li>
                            <strong>Security:</strong> Your data is stored securely in our database. We do not sell, trade, or transfer your personal information to outside parties.
                        </li>
                        <li>
                            <strong>Unsubscribe:</strong> You have the right to opt-out at any time. Every email we send contains a link to unsubscribe from our list.
                        </li>
                    </ul>

                    <p className="pt-4 border-t border-zinc-800">
                        If you have any questions regarding your data, please contact us at <a href="mailto:info@moonkatrecords.com" className="text-pink-400 hover:underline">info@moonkatrecords.com</a>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Terms;
