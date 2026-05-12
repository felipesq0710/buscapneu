import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gauge, Loader2, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useAuthStore } from '../store/auth.store'
import { useToast } from '../components/ui/Toast'

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type FormData = z.infer<typeof schema>

export default function Login() {
  const { login, isLoading } = useAuthStore()
  const { toast } = useToast()
  const [showPw, setShowPw] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'admin@buscapneu.com', password: 'admin123' },
  })

  async function onSubmit(data: FormData) {
    try {
      await login(data.email, data.password)
    } catch (err: any) {
      toast(err?.response?.data?.error || 'Credenciais inválidas', 'error')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-4">
      <div className="w-full max-w-sm">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          {/* Logo */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]">
              <Gauge className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text)]">BuscaPneu</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Entre na sua conta</p>
          </div>

          <div className="card space-y-4">
            <div className="rounded-xl bg-[var(--surface-2)] p-3 text-xs text-[var(--text-muted)]">
              Demo: <strong>admin@buscapneu.com</strong> / <strong>admin123</strong>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text)]">E-mail</label>
                <input {...register('email')} type="email" className="input" placeholder="seu@email.com" />
                {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[var(--text)]">Senha</label>
                <div className="relative">
                  <input {...register('password')} type={showPw ? 'text' : 'password'} className="input pr-10" placeholder="••••••" />
                  <button type="button" onClick={() => setShowPw(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isLoading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>

            <p className="text-center text-xs text-[var(--text-muted)]">
              Não tem conta?{' '}
              <Link to="/register" className="font-semibold text-[var(--accent)] hover:underline">Criar conta</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
