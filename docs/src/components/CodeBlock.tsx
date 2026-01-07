import { Highlight, themes } from 'prism-react-renderer'

interface CodeBlockProps {
    code: string
    language?: string
}

export function CodeBlock({ code, language = 'tsx' }: CodeBlockProps) {
    return (
        <Highlight theme={themes.nightOwl} code={code.trim()} language={language}>
            {({ style, tokens, getLineProps, getTokenProps }) => (
                <pre
                    className="rounded-xl overflow-x-auto text-sm my-4 -mx-4 sm:mx-0"
                    style={{ ...style, padding: '1.25rem', background: '#0d1117' }}
                >
                    <div className="min-w-max">
                        {tokens.map((line, i) => (
                            <div key={i} {...getLineProps({ line })}>
                                <span className="text-neutral-600 select-none mr-4 text-xs w-4 sm:w-6 text-right hidden sm:inline-block">
                                    {i + 1}
                                </span>
                                {line.map((token, key) => (
                                    <span key={key} {...getTokenProps({ token })} />
                                ))}
                            </div>
                        ))}
                    </div>
                </pre>
            )}
        </Highlight>
    )
}

