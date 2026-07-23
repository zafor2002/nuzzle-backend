# PetSocial — Documentation

This folder contains the full documentation set for PetSocial, written in LaTeX. Each
file is a **standalone** document (its own `\documentclass`, no shared master file), so
any single one can be compiled and read independently.

## Contents

| File | Document |
|---|---|
| `01-project-overview.tex` | What PetSocial is, why it exists, who it's for |
| `02-system-architecture.tex` | Tech stack, request flow, directory structure, session handling |
| `03-database-design.tex` | Every Prisma model, field-by-field, with relationships |
| `04-feature-specification.tex` | User-facing behavior and business rules per feature |
| `05-api-reference.tex` | Every Server Action: validation rules, rate limits, auth checks |
| `06-deployment-guide.tex` | Supabase setup, environment variables, GitHub + Vercel deployment |
| `07-user-guide.tex` | Plain-language guide for end users |
| `08-security-privacy.tex` | Auth model, authorization pattern, anonymity model, known limitations |

## Compiling

No LaTeX distribution is installed in the environment these were written in, so the
source has not been compiled to PDF. To build them yourself:

### Option A — Overleaf (no install required)
Upload any `.tex` file to [overleaf.com](https://www.overleaf.com) as a new project and
compile with pdfLaTeX.

### Option B — Local LaTeX install
Install [MiKTeX](https://miktex.org/) (Windows) or [TeX Live](https://www.tug.org/texlive/),
then from this folder:

```bash
pdflatex 01-project-overview.tex
pdflatex 01-project-overview.tex   # run twice so the table of contents resolves
```

Repeat for each file, or compile all of them at once:

```bash
for f in *.tex; do pdflatex -interaction=nonstopmode "$f"; pdflatex -interaction=nonstopmode "$f"; done
```

Each document uses only common, widely-available packages (`geometry`, `titlesec`,
`enumitem`, `booktabs`, `longtable`, `xcolor`, `fancyhdr`, `hyperref`, `parskip`,
`listings`; `02-system-architecture.tex` additionally uses `tikz` for one diagram) —
a standard MiKTeX or TeX Live install with automatic package fetching will pull in
everything needed on first compile.

## Keeping these in sync with the code

These documents describe the application as of the commit where this folder was added.
They are not auto-generated — if the schema, routes, or Server Actions change, update
the relevant document by hand alongside the code change.
