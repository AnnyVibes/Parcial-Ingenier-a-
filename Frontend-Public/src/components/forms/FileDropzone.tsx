import { useId } from 'react'
import { Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { validateDocFile } from '@/lib/validators'
import { toast } from 'sonner'

interface Props {
  label: string
  required?: boolean
  value: File | null
  onChange: (file: File | null) => void
}

export function FileDropzone({ label, required, value, onChange }: Props): JSX.Element {
  const id = useId()

  function handleFileSelect(file: File | null): void {
    if (!file) {
      onChange(null)
      return
    }
    const err = validateDocFile(file)
    if (err) {
      toast.error(`${label}: ${err}`)
      return
    }
    onChange(file)
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id} required={required}>
        {label}
      </Label>
      <div className="flex items-center gap-2">
        {value ? (
          <div className="flex flex-1 items-center justify-between rounded-md border bg-muted/40 px-3 py-2 text-sm">
            <span className="truncate">{value.name}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Quitar archivo"
              onClick={() => onChange(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <label
            htmlFor={id}
            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed bg-muted/20 px-3 py-3 text-sm text-muted-foreground hover:bg-muted/40"
          >
            <Upload className="h-4 w-4" /> Seleccionar archivo (PDF/JPG/PNG, max 10MB)
          </label>
        )}
        <input
          id={id}
          type="file"
          accept=".pdf,image/jpeg,image/png"
          className="sr-only"
          onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  )
}
