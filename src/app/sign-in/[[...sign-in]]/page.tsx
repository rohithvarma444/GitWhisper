"use client";

import { SignIn } from '@clerk/nextjs';
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Code, FileAudio, Github, MessagesSquare } from "lucide-react";
import Link from "next/link";

export default function Page() {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        ease: "easeOut"
      }
    })
  };

  const featureItems = [
    {
      icon: Github,
      title: "GitHub Codebase Indexing",
      description: "Upload any GitHub URL and we'll index the entire codebase for easy navigation and search."
    },
    {
      icon: Code,
      title: "AI-Powered Assistance",
      description: "Ask questions about unfamiliar codebases and get intelligent, contextual answers."
    },
    {
      icon: FileAudio,
      title: "Meeting Minutes Generation",
      description: "Upload audio files from team meetings and get AI-summarized meeting minutes automatically."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Side - Features */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-center">
        <motion.div
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div custom={0} variants={fadeIn} className="space-y-3">
            <div className="flex items-center space-x-3">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-black/10 rounded-full blur-md"></div>
                <div className="relative z-10 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center">
                  <MessagesSquare className="h-5 w-5 text-black" />
                </div>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">GitWhisper</h1>
            </div>
            <h2 className="text-4xl font-bold text-gray-800">
              Your AI-powered guide to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-700">
                codebase mastery
              </span>
            </h2>
            <p className="text-gray-600 text-lg max-w-md">
              Helping interns and students navigate unfamiliar GitHub projects with ease and confidence.
            </p>
          </motion.div>

          <div className="space-y-6">
            {featureItems.map((feature, index) => (
              <motion.div
                custom={index + 1}
                variants={fadeIn}
                key={index}
                className="flex gap-4 items-start"
              >
                <div className="bg-white p-3 rounded-lg shadow-md border border-gray-100">
                  <feature.icon className="h-6 w-6 text-black" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div custom={5} variants={fadeIn} className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Trusted by CS students globally</span>
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`w-6 h-6 rounded-full bg-gradient-to-br ${
                  ['from-gray-600 to-black', 'from-black to-gray-800', 
                   'from-gray-700 to-black', 'from-black to-gray-600'][i]
                } flex items-center justify-center text-[10px] text-white font-medium border-2 border-white`}>
                  {['JD', 'MS', 'AL', 'TK'][i]}
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right Side - Sign In */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-1 overflow-hidden">
            {/* Decorative header */}
            <div className="bg-gradient-to-r from-gray-800 to-black h-2 w-full rounded-t-xl"></div>
            
            {/* Sign-in container */}
            <div className="p-6">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                <p className="text-gray-600">Sign in to continue your journey with GitWhisper</p>
              </div>
              
              {/* Clerk Sign-In Component */}
              <SignIn />
              
              {/* Additional sign-in options */}
              <div className="mt-6 text-center">
                <p className="text-gray-500 text-sm">
                  // Line 130: Replace ' with &apos;
                  // Example:
                  // Change: Don't have an account?
                  // To: Don&apos;t have an account?
                  <a href="/sign-up" className="text-black hover:text-gray-800 font-medium">
                    Create one now
                  </a>
                </p>
              </div>
            </div>
            
            {/* Decorative footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
              <div className="flex justify-between items-center">
                <p className="text-xs text-gray-500">Protected by enterprise-grade security</p>
                <motion.div 
                  className="text-xs text-black flex items-center gap-1 font-medium cursor-pointer"
                  whileHover={{ x: 3 }}
                >
                  <span>Learn more</span>
                  <ArrowRight className="h-3 w-3" />
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}