function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#D0ED00] via-[#009900] to-[#D0ED00] border-b border-gray-200 px-6 py-8">
        <div className="text-center">
          <div className="inline-block bg-white px-6 py-3 rounded-lg mb-3 border-2 border-black">
            <h1 className="text-3xl font-bold text-black">Terms of Service</h1>
          </div>
          <p className="text-white mt-2">Last updated: October 3, 2025</p>
        </div>
      </div>

      <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-sm p-8">

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using the BudE networking platform, you accept and agree to be bound by the terms and provision of this agreement.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Use License</h2>
            <p>Permission is granted to temporarily access the materials on BudE for personal, non-commercial use only. This is the grant of a license, not a transfer of title.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
          </section>

          <section>
  <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Prohibited Uses</h2>
  <p>You may not use the service to:</p>
  <ul className="list-disc ml-6 mt-2 space-y-1">
    <li>Violate any applicable laws or regulations</li>
    <li>Harass, abuse, or harm other users</li>
    <li>Impersonate any person or entity</li>
    <li>Transmit spam or unsolicited communications</li>
    <li>Interfere with the security of the service</li>
  </ul>
  
  <div className="mt-4 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
    <p className="mb-3">
      <strong>This is not a DATING app.</strong> If you are reported by another BudE user for using it for that purpose your correspondence will be reviewed and you could be subject to suspension and NO refund of your subscription.
    </p>
    <p>
      <strong>This app shall not be used by you (as a user) to SELL goods or services to other users.</strong> If you are reported by another BudE user for using it for that purpose your correspondence will be reviewed and you could be subject to suspension and NO refund of your subscription.
    </p>
  </div>
</section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Subscription and Payment</h2>
            <p>Paid subscriptions are billed in advance on a monthly or annual basis. Subscriptions automatically renew unless cancelled before the renewal date.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Cancellation and Refunds</h2>
            <p>You may cancel your subscription at any time. Refunds are provided on a case-by-case basis in accordance with our refund policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Intellectual Property</h2>
            <p>The service and its original content, features, and functionality are owned by The BudE System™ and are protected by international copyright, trademark, and other intellectual property laws.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Termination</h2>
            <p>We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Limitation of Liability</h2>
            <p>In no event shall BudE or its suppliers be liable for any damages arising out of the use or inability to use the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">10. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">11. Contact Information</h2>
            <p>For questions about these Terms, please contact us at: support@bude.com</p>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500">© 2025 The BudE System™. All rights reserved.</p>
        </div>
      </div>
      </div>
    </div>
  );
}

export default TermsPage;