import React from "react";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import {
  Coffee,
  LayoutDashboard,
  Sparkles,
  Clock,
  MapPin,
  Shield,
  BarChart3,
  CheckCircle2,
  Gift,
  ArrowRight,
} from "lucide-react";
import LanguageSwitcher from "../components/LanguageSwitcher";

const FEATURE_KEYS = [
  { icon: Clock, titleKey: "feat_minute_title", textKey: "feat_minute_text" },
  { icon: MapPin, titleKey: "feat_nearby_title", textKey: "feat_nearby_text" },
  { icon: Shield, titleKey: "feat_status_title", textKey: "feat_status_text" },
  { icon: BarChart3, titleKey: "feat_adminbiz_title", textKey: "feat_adminbiz_text" },
];

const STEP_KEYS = [
  { n: "01", titleKey: "step1_title", descKey: "step1_desc" },
  { n: "02", titleKey: "step2_title", descKey: "step2_desc" },
  { n: "03", titleKey: "step3_title", descKey: "step3_desc" },
];

export default function Landing() {
  const { t } = useTranslation();

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#faf8f5] text-[#3d3935]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(139, 111, 71, 0.12) 0%, transparent 45%), radial-gradient(circle at 80% 10%, rgba(139, 111, 71, 0.1) 0%, transparent 40%), radial-gradient(circle at 50% 100%, rgba(232, 223, 208, 0.6) 0%, transparent 55%)",
        }}
      />

      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="mb-6 flex justify-end sm:absolute sm:right-4 sm:top-4 lg:right-6 lg:top-6">
          <LanguageSwitcher />
        </div>

        <div className="mb-8 flex flex-wrap items-center justify-center gap-2 sm:mb-10">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#e8dfd0] bg-white/90 px-4 py-2 text-sm text-[#5d4e37] shadow-sm">
            <Gift className="h-4 w-4 text-[#8b6f47]" aria-hidden />
            <span>{t("landing.promo")}</span>
          </span>
        </div>

        <header className="mb-14 text-center sm:mb-16">
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-[#8b6f47]">
            {t("landing.brand")}
          </p>
          <h1 className="text-balance text-3xl font-semibold text-[#5d4e37] sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
            {t("landing.heroTitle")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-[#7d6e5c] sm:text-lg">
            {t("landing.heroSubtitle")}
          </p>
        </header>

        <div className="mb-20 grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-8">
          <Link
            to="/customer"
            className="group flex flex-col rounded-2xl border border-[#e8dfd0] bg-white p-8 shadow-[0_8px_24px_rgba(61,57,53,0.06)] transition hover:border-[#c9b89a] hover:shadow-[0_12px_32px_rgba(61,57,53,0.1)]"
          >
            <span className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#faf7f2] text-[#8b6f47] transition group-hover:bg-[#f3ebe0]">
              <Coffee className="h-7 w-7" strokeWidth={1.75} />
            </span>
            <h2 className="text-xl font-semibold text-[#5d4e37] sm:text-2xl">{t("landing.guestsTitle")}</h2>
            <p className="mt-2 flex-1 text-[#7d6e5c]">{t("landing.guestsLead")}</p>
            <ul className="mt-6 space-y-2 text-left text-sm text-[#7d6e5c]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8b6f47]" aria-hidden />
                {t("landing.guestsLi1")}
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8b6f47]" aria-hidden />
                {t("landing.guestsLi2")}
              </li>
            </ul>
            <span className="d-btn d-btn-primary mt-8 inline-flex w-full items-center justify-center gap-2 border-0 text-base font-normal sm:w-auto sm:self-start">
              {t("landing.guestsCta")}
              <ArrowRight className="h-4 w-4 opacity-90" aria-hidden />
            </span>
          </Link>

          <Link
            to="/admin/login"
            className="group flex flex-col rounded-2xl border border-[#e8dfd0] bg-white p-8 shadow-[0_8px_24px_rgba(61,57,53,0.06)] transition hover:border-[#c9b89a] hover:shadow-[0_12px_32px_rgba(61,57,53,0.1)]"
          >
            <span className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#faf7f2] text-[#8b6f47] transition group-hover:bg-[#f3ebe0]">
              <LayoutDashboard className="h-7 w-7" strokeWidth={1.75} />
            </span>
            <h2 className="text-xl font-semibold text-[#5d4e37] sm:text-2xl">{t("landing.adminTitle")}</h2>
            <p className="mt-2 flex-1 text-[#7d6e5c]">{t("landing.adminLead")}</p>
            <ul className="mt-6 space-y-2 text-left text-sm text-[#7d6e5c]">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8b6f47]" aria-hidden />
                {t("landing.adminLi1")}
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#8b6f47]" aria-hidden />
                {t("landing.adminLi2")}
              </li>
            </ul>
            <span className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#d4c4a8] bg-[#faf7f2] px-6 py-3 text-base font-medium text-[#5d4e37] transition group-hover:border-[#8b6f47] group-hover:bg-[#f0e6d8] sm:w-auto sm:self-start">
              {t("landing.adminCta")}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </span>
          </Link>
        </div>

        <section className="admin-surface mb-20 rounded-2xl border border-[#e8dfd0] bg-linear-to-br from-white to-[#faf7f2] p-8 sm:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#8b6f47]/10 text-[#8b6f47]">
                <Sparkles className="h-6 w-6" strokeWidth={1.75} aria-hidden />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-[#5d4e37] sm:text-2xl">{t("landing.whyTitle")}</h2>
                <p className="mt-2 max-w-2xl text-[#7d6e5c]">{t("landing.whyText")}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-6 text-center sm:text-left lg:flex-col lg:gap-3">
              <div>
                <p className="text-2xl font-semibold text-[#8b6f47] sm:text-3xl">{t("landing.stat247")}</p>
                <p className="text-sm text-[#7d6e5c]">{t("landing.stat247d")}</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-[#8b6f47] sm:text-3xl">{t("landing.statRoles")}</p>
                <p className="text-sm text-[#7d6e5c]">{t("landing.statRolesd")}</p>
              </div>
              <div>
                <p className="text-2xl font-semibold text-[#8b6f47] sm:text-3xl">{t("landing.statOne")}</p>
                <p className="text-sm text-[#7d6e5c]">{t("landing.statOned")}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-20">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold text-[#5d4e37] sm:text-3xl">{t("landing.featuresTitle")}</h2>
            <p className="mx-auto mt-3 max-w-xl text-[#7d6e5c]">{t("landing.featuresLead")}</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURE_KEYS.map(({ icon: Icon, titleKey, textKey }) => (
              <div
                key={titleKey}
                className="admin-surface flex flex-col rounded-2xl border border-[#e8dfd0] bg-white p-6 shadow-[0_8px_24px_rgba(61,57,53,0.04)]"
              >
                <span className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#faf7f2] text-[#8b6f47]">
                  <Icon className="h-5 w-5" strokeWidth={1.75} aria-hidden />
                </span>
                <h3 className="font-semibold text-[#5d4e37]">{t(`landing.${titleKey}`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#7d6e5c]">{t(`landing.${textKey}`)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-semibold text-[#5d4e37] sm:text-3xl">{t("landing.howTitle")}</h2>
            <p className="mx-auto mt-3 max-w-xl text-[#7d6e5c]">{t("landing.howLead")}</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {STEP_KEYS.map(({ n, titleKey, descKey }) => (
              <div
                key={n}
                className="relative rounded-2xl border border-[#e8dfd0] bg-white p-6 pt-10 shadow-[0_8px_24px_rgba(61,57,53,0.04)]"
              >
                <span className="absolute left-6 top-4 font-mono text-sm font-semibold text-[#c9b89a]">{n}</span>
                <h3 className="text-lg font-semibold text-[#5d4e37]">{t(`landing.${titleKey}`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#7d6e5c]">{t(`landing.${descKey}`)}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-20 rounded-2xl border border-[#e8dfd0] bg-[#5d4e37] px-6 py-10 text-center text-[#faf8f5] sm:px-12">
          <p className="text-lg font-medium leading-relaxed sm:text-xl">{t("landing.quote")}</p>
          <p className="mt-4 text-sm text-[#d4c4a8]">{t("landing.quoteBy")}</p>
        </section>

        <section className="admin-surface mb-16 rounded-2xl border border-[#e8dfd0] bg-white p-8 text-center shadow-[0_8px_24px_rgba(61,57,53,0.06)] sm:p-12">
          <h2 className="text-2xl font-semibold text-[#5d4e37] sm:text-3xl">{t("landing.ctaTitle")}</h2>
          <p className="mx-auto mt-3 max-w-lg text-[#7d6e5c]">{t("landing.ctaLead")}</p>
          <div className="mt-8 flex flex-col items-stretch justify-center gap-4 sm:flex-row sm:items-center">
            <Link
              to="/customer"
              className="d-btn d-btn-primary inline-flex items-center justify-center gap-2 border-0 px-8 text-base font-normal"
            >
              <Coffee className="h-5 w-5" aria-hidden />
              {t("landing.ctaGuest")}
            </Link>
            <Link
              to="/admin/login"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#d4c4a8] bg-[#faf7f2] px-8 py-3 text-base font-medium text-[#5d4e37] transition hover:border-[#8b6f47] hover:bg-[#f0e6d8]"
            >
              <LayoutDashboard className="h-5 w-5" aria-hidden />
              {t("landing.ctaAdmin")}
            </Link>
          </div>
        </section>

        <footer className="border-t border-[#e8dfd0] pt-8 text-center text-sm text-[#9a8f82]">
          <p>{t("landing.footer")}</p>
          <nav className="mt-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2" aria-label="Footer">
            <Link to="/customer" className="text-[#8b6f47] underline-offset-4 hover:underline">
              {t("landing.footerGuest")}
            </Link>
            <Link to="/admin/login" className="text-[#8b6f47] underline-offset-4 hover:underline">
              {t("landing.footerAdmin")}
            </Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}
