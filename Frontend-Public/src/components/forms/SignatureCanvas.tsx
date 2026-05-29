import { useRef } from 'react'
import SignaturePad from 'react-signature-canvas'
import { Button } from '@/components/ui/button'

interface Props {
  onChange: (dataUrl: string | null) => void
}

export function SignatureCanvasField({ onChange }: Props): JSX.Element {
  const padRef = useRef<SignaturePad | null>(null)

  function handleClear(): void {
    padRef.current?.clear()
    onChange(null)
  }

  function handleEnd(): void {
    const pad = padRef.current
    if (!pad || pad.isEmpty()) {
      onChange(null)
      return
    }
    onChange(pad.toDataURL('image/png'))
  }

  return (
    <div className="space-y-2">
      <div className="rounded-md border bg-white">
        <SignaturePad
          ref={padRef}
          onEnd={handleEnd}
          canvasProps={{
            className: 'h-40 w-full',
            'aria-label': 'Firma',
          }}
        />
      </div>
      <Button type="button" variant="outline" size="sm" onClick={handleClear}>
        Limpiar firma
      </Button>
    </div>
  )
}
