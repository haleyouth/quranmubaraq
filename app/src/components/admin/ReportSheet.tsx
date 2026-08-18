"use client";

import Image from "next/image";
import { site } from "@/lib/content";
import { toHijri } from "@/lib/hijri";
import type { ReportData } from "@/lib/admin/reports";

/**
 * A4 report sheet.
 *
 * Laid out in millimetres so the on-screen preview matches what the printer
 * produces. The print stylesheet in globals.css hides everything outside
 * `.print-root`, so Ctrl-P / Save as PDF yields exactly this sheet.
 */
export function ReportSheet({
  data,
  generatedBy,
  now,
}: {
  data: ReportData;
  generatedBy: string;
  /** Passed in rather than read here, so the caller controls hydration. */
  now: Date;
}) {
  const hijri = toHijri(now);

  return (
    <div className="print-root">
      <article className="a4-sheet mx-auto border-2 border-ink/15 shadow-lg print:border-0 print:shadow-none">
        {/* Letterhead */}
        <header className="flex items-start justify-between gap-6 border-b-4 border-ink pb-4">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center rounded-lg bg-ink px-3 py-2">
              <Image
                src="/brand/logo.png"
                alt={site.name}
                width={104}
                height={55}
                className="h-auto w-[104px]"
              />
            </span>
            <div>
              <p className="font-display text-base leading-tight text-ink">{site.name}</p>
              <p className="text-[10px] tracking-wider text-ink/60 uppercase">
                {site.tagline}
              </p>
              <p className="mt-0.5 text-[10px] text-ink/55">
                Est. {site.founded} · Online Quran Academy
              </p>
            </div>
          </div>

          <div className="text-right text-[10px] leading-relaxed text-ink/60">
            <p className="font-display text-sm text-ink">{data.title}</p>
            <p>{data.subtitle}</p>
            <p className="mt-1">
              {now.toLocaleDateString("en-GB", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </p>
            <p>
              {hijri.day} {hijri.monthName} {hijri.year} AH
            </p>
            <p className="mt-1">Prepared by {generatedBy}</p>
          </div>
        </header>

        {/* Bismillah */}
        <p
          dir="rtl"
          lang="ar"
          className="mt-4 text-center text-lg leading-loose text-ink/70"
        >
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>

        {/* Summary */}
        <section className="mt-4">
          <h2 className="font-display border-b-2 border-ink/15 pb-1 text-xs tracking-wider text-ink/60 uppercase">
            Summary
          </h2>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {data.summary.map((s) => (
              <div key={s.label} className="rounded-lg border-2 border-ink/20 bg-cream/60 p-2.5">
                <p className="text-[9px] font-bold tracking-wider text-ink/55 uppercase">
                  {s.label}
                </p>
                <p className="font-display mt-0.5 text-lg leading-none text-ink">
                  {s.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Detail */}
        <section className="mt-5">
          <h2 className="font-display border-b-2 border-ink/15 pb-1 text-xs tracking-wider text-ink/60 uppercase">
            Detail
          </h2>

          <table className="mt-2 w-full border-collapse text-[10px]">
            <thead>
              <tr className="border-b-2 border-ink bg-cream-deep/70">
                {data.columns.map((c) => (
                  <th
                    key={c}
                    scope="col"
                    className="px-2 py-1.5 text-left font-bold tracking-wide text-ink uppercase"
                  >
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.map((row, i) => (
                <tr
                  key={i}
                  className={i % 2 ? "bg-cream/40" : "bg-white"}
                  style={{ borderBottom: "1px solid rgba(45,27,77,0.10)" }}
                >
                  {data.columns.map((c) => (
                    <td key={c} className="px-2 py-1.5 align-top text-ink/85">
                      {String(row[c] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
              {data.rows.length === 0 && (
                <tr>
                  <td
                    colSpan={data.columns.length}
                    className="px-2 py-8 text-center text-ink/50"
                  >
                    No records in this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        {/* Signature block — reports are an official record */}
        <section className="mt-8 grid grid-cols-2 gap-8">
          {["Class teacher", "Principal"].map((role) => (
            <div key={role}>
              <div className="h-10 border-b-2 border-ink/30" />
              <p className="mt-1 text-[10px] font-bold text-ink/60">{role}</p>
              <p className="text-[9px] text-ink/45">Name, signature and date</p>
            </div>
          ))}
        </section>

        {/* Footer */}
        <footer className="mt-8 border-t-2 border-ink/15 pt-2 text-[9px] leading-relaxed text-ink/50">
          <p>
            {site.name} · {site.phone} · {site.email} · {site.url.replace(/^https?:\/\//, "")}
          </p>
          <p>
            This report is confidential and intended only for the named recipient and
            their guardians. Generated {now.toLocaleString("en-GB")}.
          </p>
        </footer>
      </article>
    </div>
  );
}
