"use client";

import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function DocsPage() {
    const [markdown, setMarkdown] = useState("");
    const [headings, setHeadings] = useState<string[]>([]);

    useEffect(() => {
        fetch("/docs.md")
            .then((res) => res.text())
            .then((text) => {
                setMarkdown(text);
                const matches = text.match(/^##\s.+$/gm);
                if (matches) {
                    const cleaned = matches.map((line) => line.replace(/^##\s/, "").trim());
                    setHeadings(cleaned);
                }
            });
    }, []);

    return (
        <DashboardLayout>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                {/* Table des matières */}
                {headings.length > 0 && (
                    <aside className="lg:col-span-1 hidden lg:block bg-muted p-4 rounded h-fit sticky top-6">
                        <h2 className="text-lg font-semibold mb-2">📚 Table des matières</h2>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {headings.map((heading) => {
                                const id = heading.toLowerCase().replace(/\s+/g, '-');
                                return (
                                    <li key={id}>
                                        <a href={`#${id}`} className="hover:underline">{heading}</a>
                                    </li>
                                );
                            })}
                        </ul>
                    </aside>
                )}

                {/* Documentation */}
                <div className="lg:col-span-3 space-y-8 bg-card w-fit text-card-foreground rounded-xl border p-6 shadow-sm">
                    <ReactMarkdown
                        components={{
                            h1: ({ children }) => (
                                <h1 className="text-3xl font-bold text-foreground">{children}</h1>
                            ),
                            h2: ({ children }) => {
                                const text = children?.toString() ?? '';
                                const id = text.toLowerCase().replace(/\s+/g, '-');
                                return (
                                    <h2 id={id} className="text-2xl font-semibold mt-8 text-foreground mb-4">
                                        {children}
                                    </h2>
                                );
                            },
                            h3: ({ children }) => (
                                <h3 className="text-xl font-medium mt-6 text-foreground">{children}</h3>
                            ),
                            p: ({ children }) => (
                                <p className="text-base text-foreground leading-relaxed">{children}</p>
                            ),
                            ul: ({ children }) => (
                                <ul className="list-disc list-inside space-y-1 mb-4">{children}</ul>
                            ),
                            li: ({ children }) => (
                                <li className="text-base text-muted-foreground">{children}</li>
                            ),
                            strong: ({ children }) => (
                                <strong className="font-semibold text-foreground">{children}</strong>
                            ),
                            code: ({ children }) => (
                                <code className="px-1 py-0.5 rounded bg-accent text-sm font-mono">{children}</code>
                            ),
                            hr: () => <hr className="my-8 border-accent" />,
                        }}
                    >
                        {markdown}
                    </ReactMarkdown>
                </div>
            </div>
        </DashboardLayout>
    );
}