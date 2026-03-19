"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/providers/language-provider";

// Hardcoded testimonials data for agriculture/IoT context
const testimonials = [
  {
    id: 1,
    client_name: "Jack 'Thunder' Miller",
    client_position: "Vocalist",
    client_company: "The Shredders",
    client_avatar_url: undefined,
    testimonial_text:
      "The best vibes. Great acoustics for the gigs and the cold beers are just what we need after a set.",
  },
  {
    id: 2,
    client_name: "Sarah 'Goofy' Wijaya",
    client_position: "Pro Skater",
    client_company: "Skate School",
    client_avatar_url: undefined,
    testimonial_text:
      "The bowl here is insane. Best skate spot on the island followed by amazing burgers and drinks.",
  },
  {
    id: 3,
    client_name: "Budi Rocker",
    client_position: "Creative Director",
    client_company: "Island Vibes",
    client_avatar_url: undefined,
    testimonial_text:
      "My go-to place every weekend. The music is always on point and the kitchen never disappoints.",
  },
];

export function TestimonialsSection() {
  const { t } = useLanguage();
  return (
    <section className="w-full py-24 md:py-32 lg:py-40 bg-background relative z-30">
      {/* Smooth transition gradient from top */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-background via-background/95 to-transparent" />

      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-foreground">
            {t('landing.testimonials.title')}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t('landing.testimonials.description')}
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, margin: "-50px" }}
              whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
            >
              <Card className="bg-card h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <p className="mb-6 text-muted-foreground leading-relaxed">
                    &ldquo;{testimonial.testimonial_text}&rdquo;
                  </p>
                  <div className="flex items-center gap-4">
                    <Avatar>
                      <AvatarImage
                        src={testimonial.client_avatar_url || undefined}
                      />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {testimonial.client_name &&
                          testimonial.client_name.length > 0
                          ? testimonial.client_name.charAt(0).toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-foreground">
                        {testimonial.client_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {testimonial.client_position},{" "}
                        {testimonial.client_company}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
