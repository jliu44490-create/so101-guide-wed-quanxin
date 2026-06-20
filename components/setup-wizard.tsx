'use client'

/**
 * 环境向导 — the deterministic side of LVJIN AI's "hands".
 *
 * A guided form that turns "what's your machine?" into a correct, copy-paste
 * LeRobot setup script (grounded in chapter 3 via lib/scaffold), plus a paste-
 * your-error diagnoser backed by the site error database. No LLM, no tokens, no
 * hallucination — the AI chat reuses the same generators conversationally.
 */

import { useMemo, useState } from 'react'
import { Cpu, MonitorSmartphone, Wrench, Stethoscope, Search, ArrowRight, Bot } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { CodeBlock } from '@/components/code-block'
import {
  buildSetupScript,
  diagnoseError,
  type OS,
  type GPU,
  type Installer,
  type DiagnoseHit
} from '@/lib/scaffold'
import { cn } from '@/lib/utils'

const OS_OPTS: { value: OS; label: string }[] = [
  { value: 'windows', label: 'Windows' },
  { value: 'macos', label: 'macOS' },
  { value: 'linux', label: 'Linux' }
]
const GPU_OPTS: { value: GPU; label: string }[] = [
  { value: 'nvidia', label: 'NVIDIA 显卡' },
  { value: 'apple', label: 'Apple 芯片' },
  { value: 'none', label: '没有/不确定' }
]
const INSTALLER_OPTS: { value: Installer; label: string }[] = [
  { value: 'conda', label: 'conda（推荐）' },
  { value: 'venv', label: 'venv' }
]

function Picker<T extends string>({
  icon: Icon,
  label,
  value,
  options,
  onChange
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}) {
  return (
    <div>
      <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <Icon className="size-3.5" /> {label}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-sm transition-all',
              value === o.value
                ? 'border-primary/60 bg-primary/10 font-medium text-foreground'
                : 'border-border/60 bg-card/40 text-muted-foreground hover:border-primary/40 hover:text-foreground'
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function SetupWizard({
  trigger,
  onAskAi
}: {
  trigger: React.ReactNode
  /** Optional: hand the generated text to the chat so the AI can walk through it. */
  onAskAi?: (text: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [os, setOs] = useState<OS>('windows')
  const [gpu, setGpu] = useState<GPU>('none')
  const [installer, setInstaller] = useState<Installer>('conda')

  const [errText, setErrText] = useState('')
  const [hits, setHits] = useState<DiagnoseHit[] | null>(null)

  const plan = useMemo(() => buildSetupScript({ os, gpu, installer }), [os, gpu, installer])

  const runDiagnose = () => setHits(diagnoseError(errText))

  const askAi = (text: string) => {
    onAskAi?.(text)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="size-4 text-primary" /> 环境向导
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="setup">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="setup" className="gap-1.5">
              <MonitorSmartphone className="size-3.5" /> 搭环境
            </TabsTrigger>
            <TabsTrigger value="diagnose" className="gap-1.5">
              <Stethoscope className="size-3.5" /> 诊断报错
            </TabsTrigger>
          </TabsList>

          {/* ── 搭环境 ── */}
          <TabsContent value="setup" className="space-y-4 pt-2">
            <p className="text-xs text-muted-foreground">
              选一下你的电脑,我按站内第 3 章给你一份能直接跑的安装脚本。
            </p>
            <Picker icon={MonitorSmartphone} label="操作系统" value={os} options={OS_OPTS} onChange={setOs} />
            <Picker icon={Cpu} label="显卡" value={gpu} options={GPU_OPTS} onChange={setGpu} />
            <Picker icon={Wrench} label="环境管理器" value={installer} options={INSTALLER_OPTS} onChange={setInstaller} />

            <CodeBlock code={plan.script} language="bash" description="整段复制到终端,逐行执行:" />

            <ol className="space-y-2">
              {plan.steps.map((s, i) => (
                <li key={i} className="flex gap-3 rounded-lg border border-border/50 bg-card/30 p-3">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-[11px] font-bold text-primary">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">{s.label}</p>
                    <code className="mt-0.5 block break-all font-mono text-xs text-primary/90">{s.command}</code>
                    {s.note && <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{s.note}</p>}
                  </div>
                </li>
              ))}
            </ol>

            {plan.notes.length > 0 && (
              <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3">
                <p className="mb-1 text-xs font-semibold text-amber-600 dark:text-amber-300">💡 针对你的显卡</p>
                <ul className="space-y-1 text-xs leading-relaxed text-muted-foreground">
                  {plan.notes.map((n, i) => (
                    <li key={i}>· {n}</li>
                  ))}
                </ul>
              </div>
            )}

            {onAskAi && (
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-1.5"
                onClick={() =>
                  askAi(`我在 ${os}、显卡是 ${gpu}、用 ${installer} 装 LeRobot 环境,请按这个脚本一步步带我装,并解释每步在做什么:\n\n\`\`\`bash\n${plan.script}\n\`\`\``)
                }
              >
                <Bot className="size-4" /> 让 LVJIN AI 带我一步步装
              </Button>
            )}
          </TabsContent>

          {/* ── 诊断报错 ── */}
          <TabsContent value="diagnose" className="space-y-3 pt-2">
            <p className="text-xs text-muted-foreground">把终端里红色的报错粘进来,我帮你查根因和解决办法。</p>
            <Textarea
              value={errText}
              onChange={(e) => setErrText(e.target.value)}
              placeholder="例如:ModuleNotFoundError: No module named 'lerobot'"
              className="min-h-24 resize-y font-mono text-xs"
            />
            <Button size="sm" onClick={runDiagnose} disabled={!errText.trim()} className="gap-1.5">
              <Search className="size-4" /> 诊断
            </Button>

            {hits && hits.length === 0 && (
              <div className="rounded-lg border border-border/60 bg-card/30 p-4 text-center text-sm text-muted-foreground">
                错误库里没匹配到。
                {onAskAi ? (
                  <Button
                    variant="link"
                    size="sm"
                    className="px-1"
                    onClick={() => askAi(`我遇到这个报错,帮我排查:\n\n\`\`\`\n${errText}\n\`\`\``)}
                  >
                    让 LVJIN AI 帮你排查 →
                  </Button>
                ) : (
                  ' 试试换个关键词,或去问 LVJIN AI。'
                )}
              </div>
            )}

            {hits?.map(({ key, result }) => (
              <div key={key} className="space-y-2 rounded-xl border border-border/60 bg-card/40 p-4">
                <p className="font-mono text-sm font-medium text-destructive">{result.error}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">原因:</span> {result.cause}
                </p>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  <span className="font-semibold text-foreground">解决:</span> {result.solution}
                </p>
                {result.command && <CodeBlock code={result.command} language="bash" />}
                <p className="flex items-start gap-1 text-xs text-primary">
                  <ArrowRight className="mt-0.5 size-3 shrink-0" /> {result.nextStep}
                </p>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
