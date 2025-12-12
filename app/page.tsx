import { auth } from "@/auth";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/ui/navbar";
import { CornerDownRight, Sparkles, TrendingUp, Zap } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const session = await auth();

  return (
    <>
      <section className="min-h-screen relative flex items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50 to-violet-50">
        <BackgroundBeams />
        <Navbar session={session} />
        
        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-white/60"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(139,92,246,0.1),transparent_50%)]"></div>
        
        <div className="w-full max-w-6xl mx-auto px-4 relative pointer-events-none">
          {/* Main Heading */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100/80 backdrop-blur-sm border border-indigo-200/50 mb-6 pointer-events-auto">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-indigo-700">AI-Powered Feedback Intelligence</span>
            </div>
            
            <h1 className="font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-balance mb-6 font-display leading-tight">
              Transform{" "}
              <span className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
                Feedback
              </span>
              <br />
              into{" "}
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent inline-flex items-center gap-3">
                Insights
                <Zap className="w-12 h-12 md:w-16 md:h-16 text-yellow-500 animate-pulse inline-block" />
              </span>
            </h1>
            
            <p className="max-w-3xl mx-auto text-center text-balance text-lg md:text-xl text-slate-600 leading-relaxed">
              InsightFlow empowers businesses to effortlessly gather, analyze, and act on customer feedback with the power of AI. 
              Turn conversations into actionable intelligence.
            </p>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap items-center justify-center gap-3 mb-10 pointer-events-auto">
            <div className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm">
              <span className="text-sm font-medium text-slate-700">🤖 AI Analysis</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm">
              <span className="text-sm font-medium text-slate-700">📊 Real-time Insights</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 shadow-sm">
              <span className="text-sm font-medium text-slate-700">⚡ Instant Integration</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pointer-events-auto">
            <Link href="/register">
              <Button 
                size="lg" 
                className="gap-2 shadow-xl hover:shadow-2xl transition-all hover:scale-105 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white border-0 px-8 py-6 text-lg font-semibold rounded-xl"
              >
                <CornerDownRight className="size-5" />
                Get Started Free
              </Button>
            </Link>
            <Link href="https://youtu.be/9bCmwfdd2dg" target="_blank">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 shadow-md hover:shadow-lg transition-all hover:scale-105 bg-white/80 backdrop-blur-sm border-slate-300 hover:border-indigo-400 px-8 py-6 text-lg font-semibold rounded-xl"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="size-5">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 0 1 0 1.972l-11.54 6.347a1.125 1.125 0 0 1-1.667-.986V5.653Z"
                  />
                </svg>
                Watch Demo
              </Button>
            </Link>
          </div>

          {/* Stats or Social Proof */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto pointer-events-auto">
            <div className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/50 shadow-sm hover:shadow-md transition-all">
              <div className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent mb-2">
                100%
              </div>
              <div className="text-sm text-slate-600 font-medium">AI-Powered Analysis</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/50 shadow-sm hover:shadow-md transition-all">
              <div className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent mb-2 flex items-center justify-center gap-2">
                <TrendingUp className="w-8 h-8" />
                Real-time
              </div>
              <div className="text-sm text-slate-600 font-medium">Instant Insights</div>
            </div>
            <div className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/50 shadow-sm hover:shadow-md transition-all">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-fuchsia-600 bg-clip-text text-transparent mb-2">
                &lt; 5 min
              </div>
              <div className="text-sm text-slate-600 font-medium">Setup Time</div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
