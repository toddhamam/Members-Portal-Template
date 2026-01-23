import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Inner Wealth Initiate",
};

export default function PrivacyPolicyPage() {
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
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Privacy Policy</h1>

        <p className="text-gray-600 mb-6">
          <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Introduction</h2>
            <p>
              Inner Wealth Initiate (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or purchase our products.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Information We Collect</h2>
            <p>We may collect the following types of information:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li><strong>Personal Information:</strong> Name, email address, billing address, and payment information when you make a purchase.</li>
              <li><strong>Usage Data:</strong> Information about how you interact with our website, including IP address, browser type, pages visited, and time spent on pages.</li>
              <li><strong>Cookies and Tracking Technologies:</strong> We use cookies, pixels, and similar technologies to enhance your experience and analyze website traffic.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Process and fulfill your orders</li>
              <li>Send you order confirmations and product access information</li>
              <li>Communicate with you about updates, promotions, and new products (with your consent)</li>
              <li>Improve our website and products</li>
              <li>Comply with legal obligations</li>
              <li>Detect and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Third-Party Services</h2>
            <p>We may share your information with trusted third-party service providers who assist us in operating our business:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li><strong>Payment Processors:</strong> Stripe processes all payments securely. Your payment information is handled directly by Stripe and is subject to their privacy policy.</li>
              <li><strong>Email Marketing:</strong> We use email marketing services to send communications (you can unsubscribe at any time).</li>
              <li><strong>Analytics:</strong> We use analytics tools (such as Google Analytics) to understand how visitors use our site.</li>
              <li><strong>Advertising:</strong> We may use advertising platforms (such as Meta/Facebook) to reach potential customers. These platforms may collect data through cookies and pixels.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Your Rights</h2>
            <p>Depending on your location, you may have the following rights:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of marketing communications</li>
              <li>Withdraw consent where processing is based on consent</li>
            </ul>
            <p className="mt-4">To exercise these rights, please contact us at info@innerwealthinitiate.com.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Children&apos;s Privacy</h2>
            <p>
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last Updated&quot; date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
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
