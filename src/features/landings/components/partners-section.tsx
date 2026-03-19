"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/providers/language-provider";

// Hardcoded merchandise data
const merchandise = [
  {
    id: "1",
    name: "Barong Tee",
    image_url: "/merch/barong_tee.png",
    price: "IDR 250k",
  },
  {
    id: "2",
    name: "Bottle Trucker Hat",
    image_url: "/merch/bottle_trucker_hat.png",
    price: "IDR 150k",
  },
  {
    id: "3",
    name: "Classic Tee",
    image_url: "/merch/classic_tee.png",
    price: "IDR 250k",
  },
  {
    id: "4",
    name: "Totebag",
    image_url: "/merch/totebag.png",
    price: "IDR 100k",
  },
];

export function PartnersSection() {
  const { t } = useLanguage();
  return (
    <section className="bg-background py-16 md:py-24 relative z-30 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mb-16 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tighter">
            {t('landing.partners.title')}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t('landing.partners.description')}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
          {merchandise.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-muted/20 border border-border/40 shadow-sm transition-all duration-500 ease-in-out group-hover:shadow-2xl group-hover:border-primary/30 group-hover:-translate-y-2">
                {/* Subtle Inner Gradient/Contrast */}
                <div className="absolute inset-0 bg-gradient-to-tr from-muted/10 to-transparent pointer-events-none" />
                
                {/* Background Glow Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70 opacity-40 group-hover:opacity-90 transition-opacity duration-500 ease-in-out" />
                
                {/* Product Image */}
                <Image
                  className="object-cover transition-transform duration-500 ease-in-out group-hover:scale-105"
                  src={item.image_url}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />

                {/* Info Overlay */}
                <div className="absolute inset-0 flex flex-col justify-end p-8 text-white translate-y-6 group-hover:translate-y-0 transition-transform duration-500 ease-in-out">
                  <h3 className="text-2xl font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                    {item.name}
                  </h3>
                  <div className="flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">
                    <span className="text-white/90 font-semibold text-lg">{item.price}</span>
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em] bg-white text-black px-2.5 py-1 rounded-full shadow-lg">
                      In Stock
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Card Label for non-hover state */}
              <div className="mt-5 text-center transition-all duration-300 group-hover:opacity-0 group-hover:-translate-y-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/70">{item.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{item.price}</p>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      </div>
    </section>
  );
}
