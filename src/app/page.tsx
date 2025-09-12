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
} from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';

export default function Home() {
  const { isSignedIn } = useUser();

  const features = [
    {
      icon: Upload,
      title: 'Easy Upload',
      description:
        'Upload your swing videos in seconds with our intuitive drag-and-drop interface.',
    },
    {
      icon: BarChart3,
      title: 'Smart Analysis',
      description:
        'Get AI-powered insights on your swing mechanics, tempo, and form.',
    },
    {
      icon: Play,
      title: 'Side-by-Side Comparison',
      description:
        'Compare multiple swings with synchronized playback and overlay views.',
    },
    {
      icon: Library,
      title: 'Swing Library',
      description:
        'Organize and track your progress with a comprehensive swing library.',
    },
  ];

  return (
    <Layout>
      <div className="h-full w-full">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-white to-blue-50">
          <div className=" px-4 sm:px-6 lg:px-8 pb-20 pt-60">
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                  Master Your
                  <span className="text-green-600"> Golf Swing</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                  Upload your swings, compare instantly, and improve your game
                  with AI-powered analysis. Track your progress and perfect your
                  technique.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center"
              >
                {isSignedIn ? (
                  <>
                    <Link href="/upload">
                      <Button size="lg" className="w-full sm:w-auto">
                        Upload Your Swing
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/library">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto"
                      >
                        View Library
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/sign-up">
                      <Button size="lg" className="w-full sm:w-auto">
                        Get Started
                        <UserPlus className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/sign-in">
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full sm:w-auto"
                      >
                        Sign In
                        <LogIn className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to Improve
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Our comprehensive platform provides all the tools you need to
                analyze, compare, and perfect your golf swing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card hover className="h-full">
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <feature.icon className="h-6 w-6 text-green-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-green-600">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Ready to Transform Your Game?
              </h2>
              <p className="text-xl text-green-100 mb-8">
                Join thousands of golfers who are already improving their swings
                with our platform.
              </p>
              {isSignedIn ? (
                <Link href="/upload">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="w-full sm:w-auto"
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
                      variant="secondary"
                      className="w-full sm:w-auto"
                    >
                      Sign Up Now
                      <UserPlus className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/sign-in">
                    <Button
                      size="lg"
                      variant="outline"
                      className="w-full sm:w-auto bg-white text-green-600 hover:bg-green-50"
                    >
                      Sign In
                      <LogIn className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
