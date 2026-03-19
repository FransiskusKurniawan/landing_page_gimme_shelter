"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/components/providers/language-provider";

const foodItems = [
  {
    name: "Blackened Shrimp",
    image: "/food/Blackened_Shrimp.png",
    description: "Spicy, succulent shrimp seared to perfection with our signature house Cajun rub."
  },
  {
    name: "Crispy Eggplant",
    image: "/food/Crispy_Eggplant.png",
    description: "Golden-brown panko-crusted eggplant slices served with a zesty dipping sauce."
  },
  {
    name: "Gumbo",
    image: "/food/Gumbo.png",
    description: "Our legendary deep-south stew, packed with rich flavors, and slow-cooked for hours."
  },
  {
    name: "Jambalaya",
    image: "/food/Jambalaya.png",
    description: "A hearty Creole classic: spiced rice, vegetables, and a medley of premium meats."
  },
  {
    name: "Smashed Beef",
    image: "/food/Smashed_Beef.png",
    description: "Juicy beef patties smashed for that perfect caramelized crust, served on a toasted brioche."
  },
  {
    name: "Southern Chicken",
    image: "/food/Southhern_Chicken.png",
    description: "Buttermilk-brined, double-dredged fried chicken for the ultimate crunch and flavor."
  }
];

export function FoodMenuSection() {
  const { t } = useLanguage();

  return (
    <section className="bg-background py-24 relative z-30 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <h2 className="text-5xl md:text-6xl font-black text-foreground mb-6 uppercase tracking-tighter italic">
            Rock N' Roll Kitchen
          </h2>
          <div className="w-32 h-1.5 bg-primary mx-auto mb-8 rounded-full" />
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-medium">
            Experience the soul of the south with our curated selection of hits.
            Cold beer, hot food, and the best vibes in town.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 md:gap-12">
          {foodItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              className="group"
            >
              <div className="relative overflow-hidden rounded-[2.5rem] bg-muted/10 backdrop-blur-xl border border-border/40 shadow-xl transition-all duration-500 ease-out group-hover:shadow-primary/10 group-hover:border-primary/30 group-hover:-translate-y-3">
                {/* Image Container */}
                <div className="relative h-72 w-full overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  {/* Atmospheric Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-80" />
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Badge */}
                  <div className="absolute top-6 right-6">
                    <span className="bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] uppercase font-bold tracking-[0.2em] px-4 py-2 rounded-full shadow-lg">
                      Signature
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-8 pt-2">
                  <h3 className="text-3xl font-bold text-foreground mb-3 tracking-tight group-hover:text-primary transition-colors duration-300">
                    {item.name}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-lg line-clamp-2 group-hover:line-clamp-none transition-all duration-500">
                    {item.description}
                  </p>

                  {/* Bottom Detail */}
                  <div className="mt-8 flex items-center gap-4">
                    <div className="h-[2px] w-12 bg-primary/40 rounded-full group-hover:w-20 transition-all duration-500" />
                    <span className="text-xs uppercase font-black tracking-widest text-primary/60 group-hover:text-primary transition-colors">
                      Kitchen Hit
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Background Decorative Blurs */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-[150px] -z-10" />
    </section>
  );
}
