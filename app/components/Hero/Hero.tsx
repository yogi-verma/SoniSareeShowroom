"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import mainPhoto from "../../assets/HeroSection/mainphoto.jpeg";
import innerPhoto from "../../assets/HeroSection/innerphoto.jpeg";

const slides = [
  {
    eyebrow: "WELCOME TO SONI",
    title: "A world of",
    accent: "beautiful drapes.",
    description:
      "Step into our showroom and discover sarees chosen to make your most meaningful moments unforgettable.",
    image: mainPhoto,
    alt: "Inside the Soni Saree Showroom, with sarees on display",
    category: "OUR SHOWROOM",
  },
  {
    eyebrow: "YOUR SAREE STORY",
    title: "Tradition,",
    accent: "made yours.",
    description:
      "Visit Soni Saree Showroom for vibrant colors, graceful drapes and a warm welcome.",
    image: innerPhoto,
    alt: "The Soni Saree Showroom entrance and storefront",
    category: "THE SONI EXPERIENCE",
  },
  {
    eyebrow: "TIMELESS ELEGANCE",
    title: "Beautiful Sarees",
    accent: "for every story.",
    description:
      "Heirloom-worthy weaves, chosen to make your most meaningful moments unforgettable.",
    image: "photo-1610030469983-98e550d6193c",
    alt: "Model in a richly woven purple and gold saree",
    category: "THE SAREE EDIT",
  },
  {
    eyebrow: "CRAFTED TO BE REMEMBERED",
    title: "A little more",
    accent: "occasion-ready.",
    description:
      "Statement suits with the fine details, beautiful colors, and graceful drape you love.",
    image: "photo-1705921290980-6a644d2828ed",
    alt: "Model wearing a mint green embroidered Indian suit",
    category: "THE SUIT EDIT",
  },
  {
    eyebrow: "WOVEN WITH HERITAGE",
    title: "Tradition,",
    accent: "made yours.",
    description:
      "Discover the artistry of Indian textiles in colors that feel distinctly you.",
    image: "photo-1717835735088-4c821959bdaa",
    alt: "Model wearing a red and gold traditional saree",
    category: "THE SAREE EDIT",
  },
  {
    eyebrow: "A FRESH TAKE ON FESTIVE",
    title: "Grace in",
    accent: "every detail.",
    description:
      "Meet expressive Indian occasion wear made for celebrations big and small.",
    image: "photo-1742800767764-479556a4d8a5",
    alt: "Model in a red floral Indian suit with a flowing dupatta",
    category: "THE SUIT EDIT",
  },
  {
    eyebrow: "DRESSED IN COLOR",
    title: "The art of",
    accent: "being you.",
    description:
      "From first glance to final drape, find a look that feels like your own.",
    image: "photo-1753981031189-27bb7bd1c079",
    alt: "Model wearing an ornate green silk saree",
    category: "THE SAREE EDIT",
  },
];

const imageUrl = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=2400&q=85`;

export default function Hero() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, []);

  const showPrevious = () =>
    setActiveSlide((current) => (current - 1 + slides.length) % slides.length);
  const showNext = () =>
    setActiveSlide((current) => (current + 1) % slides.length);

  const current = slides[activeSlide];

  return (
    <section
      id="home"
      aria-roledescription="carousel"
      aria-label="Featured sarees and suits"
      className="relative isolate flex min-h-[650px] items-center overflow-hidden bg-[#211821] text-white md:min-h-[600px]"
    >
      {slides.map((slide, index) => (
        <Image
          key={`slide-${index}`}
          src={
            typeof slide.image === "string"
              ? imageUrl(slide.image)
              : slide.image
          }
          alt={index === activeSlide ? slide.alt : ""}
          aria-hidden={index !== activeSlide}
          fill
          sizes="100vw"
          unoptimized
          preload={index === 0}
          loading={index === 0 ? undefined : "lazy"}
          className={`absolute inset-0 h-full w-full object-cover object-[center_34%] transition-[opacity,transform] duration-1000 ease-in-out md:object-center ${
            index === activeSlide
              ? "scale-105 opacity-100"
              : "scale-100 opacity-0"
          }`}
        />
      ))}

      <div className="absolute inset-0 bg-gradient-to-r from-[#1b111b]/85 via-[#1b111b]/50 to-[#1b111b]/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1b111b]/55 via-transparent to-black/30" />

      <div className="relative mx-auto flex w-full max-w-[1440px] flex-col px-[7%] pb-20 pt-36 md:pb-20 md:pt-40">
        <div className="max-w-2xl">
          <div className="mb-5 flex items-center gap-3 text-[9px] font-semibold tracking-[0.24em] text-[#e9c9dc] sm:text-[10px]">
            <span className="h-px w-8 bg-[#d9b5cf]" />
            <span>{current.eyebrow}</span>
          </div>

          <h1
            key={`${activeSlide}-title`}
            className="font-serif text-[clamp(2.5rem,5.5vw,4.5rem)] font-normal leading-[1.02] tracking-[-0.035em] drop-shadow-sm"
          >
            {current.title}
            <br />
            <span className="italic text-[#eed9e8]">{current.accent}</span>
          </h1>

          <p className="mt-6 max-w-md text-[12px] leading-6 text-white/80 sm:text-[13px] sm:leading-7">
            {current.description}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#shop"
              className="group inline-flex min-h-12 items-center gap-8 rounded-sm bg-[#73456e] px-5 text-[10px] font-semibold tracking-[0.12em] text-white transition hover:bg-[#895a82] sm:px-6"
            >
              SHOP THE COLLECTION
              <FiArrowRight
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
                size={15}
              />
            </a>
          </div>
        </div>

        {/* <div className="absolute bottom-7 left-[7%] right-[7%] flex items-end justify-between md:bottom-9">
          <div className="ml-1 flex items-center gap-1.5 sm:ml-2 sm:gap-2">
            {slides.map((slide, index) => (
              <button
                key={`slide-indicator-${index}`}
                type="button"
                aria-label={`Show slide ${index + 1}: ${slide.category.toLowerCase()}`}
                aria-current={index === activeSlide ? "true" : undefined}
                onClick={() => setActiveSlide(index)}
                className={`h-1 rounded-full transition-all duration-300 ${
                  index === activeSlide
                    ? "w-8 bg-white"
                    : "w-3 bg-white/45 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        </div> */}
      </div>
    </section>
  );
}
