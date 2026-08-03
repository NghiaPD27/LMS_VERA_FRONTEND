import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Globe2,
  GraduationCap,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  Play,
  Send,
  Sparkles,
  User,
  Users,
} from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Seo } from '../../components/common/Seo'

type Language = 'vi' | 'en'

const copy = {
  vi: {
    brandSubtitle: 'Trung tâm Ngôn ngữ Vera Language',
    nav: [
      { label: 'Giới thiệu', sectionIndex: 0 },
      { label: 'Video', sectionIndex: 1 },
      { label: 'Lộ trình', sectionIndex: 2 },
      { label: 'Liên hệ', sectionIndex: 3 },
    ],
    login: 'Đăng nhập',
    register: 'Đăng ký',
    heroBadge: 'Vera Language Center',
    heroTitle: 'Tự tin giao tiếp Tiếng Anh & Tiếng Việt',
    heroDescription:
      'Vera đồng hành cùng bạn trên con đường chinh phục ngôn ngữ với lộ trình cá nhân hóa, phương pháp tương tác phản xạ và hỗ trợ 1-1 tận tâm.',
    primaryCta: 'Tư vấn lộ trình ngay',
    secondaryCta: 'Xem các khóa học',
    quickStats: [
      { value: '98%', label: 'Học viên hài lòng' },
      { value: '2', label: 'Lộ trình chuyên sâu' },
      { value: '1-on-1', label: 'Hỗ trợ trực tiếp' },
    ],
    classroomTitle: 'Lớp học tương tác 1-1',
    classroomDesc: 'Luyện phản xạ trực tiếp với cố vấn',
    cefrTitle: 'Lộ trình chuẩn CEFR',
    cefrDesc: 'Cấp chứng chỉ hoàn thành khóa học',
    scrollDown: 'Cuộn xuống',
    videoTitle: 'Lớp học trực tuyến & Phương pháp giảng dạy',
    videoDescription:
      'Cùng chị trải nghiệm môi trường học tập tương tác, phương pháp luyện phản xạ tự nhiên và cách theo dõi tiến độ bài học tại Vera.',
    videoTag: 'Video Giới Thiệu',
    videoHeading: 'Vera Language Overview Video',
    videoSubheading: 'Bấm để phát video giới thiệu trung tâm',
    pathTag: 'Lộ Trình Đào Tạo',
    pathTitle: 'Tư vấn & Lựa chọn Lộ trình học',
    pathDescription:
      'Chương trình được thiết kế chuẩn mực từ cơ bản A1 đến nâng cao A2, giúp bạn vững nền tảng và phản xạ tự tin.',
    paths: [
      {
        level: 'Lộ trình Tiếng Anh A1 - Foundation',
        target: 'Dành cho người mất gốc, cần xây dựng lại nền tảng từ đầu',
        features: ['Từ vựng & Ngữ pháp căn bản', 'Luyện phát âm chuẩn IPA', 'Giao tiếp tình huống hàng ngày'],
        badge: 'Cơ bản',
      },
      {
        level: 'Lộ trình Tiếng Anh A2 - Communication',
        target: 'Dành cho người đã có nền tảng, muốn phản xạ giao tiếp tự tin',
        features: ['Phản xạ câu phức & Thảo luận', 'Tiếng Anh công sở & Phỏng vấn', 'Luyện nói 1-1 cùng giáo viên'],
        badge: 'Nâng cao',
      },
      {
        level: 'Tiếng Việt cho Người Nước Ngoài',
        target: 'Dành cho người nước ngoài sinh sống, làm việc tại Việt Nam',
        features: ['Giao tiếp đời sống hàng ngày', 'Văn hóa & Tiếng Việt giao thương', 'Học trực tuyến linh hoạt'],
        badge: 'Đặc biệt',
      },
    ],
    contactTag: 'Liên Hệ Cố Vấn',
    contactTitle: 'Đăng ký nhận tư vấn lộ trình miễn phí',
    contactDescription:
      'Để lại thông tin, đội ngũ cố vấn Vera sẽ liên hệ trực tiếp để kiểm tra trình độ và xếp lớp phù hợp nhất với bạn.',
    hotlineLabel: 'Hotline / Zalo',
    emailLabel: 'Email',
    addressLabel: 'Địa chỉ trụ sở',
    phone: '0901 234 567',
    email: 'contact@vera.nducky.id.vn',
    address: 'Tòa nhà Vera Building, Q. 1, TP. Hồ Chí Minh',
    formName: 'Họ và tên của bạn',
    formPhone: 'Số điện thoại / Zalo',
    formNote: 'Nhu cầu học tập (Tiếng Anh A1/A2, Tiếng Việt...)',
    formSubmit: 'Gửi yêu cầu tư vấn',
    formHeader: 'Form Đăng Ký Tư Vấn',
    placeholderName: 'Nguyễn Văn A',
    placeholderNote: 'Nhập nhu cầu học tập của bạn...',
    formSuccessTitle: 'Đăng ký thành công!',
    formSuccess: 'Cảm ơn bạn! Vera sẽ liên hệ tư vấn trong 24h làm việc.',
    formReset: 'Gửi yêu cầu khác',
    footerDesc: 'Hệ thống đào tạo ngôn ngữ trực tuyến chuyên nghiệp, giúp học viên tự tin giao tiếp tiếng Anh và tiếng Việt.',
    footerAbout: 'Về Vera Language',
    footerAboutNav: ['Giới thiệu trung tâm', 'Video lớp học', 'Lộ trình CEFR', 'Danh sách khóa học'],
    footerPortals: 'Tài khoản & Portal',
    footerPortalsNav: ['Cổng học viên', 'Cổng giáo viên', 'Cổng cố vấn Evaluator', 'Đăng ký học viên mới'],
    footerSupport: 'Hỗ trợ 24/7',
    footerSupportText: 'Mọi thắc mắc về khóa học & kỹ thuật xin liên hệ hotline:',
    sectionDots: ['Giới thiệu', 'Video', 'Lộ trình', 'Liên hệ', 'Chân trang'],
  },
  en: {
    brandSubtitle: 'Vera Language Center',
    nav: [
      { label: 'About', sectionIndex: 0 },
      { label: 'Video', sectionIndex: 1 },
      { label: 'Learning Path', sectionIndex: 2 },
      { label: 'Contact', sectionIndex: 3 },
    ],
    login: 'Sign In',
    register: 'Register',
    heroBadge: 'Vera Language Center',
    heroTitle: 'Speak English & Vietnamese With Confidence',
    heroDescription:
      'Vera empowers your language journey through structured paths, natural speaking practice, and dedicated mentorship.',
    primaryCta: 'Get Free Advisory',
    secondaryCta: 'Explore Courses',
    quickStats: [
      { value: '98%', label: 'Student Satisfaction' },
      { value: '2', label: 'Core Curriculums' },
      { value: '1-on-1', label: 'Direct Mentorship' },
    ],
    classroomTitle: '1-on-1 Interactive Class',
    classroomDesc: 'Direct natural response practice with mentors',
    cefrTitle: 'CEFR Standard Path',
    cefrDesc: 'Certificate upon course completion',
    scrollDown: 'Scroll Down',
    videoTitle: 'Interactive Classes & Teaching Methodology',
    videoDescription:
      'Experience our real-time interactive online classroom, speaking-first methodology, and progress tracking tools.',
    videoTag: 'Featured Video',
    videoHeading: 'Vera Language Overview Video',
    videoSubheading: 'Click to play center introduction video',
    pathTag: 'Learning Paths',
    pathTitle: 'Find Your Tailored Learning Path',
    pathDescription:
      'Designed around CEFR standards from A1 starter to A2 practical speaker.',
    paths: [
      {
        level: 'English A1 - Foundation Path',
        target: 'For beginners building grammar, vocabulary & pronunciation from scratch.',
        features: ['Essential Vocab & Structures', 'IPA Pronunciation Master', 'Daily Situational Speaking'],
        badge: 'Starter',
      },
      {
        level: 'English A2 - Communication Path',
        target: 'For intermediate learners striving for fluent conversational confidence.',
        features: ['Natural Response & Discussion', 'Business & Interview English', '1-on-1 Speaking Practice'],
        badge: 'Advanced',
      },
      {
        level: 'Vietnamese for Expats',
        target: 'For foreigners living, working, and thriving in Vietnam.',
        features: ['Everyday Life Conversation', 'Cultural Nuances & Work Terms', 'Flexible Online Schedule'],
        badge: 'Special',
      },
    ],
    contactTag: 'Contact Counselor',
    contactTitle: 'Schedule a Free Advisory Session',
    contactDescription:
      'Leave your details and Vera counselors will reach out to assess your level and arrange the ideal class.',
    hotlineLabel: 'Hotline / Zalo',
    emailLabel: 'Email',
    addressLabel: 'Headquarter Address',
    phone: '+84 901 234 567',
    email: 'contact@vera.nducky.id.vn',
    address: 'Vera Tower, District 1, Ho Chi Minh City',
    formName: 'Your Full Name',
    formPhone: 'Phone / WhatsApp / Zalo',
    formNote: 'Learning Goals (English A1/A2, Vietnamese...)',
    formSubmit: 'Submit Request',
    formHeader: 'Consultation Request Form',
    placeholderName: 'John Doe',
    placeholderNote: 'Enter your learning goals...',
    formSuccessTitle: 'Registration Successful!',
    formSuccess: 'Thank you! Vera will contact you within 24 business hours.',
    formReset: 'Submit another request',
    footerDesc: 'Professional online language education platform, empowering students to speak English and Vietnamese with confidence.',
    footerAbout: 'About Vera Language',
    footerAboutNav: ['Center Overview', 'Classroom Video', 'CEFR Paths', 'All Courses'],
    footerPortals: 'Portals & Accounts',
    footerPortalsNav: ['Student Portal', 'Teacher Portal', 'Evaluator Portal', 'New Student Register'],
    footerSupport: '24/7 Support',
    footerSupportText: 'For course inquiry & technical assistance, please call hotline:',
    sectionDots: ['About', 'Video', 'Learning Path', 'Contact', 'Footer'],
  },
}

