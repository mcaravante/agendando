import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Share2,
  Bell,
  Settings,
  Link as LinkIcon,
  Users,
  Check,
  ArrowRight,
  Sparkles,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

// Animation variants
const easing = [0.25, 0.46, 0.45, 0.94];

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easing } },
};

const fadeInDown = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: easing } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: easing } },
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.1 } },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: easing } },
};

const floatingAnimation = {
  y: [0, -10, 0],
  transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
};

const floatingAnimationSlow = {
  y: [0, -6, 0],
  transition: { duration: 5, repeat: Infinity, ease: 'easeInOut' },
};

const viewportOnce = { once: true, margin: '-100px' as const };

const featureColors = [
  { bg: 'bg-primary-100 dark:bg-primary-900/30', text: 'text-primary-600 dark:text-primary-400' },
  { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600 dark:text-purple-400' },
  { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400' },
  { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400' },
];

export function Home() {
  const { isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: Calendar, titleKey: 'home.features.availability.title', descKey: 'home.features.availability.desc' },
    { icon: Clock, titleKey: 'home.features.eventTypes.title', descKey: 'home.features.eventTypes.desc' },
    { icon: Share2, titleKey: 'home.features.shareLink.title', descKey: 'home.features.shareLink.desc' },
    { icon: Bell, titleKey: 'home.features.notifications.title', descKey: 'home.features.notifications.desc' },
  ];

  const steps = [
    { icon: Settings, titleKey: 'home.howItWorks.step1.title', descKey: 'home.howItWorks.step1.desc' },
    { icon: LinkIcon, titleKey: 'home.howItWorks.step2.title', descKey: 'home.howItWorks.step2.desc' },
    { icon: Users, titleKey: 'home.howItWorks.step3.title', descKey: 'home.howItWorks.step3.desc' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      {/* Header */}
      <header className={`fixed top-0 w-full z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md transition-shadow duration-300 ${scrolled ? 'shadow-sm' : ''}`}>
        <div className="container mx-auto px-4 h-[72px] flex items-center justify-between">
          <Link to="/">
            <img src="/logo.png" alt="Agendando" className="h-10" />
          </Link>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button size="sm">{t('home.header.dashboard')}</Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">{t('home.header.signIn')}</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">{t('home.header.signUp')}</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-[72px]" />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Decorative orbs with floating animation */}
          <motion.div
            className="absolute top-20 left-1/4 w-72 h-72 bg-primary-400/20 rounded-full blur-3xl"
            animate={floatingAnimation}
          />
          <motion.div
            className="absolute top-40 right-1/4 w-96 h-96 bg-purple-400/15 rounded-full blur-3xl"
            animate={floatingAnimationSlow}
          />
          <motion.div
            className="absolute bottom-20 left-1/3 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl"
            animate={floatingAnimationSlow}
          />

          {/* Accent dots */}
          <motion.div
            className="absolute top-32 right-[15%] w-3 h-3 bg-primary-400 rounded-full"
            animate={floatingAnimation}
          />
          <motion.div
            className="absolute top-60 left-[10%] w-2 h-2 bg-purple-400 rounded-full"
            animate={floatingAnimationSlow}
          />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,#1f2937_1px,transparent_1px),linear-gradient(to_bottom,#1f2937_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />

          <motion.div
            className="container mx-auto px-4 py-28 sm:py-36 lg:py-44 text-center relative z-10"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {/* Badge */}
            <motion.div variants={fadeInDown} className="mb-6">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-700 text-sm font-medium text-primary-700 dark:text-primary-300">
                <Sparkles className="w-4 h-4" />
                {t('home.hero.badge')}
              </span>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-primary-700 to-primary-600 dark:from-white dark:via-primary-400 dark:to-primary-300">
                {t('home.hero.title')}
              </span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
              {t('home.hero.subtitle')}
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="gap-2 shadow-lg shadow-primary-500/25">
                  {t('home.hero.cta')}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/documentacion">
                <Button variant="outline" size="lg" className="gap-2">
                  {t('home.hero.secondary')}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>

            {/* Product Mockup */}
            <motion.div
              variants={scaleIn}
              className="mt-16 sm:mt-20 relative max-w-3xl mx-auto"
            >
              {/* Browser window frame */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl shadow-gray-900/10 dark:shadow-black/30 border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 mx-2">
                    <div className="bg-white dark:bg-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-400 dark:text-gray-500 text-center">
                      agendando.com/maria
                    </div>
                  </div>
                </div>
                {/* Mockup content */}
                <div className="p-6 sm:p-8">
                  <div className="grid sm:grid-cols-2 gap-6">
                    {/* Mini calendar */}
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Marzo 2026</div>
                      <div className="grid grid-cols-7 gap-1 text-xs">
                        {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((d, i) => (
                          <div key={i} className="text-center text-gray-400 dark:text-gray-500 py-1 font-medium">{d}</div>
                        ))}
                        {/* Empty cells for offset */}
                        {[...Array(6)].map((_, i) => (
                          <div key={`e${i}`} className="text-center py-1.5" />
                        ))}
                        {/* Days */}
                        {[...Array(31)].map((_, i) => {
                          const day = i + 1;
                          const isSelected = day === 15;
                          const hasSlots = [2, 3, 4, 5, 9, 10, 11, 12, 15, 16, 17, 18, 19, 23, 24, 25, 26, 30, 31].includes(day);
                          return (
                            <div
                              key={day}
                              className={`text-center py-1.5 rounded-lg text-xs ${
                                isSelected
                                  ? 'bg-primary-600 text-white font-semibold'
                                  : hasSlots
                                    ? 'text-gray-900 dark:text-white font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20'
                                    : 'text-gray-300 dark:text-gray-600'
                              }`}
                            >
                              {day}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* Time slots */}
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white mb-3">15 Mar</div>
                      <div className="space-y-2">
                        {['09:00', '09:30', '10:00', '10:30', '14:00', '14:30', '15:00'].map((time, i) => (
                          <div
                            key={time}
                            className={`px-3 py-2 rounded-lg text-sm font-medium text-center transition-colors ${
                              i === 2
                                ? 'bg-primary-600 text-white'
                                : 'border border-primary-200 dark:border-primary-700 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                            }`}
                          >
                            {time}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating chips */}
              <motion.div
                className="absolute -left-4 sm:-left-8 top-1/3 bg-white dark:bg-gray-800 rounded-xl shadow-lg shadow-gray-900/10 dark:shadow-black/20 border border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center gap-2"
                animate={floatingAnimation}
              >
                <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{t('home.hero.mockup.confirmed')}</span>
              </motion.div>

              <motion.div
                className="absolute -right-4 sm:-right-8 top-2/3 bg-white dark:bg-gray-800 rounded-xl shadow-lg shadow-gray-900/10 dark:shadow-black/20 border border-gray-100 dark:border-gray-700 px-4 py-3 flex items-center gap-2"
                animate={floatingAnimationSlow}
              >
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">{t('home.hero.mockup.reminder')}</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section className="py-20 sm:py-28">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={fadeInUp}
            >
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-4">
                {t('home.features.label')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('home.features.title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('home.features.subtitle')}
              </p>
            </motion.div>

            <motion.div
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6"
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={staggerContainer}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={feature.titleKey}
                  className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                  variants={staggerItem}
                  whileHover={{ y: -6 }}
                >
                  <div className={`w-12 h-12 ${featureColors[index].bg} rounded-lg flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-6 h-6 ${featureColors[index].text}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {t(feature.titleKey)}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {t(feature.descKey)}
                  </p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* How it works Section */}
        <section className="py-20 sm:py-28 bg-gradient-to-b from-gray-50/80 to-white dark:from-gray-800/30 dark:to-gray-900">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={fadeInUp}
            >
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-4">
                {t('home.howItWorks.label')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('home.howItWorks.title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('home.howItWorks.subtitle')}
              </p>
            </motion.div>

            <motion.div
              className="relative max-w-4xl mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={staggerContainer}
            >
              {/* Connector line (desktop) - dashed */}
              <div className="hidden md:block absolute top-16 left-[16.67%] right-[16.67%] h-0.5 border-t-2 border-dashed border-primary-300 dark:border-primary-700" />

              <div className="grid md:grid-cols-3 gap-10">
                {steps.map((step, index) => (
                  <motion.div key={step.titleKey} className="text-center" variants={staggerItem}>
                    <div className="relative inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-2xl text-xl font-bold mb-6 z-10 shadow-lg shadow-primary-500/25">
                      {index + 1}
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-4 inline-flex items-center justify-center">
                      <step.icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {t(step.titleKey)}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {t(step.descKey)}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 sm:py-28">
          <div className="container mx-auto px-4">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={fadeInUp}
            >
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-4">
                {t('home.pricing.label')}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {t('home.pricing.title')}
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                {t('home.pricing.subtitle')}
              </p>
            </motion.div>

            <motion.div
              className="max-w-lg mx-auto"
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={staggerContainer}
            >
              {/* Pro Plan */}
              <motion.div
                className="relative bg-white dark:bg-gray-800 rounded-2xl border-2 border-primary-500 p-8 shadow-xl shadow-primary-500/10"
                variants={staggerItem}
              >
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary-600 to-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {t('home.pricing.pro.badge')}
                </span>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {t('home.pricing.pro.name')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">
                  {t('home.pricing.pro.description')}
                </p>
                <div className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
                  $9<span className="text-base font-normal text-gray-500">{t('home.pricing.month')}</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {(['f1', 'f2', 'f3', 'f4', 'f5'] as const).map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <Check className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
                      {t(`home.pricing.pro.${f}`)}
                    </li>
                  ))}
                </ul>
                <Link to="/register" className="block">
                  <Button className="w-full">
                    {t('home.pricing.pro.cta')}
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 sm:py-28">
          <div className="container mx-auto px-4">
            <motion.div
              className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-700 to-primary-900 rounded-3xl px-8 py-20 sm:px-16 sm:py-24 text-center"
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              variants={fadeInUp}
            >
              {/* Radial overlay for depth */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.1)_0%,transparent_70%)]" />

              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
              <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white/[0.03] rounded-full" />

              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  {t('home.cta.title')}
                </h2>
                <p className="text-primary-100 text-lg max-w-xl mx-auto mb-8">
                  {t('home.cta.subtitle')}
                </p>
                <Link to="/register">
                  <Button
                    size="lg"
                    className="!bg-white !text-primary-800 hover:!bg-gray-100 focus:ring-white gap-2 shadow-lg shadow-primary-900/20"
                  >
                    {t('home.cta.button')}
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50/50 dark:bg-gray-800/20 border-t border-gray-100 dark:border-gray-800">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col items-center gap-6">
            <img src="/logo.png" alt="Agendando" className="h-8 opacity-60" />
            <nav className="flex flex-wrap justify-center gap-8">
              <Link to="/privacidad" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Privacidad
              </Link>
              <Link to="/condiciones" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Condiciones
              </Link>
              <Link to="/soporte" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Soporte
              </Link>
              <Link to="/documentacion" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Documentación
              </Link>
              <Link to="/contacto" className="text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                Contacto
              </Link>
            </nav>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              &copy; {new Date().getFullYear()} Agendando. {t('footer.rights')}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
