import React from 'react';
import FlickeringTitle from '../components/FlickeringTitle';

export default function Contact() {
    return (
        <section id="contact" className="relative min-h-screen border-t border-white/10 px-6 py-20 flex flex-col items-center justify-center bg-zinc-900">
            <FlickeringTitle
                text="CONTACT"
                className="text-5xl md:text-8xl mb-10 tracking-widest justify-center"
            />
            <div className="text-center max-w-xl">
                <p className="text-lg bebas  text-zinc-300 mb-8">
                    For demos, booking requests, or general inquiries, please reach out to us.
                </p>
                <a href="mailto:info@moonkatrecords.com" className="boton-elegante inline-block">
                    info@moonkatrecords.com
                </a>
            </div>
        </section>
    );
}