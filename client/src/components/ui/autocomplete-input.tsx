import * as React from "react"
import { cn } from "@/lib/utils"

interface AutocompleteInputProps extends Omit<React.ComponentProps<"input">, 'onChange'> {
  suggestions?: string[]
  value?: string
  onChange?: (value: string) => void
}

const AutocompleteInput = React.forwardRef<HTMLInputElement, AutocompleteInputProps>(
  ({ className, suggestions = [], value = "", onChange, ...props }, ref) => {
    const [currentSuggestion, setCurrentSuggestion] = React.useState<string>("")
    const inputRef = React.useRef<HTMLInputElement>(null)
    
    React.useImperativeHandle(ref, () => inputRef.current!)

    const findSuggestion = React.useCallback((inputValue: string) => {
      if (!inputValue || inputValue.length < 2) {
        setCurrentSuggestion("")
        return
      }

      const lowerInput = inputValue.toLowerCase()
      const match = suggestions.find(s => 
        s.toLowerCase().startsWith(lowerInput) && s.toLowerCase() !== lowerInput
      )
      
      if (match) {
        setCurrentSuggestion(match)
      } else {
        setCurrentSuggestion("")
      }
    }, [suggestions])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value
      onChange?.(newValue)
      findSuggestion(newValue)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Tab" && currentSuggestion) {
        e.preventDefault()
        onChange?.(currentSuggestion)
        setCurrentSuggestion("")
      }
    }

    const getSuggestionOverlay = () => {
      if (!currentSuggestion || !value) return null
      const remaining = currentSuggestion.slice(value.length)
      return remaining
    }

    return (
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          {...props}
        />
        {currentSuggestion && value && (
          <div className="absolute inset-0 pointer-events-none flex items-center px-3">
            <span className="invisible">{value}</span>
            <span className="text-muted-foreground/50 text-base md:text-sm">
              {getSuggestionOverlay()}
            </span>
            <span className="ml-2 text-xs text-primary/60 bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
              Tab
            </span>
          </div>
        )}
      </div>
    )
  }
)
AutocompleteInput.displayName = "AutocompleteInput"

export { AutocompleteInput }
