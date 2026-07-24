import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { LucideIcon } from 'lucide-react'
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarClock,
  ChevronDown,
  ClipboardList,
  Globe2,
  GraduationCap,
  Headphones,
  MessageCircle,
  Quote,
  School,
  Star,
  Users,
  Video,
} from 'lucide-react'
import { Button } from '../../components/common/Button'
import { Seo } from '../../components/common/Seo'
import { siteUrl } from '../../utils/seo'

type Language = 'vi' | 'en'

type IconText = {
  title: string
  description: string
  icon: LucideIcon
}

type SimpleCard = {
  title: string
  description: string
}

type PersonCard = {
  name: string
  role: string
  detail: string
}

const copy = {
  vi: {
    brandSubtitle: 'Tiếng Anh & Tiếng Việt trực tuyến',
    nav: [
      { label: 'Chương trình', href: '#programs' },
      { label: 'Vì sao chọn Vera', href: '#why-vera' },
      { label: 'Giáo viên', href: '#teachers' },
      { label: 'Câu hỏi', href: '#faq' },
    ],
    login: 'Đăng nhập',
    heroBadge: 'Học ngôn ngữ dễ theo, dễ bắt đầu',
    heroTitle: 'Tự tin giao tiếp tiếng Anh và tiếng Việt',
    heroDescription:
      'Vera giúp người Việt học tiếng Anh theo lộ trình rõ ràng, đồng thời giúp người nước ngoài học tiếng Việt để giao tiếp, làm việc và sống gần hơn với Việt Nam.',
    primaryCta: 'Bắt đầu học',
    secondaryCta: 'Xem lộ trình',
    heroImageLabel: 'Lớp học ngôn ngữ Vera',
    heroImageTitle: 'Lớp học ngôn ngữ trực tuyến',
    heroImageSubtitle: 'Luyện nói, theo dõi bài học, được hỗ trợ khi cần',
    quickStats: [
      { value: '2', label: 'lộ trình chính' },
      { value: '24/7', label: 'học mọi lúc' },
      { value: '1', label: 'tài khoản học tập' },
    ],
    stats: [
      { value: 'English', label: 'cho người Việt' },
      { value: 'Vietnamese', label: 'cho người nước ngoài' },
      { value: 'Online', label: 'học linh hoạt, dễ tiếp tục' },
    ],
    introTitle: 'Vera giúp việc học nhẹ hơn, rõ hơn và dễ duy trì hơn',
    introItems: [
      {
        title: 'Lớp học tập trung',
        description: 'Không gian học ưu tiên luyện nói, phản xạ, sửa lỗi và áp dụng vào tình huống thật.',
        icon: Users,
      },
      {
        title: 'Học theo nhịp của bạn',
        description: 'Học viên có thể quay lại bài học, xem nội dung đang học và tiếp tục lộ trình khi thuận tiện.',
        icon: CalendarClock,
      },
      {
        title: 'Nội dung thực dụng',
        description: 'Bài học xoay quanh giao tiếp, học tập, công việc, phỏng vấn và đời sống hằng ngày.',
        icon: Headphones,
      },
      {
        title: 'Lộ trình được sắp xếp rõ',
        description: 'Chương trình học được tổ chức theo từng bài để học viên biết mình nên học gì tiếp theo.',
        icon: ClipboardList,
      },
    ] satisfies IconText[],
    programsEyebrow: 'Chương trình học',
    programsTitle: 'Hai lộ trình chính trên Vera',
    programsDescription:
      'Chọn lộ trình phù hợp để học giao tiếp, luyện phản xạ và duy trì thói quen học đều đặn.',
    programs: [
      {
        title: 'Tiếng Anh cho người Việt',
        description:
          'Lộ trình giúp học viên Việt Nam luyện nghe nói, củng cố từ vựng, dùng ngữ pháp trong ngữ cảnh và tự tin sử dụng tiếng Anh trong đời sống.',
        points: ['Giao tiếp hằng ngày', 'Học tập và công việc', 'Phỏng vấn và thuyết trình'],
        icon: BookOpen,
      },
      {
        title: 'Tiếng Việt cho người nước ngoài',
        description:
          'Lộ trình giúp học viên quốc tế học phát âm, thanh điệu, mẫu câu thực tế và hiểu văn hóa Việt Nam qua ngôn ngữ.',
        points: ['Phát âm và thanh điệu', 'Đời sống tại Việt Nam', 'Giao tiếp nơi làm việc'],
        icon: Globe2,
      },
    ],
    whyEyebrow: 'Vì sao chọn Vera',
    whyTitle: 'Học có định hướng, không bị rối',
    reasons: [
      {
        title: 'Lộ trình rõ ràng',
        description: 'Bạn biết mình đang học gì, học đến đâu và bước tiếp theo nên làm gì.',
      },
      {
        title: 'Học để dùng được ngay',
        description: 'Nội dung xoay quanh giao tiếp thật trong học tập, công việc, du lịch và đời sống.',
      },
      {
        title: 'Theo dõi tiến độ dễ dàng',
        description: 'Học viên xem chương trình đang học và tiếp tục bài học chỉ trong vài thao tác.',
      },
    ] satisfies SimpleCard[],
    imageGalleryEyebrow: 'Không gian học tập',
    imageGalleryTitle: 'Một cái nhìn gần hơn về trải nghiệm học',
    imageGalleryDescription:
      'Khu vực này dành cho hình ảnh lớp học, luyện nói, văn hóa Việt Nam và sự hỗ trợ từ giáo viên.',
    gallery: [
      { title: 'Lớp học online', subtitle: 'Không gian học trực tuyến rõ ràng, dễ theo dõi', icon: Video },
      { title: 'Luyện nói', subtitle: 'Thực hành hội thoại và phản xạ trong tình huống thật', icon: MessageCircle },
      { title: 'Văn hóa Việt Nam', subtitle: 'Học ngôn ngữ gắn với đời sống và văn hóa', icon: Globe2 },
      { title: 'Hỗ trợ giáo viên', subtitle: 'Được hướng dẫn, sửa lỗi và gợi ý cách học phù hợp', icon: School },
    ],
    teachersEyebrow: 'Giáo viên tiêu biểu',
    teachersTitle: 'Đồng hành cùng người học từ những bước đầu',
    teachersDescription:
      'Đội ngũ giáo viên và cố vấn học tập giúp học viên chọn lộ trình, luyện giao tiếp và duy trì tiến độ.',
    teachers: [
      { name: 'Ms. Anna', role: 'English Coach', detail: 'Luyện phát âm, phản xạ nói và giao tiếp trong công việc.' },
      { name: 'Thầy Minh', role: 'Vietnamese Tutor', detail: 'Dạy tiếng Việt giao tiếp cho người nước ngoài đang sống và làm việc tại Việt Nam.' },
      { name: 'Ms. Linh', role: 'Learning Advisor', detail: 'Tư vấn lộ trình và hỗ trợ học viên giữ nhịp học đều đặn.' },
    ] satisfies PersonCard[],
    testimonialsEyebrow: 'Cảm nhận học viên',
    testimonialsTitle: 'Tập trung vào sự rõ ràng và tự tin',
    testimonials: [
      {
        name: 'Học viên Việt Nam',
        text: 'Mình thích cách bài học được chia theo lộ trình, đăng nhập vào là biết hôm nay cần học gì.',
      },
      {
        name: 'International learner',
        text: 'Vietnamese lessons feel practical and connected to daily situations, not only textbook phrases.',
      },
    ],
    faqEyebrow: 'Câu hỏi thường gặp',
    faqTitle: 'Trước khi bắt đầu',
    faqs: [
      {
        question: 'Vera phù hợp với ai?',
        answer:
          'Vera phù hợp với người Việt muốn học tiếng Anh thực tế và người nước ngoài muốn học tiếng Việt để sống, làm việc hoặc du lịch tại Việt Nam.',
      },
      {
        question: 'Tôi học theo lộ trình như thế nào?',
        answer:
          'Sau khi được tư vấn hoặc ghi danh, bạn sẽ vào chương trình phù hợp và học từng bài theo thứ tự rõ ràng.',
      },
      {
        question: 'Tôi có thể học online không?',
        answer:
          'Có. Bạn có thể đăng nhập để xem chương trình, mở bài học và tiếp tục việc học ở bất cứ đâu.',
      },
      {
        question: 'Có hỗ trợ luyện nói không?',
        answer:
          'Có. Nội dung được thiết kế để giúp bạn luyện nghe nói, phản xạ và dùng ngôn ngữ trong tình huống thật.',
      },
    ],
    finalTitle: 'Sẵn sàng học cùng Vera?',
    finalDescription:
      'Đăng nhập để xem chương trình của bạn, tiếp tục bài học và xây dựng thói quen học đều đặn mỗi ngày.',
  },
  en: {
    brandSubtitle: 'Online English & Vietnamese',
    nav: [
      { label: 'Programs', href: '#programs' },
      { label: 'Why Vera', href: '#why-vera' },
      { label: 'Teachers', href: '#teachers' },
      { label: 'FAQ', href: '#faq' },
    ],
    login: 'Login',
    heroBadge: 'Language learning that is easy to follow',
    heroTitle: 'Speak English and Vietnamese with confidence',
    heroDescription:
      'Vera helps Vietnamese learners study English through a clear path, while helping international learners study Vietnamese for daily life, work, and cultural connection.',
    primaryCta: 'Start learning',
    secondaryCta: 'View paths',
    heroImageLabel: 'Vera language classroom',
    heroImageTitle: 'Online language classroom',
    heroImageSubtitle: 'Speaking practice, lesson guidance, teacher support',
    quickStats: [
      { value: '2', label: 'main tracks' },
      { value: '24/7', label: 'learn anytime' },
      { value: '1', label: 'learning account' },
    ],
    stats: [
      { value: 'English', label: 'for Vietnamese learners' },
      { value: 'Vietnamese', label: 'for international learners' },
      { value: 'Online', label: 'flexible and easy to continue' },
    ],
    introTitle: 'Vera makes language learning clearer, lighter, and easier to keep going',
    introItems: [
      {
        title: 'Focused classes',
        description: 'A learning experience centered on speaking, feedback, and practical language use.',
        icon: Users,
      },
      {
        title: 'Learn at your pace',
        description: 'Learners can return to current lessons and continue their path whenever it fits their schedule.',
        icon: CalendarClock,
      },
      {
        title: 'Practical content',
        description: 'Lessons are built around daily life, study, work, interviews, and real communication.',
        icon: Headphones,
      },
      {
        title: 'Clear learning path',
        description: 'Programs are organized lesson by lesson so learners always know what to continue next.',
        icon: ClipboardList,
      },
    ] satisfies IconText[],
    programsEyebrow: 'Learning Programs',
    programsTitle: 'Two main tracks on Vera',
    programsDescription:
      'Choose the right path to practice communication, build confidence, and keep a steady learning habit.',
    programs: [
      {
        title: 'English for Vietnamese learners',
        description:
          'A path for Vietnamese learners to practice listening, speaking, vocabulary, grammar in context, and confident English use.',
        points: ['Daily communication', 'Study and work', 'Interviews and presentations'],
        icon: BookOpen,
      },
      {
        title: 'Vietnamese for international learners',
        description:
          'A path for global learners to study pronunciation, tones, practical sentence patterns, and Vietnamese culture through language.',
        points: ['Pronunciation and tones', 'Life in Vietnam', 'Workplace communication'],
        icon: Globe2,
      },
    ],
    whyEyebrow: 'Why Vera',
    whyTitle: 'Guided learning without confusion',
    reasons: [
      {
        title: 'Clear path',
        description: 'You know what you are learning, where you are in the path, and what comes next.',
      },
      {
        title: 'Useful from day one',
        description: 'Content is built around real communication for study, work, travel, and daily life.',
      },
      {
        title: 'Easy to continue',
        description: 'Learners can view their program and continue lessons in just a few steps.',
      },
    ] satisfies SimpleCard[],
    imageGalleryEyebrow: 'Learning Space',
    imageGalleryTitle: 'A closer look at the learning experience',
    imageGalleryDescription:
      'This area is ready for class photos, speaking practice, Vietnamese culture, and teacher support.',
    gallery: [
      { title: 'Online class', subtitle: 'A clear and friendly online learning space', icon: Video },
      { title: 'Speaking practice', subtitle: 'Conversation practice for real situations', icon: MessageCircle },
      { title: 'Vietnamese culture', subtitle: 'Language connected to life and culture', icon: Globe2 },
      { title: 'Teacher support', subtitle: 'Guidance, correction, and practical study advice', icon: School },
    ],
    teachersEyebrow: 'Featured Teachers',
    teachersTitle: 'Support from the first step',
    teachersDescription:
      'Teachers and learning advisors help learners choose a path, practice communication, and stay consistent.',
    teachers: [
      { name: 'Ms. Anna', role: 'English Coach', detail: 'Pronunciation, speaking fluency, and workplace English.' },
      { name: 'Mr. Minh', role: 'Vietnamese Tutor', detail: 'Practical Vietnamese for international learners living and working in Vietnam.' },
      { name: 'Ms. Linh', role: 'Learning Advisor', detail: 'Learning path guidance and support for steady progress.' },
    ] satisfies PersonCard[],
    testimonialsEyebrow: 'Learner Feedback',
    testimonialsTitle: 'Built around clarity and confidence',
    testimonials: [
      {
        name: 'Vietnamese learner',
        text: 'I like that lessons are arranged as a path. When I log in, I know exactly what to continue.',
      },
      {
        name: 'International learner',
        text: 'Vietnamese lessons feel practical and connected to daily situations, not only textbook phrases.',
      },
    ],
    faqEyebrow: 'FAQ',
    faqTitle: 'Before you start',
    faqs: [
      {
        question: 'Who is Vera for?',
        answer:
          'Vera is for Vietnamese learners who want practical English and international learners who want Vietnamese for life, work, or travel in Vietnam.',
      },
      {
        question: 'How will I follow a learning path?',
        answer:
          'After consultation or enrollment, you enter a suitable program and study lessons in a clear order.',
      },
      {
        question: 'Can I study online?',
        answer:
          'Yes. You can log in to view your program, open lessons, and continue learning wherever you are.',
      },
      {
        question: 'Does Vera support speaking practice?',
        answer:
          'Yes. The content is designed to help learners practice listening, speaking, reactions, and real communication.',
      },
    ],
    finalTitle: 'Ready to learn with Vera?',
    finalDescription:
      'Log in to view your program, continue lessons, and build a steady learning habit.',
  },
}

