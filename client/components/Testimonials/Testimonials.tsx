"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const reviews = [
  {
    name: "Aravind K.",
    role: "Regular Shopper",
    comment: "I reserve my milk and veggies on my way back from work. By the time I reach the store, my bag is packed and ready!",
    rating: 5,
  },
  {
    name: "Priya S.",
    role: "Working Professional",
    comment: "No more standing in long evening supermarket queues. Mart-In saved me at least 30 minutes every day.",
    rating: 5,
  },
  {
    name: "Sanjay M.",
    role: "Hostel Student",
    comment: "Super smooth UI and instant status updates. The takeaway concept is way faster than waiting for home delivery.",
    rating: 5,
  }
];

export default function Testimonials() {
  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-slate-900">
            Loved by Local Shoppers
          </h2>
          <p className="mt-2 text-slate-600 text-sm">
            Here is what people are saying about the instant pickup experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -6 }}
              className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between"
            >
              <div>
                <Quote className="w-8 h-8 text-emerald-500/30 mb-3" />
                <p className="text-slate-700 text-sm leading-relaxed italic">
                  "{rev.comment}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{rev.name}</h4>
                  <span className="text-xs text-slate-500">{rev.role}</span>
                </div>
                <div className="flex gap-1">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}