import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Silver Creek Logistics LLC.",
};

export default function PrivacyPage() {
  const effective = "May 1, 2026";

  return (
    <div className="bg-white">
      <div className="bg-[#1a2744] text-white py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold mb-2">Privacy Policy</h1>
          <p className="text-gray-400 text-sm">Effective date: {effective}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="space-y-8 text-gray-700 leading-relaxed">

          <section>
            <h2 className="text-xl font-bold text-[#1a2744] mb-3">1. Information We Collect</h2>
            <p className="mb-3">
              When you use our website or contact us, we may collect the following information:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li>Name, phone number, and email address (provided via contact form or phone call)</li>
              <li>Delivery address and project details</li>
              <li>Browser type, IP address, and pages visited (via standard web server logs)</li>
              <li>Any other information you choose to provide</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a2744] mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 space-y-1.5 text-sm">
              <li>To respond to quote requests and schedule deliveries</li>
              <li>To contact you regarding your order or inquiry</li>
              <li>To improve our website and services</li>
              <li>To comply with applicable laws and regulations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a2744] mb-3">3. Information Sharing</h2>
            <p>
              We do not sell, trade, or rent your personal information to third parties. We may share your information
              only in the following circumstances:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-sm mt-3">
              <li>With service providers who assist us in operating our website or business (e.g., hosting, email)</li>
              <li>When required by law or to protect our rights</li>
              <li>In connection with a business transfer or acquisition</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a2744] mb-3">4. Cookies</h2>
            <p>
              Our website may use basic cookies to improve your browsing experience. These are standard session cookies
              and do not collect personally identifiable information. You can disable cookies in your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a2744] mb-3">5. Data Security</h2>
            <p>
              We implement reasonable security measures to protect your information. However, no method of transmission
              over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a2744] mb-3">6. Third-Party Links</h2>
            <p>
              Our website may contain links to third-party sites. We are not responsible for the privacy practices of
              those sites and encourage you to review their privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a2744] mb-3">7. Children's Privacy</h2>
            <p>
              Our services are not directed at children under the age of 13. We do not knowingly collect personal
              information from children.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a2744] mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with a revised
              effective date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-[#1a2744] mb-3">9. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, contact us via the information on our{" "}
              <a href="/contact" className="text-[#e8600a] hover:underline">Contact page</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