const languages: Language[] = ['vi', 'en']

export function HomePage() {
  const [language, setLanguage] = useState<Language>('vi')
  const t = copy[language]

  return (
    <main className="vera-public-bg min-h-screen text-foreground">
      <Seo
        title="LMS Vera | Học tiếng Anh và tiếng Việt trực tuyến"
        description="LMS Vera là nền tảng học tiếng Anh và tiếng Việt online với lộ trình rõ ràng, video bài học, quiz, giáo viên hỗ trợ và theo dõi tiến độ học tập."
        path="/"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'EducationalOrganization',
            name: 'LMS Vera',
            url: siteUrl,
            description:
              'LMS Vera cung cấp chương trình học tiếng Anh và tiếng Việt trực tuyến với lộ trình rõ ràng, giáo viên hỗ trợ và hệ thống theo dõi tiến độ.',
            sameAs: [],
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'LMS Vera',
            url: siteUrl,
          },
        ]}
      />
      <header className="sticky top-0 z-20 border-b border-[hsl(var(--brand-green-hover))]/30 bg-[hsl(var(--brand-green))] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex min-w-0 items-center gap-3" aria-label="LMS Vera home">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-orange-soft))] text-primary">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <p className="text-base font-extrabold leading-tight">LMS Vera</p>
              <p className="hidden truncate text-xs text-white/75 sm:block">{t.brandSubtitle}</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-white/80 lg:flex">
            {t.nav.map((item) => (
              <a key={item.href} href={item.href} className="transition-colors hover:text-white">
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <div className="flex rounded-md border border-white/25 bg-white/10 p-1" aria-label="Language switcher">
              {languages.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setLanguage(item)}
                  className={`rounded px-2.5 py-1 text-xs font-bold transition-colors sm:px-3 sm:text-sm ${
                    language === item
                      ? 'bg-white text-[hsl(var(--brand-green))]'
                      : 'text-white/75 hover:text-white'
                  }`}
                  aria-pressed={language === item}
                >
                  {item === 'vi' ? 'Việt' : 'EN'}
                </button>
              ))}
            </div>
            <Button asChild className="hidden sm:inline-flex">
              <Link to="/login">
                {t.login}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative isolate overflow-hidden border-b border-border bg-[hsl(var(--brand-green))]">
        <svg
          className="pointer-events-none absolute inset-x-0 bottom-[-1px] -z-10 h-[36%] w-full text-[hsl(var(--background))]"
          viewBox="0 0 1440 260"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M0 150C112 190 218 206 330 196C486 182 574 112 724 88C890 61 994 107 1138 91C1254 78 1340 42 1440 0V260H0Z"
          />
        </svg>
        <svg
          className="pointer-events-none absolute -right-24 top-16 -z-10 hidden h-[390px] w-[760px] text-[hsl(var(--brand-green-soft))] lg:block"
          viewBox="0 0 760 390"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M88 236C49 181 88 96 174 55C277 6 404 1 519 42C622 79 721 140 746 210C774 289 704 356 588 376C453 399 341 349 240 325C166 308 119 281 88 236Z"
          />
        </svg>
        <svg
          className="pointer-events-none absolute left-8 top-24 -z-10 hidden h-32 w-52 text-primary/90 lg:block"
          viewBox="0 0 220 140"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M75 23C101 -11 133 5 131 46C173 48 197 73 165 94C176 133 145 149 116 119C85 140 58 129 69 91C31 83 27 56 61 48C62 38 66 30 75 23Z"
          />
          <path
            fill="currentColor"
            d="M5 81C19 56 58 50 76 75C91 96 85 118 57 118C29 118 -9 105 5 81Z"
            opacity="0.72"
          />
          <path
            fill="currentColor"
            d="M52 8C72 7 95 35 80 49C63 64 25 56 27 38C29 21 36 9 52 8Z"
            opacity="0.72"
          />
        </svg>

        <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:min-h-[620px] lg:grid-cols-[1fr_0.95fr] lg:px-8 lg:py-16">
          <div className="flex flex-col justify-center">
            <div className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1 text-sm font-bold text-white">
              <Star className="h-4 w-4 fill-primary text-primary" />
              {t.heroBadge}
            </div>
            <h1 className="max-w-3xl text-4xl font-extrabold leading-tight tracking-normal text-white sm:text-5xl lg:text-6xl">
              {t.heroTitle}
            </h1>
            <p className="mt-5 max-w-2xl text-lg font-medium leading-8 text-white/85">{t.heroDescription}</p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg">
                <Link to="/login">
                  {t.primaryCta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white bg-white text-[hsl(var(--brand-green))] hover:bg-white/90">
                <Link to="/courses">{t.secondaryCta}</Link>
              </Button>
            </div>
          </div>

          <div className="relative min-h-[420px]">
            <div className="absolute -left-6 top-10 hidden h-28 w-40 rounded-[54%_46%_58%_42%] bg-primary/80 lg:block" />
            <div className="relative overflow-hidden rounded-lg border border-white/50 bg-white p-3 shadow-[0_24px_55px_rgba(16,80,51,0.22)]">
              <img
                src="/images/vera-language-classroom-hero.png"
                alt={t.heroImageLabel}
                className="aspect-[4/3] w-full rounded-md object-cover"
              />
              <div className="absolute bottom-5 left-5 right-5 rounded-lg border border-white/70 bg-white/90 p-4 shadow-sm backdrop-blur">
                <p className="text-lg font-extrabold text-foreground">{t.heroImageTitle}</p>
                <p className="mt-1 text-sm font-medium text-muted-foreground">{t.heroImageSubtitle}</p>
              </div>
            </div>

            <div className="relative -mt-7 ml-4 mr-4 grid gap-3 rounded-lg border border-border bg-white/[0.92] p-4 shadow-sm backdrop-blur sm:grid-cols-3">
              {t.quickStats.map((item) => (
                <div key={item.label} className="text-center">
                  <p className="text-2xl font-extrabold text-primary">{item.value}</p>
                  <p className="text-xs font-semibold text-muted-foreground">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-border bg-[hsl(var(--brand-green-soft))]">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 sm:px-6 md:grid-cols-3 lg:px-8">
          {t.stats.map((item) => (
            <div key={item.label} className="flex items-center gap-4 rounded-lg bg-white/[0.88] px-5 py-4 shadow-sm backdrop-blur">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-orange-soft))] text-primary">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-foreground">{item.value}</p>
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="max-w-3xl text-3xl font-extrabold leading-tight text-foreground">{t.introTitle}</h2>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {t.introItems.map((item) => (
            <article key={item.title} className="rounded-lg border border-border bg-white/[0.88] p-5 shadow-sm backdrop-blur">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-[hsl(var(--brand-orange-soft))] text-primary">
                <item.icon className="h-6 w-6" />
              </div>
              <h3 className="font-extrabold text-foreground">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="programs" className="vera-soft-band">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-9 max-w-3xl">
            <p className="text-sm font-extrabold text-primary">{t.programsEyebrow}</p>
            <h2 className="mt-2 text-3xl font-extrabold text-foreground">{t.programsTitle}</h2>
            <p className="mt-3 text-muted-foreground">{t.programsDescription}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {t.programs.map((program, index) => (
              <article
                key={program.title}
                id={index === 0 ? 'english-track' : 'vietnamese-track'}
                className="rounded-lg border border-border bg-white/[0.88] p-6 shadow-sm backdrop-blur"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-white text-primary">
                    <program.icon className="h-8 w-8" />
                  </div>
                  <span className="rounded-full border border-[hsl(var(--brand-green))]/20 bg-[hsl(var(--brand-green-soft))] px-3 py-1 text-xs font-bold text-[hsl(var(--brand-green))]">
                    Track {index + 1}
                  </span>
                </div>
                <h3 className="mt-6 text-2xl font-extrabold">{program.title}</h3>
                <p className="mt-3 leading-7 text-muted-foreground">{program.description}</p>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  {program.points.map((point) => (
                    <div key={point} className="rounded-lg border border-border bg-white/[0.86] p-3 text-sm font-semibold text-foreground">
                      {point}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="why-vera" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-9 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-sm font-extrabold text-[hsl(var(--brand-green))]">
              {t.whyEyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-extrabold leading-tight">{t.whyTitle}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {t.reasons.map((reason, index) => (
              <article key={reason.title} className="rounded-lg border border-border bg-white/[0.88] p-5 shadow-sm backdrop-blur">
                <div className="mb-5 flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--brand-orange-soft))] text-sm font-extrabold text-primary">
                  {index + 1}
                </div>
                <h3 className="font-extrabold">{reason.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{reason.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="vera-soft-band">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-9 max-w-3xl">
            <p className="text-sm font-extrabold text-primary">{t.imageGalleryEyebrow}</p>
            <h2 className="mt-2 text-3xl font-extrabold text-foreground">{t.imageGalleryTitle}</h2>
            <p className="mt-3 text-muted-foreground">{t.imageGalleryDescription}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {t.gallery.map((item, index) => (
              <article key={item.title} className="overflow-hidden rounded-lg border border-border bg-white/[0.88] shadow-sm backdrop-blur">
                <div
                  className={`aspect-[4/3] p-5 ${
                    index % 2 === 0 ? 'bg-[hsl(var(--brand-orange-soft))]' : 'bg-[hsl(var(--brand-green-soft))]'
                  }`}
                  role="img"
                  aria-label={item.title}
                >
                  <div className="flex h-full items-center justify-center rounded-lg border border-white/70 bg-white">
                    <item.icon
                      className={`h-12 w-12 ${
                        index % 2 === 0 ? 'text-primary' : 'text-[hsl(var(--brand-green))]'
                      }`}
                    />
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-extrabold">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.subtitle}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="teachers" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-9 max-w-3xl">
          <p className="text-sm font-extrabold text-[hsl(var(--brand-green))]">
            {t.teachersEyebrow}
          </p>
          <h2 className="mt-2 text-3xl font-extrabold">{t.teachersTitle}</h2>
          <p className="mt-3 text-muted-foreground">{t.teachersDescription}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {t.teachers.map((teacher, index) => (
            <article key={teacher.name} className="rounded-lg border border-border bg-white/[0.88] p-5 shadow-sm backdrop-blur">
              <div
                className={`aspect-square rounded-lg ${
                  index === 1 ? 'bg-[hsl(var(--brand-green-soft))]' : 'bg-[hsl(var(--brand-orange-soft))]'
                }`}
                role="img"
                aria-label={teacher.name}
              >
                <div className="flex h-full items-end justify-center p-5">
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white text-primary shadow-sm">
                    <GraduationCap className="h-12 w-12" />
                  </div>
                </div>
              </div>
              <h3 className="mt-5 text-xl font-extrabold">{teacher.name}</h3>
              <p className="text-sm font-bold text-primary">{teacher.role}</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{teacher.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-[hsl(var(--brand-green-soft))]">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-9 max-w-3xl">
            <p className="text-sm font-extrabold text-[hsl(var(--brand-green))]">
              {t.testimonialsEyebrow}
            </p>
            <h2 className="mt-2 text-3xl font-extrabold">{t.testimonialsTitle}</h2>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {t.testimonials.map((testimonial) => (
              <article key={testimonial.name} className="rounded-lg border border-border bg-white/[0.88] p-6 shadow-sm backdrop-blur">
                <Quote className="h-8 w-8 text-primary" />
                <p className="mt-4 text-lg font-semibold leading-8 text-foreground">{testimonial.text}</p>
                <p className="mt-5 text-sm font-extrabold text-[hsl(var(--brand-green))]">{testimonial.name}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-sm font-extrabold text-primary">{t.faqEyebrow}</p>
            <h2 className="mt-2 text-3xl font-extrabold">{t.faqTitle}</h2>
          </div>
          <div className="space-y-4">
            {t.faqs.map((faq) => (
              <article key={faq.question} className="rounded-lg border border-border bg-white/[0.88] p-5 shadow-sm backdrop-blur">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-extrabold">{faq.question}</h3>
                  <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-white/70 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-6 rounded-lg border border-primary/30 bg-[hsl(var(--brand-orange-soft))] p-6 sm:p-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <h2 className="text-3xl font-extrabold">{t.finalTitle}</h2>
              <p className="mt-3 max-w-2xl text-muted-foreground">{t.finalDescription}</p>
            </div>
            <Button asChild size="lg">
              <Link to="/login">
                {t.login}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  )
}
