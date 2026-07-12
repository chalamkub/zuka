"use client"

import * as React from "react"

export interface LegalSection {
  heading: string
  paragraphs?: string[]
  bullets?: string[]
}

export function LegalPage({
  title,
  intro,
  updatedAt,
  sections,
}: {
  title: string
  intro?: string
  updatedAt?: string
  sections: LegalSection[]
}) {
  return (
    <main className="min-h-screen">
      <section className="flex justify-center px-3 py-10">
        <div className="w-full max-w-3xl">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
            {updatedAt && (
              <p className="mt-1 text-sm text-muted-foreground">
                ปรับปรุงล่าสุด: {updatedAt}
              </p>
            )}
          </div>

          {intro && (
            <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
              {intro}
            </p>
          )}

          <div className="flex flex-col gap-8">
            {sections.map((section, i) => (
              <div key={i} className="flex flex-col gap-2">
                <h2 className="text-base font-semibold">
                  {i + 1}. {section.heading}
                </h2>
                {section.paragraphs?.map((p, j) => (
                  <p
                    key={j}
                    className="text-sm leading-relaxed text-muted-foreground"
                  >
                    {p}
                  </p>
                ))}
                {section.bullets && (
                  <ul className="flex list-disc flex-col gap-1 pl-5 text-sm leading-relaxed text-muted-foreground">
                    {section.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
