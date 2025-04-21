"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"; 
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { motion } from "framer-motion"; // Removed AnimatePresence as it wasn't used directly here
import {
  CheckCircle,
  Code,
  GitBranch,
  MessageSquare,
  Zap,
  Search,
  Upload,
  HelpCircle,
  Github,
  Twitter,
  Dribbble, // Example social icon
  FileCode, // Example icon for demo
  Terminal // Example icon for demo
} from "lucide-react";

export default function Home() {
  const { user } = useUser();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Define reusable color classes for consistency (optional, but helpful)
  const colors = {
    primary: 'indigo',
    secondary: 'purple',
    tertiary: 'teal', // Or emerald
    success: 'emerald',
    warning: 'yellow',
    danger: 'red'
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 antialiased"> {/* Base dark bg, default text */}
      {/* Navbar */}
      <header
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled
            ? "bg-gray-850/90 backdrop-blur-md shadow-lg py-3 border-b border-gray-700/50" // Slightly darker, shadow, border
            : "bg-transparent py-6"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between px-6">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <GitBranch className={`text-${colors.primary}-500 h-7 w-7`} /> {/* Slightly larger icon */}
            <span className={`font-bold text-2xl text-${colors.primary}-400`}>gitRAG</span> {/* Brighter logo text */}
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-gray-400">
            <a href="#features" className={`hover:text-${colors.primary}-300 transition-colors duration-200 ease-in-out`}>Features</a>
            <a href="#workflow" className={`hover:text-${colors.primary}-300 transition-colors duration-200 ease-in-out`}>How It Works</a>
            <a href="#testimonials" className={`hover:text-${colors.primary}-300 transition-colors duration-200 ease-in-out`}>Testimonials</a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button className={`bg-${colors.primary}-600 text-white hover:bg-${colors.primary}-700 shadow-md shadow-${colors.primary}-900/50`}>
                  Dashboard
                </Button>
              </Link>
            ) : (
              <div className="flex gap-3">
                <Link href="/signin">
                  <Button variant="outline" className={`border-${colors.primary}-700 text-gray-300 hover:text-white hover:bg-${colors.primary}-800/40 transition-all duration-200 ease-in-out`}>
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className={`bg-${colors.primary}-600 text-white hover:bg-${colors.primary}-500 shadow-lg shadow-${colors.primary}-800/60 transition-all hover:shadow-xl`}> {/* Brighter hover, stronger shadow */}
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-36 pb-28 px-6 relative overflow-hidden bg-gradient-to-b from-gray-900 via-gray-900 to-gray-850"> {/* Adjusted padding, added subtle bg gradient */}
        {/* Background Elements - More vibrant */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className={`absolute top-10 left-1/4 w-72 h-72 bg-${colors.primary}-800 rounded-full mix-blend-hard-light filter blur-3xl opacity-30 animate-blob`}></div>
          <div className={`absolute top-1/3 right-1/4 w-80 h-80 bg-${colors.secondary}-800 rounded-full mix-blend-hard-light filter blur-3xl opacity-30 animate-blob animation-delay-2000`}></div>
          <div className={`absolute bottom-10 left-1/3 w-96 h-96 bg-${colors.tertiary}-800 rounded-full mix-blend-hard-light filter blur-3xl opacity-25 animate-blob animation-delay-4000`}></div>
        </div>

        <div className="container mx-auto max-w-7xl relative z-10"> {/* Ensure content is above blobs */}
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Release Badge - More colorful */}
              <div className="inline-block mb-5">
                <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium bg-${colors.tertiary}-500 text-${colors.tertiary}-950 shadow`}>
                  <Zap className="w-4 h-4 mr-1.5" /> New Release v1.2
                </span>
              </div>
              {/* Main Heading - Gradient kept */}
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400"> {/* Adjusted gradient slightly */}
                <span className="block">Accelerate Developer</span>
                <span className="block">Onboarding with gitRAG</span>
              </h1>
              {/* Sub Heading */}
              <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                Navigate unfamiliar codebases with confidence. Ask questions, understand commits, and learn new repositories faster than ever with AI-powered insights.
              </p>
            </motion.div>

            {/* Hero CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              {/* Buttons already styled above */}
              {user ? (
                <Link href="/dashboard">
                  <Button size="lg" className={`bg-${colors.primary}-600 text-white hover:bg-${colors.primary}-500 shadow-lg shadow-${colors.primary}-800/60 transition-all hover:shadow-xl text-lg px-10 py-3`}> {/* Explicit large size */}
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/signup">
                    <Button size="lg" className={`bg-${colors.primary}-600 text-white hover:bg-${colors.primary}-500 shadow-lg shadow-${colors.primary}-800/60 transition-all hover:shadow-xl text-lg px-10 py-3`}>
                      Get Started for Free
                    </Button>
                  </Link>
                  <Link href="/signin">
                    <Button size="lg" variant="ghost" className={`px-10 py-3 text-lg text-gray-300 hover:text-white hover:bg-${colors.primary}-800/40 transition-colors duration-200 ease-in-out`}>
                      Sign In →
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>
          </div>

          {/* Hero Demo Image - Enhanced Color */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative max-w-5xl mx-auto"
          >
            <div className="rounded-2xl overflow-hidden shadow-2xl shadow-black/40 border border-gray-700 bg-gray-850"> {/* Slightly darker bg */}
              {/* Mock Window Bar - Vibrant dots */}
              <div className="h-8 bg-gray-700 flex items-center gap-2 px-4 border-b border-gray-700">
                <div className={`w-3.5 h-3.5 rounded-full bg-${colors.danger}-500`}></div>
                <div className={`w-3.5 h-3.5 rounded-full bg-${colors.warning}-500`}></div>
                <div className={`w-3.5 h-3.5 rounded-full bg-${colors.success}-500`}></div>
              </div>
              {/* Mock Content */}
              <div className="p-5 bg-gradient-to-br from-gray-850 to-gray-800"> {/* Subtle gradient bg */}
                <div className="flex gap-6">
                  {/* Mock Repo Structure - Colorful Icons/Dots */}
                  <div className="w-1/3 bg-gray-700/40 p-4 rounded-lg shadow-inner border border-gray-700/50">
                    <h3 className="text-sm font-medium text-gray-100 mb-3 flex items-center gap-2">
                      <Terminal className={`w-4 h-4 text-${colors.tertiary}-400`} /> Repository Structure
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className={`flex items-center gap-2 text-${colors.primary}-300 font-medium`}>
                        <GitBranch className="w-4 h-4" />
                        <span>main</span>
                      </div>
                      <div className="pl-5 space-y-1.5 border-l border-gray-600/50 ml-2">
                        <div className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors">
                          <div className={`w-2 h-2 bg-${colors.primary}-500 rounded-full flex-shrink-0`}></div>
                          <span>src/</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors">
                          <div className={`w-2 h-2 bg-${colors.success}-500 rounded-full flex-shrink-0`}></div>
                          <span>components/</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors">
                          <div className={`w-2 h-2 bg-${colors.secondary}-500 rounded-full flex-shrink-0`}></div>
                          <span>utils/</span>
                        </div>
                         <div className="flex items-center gap-2 text-gray-400 hover:text-gray-200 transition-colors">
                          <FileCode className="w-3 h-3 text-gray-500 flex-shrink-0 ml-1" /> {/* Example file icon */}
                          <span className="text-xs">auth.ts</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Mock Chat - Colorful Highlights */}
                  <div className="w-2/3 bg-gray-700/40 p-4 rounded-lg shadow-inner border border-gray-700/50">
                    <div className={`flex items-center gap-2 mb-3 text-${colors.tertiary}-400`}>
                      <MessageSquare className="w-5 h-5" />
                      <span className="font-medium text-sm">Ask gitRAG</span>
                    </div>
                    {/* User Question */}
                    <div className="border border-gray-600 rounded-lg p-3 text-sm bg-gray-800/60 mb-3 shadow">
                      <p className="text-gray-300">How does the authentication flow work in this codebase?</p>
                    </div>
                     {/* AI Answer with Highlights */}
                    <div className={`p-4 bg-gradient-to-br from-${colors.primary}-900/30 to-${colors.secondary}-900/30 rounded-lg text-sm border border-${colors.primary}-800/50 shadow`}>
                      <p className="text-gray-300 leading-relaxed">
                        The authentication flow uses Clerk. It starts in
                        <code className={`bg-${colors.secondary}-800/50 text-${colors.secondary}-300 px-2 py-0.5 rounded mx-1 font-mono text-xs border border-${colors.secondary}-700`}>src/app/auth.ts</code>
                        which sets up protected routes. User sessions are managed via context in
                        <code className={`bg-${colors.tertiary}-800/50 text-${colors.tertiary}-300 px-2 py-0.5 rounded mx-1 font-mono text-xs border border-${colors.tertiary}-700`}>src/components/AuthProvider.tsx</code>.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badges - Colorful */}
            <motion.div
              className={`absolute -top-8 -right-8 bg-gray-800 rounded-full p-4 shadow-lg border-2 border-${colors.secondary}-700`}
              animate={{ rotate: [0, 10, -5, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
              <Code className={`w-7 h-7 text-${colors.secondary}-400`} />
            </motion.div>
            <motion.div
             className={`absolute -bottom-8 -left-8 bg-gray-800 rounded-full p-4 shadow-lg border-2 border-${colors.success}-700`}
              animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
             >
              <CheckCircle className={`w-7 h-7 text-${colors.success}-500`} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Colorful Icons & Borders */}
      <section id="features" className="py-28 px-6 bg-gray-850"> {/* Slightly darker bg */}
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className={`text-4xl md:text-5xl font-bold mb-5 text-transparent bg-clip-text bg-gradient-to-r from-${colors.primary}-400 to-${colors.tertiary}-400`}>Why Teams Choose gitRAG</h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Shorten the learning curve for new team members and boost productivity across your engineering organization with AI-driven insights.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              // Assigning specific colors to each feature
              { icon: <Search className={`w-9 h-9 text-${colors.primary}-400`} />, title: "AI-Powered Navigation", description: "Understand complex repo structure instantly with AI mapping relationships.", color: colors.primary },
              { icon: <GitBranch className={`w-9 h-9 text-${colors.secondary}-400`} />, title: "Commit Summaries", description: "Get intelligent summaries of commits and PRs highlighting key changes.", color: colors.secondary },
              { icon: <Upload className={`w-9 h-9 text-${colors.tertiary}-400`} />, title: "Meeting Intelligence", description: "Upload recordings to automatically extract and prioritize discussed issues.", color: colors.tertiary },
              { icon: <HelpCircle className={`w-9 h-9 text-${colors.success}-400`} />, title: "Dev Q&A", description: "Ask natural questions about the codebase and get contextual answers.", color: colors.success }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                // Added colored left border, different icon background based on feature color
                className={`bg-gray-800 p-7 rounded-xl shadow-lg border border-gray-700/80 border-l-4 border-${feature.color}-500 hover:shadow-${feature.color}-900/30 hover:border-${feature.color}-400 transition-all duration-300 ease-in-out group`}
              >
                {/* Icon background matches feature color but darker */}
                <div className={`p-4 bg-${feature.color}-900/50 rounded-lg inline-block mb-5 border border-${feature.color}-800/60 transition-colors duration-300 group-hover:bg-${feature.color}-900/80`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-100">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p> {/* Smaller text */}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section - Colorful Badges & Borders */}
      <section id="workflow" className="py-28 px-6 bg-gradient-to-b from-gray-850 to-gray-900"> {/* Gradient bg */}
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
             <h2 className={`text-4xl md:text-5xl font-bold mb-5 text-transparent bg-clip-text bg-gradient-to-r from-${colors.secondary}-400 to-${colors.primary}-400`}>How gitRAG Works</h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Powered by retrieval-augmented generation (RAG), gitRAG creates an intelligent, searchable knowledge base from your code repositories.
            </p>
          </div>

          <div className="relative">
            {/* Connection Lines - More prominent */}
            <div className={`hidden lg:block absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-${colors.primary}-800 via-${colors.secondary}-800 to-${colors.tertiary}-800 opacity-50 -z-10 transform -translate-y-1/2 rounded-full`}></div>

            <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
              {[
                 { step: "01", title: "Connect Repositories", description: "Securely link GitHub, GitLab, or Bitbucket accounts. Indexing starts automatically.", color: colors.primary },
                 { step: "02", title: "AI Analyzes Code", description: "Our system parses code, commits, and discussions, building a semantic knowledge graph.", color: colors.secondary },
                 { step: "03", title: "Ask & Understand", description: "Query in natural language. Get contextual answers, summaries, and code pointers.", color: colors.tertiary }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={{ duration: 0.5, delay: index * 0.15 }}
                  className="relative"
                >
                  {/* Card Styling - Colored border */}
                  <div className={`bg-gray-800 rounded-xl p-8 shadow-xl border border-gray-700 border-t-4 border-${item.color}-500 relative z-10 transition-all duration-300 hover:shadow-${item.color}-900/40 hover:border-gray-600`}>
                    {/* Step Badge - Colored */}
                    <div className={`absolute -top-5 left-1/2 transform -translate-x-1/2 bg-${item.color}-600 text-white text-sm font-bold py-1.5 px-4 rounded-full shadow-md border border-${item.color}-500`}>
                      STEP {item.step}
                    </div>
                    <h3 className="text-xl font-bold mb-4 pt-5 text-center text-gray-100">{item.title}</h3> {/* Centered title */}
                    <p className="text-gray-400 text-center leading-relaxed">{item.description}</p> {/* Centered description */}
                  </div>

                  {/* Connecting Dot - Colored */}
                  <div className={`hidden lg:block absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-${item.color}-500 border-4 border-gray-900 z-20 shadow-lg`}></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section - Colorful Quotes */}
      <section id="testimonials" className="py-28 px-6 bg-gray-850">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-20">
             <h2 className={`text-4xl md:text-5xl font-bold mb-5 text-transparent bg-clip-text bg-gradient-to-r from-${colors.tertiary}-400 to-${colors.success}-400`}>What Developers Say</h2>
            <p className="text-lg text-gray-400 max-w-3xl mx-auto">
              Hear from engineers who've transformed their onboarding and code navigation experience with gitRAG.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              // Using tertiary color for quotes/borders here
              { quote: "gitRAG reduced our onboarding time by 40%. New engineers navigate our complex codebase in days, not weeks.", author: "Sarah Chen", role: "Lead Developer, Fintech Startup" },
              { quote: "The ability to ask questions about our codebase in natural language is a game changer for our distributed team.", author: "Miguel Rodriguez", role: "Senior Engineer, Remote-First Co." },
              { quote: "I use gitRAG daily to understand unfamiliar parts of our codebase. It's like having an expert pair programmer.", author: "Alex Johnson", role: "Full Stack Developer" }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                // Colored quote icon and border
                className={`bg-gray-800 p-7 rounded-xl border border-gray-700/80 shadow-lg transition-all duration-300 ease-in-out border-l-4 border-${colors.tertiary}-500 hover:shadow-${colors.tertiary}-900/30`}
              >
                <div className="flex flex-col h-full">
                  {/* Quote Icon - Colored */}
                  <div className={`mb-5 text-${colors.tertiary}-400`}>
                     <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="fill-current opacity-70">
                        <path d="M9.99999 15C9.99999 13.3333 9.33332 11.8333 8.49999 10.5C7.66666 9.16667 6.66666 8 5.49999 7L5 8C6.16666 9.16667 7.16666 10.6667 7.99999 12.5C8.83332 14.3333 9.49999 16 9.99999 17H6L4 21H10V15ZM19 15C19 13.3333 18.3333 11.8333 17.5 10.5C16.6667 9.16667 15.6667 8 14.5 7L14 8C15.1667 9.16667 16.1667 10.6667 17 12.5C17.8333 14.3333 18.5 16 19 17H15L13 21H19V15Z"/>
                     </svg>
                  </div>
                  <p className="text-gray-300 mb-6 flex-grow leading-relaxed italic">{testimonial.quote}</p> {/* Added italic */}
                  <div className="mt-auto pt-4 border-t border-gray-700/50"> {/* Separator */}
                    <p className="font-semibold text-gray-100">{testimonial.author}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - Vibrant Gradient */}
      <section className="py-24 px-6 bg-gradient-to-br from-indigo-700 via-purple-700 to-indigo-600 text-white"> {/* Richer gradient */}
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">Ready to Transform Your Development Workflow?</h2>
              <p className="text-xl opacity-90 mb-10">
                Join forward-thinking engineering teams accelerating onboarding and boosting productivity with gitRAG.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center">
                <Link href="/signup">
                   {/* Brighter primary CTA */}
                  <Button size="lg" className="bg-white text-indigo-700 hover:bg-gray-100 px-10 py-3 text-lg rounded-lg shadow-xl transition-all duration-300 transform hover:scale-105">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="#demo"> {/* Assuming #demo exists */}
                   {/* Contrasting secondary CTA */}
                  <Button size="lg" variant="outline" className="border-white/70 text-white hover:bg-white/10 hover:border-white px-10 py-3 text-lg rounded-lg transition-all duration-300 transform hover:scale-105">
                    Request Demo
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer - Clean and Consistent */}
      <footer className="py-16 px-6 bg-gray-900 text-gray-400">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-center text-center md:text-left">
            {/* Footer Logo */}
             <div className="flex items-center gap-2 justify-center md:justify-start">
              <GitBranch className={`text-${colors.primary}-500 h-6 w-6`} />
              <span className={`font-bold text-2xl text-${colors.primary}-400`}>gitRAG</span>
            </div>

            {/* Footer Links */}
             <div className="flex flex-wrap justify-center gap-6 md:gap-8">
              <a href="#features" className={`hover:text-${colors.primary}-300 transition-colors duration-200 ease-in-out`}>Features</a>
              <a href="#pricing" className={`hover:text-${colors.primary}-300 transition-colors duration-200 ease-in-out`}>Pricing</a>
              <a href="#docs" className={`hover:text-${colors.primary}-300 transition-colors duration-200 ease-in-out`}>Docs</a>
              <a href="#blog" className={`hover:text-${colors.primary}-300 transition-colors duration-200 ease-in-out`}>Blog</a>
            </div>

            {/* Social Icons */}
             <div className="flex gap-5 justify-center md:justify-end">
              <a href="#" aria-label="GitHub" className={`p-2 rounded-full hover:bg-gray-800 hover:text-white transition-colors duration-200 ease-in-out`}>
                <Github className="w-6 h-6" />
              </a>
              <a href="#" aria-label="Dribbble" className={`p-2 rounded-full hover:bg-gray-800 hover:text-white transition-colors duration-200 ease-in-out`}>
                <Dribbble className="w-6 h-6" />
              </a>
              <a href="#" aria-label="Twitter" className={`p-2 rounded-full hover:bg-gray-800 hover:text-white transition-colors duration-200 ease-in-out`}>
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Copyright */}
          <div className="pt-10 mt-10 border-t border-gray-800 text-center text-sm text-gray-500">
            <p>© {new Date().getFullYear()} gitRAG Technologies Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* CSS for animations (Keep as is) */}
      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 10s infinite cubic-bezier(0.68, -0.55, 0.27, 1.55); /* Adjusted timing */
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}