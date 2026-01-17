"use client";

// Download icon for CTA button
function DownloadIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
    </svg>
  );
}

// YouTube icon
function YouTubeIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

// Brand logo icon (flame/lotus design)
function BrandLogo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none">
      {/* Outer circle */}
      <circle cx="50" cy="50" r="45" stroke="#d4a574" strokeWidth="2" fill="none" />
      {/* Inner flame/lotus shape */}
      <path
        d="M50 20 C50 20, 35 40, 35 55 C35 65, 42 75, 50 80 C58 75, 65 65, 65 55 C65 40, 50 20, 50 20Z"
        fill="#d4a574"
      />
      <path
        d="M50 30 C50 30, 42 45, 42 55 C42 62, 46 68, 50 72 C54 68, 58 62, 58 55 C58 45, 50 30, 50 30Z"
        fill="#e85d04"
      />
      <path
        d="M50 40 C50 40, 46 50, 46 56 C46 60, 48 64, 50 66 C52 64, 54 60, 54 56 C54 50, 50 40, 50 40Z"
        fill="#faa307"
      />
    </svg>
  );
}

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-[#1a1a1a] py-4 px-4">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <BrandLogo className="w-10 h-10" />
          <div className="text-white">
            <span className="text-sm font-medium tracking-widest">INNER WEALTH</span>
            <br />
            <span className="text-sm font-medium tracking-widest">INITIATE</span>
            <span className="text-[10px] align-top">™</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1">
        {/* Thank You Section */}
        <section className="py-12 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="font-serif text-5xl lg:text-6xl text-[#222222] mb-4">
              Thank You!
            </h1>

            <p className="text-gray-600 mb-6">
              Your order is complete...
            </p>

            <p className="text-[#222222] font-semibold text-lg mb-8">
              Click below to access your product downloads + course portal
            </p>

            <a
              href="#"
              className="inline-flex items-center justify-center gap-2 bg-[#7c5cff] hover:bg-[#6b4ce6] text-white text-xl font-medium px-8 py-4 rounded-lg transition-colors"
            >
              Access Your Products
              <DownloadIcon className="w-6 h-6" />
            </a>
          </div>
        </section>

        {/* Order Confirmation */}
        <section className="py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold text-[#222222] mb-4">Order Confirmation</h2>

            <div className="border-t border-gray-200">
              {/* Table Header */}
              <div className="grid grid-cols-12 py-3 text-sm font-medium text-gray-600 border-b border-gray-200">
                <div className="col-span-8">Product</div>
                <div className="col-span-2 text-center">Quantity</div>
                <div className="col-span-2 text-right">Price</div>
              </div>

              {/* Product Row - Placeholder for dynamic content */}
              <div className="grid grid-cols-12 py-4 text-sm border-b border-gray-200">
                <div className="col-span-8 text-gray-800">Resistance Mapping Guide™ - Expanded 2nd Edition</div>
                <div className="col-span-2 text-center text-gray-600">1</div>
                <div className="col-span-2 text-right text-gray-800">AU$7.00</div>
              </div>

              {/* Total Row */}
              <div className="grid grid-cols-12 py-4 text-sm font-semibold">
                <div className="col-span-8 text-gray-800">Total</div>
                <div className="col-span-2 text-center"></div>
                <div className="col-span-2 text-right text-gray-800">AU$7.00</div>
              </div>
            </div>
          </div>
        </section>

        {/* YouTube Subscribe Section */}
        <section className="py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl lg:text-4xl text-[#222222] text-center mb-4">
              P.s. Don&apos;t forget to Subscribe!
            </h2>

            <p className="text-gray-600 text-center mb-8">
              Subscribe to my YouTube Channel to stay up to date with free content, exercises, and subscriber only promotions...
            </p>

            {/* YouTube Channel Embed/Preview */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-8">
              {/* Channel Banner */}
              <div className="h-32 bg-gradient-to-r from-[#1a1a2e] via-[#16213e] to-purple-900 relative">
                {/* Stars/space effect */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIj48Y2lyY2xlIGN4PSIxMCIgY3k9IjEwIiByPSIxIiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC4zIi8+PGNpcmNsZSBjeD0iNTAiIGN5PSIzMCIgcj0iMC41IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC41Ii8+PGNpcmNsZSBjeD0iODAiIGN5PSI2MCIgcj0iMC44IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC40Ii8+PGNpcmNsZSBjeD0iMjAiIGN5PSI3MCIgcj0iMC42IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC4zIi8+PGNpcmNsZSBjeD0iNjAiIGN5PSI4MCIgcj0iMSIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuMiIvPjwvc3ZnPg==')] opacity-50" />
              </div>

              {/* Channel Info */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start gap-4">
                  {/* Profile Image Placeholder */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1a1a2e] to-purple-900 flex-shrink-0 flex items-center justify-center overflow-hidden">
                    <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCI+PGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiMxYTFhMmUiLz48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIyMCIgZmlsbD0iIzg4NjZmZiIgb3BhY2l0eT0iMC41Ii8+PGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMTAiIGZpbGw9IiNmZjY2ZmYiIG9wYWNpdHk9IjAuNiIvPjwvc3ZnPg==')]" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900">Inner Wealth Initiate</h3>
                    <p className="text-sm text-gray-500">@innerwealthinitiate · 788 subscribers · 265 videos</p>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      I talk about consciousness, non-duality, and the hidden mechanics of reality, so you can...
                      <span className="text-blue-600 ml-1">more</span>
                    </p>
                  </div>
                </div>

                {/* Channel Actions */}
                <div className="flex items-center gap-3 mt-4">
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-full transition-colors">
                    Customise channel
                  </button>
                  <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium px-4 py-2 rounded-full transition-colors">
                    Manage videos
                  </button>
                  <button className="bg-[#222222] hover:bg-black text-white text-sm font-medium px-4 py-2 rounded-full transition-colors">
                    View channel stats
                  </button>
                </div>
              </div>

              {/* Channel Navigation */}
              <div className="px-4 py-2 border-b border-gray-100 flex items-center gap-6">
                <button className="text-sm font-medium text-gray-900 border-b-2 border-gray-900 pb-2">Home</button>
                <button className="text-sm text-gray-500 hover:text-gray-700 pb-2">Videos</button>
                <button className="text-sm text-gray-500 hover:text-gray-700 pb-2">Shorts</button>
                <button className="text-sm text-gray-500 hover:text-gray-700 pb-2">Posts</button>
                <svg className="w-5 h-5 text-gray-500 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Video Thumbnails */}
              <div className="p-4">
                <p className="text-sm font-medium text-gray-500 mb-3">For you</p>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {/* Video 1 */}
                  <div className="flex-shrink-0 w-48">
                    <div className="aspect-video bg-gradient-to-br from-blue-900 to-blue-700 rounded-lg relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center p-4">
                        <span className="text-white font-bold text-sm leading-tight">Meditation Changed Everything</span>
                      </div>
                    </div>
                  </div>

                  {/* Video 2 */}
                  <div className="flex-shrink-0 w-48">
                    <div className="aspect-video bg-gradient-to-br from-amber-100 to-amber-200 rounded-lg relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center p-4">
                        <span className="text-gray-800 font-bold text-sm leading-tight text-center">Stop Feeling Stuck & Be Free...</span>
                      </div>
                    </div>
                  </div>

                  {/* Video 3 */}
                  <div className="flex-shrink-0 w-48">
                    <div className="aspect-video bg-gradient-to-br from-amber-800 to-amber-900 rounded-lg relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center p-4">
                        <span className="text-white font-bold text-sm leading-tight text-center">Who Awakens ???</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Visit YouTube Channel Button */}
            <div className="text-center">
              <a
                href="https://youtube.com/@innerwealthinitiate"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#c9302c] hover:bg-[#ac2925] text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                Visit YouTube Channel
                <YouTubeIcon className="w-5 h-5" />
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-[#1a1a1a] py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <BrandLogo className="w-16 h-16" />
          </div>
          <div className="text-white mb-6">
            <span className="text-lg font-medium tracking-widest">INNER WEALTH</span>
            <br />
            <span className="text-lg font-medium tracking-widest">INITIATE</span>
            <span className="text-xs align-top">™</span>
          </div>
          <p className="text-gray-500 text-sm">
            Inner Wealth Initiate | Copyright &copy;{new Date().getFullYear()} | All Rights Reserved
          </p>
        </div>
      </footer>
    </main>
  );
}
