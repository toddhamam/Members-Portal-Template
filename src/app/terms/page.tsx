import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Inner Wealth Initiate",
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="py-6 px-4 bg-black">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="Inner Wealth Initiate"
              width={200}
              height={50}
              className="mx-auto"
            />
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Terms of Service</h1>

        <p className="text-gray-600 mb-6">
          <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing or using the Inner Wealth Initiate website and purchasing our products, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Products and Services</h2>
            <p>
              Inner Wealth Initiate offers digital products including eBooks, guides, courses, and related materials focused on personal development, spiritual growth, and self-improvement. All products are delivered digitally and are available for immediate download or access upon purchase.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Intellectual Property</h2>
            <p>
              All content, including but not limited to text, graphics, images, videos, audio, and software, is the property of Inner Wealth Initiate and is protected by copyright and other intellectual property laws.
            </p>
            <p className="mt-4">
              Upon purchase, you are granted a limited, non-exclusive, non-transferable license to access and use the purchased materials for personal, non-commercial purposes only. You may not:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Reproduce, distribute, or publicly display the materials</li>
              <li>Modify or create derivative works</li>
              <li>Share your account or access credentials with others</li>
              <li>Use the materials for commercial purposes</li>
              <li>Resell or redistribute the products</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. User Accounts</h2>
            <p>
              When you create an account, you are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Payment and Pricing</h2>
            <p>
              All prices are listed in US Dollars (USD) unless otherwise specified. We reserve the right to change prices at any time without notice. Payment is processed securely through Stripe, and you agree to provide accurate payment information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Disclaimer</h2>
            <p>
              <strong>Educational Purposes Only:</strong> The content provided by Inner Wealth Initiate is for educational and informational purposes only. It is not intended to be a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of qualified health providers with any questions you may have.
            </p>
            <p className="mt-4">
              <strong>No Guarantees:</strong> While we believe our products provide valuable insights and tools, we make no guarantees regarding specific results. Individual outcomes vary based on many factors including effort, dedication, and personal circumstances.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Inner Wealth Initiate shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of our products or services.
            </p>
            <p className="mt-4">
              Our total liability shall not exceed the amount you paid for the product or service giving rise to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless Inner Wealth Initiate and its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of our products or violation of these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your access to our services at any time, without notice, for conduct that we believe violates these Terms or is harmful to other users or our business.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Inner Wealth Initiate operates, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of our services after any changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">12. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> info@innerwealthinitiate.com
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 bg-black">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-center gap-6 mb-4 text-sm">
            <Link href="/privacy" className="text-gray-400 hover:text-white underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-gray-400 hover:text-white underline">
              Terms of Service
            </Link>
            <Link href="/refund" className="text-gray-400 hover:text-white underline">
              Refund Policy
            </Link>
          </div>
          <p className="text-center text-sm text-gray-500">All rights reserved {new Date().getFullYear()}.</p>
        </div>
      </footer>
    </main>
  );
}
