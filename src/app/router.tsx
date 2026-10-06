import React from 'react'
import { createBrowserRouter, RouteObject } from 'react-router-dom'
import ErrorPage from '../shared/components/error-page'
import { getDefaultLayout } from './layouts/layout'
import HomePage from './pages/home'
import { authRoutes } from './auth-routes'

export const routerObjects: RouteObject[] = [
  ...authRoutes,
  {
    path: '/',
    Component: HomePage,
  },
]

export function createRouter(): ReturnType<typeof createBrowserRouter> {
  const routeWrappers = routerObjects.map((router) => {
    // @ts-ignore TODO: better type support
    const getLayout = router.Component?.getLayout || getDefaultLayout
    const Component = router.Component!
    const page = getLayout(<Component />)
    return {
      ...router,
      element: page,
      Component: null,
      ErrorBoundary: ErrorPage,
    }
  })
  return createBrowserRouter(routeWrappers)
}
