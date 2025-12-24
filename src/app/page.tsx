'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Play,
  BarChart3,
  Upload,
  Library,
  LogIn,
  UserPlus,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';

export default function Home() {
  const { isSignedIn } = useUser();

  const features = [
    {
      icon: Upload,
      title: 'Instant Upload',
      description:
        'Drag and drop your swing videos. Our AI processes them in seconds.',
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      icon: BarChart3,
      title: 'AI Analysis',
      description:
        'Get detailed insights on your swing mechanics, tempo, and form.',
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      icon: Play,
      title: 'Side-by-Side',
      description:
        'Compare multiple swings with synchronized playback and overlays.',
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      icon: Library,
      title: 'Progress Tracking',
      description: 'Build your swing library and track improvement over time.',
      color: 'from-emerald-500 to-emerald-600',
    },
  ];

  return (
    <Layout>
      <div className="h-full w-full bg-black text-white overflow-x-hidden">
        {/* Hero Section - Asymmetric Split */}
        <section className="relative min-h-screen flex items-center overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-950/50 via-black to-emerald-950/30"></div>
            <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl animate-blob"></div>
            <div className="absolute bottom-1/4 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          </div>

          {/* Grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>

          <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Column - Content */}
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-8"
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
                >
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-medium">
                    AI-Powered Analysis
                  </span>
                </motion.div>

                <h1 className="text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight">
                  Master Your
                  <br />
                  <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                    Golf Swing
                  </span>
                </h1>

                <p className="text-xl md:text-2xl text-gray-400 leading-relaxed max-w-xl">
                  Transform your game with AI-powered swing analysis. Upload,
                  compare, and perfect your technique with precision insights.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  {isSignedIn ? (
                    <>
                      <Link href="/upload">
                        <Button
                          size="lg"
                          className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-0"
                        >
                          Upload Swing
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                      <Link href="/library">
                        <Button
                          variant="outline"
                          size="lg"
                          className="px-8 py-4 text-lg font-semibold bg-white/5 backdrop-blur-sm border-white/20 text-white hover:bg-white/10"
                        >
                          View Library
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link href="/sign-up">
                        <Button
                          size="lg"
                          className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-0"
                        >
                          Get Started
                          <UserPlus className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                      <Link href="/sign-in">
                        <Button
                          variant="outline"
                          size="lg"
                          className="px-8 py-4 text-lg font-semibold bg-white/5 backdrop-blur-sm border-white/20 text-white hover:bg-white/10"
                        >
                          Sign In
                          <LogIn className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>
                    </>
                  )}
                </div>
              </motion.div>

              {/* Right Column - Visual Element */}
              <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative hidden lg:block"
              >
                <div className="relative">
                  {/* Glass morphism card */}
                  <div className="glass-dark rounded-3xl p-12 border border-white/10 backdrop-blur-xl">
                    <div className="space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 flex items-center justify-center border border-emerald-500/30">
                          <Target className="h-8 w-8 text-emerald-400" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-400">Accuracy</div>
                          <div className="text-3xl font-bold">98.2%</div>
                        </div>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: '98%' }}
                          transition={{ duration: 1.5, delay: 0.5 }}
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Floating elements */}
                  <motion.div
                    animate={{ y: [0, -20, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute -top-8 -right-8 w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-xl border border-emerald-500/30 flex items-center justify-center"
                  >
                    <Zap className="h-10 w-10 text-emerald-400" />
                  </motion.div>

                  <motion.div
                    animate={{ y: [0, 20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                    className="absolute -bottom-8 -left-8 w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 backdrop-blur-xl border border-emerald-500/30 flex items-center justify-center"
                  >
                    <TrendingUp className="h-8 w-8 text-emerald-400" />
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section - Creative Layout */}
        <section className="relative py-32 md:py-40 overflow-hidden">
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-950/5 to-transparent"></div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight">
                Powerful
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                  Features
                </span>
              </h2>
              <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                Everything you need to elevate your golf game
              </p>
            </motion.div>

            {/* Creative asymmetric grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {features.map((feature, index) => {
                // Alternate between different card sizes and positions
                const isLarge = index === 0 || index === 3;
                const colSpan = isLarge ? 'md:col-span-7' : 'md:col-span-5';
                const isOffset = index === 1;

                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
                    whileInView={{ opacity: 1, scale: 1, rotateY: 0 }}
                    viewport={{ once: true, margin: '-100px' }}
                    transition={{
                      delay: index * 0.15,
                      duration: 0.7,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={`group relative ${colSpan} ${isOffset ? 'md:col-start-8' : ''}`}
                  >
                    {/* Animated background gradient */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>

                    {/* Card with unique styling */}
                    <div className="relative glass-dark rounded-3xl p-8 md:p-10 border border-white/10 hover:border-emerald-500/40 transition-all duration-500 h-full overflow-hidden">
                      {/* Diagonal accent line */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      <div className="relative flex flex-col h-full">
                        {/* Icon with unique positioning */}
                        <div className="flex items-start justify-between mb-6">
                          <div className="relative">
                            <div
                              className={`absolute -inset-2 w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-30 blur-md transition-all duration-500 group-hover:scale-150`}
                            ></div>
                            <div
                              className={`relative w-16 h-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-500`}
                            >
                              <feature.icon className="h-8 w-8 text-white" />
                            </div>
                          </div>

                          {/* Number badge */}
                          <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm group-hover:bg-emerald-500/20 group-hover:scale-110 transition-all duration-300">
                            {index + 1}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col">
                          <h3 className="text-2xl md:text-3xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors duration-300">
                            {feature.title}
                          </h3>
                          <p className="text-gray-400 leading-relaxed text-base md:text-lg flex-1">
                            {feature.description}
                          </p>

                          {/* Arrow indicator */}
                          <div className="mt-6 flex items-center text-emerald-400 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all duration-300">
                            <ArrowRight className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-32 md:py-40 border-t border-white/10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black leading-tight">
                Ready to
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-emerald-500 bg-clip-text text-transparent">
                  Transform Your Game?
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mx-auto">
                Join thousands of golfers improving their swings with AI-powered
                analysis
              </p>
              <div className="pt-8">
                {isSignedIn ? (
                  <Link href="/upload">
                    <Button
                      size="lg"
                      className="px-10 py-5 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-0"
                    >
                      Get Started Now
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/sign-up">
                      <Button
                        size="lg"
                        className="px-10 py-5 text-lg font-semibold bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-0"
                      >
                        Sign Up Now
                        <UserPlus className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/sign-in">
                      <Button
                        variant="outline"
                        size="lg"
                        className="px-10 py-5 text-lg font-semibold bg-white/5 backdrop-blur-sm border-white/20 text-white hover:bg-white/10"
                      >
                        Sign In
                        <LogIn className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
