'use client';

import { motion } from 'framer-motion';
import { ChevronUp } from 'lucide-react';
import { useState } from 'react';

interface Section {
  id: string;
  title: string;
  content: string[];
}

const sections: Section[] = [
  {
    id: 'introduction',
    title: 'Introduction',
    content: [
      'Welcome to our Revenue Recovery Services ("we," "us," "our," or "Company"). We are committed to protecting your privacy and ensuring you have a positive experience on our website and when using our services.',
      'This Privacy Policy explains how we collect, use, disclose, and otherwise process personal information in connection with our website, services, and interactions with you. Please read this policy carefully.',
      'By accessing and using our website and services, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy. If you do not agree with our practices, please do not use our services.',
    ],
  },
  {
    id: 'information-collection',
    title: 'Information We Collect',
    content: [
      'We collect information you provide directly to us, such as when you fill out our revenue recovery calculator, subscribe to our newsletter, request a consultation, or contact us with inquiries. This includes your name, email address, phone number, company information, and any other details you choose to share.',
      'When you visit our website, we automatically collect certain information about your device and how you interact with our site. This includes your IP address, browser type, operating system, referring URLs, and pages visited. We use cookies and similar tracking technologies to enhance your experience and understand how our site is used.',
      'We may collect information about your business metrics and revenue data that you voluntarily provide through our calculator tool. This information helps us provide personalized insights and recommendations tailored to your situation.',
    ],
  },
  {
    id: 'use-of-information',
    title: 'How We Use Your Information',
    content: [
      'We use the information we collect to provide, maintain, and improve our services, including generating personalized revenue recovery reports and recommendations based on the data you provide.',
      'We use your contact information to communicate with you about our services, send you newsletters and updates, respond to your inquiries, and schedule consultations or audits as requested.',
      'We analyze aggregated and de-identified data to understand trends, improve our website functionality, and develop new features and services. This analysis helps us optimize the user experience.',
      'We may use your information to comply with legal obligations, enforce our terms of service, protect our rights and the rights of our users, and prevent fraud or misuse of our services.',
    ],
  },
  {
    id: 'information-sharing',
    title: 'How We Share Your Information',
    content: [
      'We do not sell, trade, or rent your personal information to third parties. However, we may share your information with trusted service providers who assist us in operating our website and conducting our business, subject to confidentiality agreements.',
      'We may disclose your information when required by law, such as in response to a subpoena, court order, or government request, or when we believe in good faith that disclosure is necessary to protect our rights, your safety, or the safety of others.',
      'If our company is involved in a merger, acquisition, bankruptcy, or sale of assets, your information may be transferred as part of that transaction. We will provide notice before your information becomes subject to a different privacy policy.',
      'We may share aggregated, de-identified information with third parties for marketing, advertising, analytics, and other purposes. This information cannot reasonably be used to identify you.',
    ],
  },
  {
    id: 'data-security',
    title: 'Data Security',
    content: [
      'We implement comprehensive security measures designed to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include encryption, secure socket layer (SSL) technology, and regular security assessments.',
      'While we strive to protect your information using reasonable security measures, no method of transmission over the Internet or electronic storage is completely secure. We cannot guarantee absolute security, and you use our services at your own risk.',
      'We limit access to your personal information to employees, contractors, and service providers who need access to perform their job functions and are bound by confidentiality agreements.',
    ],
  },
  {
    id: 'data-retention',
    title: 'Data Retention',
    content: [
      'We retain your personal information for as long as necessary to provide our services, fulfill the purposes outlined in this policy, and comply with legal obligations.',
      'If you wish to request deletion of your personal information, you may contact us using the information provided at the end of this policy. We will respond to your request within 30 days, subject to legal and contractual obligations that may require us to retain certain information.',
      'Even after deletion, we may retain de-identified or aggregated information that cannot be used to identify you.',
    ],
  },
  {
    id: 'your-rights',
    title: 'Your Privacy Rights',
    content: [
      'Depending on your location, you may have certain rights regarding your personal information, including the right to access, correct, or delete your information. You may also have the right to opt-out of certain uses or to data portability.',
      'To exercise any of these rights, please contact us at the email address provided at the end of this policy. We will verify your identity and respond to your request within the timeframe required by applicable law.',
      'You have the right to opt-out of receiving marketing communications from us. You can do this by clicking the unsubscribe link in any email we send or by contacting us directly.',
      'If you are a resident of the European Union, California, or another jurisdiction with specific privacy laws, you may have additional rights. Please refer to the jurisdiction-specific section below.',
    ],
  },
  {
    id: 'cookies',
    title: 'Cookies and Tracking Technologies',
    content: [
      'We use cookies and similar tracking technologies to enhance your experience, remember your preferences, and understand how you use our website. Cookies are small files stored on your device that help us recognize you on future visits.',
      'You can control cookie settings through your browser. Most browsers allow you to refuse cookies or alert you when cookies are being sent. However, blocking cookies may affect the functionality of our website.',
      'We use both session-based and persistent cookies. Session cookies are deleted when you close your browser, while persistent cookies remain on your device until you delete them or they expire.',
    ],
  },
  {
    id: 'third-party-links',
    title: 'Third-Party Links and Services',
    content: [
      'Our website may contain links to third-party websites and services that are not operated by us. This Privacy Policy does not apply to third-party websites, and we are not responsible for their privacy practices.',
      'We encourage you to review the privacy policies of any third-party websites before providing your personal information. Your use of third-party services is governed by their terms and policies.',
      'We are not responsible for the privacy or security practices of third-party service providers, and your use of such services is at your own risk.',
    ],
  },
  {
    id: 'children',
    title: "Children's Privacy",
    content: [
      'Our services are not directed to children under the age of 13, and we do not knowingly collect personal information from children under 13. If we become aware that we have collected information from a child under 13, we will take steps to delete such information promptly.',
      'For users between 13 and 18 years old, we provide additional privacy protections as required by law. If you are under 18, please ensure you have parental consent before providing your information.',
    ],
  },
  {
    id: 'policy-updates',
    title: 'Changes to This Privacy Policy',
    content: [
      'We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. We will notify you of any material changes by posting the updated policy on our website and updating the "Last Updated" date.',
      'Your continued use of our services after any changes constitutes your acceptance of the updated Privacy Policy. We encourage you to review this policy periodically to stay informed about how we protect your information.',
    ],
  },
  {
    id: 'contact',
    title: 'Contact Us',
    content: [
      'If you have questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at:',
      'Email: servevelio.agency@gmail.com',
      //   'Mailing Address: Revenue Recovery Services, Legal Department, [Your Company Address]',
      //   'Phone: [Your Company Phone Number]',
      'We will respond to your inquiry within 30 days of receipt. If you are not satisfied with our response, you may have the right to lodge a complaint with your local data protection authority.',
    ],
  },
];

