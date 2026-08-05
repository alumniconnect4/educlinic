'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const ContactPage = () => {
  const router = useRouter();
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isSubmittingSuccess, setIsSubmittingSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({
    type: null,
    message: '',
  });

  const [submittedSuccessfully, setSubmittedSuccessfully] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await axios.post(
        `${apiUrl}/admin-portal/help-tickets`,
        formData
      );

      if (response.status === 201) {
        setFormData({ name: '', email: '', phone: '', message: '' });
        setSubmittedSuccessfully(true);
      } else {
        setStatus({
          type: 'error',
          message:
            response.data.message || 'Something went wrong. Please try again.',
        });
      }
    } catch (error: any) {
      console.error('Error submitting contact form:', error);
      setStatus({
        type: 'error',
        message:
          error.response?.data?.message ||
          'Failed to submit the form. Please check your network connection.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-white pb-16 transition-all duration-700 ease-in-out ${
        isSubmittingSuccess ? 'opacity-0 scale-[0.98]' : 'opacity-100 scale-100'
      }`}
    >
      <div className="w-full h-[400px] lg:h-[450px] relative bg-gray-100">
        {!isMapLoaded && (
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center animate-pulse">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-[#d60000] rounded-full animate-spin mb-3"></div>
            <span className="text-gray-500 font-medium">Loading Map...</span>
          </div>
        )}
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3447.880733791609!2d74.8420018!3d30.2510336!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x391731172aeedaaf%3A0x7d09b26e96ee593b!2sBaba%20Farid%20Group%20of%20Institutions!5e0!3m2!1sen!2sin!4v1707572391234!5m2!1sen!2sin"
          className={`absolute inset-0 w-full h-full border-0 transition-opacity duration-700 ease-in-out ${
            isMapLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={() => setIsMapLoaded(true)}
        ></iframe>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 -mt-24 relative z-10">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="flex flex-col h-full bg-white border border-gray-200 shadow-sm">
            <div className="relative h-64 w-full">
              <Image
                src="/contact.jpg"
                alt="Contact Us Icons"
                fill
                className="object-cover"
              />
            </div>

            <div className="bg-[#d60000] text-white px-6 py-4">
              <h2 className="text-xl font-bold tracking-wide uppercase">
                Contact Us in India
              </h2>
            </div>

            <div className="p-6 md:p-8 flex flex-col gap-4 text-gray-700">
              <div className="flex items-start gap-3">
                <span className="text-[#d60000] text-xl leading-none mt-0.5">
                  ♦
                </span>
                <p className="text-[15px] font-medium">
                  Baba Farid Group of Institutions, Bathinda, Punjab, India.
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#d60000] text-xl leading-none mt-0.5">
                  ♦
                </span>
                <p className="text-[15px] font-medium">
                  contactus@babafaridgroup.com
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#d60000] text-xl leading-none mt-0.5">
                  ♦
                </span>
                <p className="text-[15px] font-medium">
                  admissions@babafaridgroup.edu.in
                </p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-[#d60000] text-xl leading-none mt-0.5">
                  ♦
                </span>
                <p className="text-[15px] font-medium">
                  +91 8081-100-200 (Helpline)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 text-slate-800 p-8 md:p-10 lg:p-12 flex flex-col justify-center h-full shadow-sm">
            {submittedSuccessfully ? (
              <div className="flex flex-col items-center justify-center text-center py-8 my-auto">
                <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center mb-4">
                  <span className="text-emerald-600 text-2xl font-bold">✓</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Thank You!</h3>
                <p className="text-gray-600 text-sm mb-6 max-w-xs leading-relaxed">
                  Your message has been sent successfully. We will get back to you soon.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmittedSuccessfully(false)}
                  className="bg-slate-900 hover:bg-black text-white font-bold py-2.5 px-6 rounded-sm text-xs uppercase tracking-wider shadow-xs transition-colors cursor-pointer"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Get in Touch</h2>
                <p className="text-gray-500 text-sm mb-8">
                  Please fill out the form and we will contact you asap.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Full Name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-sm bg-white text-slate-800 placeholder-gray-400 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-sm bg-white text-slate-800 placeholder-gray-400 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Your Mobile No."
                      className="w-full px-4 py-3 border border-gray-300 rounded-sm bg-white text-slate-800 placeholder-gray-400 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors"
                      required
                    />
                  </div>
                  <div>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Message"
                      maxLength={500}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-sm bg-white text-slate-800 placeholder-gray-400 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 outline-none transition-colors resize-none"
                      required
                    ></textarea>
                    <div className="text-right text-[11px] text-gray-400 mt-1 select-none">
                      {formData.message.length}/500 characters
                    </div>
                  </div>

                  {status.type && (
                    <div
                      className={`text-sm px-4 py-2 rounded-sm ${
                        status.type === 'success'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {status.message}
                    </div>
                  )}

                  <div className="mt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-[#b91c1c] hover:bg-[#991b1b] text-white font-bold py-3 px-8 rounded-sm shadow-xs transition-colors w-max disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                    >
                      {loading ? 'Sending...' : 'Send'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
