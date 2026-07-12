import { Spinner } from "@/components/kibo-ui/spinner"

export function RouteLoading() {
  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <Spinner variant="ring" className="size-7 text-muted-foreground" />
    </div>
  )
}
