"use client";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import About from "@/landing/about";
import Hero from "@/landing/hero";
import Link from "next/link";
import { useState } from "react";

export default function LandingPage() {
  const navItems = [
    {
      name: "الرئيسية",
      link: "#main",
    },
    {
      name: "عن المشروع",
      link: "#about",
    },
    {
      name: "المصادر",
      link: "https://qul.tarteel.ai/resources",
    },
  ];

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative w-full  flex justify-cetner items-center flex-col">
      <Navbar className=" fixed top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            <Link href="https://github.com/mohammed-ayoub-dz/hifz" target="_blank">
              <NavbarButton variant="secondary">Github </NavbarButton>
            </Link>
          </div>
        </NavBody>

        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4">
            <Link href="https://github.com/mohammed-ayoub-dz/hifz" target="_blank">
              
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full"
              >
               Github
              </NavbarButton>
              </Link>
             
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>
      <Content />

    </div>
  );
}

const Content = () => {
  return (
    <div className="container ">
    <Hero />
    <About />
    </div>
  );
};
