import React from "react";

export default function Footer() {
  return (
    <>
      {/* MIALTER Title Banner */}
      <div
        className="w-full flex flex-col items-center justify-end bg-white"
        style={{
          borderBottom: '8px solid #FFD700',
          padding: 0,
          margin: 0,
          lineHeight: 1,
          height: 'auto',
          minHeight: 0,
        }}
      >
        <span
          className="block text-[4rem] md:text-[6rem] font-extrabold text-yellow-400 leading-none tracking-tight"
          style={{
            fontFamily: `'Playfair Display', 'Merriweather', Georgia, serif`,
            letterSpacing: '-0.04em',
            lineHeight: 1,
            margin: 0,
            padding: 0,
            display: 'block',
            marginBottom: '-0.18em', // Pull text down to touch the border
          }}
        >
          MIALTER
        </span>
      </div>
      <footer className="w-full bg-black text-yellow-400 pt-8 pb-4 mt-0 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          {/* Project Title and Description */}
          <div className="mb-6 text-center">
            <div className="text-lg md:text-xl text-white font-medium mb-1">Create your perfect virtual altar</div>
            <div className="text-sm text-gray-300 max-w-2xl mx-auto">
              MIALTER is a creative platform for designing, sharing, and personalizing virtual altars and memorials. Whether for remembrance, celebration, or creative expression, MIALTER empowers you to craft meaningful digital spaces with ease and beauty.
            </div>
          </div>
          {/* Navigation Links */}
          <div className="flex flex-wrap flex-col sm:flex-row gap-2 sm:gap-6 justify-center items-center text-sm font-semibold mb-6 text-center">
            <a href="/" className="hover:underline">Home</a>
            <a href="/features" className="hover:underline">Features</a>
            <a href="/pricing" className="hover:underline">Pricing & Plans</a>
            <a href="/gallery" className="hover:underline">Gallery</a>
            <a href="/community" className="hover:underline">Community</a>
            <a href="/blog" className="hover:underline">Blog</a>
            <a href="/faq" className="hover:underline">FAQ</a>
            <a href="/support" className="hover:underline">Support</a>
            <a href="/contact" className="hover:underline">Contact Us</a>
            <a href="/privacy" className="hover:underline">Privacy Policy</a>
            <a href="/terms" className="hover:underline">Terms of Service</a>
          </div>
          {/* Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-white py-8 border-t border-b border-gray-800 mb-4 text-center sm:text-left">
            {/* Platform */}
            <div>
              <div className="text-yellow-400 font-bold mb-3">Platform</div>
              <ul className="space-y-1 text-sm">
                <li><a href="/create" className="hover:underline">Create Altar</a></li>
                <li><a href="/gallery" className="hover:underline">Explore Altars</a></li>
                <li><a href="/templates" className="hover:underline">Templates</a></li>
                <li><a href="/decor" className="hover:underline">Decor Gallery</a></li>
                <li><a href="/export" className="hover:underline">Export & Share</a></li>
              </ul>
            </div>
            {/* Resources */}
            <div>
              <div className="text-yellow-400 font-bold mb-3">Resources</div>
              <ul className="space-y-1 text-sm">
                <li><a href="/getting-started" className="hover:underline">Getting Started</a></li>
                <li><a href="/guide" className="hover:underline">User Guide</a></li>
                <li><a href="/tutorials" className="hover:underline">Video Tutorials</a></li>
                <li><a href="/blog" className="hover:underline">Blog</a></li>
                <li><a href="/help" className="hover:underline">Help Center</a></li>
              </ul>
            </div>
            {/* Community */}
            <div>
              <div className="text-yellow-400 font-bold mb-3">Community</div>
              <ul className="space-y-1 text-sm">
                <li><a href="/forums" className="hover:underline">Forums</a></li>
                <li><a href="/events" className="hover:underline">Events & Webinars</a></li>
                <li><a href="/stories" className="hover:underline">User Stories</a></li>
                <li><a href="/feedback" className="hover:underline">Submit Feedback</a></li>
                <li><a href="/partners" className="hover:underline">Partner With Us</a></li>
              </ul>
            </div>
            {/* About */}
            <div>
              <div className="text-yellow-400 font-bold mb-3">About</div>
              <ul className="space-y-1 text-sm">
                <li><a href="/about" className="hover:underline">About MIALTER</a></li>
                <li><a href="/mission" className="hover:underline">Our Mission</a></li>
                <li><a href="/team" className="hover:underline">Team</a></li>
                <li><a href="/press" className="hover:underline">Press & Media</a></li>
                <li><a href="/careers" className="hover:underline">Careers</a></li>
              </ul>
            </div>
          </div>
          {/* Social Icons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-4">
            <a href="#" title="Twitter" className="text-yellow-400 hover:text-white text-2xl" aria-label="Twitter">
              <svg fill="currentColor" viewBox="0 0 24 24" width="28" height="28"><path d="M22.46 6c-.77.35-1.6.58-2.47.69a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.64-.58 1.39-.58 2.19 0 1.51.77 2.85 1.95 3.63-.72-.02-1.4-.22-1.99-.55v.06c0 2.11 1.5 3.87 3.5 4.27-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.68 2.11 2.9 3.97 2.93A8.6 8.6 0 0 1 2 19.54c-.29 0-.57-.02-.85-.05A12.13 12.13 0 0 0 8.29 21.5c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.18 8.18 0 0 0 24 4.59a8.36 8.36 0 0 1-2.54.7z"/></svg>
            </a>
            <a href="#" title="Facebook" className="text-yellow-400 hover:text-white text-2xl" aria-label="Facebook">
              <svg fill="currentColor" viewBox="0 0 24 24" width="28" height="28"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg>
            </a>
            <a href="#" title="Instagram" className="text-yellow-400 hover:text-white text-2xl" aria-label="Instagram">
              <svg fill="currentColor" viewBox="0 0 24 24" width="28" height="28"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.775.131 4.602.425 3.635 1.392 2.668 2.359 2.374 3.532 2.315 4.808 2.256 6.088 2.243 6.497 2.243 12c0 5.503.013 5.912.072 7.192.059 1.276.353 2.449 1.32 3.416.967.967 2.14 1.261 3.416 1.32 1.28.059 1.689.072 7.192.072s5.912-.013 7.192-.072c1.276-.059 2.449-.353 3.416-1.32.967-.967 1.261-2.14 1.32-3.416.059-1.28.072-1.689.072-7.192s-.013-5.912-.072-7.192c-.059-1.276-.353-2.449-1.32-3.416C21.551.425 20.378.131 19.102.072 17.822.013 17.413 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm7.2-10.406a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>
            </a>
          </div>
          {/* Copyright */}
          <div className="text-center text-yellow-400 text-xs mt-2">
            © {new Date().getFullYear()} Outside Interactive, Inc
          </div>
        </div>
      </footer>
    </>
  );
} 