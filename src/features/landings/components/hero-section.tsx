"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/components/providers/language-provider";

export function HeroSection() {
  const { t } = useLanguage();
  const [contentOpacity, setContentOpacity] = useState({
    content1: 1,
    content2: 0,
    content3: 0,
  });

  // Form state for the contact dialog
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });

  const [dialogOpen, setDialogOpen] = useState(false);

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Reset form when dialog closes
  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setFormData({ name: "", email: "", phone: "", company: "", message: "" });
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you can add your form submission logic
    console.log("Form submitted:", formData);
    // Close dialog after submission
    setDialogOpen(false);
    setFormData({ name: "", email: "", phone: "", company: "", message: "" });
  };

  // Scroll animation handler for sticky hero content transitions
  useEffect(() => {
    let ticking = false;

    const updateScrollY = () => {
      const currentScrollY = window.scrollY;
      const viewportHeight = window.innerHeight;

      // Define transition ranges for sticky hero content
      const vh = viewportHeight || 800; // Fallback to 800 if 0
      const content1End = vh * 0.8;
      const content2Start = vh * 0.6;
      const content2End = vh * 1.6;
      const content3Start = vh * 1.4;
      const content3End = vh * 2.4;

      // Calculate opacity for each content section
      let content1Opacity = 0;
      let content2Opacity = 0;
      let content3Opacity = 0;

      const fadeRange = vh * 0.4;

      // Content 1 logic - starts visible, fades out
      if (currentScrollY <= content1End) {
        content1Opacity = 1;
      } else {
        content1Opacity = Math.max(
          0,
          1 - (currentScrollY - content1End) / fadeRange
        );
      }

      // Content 2 logic - fades in then out
      if (currentScrollY >= content2Start && currentScrollY <= content2End) {
        if (currentScrollY < content1End) {
          content2Opacity =
            (currentScrollY - content2Start) / (content1End - content2Start || 1);
        } else if (currentScrollY > content2End - fadeRange) {
          content2Opacity = Math.max(
            0,
            1 -
            (currentScrollY - (content2End - fadeRange)) /
            fadeRange
          );
        } else {
          content2Opacity = 1;
        }
      }

      // Content 3 logic - fades in and stays visible longer
      if (currentScrollY >= content3Start) {
        if (currentScrollY < content3End) {
          content3Opacity = Math.min(
            1,
            (currentScrollY - content3Start) / fadeRange
          );
        } else {
          const content3FadeRange = vh * 0.3;
          content3Opacity = Math.max(
            0,
            1 - (currentScrollY - content3End) / (content3FadeRange || 1)
          );
        }
      }

      // Update state with calculated opacities
      setContentOpacity({
        content1: Math.max(0, Math.min(1, content1Opacity)),
        content2: Math.max(0, Math.min(1, content2Opacity)),
        content3: Math.max(0, Math.min(1, content3Opacity)),
      });

      ticking = false;
    };

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollY);
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateScrollY(); // Initial call

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <>
      {/* Hero section with sticky content that stays centered */}
      <section
        className="relative"
        style={{
          height: "var(--hero-height)",
          background: "transparent",
        }}
      >
        {/* Sticky container that remains centered during scroll */}
        <div
          className="sticky top-0 left-0 w-full h-screen flex items-center justify-center pointer-events-none overflow-hidden"
          style={{
            zIndex: 40,
            background: "transparent",
          }}
        >
          {/* Background Layer for Content 1 */}
          <motion.div
            className="absolute inset-0 z-0 pointer-events-none flex"
            style={{
              opacity: contentOpacity.content1,
            }}
          >
            <div className="grid grid-cols-3 w-full h-full">
              <div 
                className="relative h-full w-full"
                style={{
                  backgroundImage: 'url(/gallery/bar.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-black/60" />
              </div>
              <div 
                className="relative h-full w-full"
                style={{
                  backgroundImage: 'url(/gallery/music.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-black/60" />
              </div>
              <div 
                className="relative h-full w-full"
                style={{
                  backgroundImage: 'url(/gallery/photo.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-black/60" />
              </div>
            </div>
          </motion.div>

          {/* Background Layer for Content 2 */}
          <motion.div
            className="absolute inset-0 z-0 pointer-events-none flex"
            style={{
              opacity: contentOpacity.content2,
            }}
          >
            <div className="grid grid-cols-2 w-full h-full">
              <div 
                className="relative h-full w-full"
                style={{
                  backgroundImage: 'url(/gallery/skate1.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-black/60" />
              </div>
              <div 
                className="relative h-full w-full"
                style={{
                  backgroundImage: 'url(/gallery/skate.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-black/60" />
              </div>
            </div>
          </motion.div>

          {/* Background Layer for Content 3 */}
          <motion.div
            className="absolute inset-0 z-0 pointer-events-none flex"
            style={{
              opacity: contentOpacity.content3,
            }}
          >
            <div className="grid grid-cols-2 lg:grid-cols-6 w-full h-full">
              {[
                "Blackened_Shrimp.png",
                "Crispy_Eggplant.png",
                "Gumbo.png",
                "Jambalaya.png",
                "Smashed_Beef.png",
                "Southhern_Chicken.png"
              ].map((img) => (
                <div 
                  key={img}
                  className="relative h-full w-full"
                  style={{
                    backgroundImage: `url(/food/${img})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div className="absolute inset-0 bg-black/60" />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Content 1 - Initial Hero Text */}
          <motion.div
            className="absolute z-10 text-center max-w-4xl px-4 pointer-events-none"
            style={{
              opacity: contentOpacity.content1,
              transform: `translateY(${contentOpacity.content1 === 1 ? 0 : 20
                }px)`,
              transition: "all 0.3s ease-out",
            }}
          >
            <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-white mb-6 drop-shadow-lg">
              {t('landing.hero.content1.title')}
              <br />
              {t('landing.hero.content1.subtitle')}
            </h1>
            <p className="text-sm md:text-xl text-white/80 mb-8 drop-shadow-md">
              {t('landing.hero.content1.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="text-lg px-8 py-6 pointer-events-auto bg-white text-black hover:bg-white/90">
                  {t('landing.hero.content1.cta')}
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Content 2 - Our Features */}
          <motion.div
            className="absolute z-10 text-center max-w-4xl px-4 pointer-events-none"
            style={{
              opacity: contentOpacity.content2,
              transform: `translateY(${contentOpacity.content2 === 1 ? 0 : 20
                }px)`,
              transition: "all 0.3s ease-out",
            }}
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-white mb-6 drop-shadow-lg">
              {t('landing.hero.content2.title')}
              <br />
              {t('landing.hero.content2.subtitle')}
            </h2>
            <p className="text-sm md:text-xl text-white/80 mb-8 drop-shadow-md">
              {t('landing.hero.content2.description')}
            </p>
          </motion.div>

          {/* Content 3 - Featured Capabilities */}
          <motion.div
            className="absolute z-10 text-center max-w-4xl px-4 pointer-events-none"
            style={{
              opacity: contentOpacity.content3,
              transform: `translateY(${contentOpacity.content3 === 1 ? 0 : 20
                }px)`,
              transition: "all 0.3s ease-out",
            }}
          >
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl leading-tight text-white mb-6 drop-shadow-lg">
              {t('landing.hero.content3.title')}
            </h2>
            <p className="text-sm md:text-xl text-white/80 mb-8 drop-shadow-md">
              {t('landing.hero.content3.description')}
            </p>
          </motion.div>
        </div>
      </section>
    </>
  );
}
