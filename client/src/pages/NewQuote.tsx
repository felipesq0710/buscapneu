import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import api from '../lib/api'
import { useToast } from '../components/ui/Toast'

const schema = z.object({
  company: z.string().min(1, 'Empresa obrigatória'),
  brand: z.string().min(1, 'Marca obrigatória'),
  model: z.string().optional(),
  unitPrice: z.string().optional().transform(v => v ? parseFloat(v) : undefined),
  totalPrice: z.string().optional().transform(v => v ? parseFloat(v) : undefined),
  paymentConditions: z.string().optional(),
  includedServices: z.string().optional(),
  observations: z.string().optional(),
})

type FormData = z.infer<typeof schema>

const COMPANIES = ['Harter Pneus', 'Corrales Pneus', 'Muniz Pneus', 'Impacto Pneus', 'Zé Pneus', 'Rede GP Pneus', 'Gomma Pneus', 'Lyon Pneus', 'Crestani Pneus', 'HR Pneus']

export default function NewQuote() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    try {
      await api.post('/quotes', data)
      toast('Cotação adicionada com sucesso!', 'success')
      navigate('/quotes')
    } catch (err: any) {
      toast(err?.response?.data?.error || 'Erro ao salvar cotação', 'error')
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary px-2.5 py-2">
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Nova Cotação</h1>
          <p className="text-sm text-[var(--text-muted)]">Cadastre uma nova cotação de pneus</p>
        </div>
      </div>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit(onSubmit)}
        className="card space-y-5"
      >
        <div className="grid gap-5 sm:grid-cols-2">
          {/* Company */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text)]">Empresa *</label>
            <input {...register('company')} list="companies" className="input" placeholder="Ex: Harter Pneus" />
            <datalist id="companies">
              {COMPANIES.map(c => <option key={c} value={c} />)}
            </datalist>
            {errors.company && <p className="text-xs text-red-500">{errors.company.message}</p>}
          </div>

          {/* Brand */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text)]">Marca *</label>
            <input {...register('brand')} className="input" placeholder="Ex: Pirelli, Goodyear, XBRI..." />
            {errors.brand && <p className="text-xs text-red-500">{errors.brand.message}</p>}
          </div>

          {/* Model */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text)]">Modelo</label>
            <input {...register('model')} className="input" placeholder="Ex: Cinturato P1" />
          </div>

          {/* Unit price */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text)]">Valor unitário (R$)</label>
            <input {...register('unitPrice')} type="number" step="0.01" min="0" className="input" placeholder="0,00" />
          </div>

          {/* Total price */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text)]">Valor 2 pneus (R$)</label>
            <input {...register('totalPrice')} type="number" step="0.01" min="0" className="input" placeholder="0,00" />
          </div>

          {/* Payment */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-[var(--text)]">Condição de pagamento</label>
            <input {...register('paymentConditions')} className="input" placeholder="Ex: Pix, Até 10x sem juros..." />
          </div>
        </div>

        {/* Services */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--text)]">Serviços inclusos</label>
          <input {...register('includedServices')} className="input" placeholder="Ex: Montagem + balanceamento grátis" />
        </div>

        {/* Observations */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[var(--text)]">Observações</label>
          <textarea {...register('observations')} className="input resize-none" rows={3} placeholder="Notas adicionais..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">
            Cancelar
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary flex-1">
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSubmitting ? 'Salvando...' : 'Salvar cotação'}
          </button>
        </div>
      </motion.form>
    </div>
  )
}