const TOTAL_SECTIONS = 5

export function HomePage() {
  const [lang, setLang] = useState<Language>('vi')
  const [currentSection, setCurrentSection] = useState(0)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [formData, setFormData] = useState({ name: '', phone: '', note: '' })

  const isScrollingRef = useRef(false)
  const touchStartYRef = useRef(0)

  const t = copy[lang]

  const goToSection = useCallback((targetIndex: number) => {
    const clampedIndex = Math.max(0, Math.min(TOTAL_SECTIONS - 1, targetIndex))
    setCurrentSection(clampedIndex)
  }, [])

  // Global Window Wheel Controller (Scroll ANYWHERE on the screen)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null
      const isFormInput = target?.closest('input, textarea')
      if (isFormInput) return

      e.preventDefault()

      if (isScrollingRef.current) return
      if (Math.abs(e.deltaY) < 15) return

      isScrollingRef.current = true
      if (e.deltaY > 0) {
        setCurrentSection((prev) => Math.min(TOTAL_SECTIONS - 1, prev + 1))
      } else {
        setCurrentSection((prev) => Math.max(0, prev - 1))
      }

      setTimeout(() => {
        isScrollingRef.current = false
      }, 700)
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    return () => {
      window.removeEventListener('wheel', handleWheel)
    }
  }, [])

  // Keyboard navigation (Up/Down arrow, PageUp/PageDown)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowDown', 'PageDown', 'Space'].includes(e.key)) {
        if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return
        e.preventDefault()
        setCurrentSection((prev) => Math.min(TOTAL_SECTIONS - 1, prev + 1))
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        if (['input', 'textarea'].includes((e.target as HTMLElement)?.tagName?.toLowerCase())) return
        e.preventDefault()
        setCurrentSection((prev) => Math.max(0, prev - 1))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Touch Swipe Controller
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY
    const deltaY = touchStartYRef.current - touchEndY

    if (Math.abs(deltaY) > 50) {
      if (deltaY > 0) {
        setCurrentSection((prev) => Math.min(TOTAL_SECTIONS - 1, prev + 1))
      } else {
        setCurrentSection((prev) => Math.max(0, prev - 1))
      }
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.phone) {
      setFormSubmitted(true)
    }
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="h-[100dvh] w-full overflow-hidden bg-[hsl(220_14%_6%)] text-foreground font-sans selection:bg-primary/30 selection:text-white relative"
    >
      <Seo
        title="Vera Language | Trung tâm Ngôn ngữ Tiếng Anh & Tiếng Việt Online"
        description="Vera Language - Hệ thống học tiếng Anh và tiếng Việt trực tuyến với lộ trình A1/A2 rõ ràng, bài học video tương tác và cố vấn 1-1."
        path="/"
      />

      {/* Floating Header */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border/60 bg-[hsl(220_14%_8%)]/85 backdrop-blur-xl transition-all">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          <button onClick={() => goToSection(0)} className="flex items-center gap-3 text-left focus:outline-none">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-[0_0_16px_rgba(244,106,37,0.4)]">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-base font-extrabold text-white tracking-tight leading-none">Vera Language</p>
              <p className="text-[10px] text-muted-foreground font-medium hidden sm:block">{t.brandSubtitle}</p>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-zinc-300">
            {t.nav.map((item) => (
              <button
                key={item.sectionIndex}
                onClick={() => goToSection(item.sectionIndex)}
                className={`transition-colors duration-200 ${
                  currentSection === item.sectionIndex ? 'text-primary font-bold' : 'hover:text-primary'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setLang(lang === 'vi' ? 'en' : 'vi')}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-slate-900/80 px-2.5 py-1.5 text-xs font-bold text-zinc-300 hover:border-primary/50 hover:text-white transition-all"
            >
              <Globe2 className="h-3.5 w-3.5 text-primary" />
              <span>{lang.toUpperCase()}</span>
            </button>

            <Button asChild variant="outline" className="border-border text-xs text-white hover:border-primary hidden sm:inline-flex">
              <Link to="/login">{t.login}</Link>
            </Button>
            <Button asChild className="bg-primary text-xs font-bold text-white hover:bg-primary/90 shadow-[0_0_15px_rgba(244,106,37,0.3)]">
              <Link to="/register">{t.register}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Floating Side Section Dots Indicator */}
      <div className="fixed right-4 sm:right-6 top-1/2 -translate-y-1/2 z-50 hidden sm:flex flex-col items-center gap-3 bg-slate-950/60 border border-white/10 backdrop-blur-md px-2.5 py-3.5 rounded-full shadow-2xl">
        {t.sectionDots.map((dotLabel, idx) => {
          const isActive = currentSection === idx
          return (
            <button
              key={idx}
              onClick={() => goToSection(idx)}
              title={dotLabel}
              className="group relative flex items-center justify-center p-1 focus:outline-none"
            >
              <span className={`block transition-all duration-300 rounded-full ${
                isActive
                  ? 'h-6 w-2 bg-primary shadow-[0_0_12px_rgba(244,106,37,0.8)]'
                  : 'h-2 w-2 bg-white/30 group-hover:bg-white/70 group-hover:scale-125'
              }`} />
              <span className="absolute right-8 whitespace-nowrap rounded-md bg-slate-900 border border-border px-2.5 py-1 text-[10px] font-bold text-white opacity-0 transition-opacity duration-200 pointer-events-none group-hover:opacity-100 shadow-lg">
                {dotLabel}
              </span>
            </button>
          )
        })}
      </div>

      {/* Ultra Smooth Sliding Master Track */}
      <motion.div
        animate={{ y: `-${currentSection * 100}vh` }}
        transition={{
          duration: 0.85,
          ease: [0.65, 0, 0.35, 1],
        }}
        className="w-full h-full"
      >
        {/* Section 0: Hero / Giới thiệu trung tâm */}
        <section className="h-[100dvh] w-full flex flex-col justify-center relative px-6 py-10 pt-20 sm:pt-24 overflow-y-auto sm:overflow-hidden">
          <div className="pointer-events-none absolute -left-40 top-20 h-96 w-96 rounded-full bg-primary/10 blur-[130px]" />
          <div className="pointer-events-none absolute right-10 bottom-20 h-80 w-80 rounded-full bg-orange-600/10 blur-[100px]" />

          <div className="mx-auto max-w-7xl w-full grid gap-8 lg:grid-cols-12 lg:items-center my-auto">
            <motion.div
              animate={{ opacity: currentSection === 0 ? 1 : 0.4, x: currentSection === 0 ? 0 : -20 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-7 space-y-5"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1 text-xs font-bold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{t.heroBadge}</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
                {t.heroTitle}
              </h1>

              <p className="text-xs sm:text-base leading-relaxed text-muted-foreground max-w-xl">
                {t.heroDescription}
              </p>

              <div className="flex flex-wrap gap-4 pt-1">
                <Button onClick={() => goToSection(3)} className="h-11 sm:h-12 px-6 bg-primary text-white font-bold hover:bg-primary/90 shadow-[0_0_24px_rgba(244,106,37,0.35)]">
                  <span>{t.primaryCta}</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
                <Button onClick={() => goToSection(2)} variant="outline" className="h-11 sm:h-12 px-6 border-border text-white hover:border-primary/50 hover:bg-slate-900">
                  <span>{t.secondaryCta}</span>
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-5 border-t border-border/60 max-w-lg">
                {t.quickStats.map((stat, i) => (
                  <div key={i}>
                    <p className="text-xl sm:text-2xl font-extrabold text-primary tracking-tight">{stat.value}</p>
                    <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              animate={{ opacity: currentSection === 0 ? 1 : 0.4, scale: currentSection === 0 ? 1 : 0.95 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="lg:col-span-5 hidden lg:block"
            >
              <div className="relative rounded-2xl border border-border bg-slate-900/80 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl">
                <div className="rounded-xl bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 flex flex-col justify-between p-6 sm:p-8 overflow-hidden relative border border-border/60 group min-h-[320px]">
                  <div className="pointer-events-none absolute -right-10 -bottom-10 h-56 w-56 rounded-full bg-primary/20 blur-2xl group-hover:bg-primary/30 transition-all duration-300" />
                  
                  <div className="flex items-center justify-between mb-8">
                    <span className="rounded-md bg-primary/20 border border-primary/30 px-3 py-1 text-xs font-bold text-primary uppercase tracking-wider">
                      Interactive Classroom
                    </span>
                    <div className="flex gap-2">
                      <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                      <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                      <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                    </div>
                  </div>

                  <div className="space-y-3 relative z-10 mt-auto">
                    <div className="flex items-center gap-3.5 rounded-xl bg-slate-900/90 border border-border p-3.5 shadow-md">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/25 shrink-0">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{t.classroomTitle}</p>
                        <p className="text-xs text-muted-foreground">{t.classroomDesc}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3.5 rounded-xl bg-slate-900/90 border border-border p-3.5 shadow-md">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/25 shrink-0">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{t.cefrTitle}</p>
                        <p className="text-xs text-muted-foreground">{t.cefrDesc}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <button
            onClick={() => goToSection(1)}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors animate-bounce focus:outline-none"
          >
            <span>{t.scrollDown}</span>
            <ChevronDown className="h-4 w-4" />
          </button>
        </section>

        {/* Section 1: Video của chị / trung tâm */}
        <section className="h-[100dvh] w-full flex flex-col justify-center relative px-4 sm:px-6 py-6 pt-20 sm:pt-24 overflow-y-auto sm:overflow-hidden bg-[hsl(220_14%_7%)]">
          <div className="mx-auto max-w-4xl w-full my-auto flex flex-col items-center">
            <motion.div
              animate={{ opacity: currentSection === 1 ? 1 : 0.4, y: currentSection === 1 ? 0 : 20 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-xl mx-auto mb-3 sm:mb-4"
            >
              <span className="text-[11px] font-bold uppercase tracking-wider text-primary">{t.videoTag}</span>
              <h2 className="text-xl sm:text-3xl font-extrabold text-white mt-0.5">{t.videoTitle}</h2>
              <p className="text-xs text-muted-foreground mt-1">{t.videoDescription}</p>
            </motion.div>

            <motion.div
              animate={{ opacity: currentSection === 1 ? 1 : 0.4, scale: currentSection === 1 ? 1 : 0.96 }}
              transition={{ duration: 0.6 }}
              className="w-full max-w-3xl mx-auto rounded-2xl border border-border bg-slate-900/80 p-2.5 sm:p-3 shadow-[0_20px_60px_rgba(0,0,0,0.7)]"
            >
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center group border border-border/60">
                {!isVideoPlaying ? (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-800 flex items-center justify-center">
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
                      <div className="text-center p-6 relative z-10">
                        <GraduationCap className="h-10 sm:h-12 w-10 sm:w-12 text-primary mx-auto mb-2 opacity-80" />
                        <h3 className="text-base sm:text-lg font-bold text-white">{t.videoHeading}</h3>
                        <p className="text-xs text-muted-foreground mt-1">{t.videoSubheading}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsVideoPlaying(true)}
                      aria-label="Play introduction video"
                      className="relative z-20 flex h-14 sm:h-16 w-14 sm:w-16 items-center justify-center rounded-full bg-primary text-white shadow-[0_0_30px_rgba(244,106,37,0.6)] transition-transform duration-300 group-hover:scale-110"
                    >
                      <Play className="h-6 sm:h-7 w-6 sm:w-7 fill-current ml-1" />
                    </button>
                  </>
                ) : (
                  <iframe
                    className="w-full h-full rounded-xl"
                    src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
                    title="Vera Language Video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section 2: Tư vấn lộ trình */}
        <section className="h-[100dvh] w-full flex flex-col justify-center relative px-6 py-10 pt-20 sm:pt-24 overflow-y-auto sm:overflow-hidden">
          <div className="mx-auto max-w-7xl w-full my-auto">
            <motion.div
              animate={{ opacity: currentSection === 2 ? 1 : 0.4, y: currentSection === 2 ? 0 : 20 }}
              transition={{ duration: 0.5 }}
              className="text-center max-w-2xl mx-auto mb-6 sm:mb-8"
            >
              <span className="text-xs font-bold uppercase tracking-wider text-primary">{t.pathTag}</span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">{t.pathTitle}</h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1.5">{t.pathDescription}</p>
            </motion.div>

            <div className="grid gap-5 md:grid-cols-3">
              {t.paths.map((path, i) => (
                <motion.div
                  key={i}
                  animate={{ opacity: currentSection === 2 ? 1 : 0.4, y: currentSection === 2 ? 0 : 30 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="lms-surface flex flex-col justify-between p-5 sm:p-6 hover:border-primary/50 group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="rounded-full bg-primary/15 border border-primary/25 px-3 py-0.5 text-[10px] font-bold text-primary uppercase">
                        {path.badge}
                      </span>
                      <BookOpen className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>

                    <h3 className="text-base sm:text-lg font-extrabold text-white group-hover:text-primary transition-colors">{path.level}</h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{path.target}</p>

                    <ul className="mt-4 space-y-2 pt-3 border-t border-border/60 text-xs text-zinc-300">
                      {path.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button onClick={() => goToSection(3)} className="mt-6 w-full bg-primary text-white font-bold hover:bg-primary/90 shadow-[0_0_15px_rgba(244,106,37,0.25)] text-xs">
                    <span>{t.primaryCta}</span>
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Thông tin liên hệ */}
        <section className="h-[100dvh] w-full flex flex-col justify-center relative px-6 py-10 pt-20 sm:pt-24 overflow-y-auto sm:overflow-hidden bg-[hsl(220_14%_7%)]">
          <div className="mx-auto max-w-7xl w-full grid gap-8 lg:grid-cols-12 lg:items-center my-auto">
            
            <motion.div
              animate={{ opacity: currentSection === 3 ? 1 : 0.4, x: currentSection === 3 ? 0 : -20 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-5 space-y-5"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-primary">{t.contactTag}</span>
                <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">{t.contactTitle}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">{t.contactDescription}</p>
              </div>

              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-3.5 rounded-xl border border-border bg-slate-900/60 p-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/25 shrink-0">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">{t.hotlineLabel}</p>
                    <p className="text-xs sm:text-sm font-bold text-white">{t.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 rounded-xl border border-border bg-slate-900/60 p-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/25 shrink-0">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">{t.emailLabel}</p>
                    <p className="text-xs sm:text-sm font-bold text-white">{t.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 rounded-xl border border-border bg-slate-900/60 p-3.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/25 shrink-0">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase text-muted-foreground">{t.addressLabel}</p>
                    <p className="text-xs font-bold text-white">{t.address}</p>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              animate={{ opacity: currentSection === 3 ? 1 : 0.4, x: currentSection === 3 ? 0 : 20 }}
              transition={{ duration: 0.5 }}
              className="lg:col-span-7"
            >
              <div className="lms-surface p-6 sm:p-8 border-border">
                {formSubmitted ? (
                  <div className="text-center py-8 space-y-3">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="h-7 w-7" />
                    </div>
                    <h3 className="text-lg font-bold text-white">{t.formSuccessTitle}</h3>
                    <p className="text-xs text-muted-foreground max-w-sm mx-auto">{t.formSuccess}</p>
                    <Button onClick={() => setFormSubmitted(false)} variant="outline" className="mt-3 border-border text-xs">
                      {t.formReset}
                    </Button>
                  </div>
                ) : (
                  <form onSubmit={handleFormSubmit} className="space-y-3.5">
                    <h3 className="text-base font-bold text-white mb-1">{t.formHeader}</h3>

                    <div>
                      <label className="text-xs font-bold text-zinc-300">{t.formName}</label>
                      <div className="relative mt-1">
                        <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="lms-input pl-10 text-xs"
                          placeholder={t.placeholderName}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-300">{t.formPhone}</label>
                      <div className="relative mt-1">
                        <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="lms-input pl-10 text-xs"
                          placeholder="0901 234 567"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-zinc-300">{t.formNote}</label>
                      <div className="relative mt-1">
                        <MessageSquare className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <textarea
                          rows={2}
                          value={formData.note}
                          onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                          className="lms-input pl-10 py-2 resize-none text-xs"
                          placeholder={t.placeholderNote}
                        />
                      </div>
                    </div>

                    <Button type="submit" className="h-10 w-full bg-primary text-white font-bold hover:bg-primary/90 shadow-[0_0_20px_rgba(244,106,37,0.3)] text-xs">
                      <Send className="h-4 w-4 mr-2" />
                      {t.formSubmit}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Section 4: Footer & Community */}
        <section className="h-[100dvh] w-full flex flex-col justify-between relative px-6 py-10 pt-20 sm:pt-24 overflow-y-auto sm:overflow-hidden bg-[hsl(220_14%_5%)] border-t border-border/80">
          <div className="mx-auto max-w-7xl w-full my-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-4 py-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <p className="text-lg font-extrabold text-white">Vera Language</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.footerDesc}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white mb-3">{t.footerAbout}</p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><button onClick={() => goToSection(0)} className="hover:text-primary transition-colors">{t.footerAboutNav[0]}</button></li>
                <li><button onClick={() => goToSection(1)} className="hover:text-primary transition-colors">{t.footerAboutNav[1]}</button></li>
                <li><button onClick={() => goToSection(2)} className="hover:text-primary transition-colors">{t.footerAboutNav[2]}</button></li>
                <li><Link to="/courses" className="hover:text-primary transition-colors">{t.footerAboutNav[3]}</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white mb-3">{t.footerPortals}</p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li><Link to="/login" className="hover:text-primary transition-colors">{t.footerPortalsNav[0]}</Link></li>
                <li><Link to="/login" className="hover:text-primary transition-colors">{t.footerPortalsNav[1]}</Link></li>
                <li><Link to="/login" className="hover:text-primary transition-colors">{t.footerPortalsNav[2]}</Link></li>
                <li><Link to="/register" className="hover:text-primary transition-colors">{t.footerPortalsNav[3]}</Link></li>
              </ul>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-white mb-3">{t.footerSupport}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {t.footerSupportText} <span className="text-white font-bold">{t.phone}</span>
              </p>
            </div>
          </div>

          <div className="border-t border-border/60 pt-4 pb-2 text-center text-xs text-muted-foreground">
            <p>© {new Date().getFullYear()} Vera Language Center. All rights reserved.</p>
          </div>
        </section>
      </motion.div>
    </div>
  )
}
