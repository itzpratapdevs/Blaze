import { Highlight, themes } from 'prism-react-renderer'
import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

interface CodeBlockProps {
    code: string
    language?: string
    filename?: string
    showLineNumbers?: boolean
}

export function CodeBlock({ code, language = 'tsx', filename, showLineNumbers = true }: CodeBlockProps) {
    const [copied, setCopied] = useState(false)

    const handleCopy = () => {
        navigator.clipboard.writeText(code.trim())
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="docs-code-block my-6">
            {/* Header */}
            <div className="docs-code-block-header">
                {/* Mac-style dots */}
                <div className="docs-code-block-dots">
                    <div className="docs-code-block-dot docs-code-block-dot-red" />
                    <div className="docs-code-block-dot docs-code-block-dot-yellow" />
                    <div className="docs-code-block-dot docs-code-block-dot-green" />
                </div>

                {/* Filename or language */}
                <div className="flex items-center gap-3">
                    {filename && (
                        <span className="text-xs text-neutral-400 font-medium">{filename}</span>
                    )}
                    <span className="docs-code-block-lang">{language}</span>
                </div>

                {/* Copy button */}
                <button
                    onClick={handleCopy}
                    className="docs-code-block-copy"
                    title="Copy code"
                >
                    {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                    ) : (
                        <Copy className="w-4 h-4" />
                    )}
                </button>
            </div>

            {/* Code content */}
            <Highlight theme={themes.nightOwl} code={code.trim()} language={language}>
                {({ style, tokens, getLineProps, getTokenProps }) => (
                    <pre
                        className="overflow-x-auto text-sm p-5"
                        style={{ ...style, background: 'transparent', margin: 0 }}
                    >
                        <div className="min-w-max">
                            {tokens.map((line, i) => (
                                <div key={i} {...getLineProps({ line })} className="flex">
                                    {showLineNumbers && (
                                        <span className="text-neutral-600 select-none mr-6 text-xs w-6 text-right flex-shrink-0 font-mono">
                                            {i + 1}
                                        </span>
                                    )}
                                    <span className="flex-1">
                                        {line.map((token, key) => (
                                            <span key={key} {...getTokenProps({ token })} />
                                        ))}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </pre>
                )}
            </Highlight>
        </div>
    )
}
