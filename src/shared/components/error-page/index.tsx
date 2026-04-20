import { Link, useRouteError } from 'react-router-dom'
import { Button } from '../ui/button'

export default function ErrorPage() {
  const error = useRouteError() as any

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-4 text-left bg-white">
      <h1>Oops!</h1>
      <p>Sorry, an unexpected error has occurred.</p>
      <p className="font-mono text-sm text-muted-foreground">
        <span className="mr-2">{error?.status}</span>
        <i>{error?.statusText || error?.message}</i>
      </p>
      <Button asChild variant="outline">
        <Link to="/">Back to Home Page</Link>
      </Button>
    </div>
  )
}
