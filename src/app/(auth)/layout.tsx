import Link from "next/link";
import { Boxes, Database, Globe, Server, ShieldCheck } from "lucide-react";

import { Card, SectionTitle } from "@/components/ui";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_10%_10%,rgba(59,130,246,0.18),transparent_55%),radial-gradient(800px_circle_at_90%_20%,rgba(16,185,129,0.14),transparent_55%),radial-gradient(900px_circle_at_50%_100%,rgba(244,63,94,0.10),transparent_55%)]" />

      <div className="mx-auto grid min-h-dvh max-w-6xl items-center gap-10 px-4 py-12 lg:grid-cols-2">
        <div className="relative">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-300">
            <span className="rounded-xl border border-zinc-200 bg-white/60 px-3 py-1 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/40">
              DeployManage
            </span>
            <span>统一管理你的部署入口</span>
          </Link>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            更清晰地掌控每一台服务器与每一个域名
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-zinc-600 dark:text-zinc-300">
            将 Docker / Vercel / 反向代理 / 1Panel 管理入口等信息集中到一个地方，支持一键跳转与快速检索。
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Feature icon={Server} title="服务器清单" desc="Host/IP、地区、标签、1Panel 地址" />
            <Feature icon={Globe} title="域名入口" desc="访问地址 + 管理入口一键打开" />
            <Feature icon={Boxes} title="部署方式" desc="Docker / Vercel / 反代信息归档" />
            <Feature icon={Database} title="单文件数据" desc="WebDAV / OSS 外部存储" />
          </div>
        </div>

        <div className="relative">
          <Card className="p-6 sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <SectionTitle>登录</SectionTitle>
                <div className="mt-2 text-xl font-semibold tracking-tight">欢迎回来</div>
                <div className="mt-2 text-sm text-zinc-600 dark:text-zinc-300">
                  使用环境变量配置的账号密码进入面板。
                </div>
              </div>
              <div className="rounded-2xl border border-zinc-200 bg-white/60 p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/40">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6">{children}</div>

            <div className="mt-6 text-xs text-zinc-500">
              建议开启鉴权以保护服务器、面板等敏感信息。
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  desc,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200/70 bg-white/50 p-4 shadow-sm backdrop-blur dark:border-zinc-800/70 dark:bg-zinc-950/30">
      <div className="flex items-start gap-3">
        <div className="rounded-2xl border border-zinc-200 bg-white/70 p-2 shadow-sm dark:border-zinc-800 dark:bg-zinc-950/50">
          <Icon className="h-5 w-5 text-zinc-800 dark:text-zinc-100" />
        </div>
        <div>
          <div className="text-sm font-semibold">{title}</div>
          <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{desc}</div>
        </div>
      </div>
    </div>
  );
}

