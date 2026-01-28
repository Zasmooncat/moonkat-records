import React from 'react';
import fondo from "../assets/images/fondo/textura_industrial.jpg";
import FlickeringTitle from '../components/FlickeringTitle';

export default function Merch() {
    return (
        <section id="merch" className="relative min-h-screen border-t border-white/10 px-6 py-20 flex flex-col items-center justify-center bg-zinc-800">
            <div
                className="absolute inset-0 z-0 bg-cover bg-center opacity-30"
                style={{ backgroundImage: `url(${fondo})` }}
            />
            <FlickeringTitle
                text="MERCH"
                className="text-6xl md:text-8xl mb-10 tracking-widest justify-center"
            />
            <div className="text-center">
                <p className="text-xl text-zinc-400 font-mono mb-4">COMING SOON</p>
                <div className="w-16 h-1 bg-pink-300 mx-auto"></div>
            </div>
        </section>
    );
}