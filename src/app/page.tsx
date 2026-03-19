"use client";

import { Navbar } from "@/features/landings/components/navbar";
import { HeroSection } from "@/features/landings/components/hero-section";
import { FeaturesSection } from "@/features/landings/components/features-section";
import { PartnersSection } from "@/features/landings/components/partners-section";
import { TestimonialsSection } from "@/features/landings/components/testimonials-section";
import { ContactSection } from "@/features/landings/components/contact-section";
import { Footer } from "@/features/landings/components/footer";
import { MainContent } from "@/features/landings/components/main-content";
import { FoodMenuSection } from "@/features/landings/components/food-menu-section";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header overlay for landing page */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <Navbar />
      </div>

      {/* Main content with sticky hero and overlapping sections */}
      <MainContent>
        <div id="home">
          <HeroSection />
        </div>
        <div id="menu">
          <FoodMenuSection />
        </div>
        <div id="features">
          <FeaturesSection />
        </div>
        <div id="partners">
          <PartnersSection />
        </div>
        <div id="testimonials">
          <TestimonialsSection />
        </div>
        <div id="contact">
          <ContactSection />
        </div>
      </MainContent>

      <Footer />
    </div>
  );
}
