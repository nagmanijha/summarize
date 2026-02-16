import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="bg-[#f6f6f8] dark:bg-[#101322] text-gray-900 dark:text-white font-sans antialiased overflow-x-hidden min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-[#f6f6f8]/80 dark:bg-[#101322]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-blue-600/10 p-1.5 rounded-lg">
                <span className="material-icons text-blue-600 text-xl">description</span>
              </div>
              <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">ScribeAI</span>
            </div>
            <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-600 dark:text-gray-300">
              <a className="hover:text-blue-600 transition-colors" href="#how-it-works">How It Works</a>
              <a className="hover:text-blue-600 transition-colors" href="#features">Features</a>
              <a className="hover:text-blue-600 transition-colors" href="#pricing">Pricing</a>
            </div>
            <div className="flex items-center space-x-4">
              <Link className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors hidden sm:block" href="/dashboard">Log in</Link>
              <Link className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-600/20" href="/dashboard">Get Started</Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{
          backgroundImage: 'radial-gradient(#1337ec 0.5px, transparent 0.5px), radial-gradient(#1337ec 0.5px, #f6f6f8 0.5px)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 10px 10px'
        }}></div>
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-[400px] h-[400px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/5 border border-blue-600/10 text-blue-600 text-xs font-semibold mb-8">
            <span className="flex h-2 w-2 rounded-full bg-blue-600"></span>
            Powered by Google Document AI & Gemini
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6 max-w-4xl mx-auto leading-tight">
            Turn <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-400">Handwritten Notes</span> into <br className="hidden md:block" /> Structured AI Summaries
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop transcribing manually. We use advanced AI to instantly convert your messy PDF scans into clean, actionable insights and formatted text.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/dashboard" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-base font-semibold transition-all shadow-xl shadow-blue-600/25 hover:-translate-y-0.5">
              <span className="material-icons text-xl">upload_file</span>
              Upload PDF to Summarize
            </Link>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 px-8 py-4 rounded-xl text-base font-semibold transition-all">
              <span className="material-icons text-xl">play_circle_outline</span>
              View Interactive Demo
            </button>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="material-icons text-base text-green-500">lock</span>
            <span>Bank-grade security. Files auto-deleted after processing.</span>
          </div>

          {/* Hero Visual / Mockup */}
          <div className="mt-16 relative mx-auto max-w-5xl">
            <div className="absolute inset-0 bg-gradient-to-t from-[#f6f6f8] dark:from-[#101322] via-transparent to-transparent z-20 h-full w-full pointer-events-none"></div>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-2 md:p-4 overflow-hidden">
              <div className="grid md:grid-cols-2 gap-4 h-[400px] md:h-[500px]">
                {/* Left: Handwritten Input */}
                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-700 p-6 relative overflow-hidden group">
                  <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 shadow-sm px-3 py-1 rounded-md text-xs font-semibold text-gray-500 z-10">Original Scan</div>
                  <img alt="Messy handwritten notes on paper" className="w-full h-full object-cover opacity-80 mix-blend-multiply dark:mix-blend-normal grayscale group-hover:grayscale-0 transition-all duration-500" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCrpQ7iEAb7cbttOFlm3-6RHXy1KwfQT2hlr3Ud1TKFPyosffJB4FIrNjroyQfOjHg48CFFYSzBU9ToPfZvOPkj3QraAfWji97AaEWejLZSU2aiQ1rwkLBtqk_tsVwJQYonlxJ8ceAXarS7YcbrGAVcjxp7C3-RkOqql5ZTt4WNV6CANMAAZEQIaTSbApuEl6ocL_iJQyLOxwhMNGNIlIRBI56wVTS84oqaMCmZIojxZ5WKYU3s2RFTv4b2agCt1ftkmj1mAszdsQU" />
                </div>
                {/* Right: AI Output */}
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-blue-600/20 p-6 relative flex flex-col">
                  <div className="absolute top-4 right-4 bg-blue-600/10 text-blue-600 px-3 py-1 rounded-md text-xs font-semibold flex items-center gap-1">
                    <span className="material-icons text-xs">auto_awesome</span> AI Summary
                  </div>
                  <div className="space-y-4 mt-8">
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4 animate-pulse"></div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full animate-pulse delay-75"></div>
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-5/6 animate-pulse delay-100"></div>
                    <div className="p-4 bg-blue-600/5 rounded-lg border border-blue-600/10 mt-6">
                      <h4 className="text-sm font-bold text-blue-600 mb-2">Key Insights Extracted:</h4>
                      <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        <li>Meeting objective confirmed for Q3 launch.</li>
                        <li>Budget allocation increased by 15%.</li>
                        <li>Pending approval from the finance department.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800" id="how-it-works">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">From Ink to Intelligence</h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Three simple steps to digitize your workflow.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-gray-200 via-blue-600/30 to-gray-200 z-0"></div>
            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-[#f6f6f8] dark:bg-[#101322] rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-center mb-6 shadow-sm group-hover:border-blue-600/50 group-hover:shadow-lg transition-all duration-300">
                <span className="material-icons text-4xl text-gray-400 group-hover:text-blue-600 transition-colors">cloud_upload</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">1. Upload PDF</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 px-4">Drag & drop your handwritten meeting notes, journal pages, or forms.</p>
            </div>
            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-[#f6f6f8] dark:bg-[#101322] rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-center mb-6 shadow-sm group-hover:border-blue-600/50 group-hover:shadow-lg transition-all duration-300">
                <span className="material-icons text-4xl text-gray-400 group-hover:text-blue-600 transition-colors">psychology</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">2. AI Processing</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 px-4">Google Doc AI deciphers the handwriting while Gemini extracts key points.</p>
            </div>
            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-[#f6f6f8] dark:bg-[#101322] rounded-2xl border border-gray-200 dark:border-gray-700 flex items-center justify-center mb-6 shadow-sm group-hover:border-blue-600/50 group-hover:shadow-lg transition-all duration-300">
                <span className="material-icons text-4xl text-gray-400 group-hover:text-blue-600 transition-colors">article</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">3. Smart Summary</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 px-4">Receive a structured digital summary ready to copy, edit, or share.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-[#f6f6f8] dark:bg-[#101322]" id="features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:shadow-blue-600/5 transition-all">
              <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-6">
                <span className="material-icons text-blue-600">border_color</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Handwriting Recognition</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">Powered by Google's industry-leading OCR, capable of reading even the messiest cursive and shorthand.</p>
            </div>
            {/* Feature 2 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:shadow-blue-600/5 transition-all">
              <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-6">
                <span className="material-icons text-blue-600">format_shapes</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Structured Extraction</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">Don't just get text. Get tables, bullet points, and action items automatically organized by Gemini.</p>
            </div>
            {/* Feature 3 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:shadow-blue-600/5 transition-all">
              <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-6">
                <span className="material-icons text-blue-600">security</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Secure Auto-Delete</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">Your data privacy is paramount. All uploaded documents are automatically deleted after processing.</p>
            </div>
            {/* Feature 4 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:shadow-blue-600/5 transition-all">
              <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-6">
                <span className="material-icons text-blue-600">translate</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Multi-Language Support</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">Detects and translates handwriting in over 40 languages seamlessly.</p>
            </div>
            {/* Feature 5 */}
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:shadow-blue-600/5 transition-all">
              <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center mb-6">
                <span className="material-icons text-blue-600">ios_share</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Export Anywhere</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">One-click export to Notion, Google Docs, Slack, or plain text format.</p>
            </div>
            {/* Feature 6 (CTA Card) */}
            <div className="bg-blue-600 p-8 rounded-xl border border-blue-600 text-white flex flex-col justify-center items-center text-center shadow-lg shadow-blue-600/20">
              <h3 className="text-xl font-bold mb-3">Ready to try?</h3>
              <p className="text-blue-100 mb-6 text-sm">Get 5 free summaries when you sign up today.</p>
              <Link href="/dashboard" className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold text-sm hover:bg-gray-50 transition-colors w-full">Start for Free</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f6f6f8] dark:bg-[#101322] border-t border-gray-200 dark:border-gray-800 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-blue-600/10 p-1.5 rounded-lg">
                  <span className="material-icons text-blue-600 text-lg">description</span>
                </div>
                <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">ScribeAI</span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Transforming messy handwriting into structured intelligence for modern teams.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a className="hover:text-blue-600" href="#">Features</a></li>
                <li><a className="hover:text-blue-600" href="#">Integrations</a></li>
                <li><a className="hover:text-blue-600" href="#">Pricing</a></li>
                <li><a className="hover:text-blue-600" href="#">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a className="hover:text-blue-600" href="#">About</a></li>
                <li><a className="hover:text-blue-600" href="#">Blog</a></li>
                <li><a className="hover:text-blue-600" href="#">Careers</a></li>
                <li><a className="hover:text-blue-600" href="#">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li><a className="hover:text-blue-600" href="#">Privacy Policy</a></li>
                <li><a className="hover:text-blue-600" href="#">Terms of Service</a></li>
                <li><a className="hover:text-blue-600" href="#">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 dark:border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">© 2026 ScribeAI Inc. All rights reserved.</p>
            <div className="flex space-x-6">
              <a className="text-gray-400 hover:text-blue-600" href="#"><span className="sr-only">Twitter</span><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg></a>
              <a className="text-gray-400 hover:text-blue-600" href="#"><span className="sr-only">GitHub</span><svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" fillRule="evenodd"></path></svg></a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
