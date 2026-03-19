"use client";

import { Mail, Phone, MapPin, Instagram } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/components/providers/language-provider";

export function ContactSection() {
  const { t } = useLanguage();

  const contactInfo = [
    {
      icon: Instagram,
      label: "Instagram",
      value: "@gimme_shelter_bali",
      href: "https://www.instagram.com/gimme_shelter_bali/",
    },
    {
      icon: MapPin,
      label: t('landing.contact.address_label'),
      value: t('landing.contact.address'),
      href: "https://goo.gl/maps/xyz",
    },
    {
      icon: Phone,
      label: "Phone",
      value: t('landing.contact.phone'),
      href: `tel:${t('landing.contact.phone').replace(/\s+/g, '')}`,
    },
  ];

  return (
    <section className="w-full py-24 md:py-32 lg:py-40 bg-background relative z-30 pointer-events-auto">
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
            {t('landing.contact.title')}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {t('landing.contact.description')}
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col items-center space-y-12"
          >
            <div className="w-full">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {contactInfo.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex flex-col items-center text-center p-8 bg-card rounded-2xl shadow-sm border border-border/50 group hover:border-primary/50 transition-all duration-300"
                  >
                    <div className="flex-shrink-0 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors">
                      <item.icon className="w-6 h-6 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                        {item.label}
                      </p>
                      {item.href !== "#" ? (
                        <a
                          href={item.href}
                          className="text-lg text-foreground hover:text-primary transition-colors font-bold block"
                        >
                          {item.value}
                        </a>
                      ) : (
                        <p className="text-lg text-foreground font-bold">
                          {item.value}
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Additional info card centered */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="w-full max-w-2xl"
            >
              <div className="bg-muted/40 backdrop-blur-sm p-8 rounded-2xl border border-border/30 text-center">
                <h4 className="text-xl font-bold text-foreground mb-3">
                  {t('landing.contact.consultation_title')}
                </h4>
                <p className="text-muted-foreground">
                  {t('landing.contact.consultation_description')}
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
