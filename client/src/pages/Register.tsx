import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Gauge, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/auth.store'
import { useToast } from '../components/ui/Toast'

const schema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, { message: 'Senhas não coincidem', path: ['confirm'] })

type FormData = z.infer<typeof schema>

export default function Register() {
  const { register: authRegister, isLoading } = useAuthStore()
  const { toast } = useToast()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    try {
      await authRegister(data.name, data.email, data.password)
    } catch (err: any) {
      toast(err?.response?.data?.error || 'Erro ao criar conta', 'error')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--bg)] p-4">
      <div className="w-full max-w-sm">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
          <div className="mb-8 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)]">
              <Gauge className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--text)]">BuscaPneu</h1>
            <p className="mt-1 text-sm text-[var(--text-muted)]">Crie sua conta gratuita</p>
          </div>

          <div className="card space-y-4">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {[
                { name: 'name' as const, label: 'Nome completo', type: 'text', placeholder: 'Seu nome' },
                { name: 'email' as const, label: 'E-mail', type: 'email', placeholder: 'seu@email.com' },
                { name: 'password' as const, label: 'Senha', type: 'password', placeholder: '••••••' },
                { name: 'confirm' as const, label: 'Confirmar senha', type: 'password', placeholder: '••••••' },
              ].map(f => (
                <div key={f.name} className="space-y-1.5">
                  <label className="text-sm font-medium text-[var(--text)]">{f.label}</label>
                  <input {...register(f.name)} type={f.type} className="input" placeholder={f.placeholder} />
                  {errors[f.name] && <p className="text-xs text-red-500">{errors[f.name]?.message}</p>}
                </div>
              ))}

              <button type="submit" disabled={isLoading} className="btn-primary w-full justify-center py-3">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isLoading ? 'Criando conta...' : 'Criar conta'}
              </button>
            </form>

            <p className="text-center text-xs text-[var(--text-muted)]">
              Já tem conta?{' '}
              <Link to="/login" className="font-semibold text-[var(--accent)] hover:underline">Entrar</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
