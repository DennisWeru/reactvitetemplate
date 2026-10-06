import React, { PropsWithChildren, ReactNode } from 'react'

interface AuthCardProps {
  title: string
  description?: string
  footer?: ReactNode
}

export function AuthCard({ title, description, footer, children }: PropsWithChildren<AuthCardProps>) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {description && <p className="mt-2 text-sm text-slate-500">{description}</p>}
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
      </div>
    </div>
  )
}

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function Field({ label, id, ...props }: FieldProps) {
  return (
    <label htmlFor={id} className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <input
        id={id}
        className="mt-1 block h-10 w-full rounded-md border border-slate-300 px-3 text-sm text-slate-900 shadow-sm outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
        {...props}
      />
    </label>
  )
}

export function FormMessage({ tone, children }: PropsWithChildren<{ tone: 'error' | 'success' }>) {
  const styles = tone === 'error' ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={`rounded-md px-3 py-2 text-sm ${styles}`}>
      {children}
    </p>
  )
}
