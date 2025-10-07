import React, { useRef } from "react";
import emailjs from "emailjs-com";

const Contact = () => {
  const form = useRef();

  const sendEmail = (e) => {
    e.preventDefault();

    emailjs
      .sendForm(
        "service_4afv4cg",   // 🔹 Replace with your EmailJS service ID
        "template_dtfqelt",  // 🔹 Replace with your EmailJS template ID
        form.current,
        "L5vdTvl73yqsAvnMb"    // 🔹 Replace with your EmailJS public key
      )
      .then(
        (result) => {
          alert("✅ Message sent successfully!");
          e.target.reset();
        },
        (error) => {
          alert("❌ Something went wrong. Try again!");
          console.error(error.text);
        }
      );
  };

  return (
    <main className="bg-gray-50 text-gray-800 font-sans min-h-screen flex items-center justify-center py-24 px-4">
      <div className="max-w-6xl w-full lg:grid lg:grid-cols-2 lg:gap-16 lg:items-start">
        
        {/* Contact Form */}
        <div>
          <h2 className="text-3xl font-bold text-purple-700 sm:text-4xl mb-6">
            Send Us a Message
          </h2>

          <form
            ref={form}
            onSubmit={sendEmail}
            className="space-y-6 bg-gradient-to-br from-blue-100 via-purple-100 to-yellow-100 p-8 rounded-2xl shadow-lg"
          >
            <div>
              <label className="block text-gray-800 font-medium mb-2" htmlFor="name">
                Full Name
              </label>
              <input
                type="text"
                id="name"
                name="user_name"
                placeholder="Your Name"
                className="w-full px-4 py-3 rounded-lg border border-purple-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-gray-800 font-medium mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="user_email"
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border border-purple-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-gray-800 font-medium mb-2" htmlFor="message">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows="5"
                placeholder="Your message..."
                className="w-full px-4 py-3 rounded-lg border border-purple-300 focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                required
              ></textarea>
            </div>

            <button
              type="submit"
              className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-blue-600 transition-all transform hover:scale-105"
            >
              Send Message
            </button>
          </form>
        </div>

        {/* Contact Info */}
        <div className="mt-12 lg:mt-0">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl mb-6">
            Contact Info
          </h2>
          <div className="space-y-6">
            
            {/* Email */}
            <div className="flex items-start space-x-4">
              <svg className="w-6 h-6 text-purple-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12H8m0 0l4-4m0 8l-4-4m12 4v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6"></path>
              </svg>
              <p className="text-gray-600">deepakdesh565@gmail.com</p>
            </div>

            {/* Phone */}
            <div className="flex items-start space-x-4">
              <svg className="w-6 h-6 text-purple-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3a2 2 0 012 2v3a2 2 0 01-2 2H5a2 2 0 01-2-2V5zM14 3h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2V5a2 2 0 012-2zM14 14h3a2 2 0 012 2v3a2 2 0 01-2 2h-3a2 2 0 01-2-2v-3a2 2 0 012-2zM3 14h3a2 2 0 012 2v3a2 2 0 01-2 2H5a2 2 0 01-2-2v-3a2 2 0 012-2z"></path>
              </svg>
              <p className="text-gray-600">+91 9508173611</p>
            </div>

            {/* Helpline Number */}
            <div className="flex items-start space-x-4">
              <svg className="w-6 h-6 text-purple-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 8a6 6 0 00-12 0v6a6 6 0 0012 0V8z"></path>
              </svg>
              <p className="text-gray-600">Helpline: +91 98765 43210</p>
            </div>

            {/* Support / Toll-Free */}
            <div className="flex items-start space-x-4">
              <svg className="w-6 h-6 text-purple-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <p className="text-gray-600">Toll-Free: 1800-123-456</p>
            </div>

            {/* Address */}
            <div className="flex items-start space-x-4">
              <svg className="w-6 h-6 text-purple-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-5M3 3v5h5M21 3l-9 9-7-7L3 14l7 7 11-11z"></path>
              </svg>
              <p className="text-gray-600">
                Room no: G105, Patel Hostel, Motilal Nehru National Institute of Technology Allahabad, Prayagraj, Uttar Pradesh, India - 211004
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Contact;
