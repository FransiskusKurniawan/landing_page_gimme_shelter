"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Menu,
  X,
  Zap,
  Utensils,
  ChefHat,
  Calendar,
  MapPin,
  Instagram,
} from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useNavbarAnimation } from "../hooks/use-navbar-animation";
import { ThemeSwitcher } from "@/components/widget/theme-switcher";
import { LanguageSwitcher } from "@/components/widget/language-switcher";
import { useLanguage } from "@/components/providers/language-provider";

export function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const isLandingPage = pathname === "/";
  const { t } = useLanguage();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Smooth scroll to section function (only works on landing page)
  const scrollToSection = (sectionId: string) => {
    if (!isLandingPage) return;

    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    // Close mobile menu if open
    setIsMobileMenuOpen(false);
  };

  // Navigate to landing page and scroll to section
  const navigateToSection = (sectionId: string) => {
    if (isLandingPage) {
      scrollToSection(sectionId);
    } else {
      // Navigate to landing page with hash
      window.location.href = `/#${sectionId}`;
    }
  };

  // Use navbar animation hook
  const { navbarRef, logoRef, navRef, themeSwitcherRef } = useNavbarAnimation({
    onFloatingStart: () => {
      // Navbar started floating
    },
    onFloatingEnd: () => {
      // Navbar returned to normal
    },
  });

  return (
    <header
      ref={navbarRef}
      className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      style={{
        height: "5rem", // 80px - normal height
        width: "100%", // Full width
        backdropFilter: "blur(8px)",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        borderBottom: "1px solid rgba(var(--border), 0.2)",
        margin: "0",
        padding: "0",
        borderRadius: "0",
      }}
    >
      <div className="flex h-full items-center justify-between px-2 sm:px-4 md:px-6 max-w-7xl mx-auto">
        {/* Logo Section */}
        <Link href="/" className="flex items-center gap-3 group" ref={logoRef}>
          <div className="relative">
            <Image
              src="/gimmeshelter.jpg"
              alt="Gimme Shelter Logo"
              width={52}
              height={52}
              className="rounded-full transition-transform duration-300 group-hover:scale-110 w-10 h-10 sm:w-[52px] sm:h-[52px]"
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          ref={navRef}
          className="hidden lg:flex items-center gap-8 text-sm font-medium"
        >
          <button
            onClick={() => navigateToSection("home")}
            className="flex items-center gap-2 text-muted-foreground transition-all duration-300 hover:text-foreground hover:scale-105 group cursor-pointer"
          >
            <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
            {t('landing.navbar.home')}
          </button>
          <button
            onClick={() => navigateToSection("menu")}
            className="flex items-center gap-2 text-muted-foreground transition-all duration-300 hover:text-foreground hover:scale-105 group cursor-pointer"
          >
            <ChefHat className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
            {t('landing.navbar.menu')}
          </button>
          <button
            onClick={() => navigateToSection("contact")}
            className="flex items-center gap-2 text-muted-foreground transition-all duration-300 hover:text-foreground hover:scale-105 group cursor-pointer"
          >
            <MapPin className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
            {t('landing.navbar.contact')}
          </button>
        </nav>

        {/* Right Section - Auth Buttons, Theme Toggle & Mobile Menu */}
        <div className="flex items-center gap-1 sm:gap-4">
          {/* Desktop Auth Buttons removed */}

          <div ref={themeSwitcherRef} className="flex items-center gap-1 sm:gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="lg:hidden sm:size-9"
            onClick={toggleMobileMenu}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-4 w-4 sm:h-5 sm:h-5" />
            ) : (
              <Menu className="h-4 w-4 sm:h-5 sm:h-5" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
          <div className="container mx-auto px-4 py-6 space-y-4">
            <nav className="flex flex-col space-y-4">
              <button
                onClick={() => navigateToSection("home")}
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors duration-200 py-2 px-3 rounded-lg hover:bg-muted/50 cursor-pointer text-left w-full"
              >
                <Zap className="w-4 h-4" />
                {t('landing.navbar.home')}
              </button>
              <button
                onClick={() => navigateToSection("menu")}
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors duration-200 py-2 px-3 rounded-lg hover:bg-muted/50 cursor-pointer text-left w-full"
              >
                <ChefHat className="w-4 h-4" />
                {t('landing.navbar.menu')}
              </button>
              <button
                onClick={() => navigateToSection("contact")}
                className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors duration-200 py-2 px-3 rounded-lg hover:bg-muted/50 cursor-pointer text-left w-full"
              >
                <MapPin className="w-4 h-4" />
                {t('landing.navbar.contact')}
              </button>
            </nav>

            {/* Mobile Auth Buttons removed */}
          </div>
        </div>
      )}
    </header>
  );
}