export default function PrivacyPolicy() {
  const [activeSection, setActiveSection] = useState<string>('introduction');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['introduction'])
  );

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
    setActiveSection(id);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className='relative isolate bg-gradient-to-b from-background via-slate-900/20 to-background text-foreground min-h-screen'>
      {/* Background decorations */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-0 right-0 w-96 h-96 bg-purple-500/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2' />
        <div className='absolute bottom-0 left-0 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2' />
      </div>

      {/* Header */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className='relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20'
      >
        <div className='max-w-4xl mx-auto'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className='text-center space-y-4'
          >
            <h1 className='text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight'>
              <span className='block text-white mb-2'>Privacy Policy</span>
            </h1>
            <p className='text-base sm:text-lg text-slate-300 max-w-2xl mx-auto'>
              We take your privacy seriously. Learn how we collect, use, and
              protect your information.
            </p>
            <p className='text-sm text-slate-400'>Last Updated: June 2026</p>
          </motion.div>
        </div>
      </motion.section>

      {/* Content Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className='relative z-10 px-4 sm:px-6 lg:px-8 py-12 sm:py-16'
      >
        <div className='max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8'>
          {/* Table of Contents - Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className='lg:col-span-1'
          >
            <div className='sticky top-8 rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm p-6 space-y-2'>
              <h3 className='text-sm font-bold text-purple-300 uppercase tracking-wider mb-4'>
                Sections
              </h3>
              <nav className='space-y-2'>
                {sections.map((section) => (
                  <motion.button
                    key={section.id}
                    onClick={() => toggleSection(section.id)}
                    whileHover={{ x: 4 }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
                      activeSection === section.id
                        ? 'bg-purple-500/30 text-purple-200'
                        : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/30'
                    }`}
                  >
                    {section.title}
                  </motion.button>
                ))}
              </nav>
            </div>
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className='lg:col-span-3 space-y-6'
          >
            {sections.map((section, idx) => (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + idx * 0.05, duration: 0.5 }}
                className='rounded-2xl border border-purple-500/40 bg-gradient-to-br from-purple-900/20 to-blue-900/20 backdrop-blur-sm overflow-hidden'
              >
                <button
                  onClick={() => toggleSection(section.id)}
                  className='w-full px-6 sm:px-8 py-5 sm:py-6 flex items-center justify-between hover:bg-purple-500/10 transition-colors duration-200'
                >
                  <h2 className='text-lg sm:text-xl font-bold text-white text-left'>
                    {section.title}
                  </h2>
                  <motion.div
                    animate={{
                      rotate: expandedSections.has(section.id) ? 180 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronUp className='w-5 h-5 text-purple-300' />
                  </motion.div>
                </button>

                <motion.div
                  initial={false}
                  animate={{
                    height: expandedSections.has(section.id) ? 'auto' : 0,
                    opacity: expandedSections.has(section.id) ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className='overflow-hidden'
                >
                  <div className='px-6 sm:px-8 pb-6 space-y-4 border-t border-purple-500/20'>
                    {section.content.map((paragraph, pIdx) => (
                      <p
                        key={pIdx}
                        className='text-slate-300 leading-relaxed text-sm sm:text-base'
                      >
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Scroll to Top Button */}
      <motion.button
        onClick={scrollToTop}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className='fixed bottom-8 right-8 z-50 p-3 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg shadow-purple-500/40 transition-all duration-300'
      >
        <ChevronUp className='w-6 h-6' />
      </motion.button>
    </main>
  );
}
