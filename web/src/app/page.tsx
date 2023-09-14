'use client'
import {
  Button,
  Label,
  PromptSelect,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Slider,
  Textarea,
  VideoInputForm
} from '@/components/ui'
import { useCompletion } from 'ai/react'
import { Wand2 } from 'lucide-react'
import { useState } from 'react'

export default function Home() {
  const [temperature, setTemperature] = useState(0.5)
  const [videoId, setVideoId] = useState<string | null>(null)
  const {
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    completion,
    isLoading
  } = useCompletion({
    api: 'http://localhost:3333/ai/complete',
    body: {
      videoId,
      temperature
    },
    headers: {
      'Content-Type': 'application/json'
    }
  })
  return (
    <main className="flex-1 p-6 flex gap-6">
      <div className="flex flex-col flex-1 gap-4">
        <div className="grid grid-rows-2 gap-4 flex-1">
          <Textarea
            value={input}
            className="resize-none p-4 leading-relaxed"
            placeholder="Inclua o prompt para a IA..."
            onChange={handleInputChange}
          />
          <Textarea
            className="resize-none p-4 leading-relaxed"
            placeholder="Resultado gerado pela IA"
            readOnly
            value={completion}
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Lembre-se: você pode utilizar a variável{' '}
          <code className="text-violet-400">{`{transcription}`}</code> no seu
          prompt para adicionar o conteúdo da transcrição do vídeo selecionado.
        </p>
      </div>
      <aside className="w-80 space-y-6">
        <VideoInputForm />
        <Separator />
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label>Prompt</Label>
            <PromptSelect onPromptSelected={setInput} />
          </div>
          <div className="space-y-2">
            <Label>Modelo</Label>
            <Select disabled defaultValue="gpt3.5">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt3.5">GPT 3.5-turbo 16k</SelectItem>
              </SelectContent>
            </Select>
            <span className="block text-sm text-muted-foreground italic">
              Você poderá customizar essa opção em breve
            </span>
          </div>
          <Separator />
          <div className="space-y-4">
            <Label>Temperatura</Label>
            <Slider
              value={[temperature]}
              onValueChange={(value) => setTemperature(value[0])}
              min={0}
              max={1}
              step={0.1}
            />
            <span className="block text-sm text-muted-foreground italic leading-relaxed">
              Valores mais altos tornam o resultado mais criativo, mas aumenta o
              índice de erros.
            </span>
          </div>
          <Separator />
          <Button type="submit" disabled={isLoading} className="w-full">
            Executar
            <Wand2 className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </aside>
    </main>
  )
}
