"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { motion } from "framer-motion";
import { Wand2, VideoIcon, BrainCircuit } from "lucide-react";
import { useState } from "react";
``;
export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const features = [
    {
      title: "Create Visuals for Videos",
      description:
        "Convert your drawings and scene descriptions into visuals for your stories with Livepeer AI.",
      icon: <VideoIcon className="h-8 w-8 text-green-500" />,
    },
    {
      title: "Register IP for your Assets",
      description:
        "Register IP for your assets on Story network which can be licensed and monetized.",
      icon: <Wand2 className="h-8 w-8 text-blue-500" />,
    },

    {
      title: "Create collections on Zora",
      description:
        "Create collection on Zora and monetize your assets by sharing them with world.",
      icon: <BrainCircuit className="h-8 w-8 text-purple-500" />,
    },
  ];

  return (
    <>
      <main className="flex min-h-screen flex-col items-center px-4 sm:px-8 md:px-24 pt-12 bg-gradient-to-b from-blue-50 to-white">
        <nav className="z-10 w-full max-w-5xl flex items-center justify-between font-bold text-3xl mb-12">
          <motion.p
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="font-sans italic text-4xl text-black"
          >
            VisualizeIt
            <span className="font-bold text-blue-500">.ai</span>
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Link href="/dashboard">
              <Button className="font-bold text-xl bg-blue-500 hover:bg-blue-600 text-white">
                Launch App
              </Button>
            </Link>
          </motion.div>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col justify-center gap-4 items-center mt-12 text-center"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-800 mb-4">
            Welcome to{" "}
            <span className="font-sans italic text-black">
              VisualizeIt
              <span className="font-bold text-blue-500">.ai</span>
            </span>
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 max-w-2xl">
            A tool for empowering your creativity with AI-driven visual
            storytelling.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 w-full max-w-5xl"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              onHoverStart={() => setHoveredCard(index)}
              onHoverEnd={() => setHoveredCard(null)}
            >
              <Card className="h-full shadow-lg border-2 border-gray-100 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                    {feature.icon}
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-20 mb-12"
        >
          <Link href="/dashboard">
            <Button className="font-bold text-xl bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-full shadow-lg">
              Get Started Now
            </Button>
          </Link>
        </motion.div>
      </main>

      <footer className="w-full bg-gray-100 py-4">
        <div className="container mx-auto text-center">
          <p className="text-gray-600">
            &copy; 2024{" "}
            <a
              href="https://www.alphadevs.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline"
            >
              AlphaDevs
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
