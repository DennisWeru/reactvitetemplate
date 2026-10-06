import { RouteObject } from 'react-router-dom'
import LoginPage from './pages/login'
import SignupPage from './pages/signup'
import ForgotPasswordPage from './pages/forgot-password'
import ResetPasswordPage from './pages/reset-password'
import AccountPage from './pages/account'

export const authRoutes: RouteObject[] = [
  { path: '/login', Component: LoginPage },
  { path: '/signup', Component: SignupPage },
  { path: '/forgot-password', Component: ForgotPasswordPage },
  { path: '/reset-password', Component: ResetPasswordPage },
  { path: '/account', Component: AccountPage },
]
