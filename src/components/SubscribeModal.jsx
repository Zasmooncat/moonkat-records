import { useState } from "react";
import { HiX } from "react-icons/hi";
import { supabase } from "../lib/supabase";


const SubscribeModal = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSubmitting(true);
  setSubmitMessage("");

  try {
    const { error } = await supabase
      .from("subscriptions")
      .insert([{ email }]);

    if (error) {
      if (error.code === "23505") {
        setSubmitMessage("This email is already subscribed.");
      } else {
        throw error;
      }
      return;
    }

    setSubmitMessage("Thanks for subscribing! You'll receive our releases first.");
    setEmail("");

    setTimeout(() => {
      handleClose();
    }, 2000);

  } catch (err) {
    setSubmitMessage("Something went wrong. Please try again.");
  } finally {
    setIsSubmitting(false);
  }
};


  const handleClose = () => {
    setEmail("");
    setSubmitMessage("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 px-4"
      onClick={handleClose}
    >
      <div 
        className="bg-zinc-900 rounded-lg p-8 max-w-md w-full relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-white hover:text-violet-300 transition-colors"
          aria-label="Close modal"
        >
          <HiX size={28} />
        </button>

        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
          Join the Promo List
        </h2>
        <p className="text-gray-400 text-sm mb-6">
          Get exclusive access to new releases before anyone else!
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label 
              htmlFor="email" 
              className="block text-white text-sm font-medium mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-zinc-800 text-white rounded-lg border border-zinc-700 focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:ring-opacity-50 transition-colors"
            />
          </div>

          {submitMessage && (
            <p className={`text-sm mb-4 ${submitMessage.includes('Thanks') ? 'text-green-400' : 'text-red-400'}`}>
              {submitMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full boton-elegante disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SubscribeModal;