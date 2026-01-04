import { HiX } from "react-icons/hi";

const SendDemosModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4"
            onClick={onClose}
        >
            <div
                className="bg-zinc-900 rounded-lg p-8 max-w-md w-full relative text-center"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white hover:text-violet-300 transition-colors"
                    aria-label="Close modal"
                >
                    <HiX size={28} />
                </button>

                <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
                    Send us your demos
                </h2>

                <p className="text-gray-300 text-sm leading-relaxed mb-6">
                    If you are a drum &amp; bass producer and want your music to be part of
                    our label, send your demos to
                </p>

                <p className="text-white font-semibold mb-6">
                    moonkatrecords@gmail.com
                </p>

                <p className="text-gray-400 text-sm">
                    We will listen carefully and get in touch with you.
                </p>
            </div>
        </div>
    );
};

export default SendDemosModal;
