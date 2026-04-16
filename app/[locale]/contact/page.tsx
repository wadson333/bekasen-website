"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { Send, Mail, MapPin, Phone, MessageCircle, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import { Link } from "@/i18n/navigation";

export default function ContactPage() {
  const t = useTranslations("contact");
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setFormState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  const contactInfo = [
    {
      icon: Mail,
      label: t("infoEmail"),
      value: "hello@bekasen.com",
      href: "mailto:hello@bekasen.com",
    },
    {
      icon: Phone,
      label: t("infoPhone"),
      value: "+509 XX XX XXXX",
      href: "tel:+509XXXXXXXX",
    },
    {
      icon: MapPin,
      label: t("infoLocation"),
      value: "Port-au-Prince, Haïti",
      href: undefined,
    },
    {
      icon: MessageCircle,
      label: "WhatsApp",
      value: t("infoWhatsapp"),
      href: "https://wa.me/509XXXXXXXX",
    },
  ];

  return (
    <main>
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-bg-primary">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.span
            className="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest text-purple-400 bg-purple-400/10 rounded-full mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {t("badge")}
          </motion.span>
          <motion.h1
            className="text-4xl md:text-5xl font-bold font-[family-name:var(--font-syne)] text-text-primary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {t("title")}
          </motion.h1>
          <motion.p
            className="mt-4 text-text-secondary text-lg max-w-xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t("subtitle")}
          </motion.p>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="py-16 bg-bg-primary">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            {/* Form — takes 3 columns */}
            <motion.div
              className="lg:col-span-3"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {submitted ? (
                <div className="bg-bg-secondary rounded-2xl border border-border p-12 text-center">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold font-[family-name:var(--font-syne)] text-text-primary mb-3">
                    {t("successTitle")}
                  </h3>
                  <p className="text-text-secondary mb-8">
                    {t("successMessage")}
                  </p>
                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors font-medium"
                  >
                    {t("backHome")}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="bg-bg-secondary rounded-2xl border border-border p-8 md:p-10 space-y-6"
                >
                  <h2 className="text-2xl font-bold font-[family-name:var(--font-syne)] text-text-primary mb-2">
                    {t("formTitle")}
                  </h2>
                  <p className="text-text-secondary text-sm mb-6">
                    {t("formSubtitle")}
                  </p>

                  {/* Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-text-primary mb-2"
                    >
                      {t("labelName")}
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formState.name}
                      onChange={handleChange}
                      placeholder={t("placeholderName")}
                      className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-border text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-text-primary mb-2"
                    >
                      {t("labelEmail")}
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formState.email}
                      onChange={handleChange}
                      placeholder={t("placeholderEmail")}
                      className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-border text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                    />
                  </div>

                  {/* Subject */}
                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-text-primary mb-2"
                    >
                      {t("labelSubject")}
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      required
                      value={formState.subject}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-border text-text-primary focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
                    >
                      <option value="">{t("subjectDefault")}</option>
                      <option value="website">{t("subjectWebsite")}</option>
                      <option value="branding">{t("subjectBranding")}</option>
                      <option value="app">{t("subjectApp")}</option>
                      <option value="other">{t("subjectOther")}</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-text-primary mb-2"
                    >
                      {t("labelMessage")}
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      value={formState.message}
                      onChange={handleChange}
                      placeholder={t("placeholderMessage")}
                      className="w-full px-4 py-3 rounded-xl bg-bg-primary border border-border text-text-primary placeholder:text-text-secondary/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all resize-none"
                    />
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-shadow flex items-center justify-center gap-2"
                  >
                    {t("submitButton")}
                    <Send className="w-5 h-5" />
                  </motion.button>
                </form>
              )}
            </motion.div>

            {/* Contact Info — takes 2 columns */}
            <motion.div
              className="lg:col-span-2 space-y-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold font-[family-name:var(--font-syne)] text-text-primary mb-2">
                {t("infoTitle")}
              </h2>
              <p className="text-text-secondary text-sm mb-8">
                {t("infoSubtitle")}
              </p>

              {contactInfo.map((item, index) => (
                <motion.div
                  key={item.label}
                  className="flex items-start gap-4 p-4 rounded-xl bg-bg-secondary border border-border hover:border-purple-500/30 transition-colors"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
                >
                  <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-text-secondary uppercase tracking-wider mb-1">
                      {item.label}
                    </p>
                    {item.href ? (
                      <a
                        href={item.href}
                        target={item.href.startsWith("http") ? "_blank" : undefined}
                        rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                        className="text-text-primary hover:text-purple-400 transition-colors font-medium"
                      >
                        {item.value}
                      </a>
                    ) : (
                      <p className="text-text-primary font-medium">{item.value}</p>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* CTA to Start Project */}
              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/20">
                <h3 className="text-lg font-bold font-[family-name:var(--font-syne)] text-text-primary mb-2">
                  {t("ctaTitle")}
                </h3>
                <p className="text-text-secondary text-sm mb-4">
                  {t("ctaDescription")}
                </p>
                <Link
                  href="/start-project"
                  className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors font-medium text-sm"
                >
                  {t("ctaLink")}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </main>
  );
}
