import Link from "next/link";
import {
  Rocket,
  Lightbulb,
  MessageCircle,
  BarChart3,
  Target,
  GraduationCap,
  School,
  ArrowRight,
  Sparkles,
  Users,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    icon: Lightbulb,
    title: "Опиши идею",
    description:
      "Расскажи AI-наставнику о своей идее. Получи ICE-оценку и рекомендации.",
  },
  {
    icon: MessageCircle,
    title: "Пройди валидацию",
    description:
      "AI поможет провести CustDev, составить вопросы и проанализировать ответы.",
  },
  {
    icon: BarChart3,
    title: "Построй бизнес-модель",
    description:
      "Заполни Business Model Canvas и Value Proposition Canvas с подсказками AI.",
  },
  {
    icon: Target,
    title: "Подготовь питч",
    description:
      "Создай убойную презентацию инвестору с помощью AI-помощника.",
  },
];

const features = [
  {
    emoji: "🤖",
    title: "AI-наставник",
    description:
      "GigaChat помогает на каждом этапе — от идеи до питча. Персонализированные советы, а не шаблоны.",
  },
  {
    emoji: "📊",
    title: "Рабочее пространство",
    description:
      "BMC, VPC, юнит-экономика — всё в одном месте с AI-заполнением и визуализацией.",
  },
  {
    emoji: "🎓",
    title: "Академия",
    description:
      "Микро-уроки по бизнесу, маркетингу, финансам. Квизы после каждого урока.",
  },
  {
    emoji: "🏆",
    title: "Геймификация",
    description:
      "XP, уровни, стрики, ачивки. Учиться бизнесу так же увлекательно, как играть.",
  },
  {
    emoji: "👥",
    title: "Сообщество",
    description:
      "Лидерборд, обмен идеями, менторство. Найди единомышленников и сооснователей.",
  },
  {
    emoji: "🎤",
    title: "Питч-деки",
    description:
      "AI-генерация слайдов по шаблону. Тренируй питч с AI-инвестором.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-50">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-surface-0/80 backdrop-blur-lg border-b border-surface-100">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{
                background:
                  "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
              }}
            >
              <Rocket size={16} strokeWidth={1.75} />
            </div>
            <span className="text-h4 text-surface-900">
              Startup<span className="text-primary-500">Copilot</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button
                variant="ghost"
                className="text-surface-600 cursor-pointer"
              >
                Войти
              </Button>
            </Link>
            <Link href="/register">
              <Button
                className="rounded-lg font-semibold text-white cursor-pointer"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                }}
              >
                Начать бесплатно
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(ellipse at top center, var(--color-primary-50) 0%, transparent 60%), radial-gradient(ellipse at bottom right, rgba(249,115,22,0.06) 0%, transparent 40%)",
          }}
        />
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-16">
          <div className="max-w-[720px] mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-body-sm font-medium mb-6">
              <Sparkles size={14} strokeWidth={1.75} />
              AI-платформа Сбера для молодых предпринимателей
            </div>
            <h1 className="text-display text-surface-950 mb-6">
              От идеи до питча{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary-500), var(--color-accent-500))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                с AI-наставником
              </span>
            </h1>
            <p className="text-body-lg text-surface-500 mb-8 max-w-[560px] mx-auto">
              StartupCopilot — платформа, которая проведёт тебя через все этапы
              создания стартапа. От первой идеи до готовой презентации инвестору.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="h-14 px-8 rounded-xl text-base font-semibold text-white cursor-pointer"
                  style={{
                    background:
                      "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                    boxShadow: "var(--shadow-glow-primary)",
                  }}
                >
                  Начать бесплатно
                  <ArrowRight size={18} strokeWidth={1.75} />
                </Button>
              </Link>
              <div className="flex items-center gap-2 text-body-sm text-surface-400">
                <Users size={14} strokeWidth={1.75} />
                <span>1000+ молодых предпринимателей</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-h1 text-surface-900 mb-3">Как это работает</h2>
            <p className="text-body-lg text-surface-500">
              4 простых шага от идеи до запуска
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="relative p-6 rounded-xl bg-surface-0 border border-surface-200 transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="absolute -top-3 -left-1 text-caption font-bold text-surface-300">
                    0{i + 1}
                  </div>
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                    style={{
                      background:
                        "linear-gradient(135deg, var(--color-primary-50), var(--color-primary-100))",
                    }}
                  >
                    <Icon
                      size={24}
                      strokeWidth={1.75}
                      className="text-primary-500"
                    />
                  </div>
                  <h3 className="text-h4 text-surface-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-body-sm text-surface-500">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        className="py-16 md:py-24"
        style={{ backgroundColor: "var(--color-surface-0)" }}
      >
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-h1 text-surface-900 mb-3">Возможности</h2>
            <p className="text-body-lg text-surface-500">
              Всё, что нужно для запуска стартапа
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <div
                key={i}
                className="p-6 rounded-xl border border-surface-200 bg-surface-50 transition-all hover:-translate-y-1 hover:shadow-md hover:bg-surface-0"
              >
                <span className="text-3xl block mb-4">{feature.emoji}</span>
                <h3 className="text-h4 text-surface-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-body-sm text-surface-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For whom */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h2 className="text-h1 text-surface-900 mb-3">Для кого</h2>
            <p className="text-body-lg text-surface-500">
              Платформа для молодых предпринимателей 14–25 лет
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-[800px] mx-auto">
            <div className="p-8 rounded-2xl bg-surface-0 border border-surface-200 shadow-sm">
              <div className="w-14 h-14 rounded-xl bg-primary-50 flex items-center justify-center mb-4">
                <School
                  size={28}
                  strokeWidth={1.75}
                  className="text-primary-500"
                />
              </div>
              <h3 className="text-h3 text-surface-900 mb-3">
                Школьники 14–17
              </h3>
              <ul className="space-y-2">
                {[
                  "Первые шаги в предпринимательстве",
                  "Участие в конкурсах стартапов",
                  "Формирование бизнес-мышления",
                  "Геймифицированное обучение",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-body-sm text-surface-600"
                  >
                    <CheckCircle2
                      size={16}
                      className="text-success-500 shrink-0 mt-0.5"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="p-8 rounded-2xl bg-surface-0 border border-surface-200 shadow-sm">
              <div className="w-14 h-14 rounded-xl bg-accent-500/10 flex items-center justify-center mb-4">
                <GraduationCap
                  size={28}
                  strokeWidth={1.75}
                  className="text-accent-500"
                />
              </div>
              <h3 className="text-h3 text-surface-900 mb-3">
                Студенты 18–25
              </h3>
              <ul className="space-y-2">
                {[
                  "Серьёзная работа над стартапом",
                  "Подготовка к акселераторам",
                  "Инструменты бизнес-анализа",
                  "AI-генерация питч-деков",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2 text-body-sm text-surface-600"
                  >
                    <CheckCircle2
                      size={16}
                      className="text-success-500 shrink-0 mt-0.5"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div
            className="rounded-2xl p-8 md:p-12 text-center"
            style={{
              background:
                "linear-gradient(135deg, var(--color-primary-600), var(--color-primary-700))",
            }}
          >
            <h2 className="text-h1 text-white mb-4">
              Готов начать свой путь? 🚀
            </h2>
            <p className="text-body-lg text-primary-200 mb-8 max-w-[480px] mx-auto">
              Присоединяйся к StartupCopilot и преврати идею в реальный бизнес.
            </p>
            <Link href="/register">
              <Button
                size="lg"
                className="h-14 px-8 rounded-xl text-base font-semibold cursor-pointer"
                style={{
                  background: "white",
                  color: "var(--color-primary-600)",
                }}
              >
                Начать бесплатно
                <ArrowRight size={18} strokeWidth={1.75} />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-200 bg-surface-0 py-8">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center text-white text-xs"
                style={{
                  background:
                    "linear-gradient(135deg, var(--color-primary-500), var(--color-primary-600))",
                }}
              >
                <Rocket size={12} strokeWidth={1.75} />
              </div>
              <span className="text-body-sm font-semibold text-surface-900">
                StartupCopilot
              </span>
            </div>
            <p className="text-body-sm text-surface-400">
              © 2026 StartupCopilot. Платформа Сбера для молодых
              предпринимателей.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
