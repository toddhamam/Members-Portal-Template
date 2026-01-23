import Link from "next/link";
import Image from "next/image";

export const metadata = {
  title: "Refund Policy",
  description: "Refund Policy for Inner Wealth Initiate",
};

export default function RefundPolicyPage() {
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
        <h1 className="text-3xl font-serif font-bold text-gray-900 mb-8">Refund Policy</h1>

        <p className="text-gray-600 mb-6">
          <strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">30-Day Money-Back Guarantee</h2>
            <p>
              At Inner Wealth Initiate, we stand behind the quality of our products. We offer a <strong>30-day money-back guarantee</strong> on all purchases. If you are not satisfied with your purchase for any reason, you may request a full refund within 30 days of your purchase date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">How to Request a Refund</h2>
            <p>To request a refund, please follow these steps:</p>
            <ol className="list-decimal list-inside ml-4 space-y-2 mt-2">
              <li>Send an email to <strong>info@innerwealthinitiate.com</strong> with the subject line &quot;Refund Request&quot;</li>
              <li>Include your full name and the email address used for the purchase</li>
              <li>Provide the order number or transaction ID (found in your confirmation email)</li>
              <li>Briefly explain why you are requesting a refund (optional, but helps us improve)</li>
            </ol>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Refund Processing</h2>
            <p>
              Once we receive your refund request, we will review it and process your refund within <strong>5-7 business days</strong>. Refunds will be issued to the original payment method used for the purchase.
            </p>
            <p className="mt-4">
              Please note that depending on your bank or credit card company, it may take an additional 5-10 business days for the refund to appear on your statement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Eligibility</h2>
            <p>To be eligible for a refund:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Your refund request must be submitted within 30 days of the original purchase date</li>
              <li>The request must be sent from the email address associated with your purchase, or include sufficient information to verify your identity</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Digital Product Access</h2>
            <p>
              Because our products are delivered digitally, you will retain access to purchased materials until your refund is processed. Upon refund approval, your access to the refunded product(s) will be revoked.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Exceptions</h2>
            <p>
              We reserve the right to refuse refund requests in cases of suspected abuse of our refund policy, including but not limited to:
            </p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-2">
              <li>Multiple refund requests from the same individual</li>
              <li>Evidence that the product has been copied, shared, or distributed</li>
              <li>Requests made after the 30-day refund period</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Partial Refunds</h2>
            <p>
              If you purchased multiple products and wish to receive a refund for only some of them, please specify which products you would like refunded in your request. We will process partial refunds accordingly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">Questions?</h2>
            <p>
              If you have any questions about our refund policy or need assistance with a refund request, please don&apos;t hesitate to contact us:
            </p>
            <p className="mt-2">
              <strong>Email:</strong> info@innerwealthinitiate.com
            </p>
            <p className="mt-4">
              We are committed to your satisfaction and will do our best to resolve any issues promptly.
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
