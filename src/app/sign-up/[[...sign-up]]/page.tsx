"use client";

import { SignUp } from '@clerk/nextjs';
import { motion } from "framer-motion";
import { ArrowLeft, MessagesSquare } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Logo and title */}
        <div className="flex items-center justify-center mb-6 space-x-3">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 bg-black/10 rounded-full blur-md"></div>
            <div className="relative z-10 w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center">
              <MessagesSquare className="h-5 w-5 text-black" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">GitWhisper</h1>
        </div>

        {/* Sign up card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-1 overflow-hidden">
          {/* Decorative header */}
          <div className="bg-gradient-to-r from-gray-800 to-black h-2 w-full rounded-t-xl"></div>
          
          {/* Sign-up container */}
          <div className="p-6">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Create Your Account</h2>
              <p className="text-gray-600">Join GitWhisper and start mastering codebases today</p>
            </div>
            
            {/* Clerk Sign-Up Component */}
            <SignUp />
          </div>
          
          {/* Decorative footer */}
          <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
            <div className="flex justify-between items-center">
              <Link href="/" className="text-xs text-black flex items-center gap-1 font-medium">
                <ArrowLeft className="h-3 w-3" />
                <span>Back to home</span>
              </Link>
              <p className="text-xs text-gray-500">Protected by enterprise-grade security</p>
            </div>
          </div>
        </div>

        {/* Additional text */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center text-gray-500 text-sm mt-6"
        >
          By signing up, you agree to our Terms of Service and Privacy Policy
        </motion.p>
      </motion.div>
    </div>
  );
}