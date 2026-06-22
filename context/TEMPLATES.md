# LaTeX Resume Templates

How templates are stored, versioned, and extended in Render Resume. Read this before adding or modifying any `.tex` template.

---

## Where Templates Live

**Templates belong in the project directory** — not in a separate container volume, not in InsForge Storage, not in the database.

```
engine/templates/
├── registry.ts              → Single source of truth for template metadata
├── _shared/
│   └── watermark.sty        → Shared watermark package (preview vs download)
└── harvard/
    ├── resume.tex           → Handlebars-instrumented main .tex file
    └── (optional) *.cls     → Any class/style files the Overleaf project needs
```

**Why project directory, not container-only:**

| Approach | Verdict |
| -------- | ------- |
| **Project dir (`engine/templates/`)** | **Use this.** Version-controlled in git, reviewed in PRs, baked into Docker via `COPY . .` |
| Separate Docker volume mount | Avoid for v1 — adds deploy complexity, templates not in git |
| InsForge Storage / DB | Wrong — templates are code, not user data |
| Download from Overleaf at runtime | Wrong — brittle, no versioning, network dependency |

When you `docker compose up --build`, the Dockerfile copies the entire repo including `engine/templates/` into the image. Redeploy = templates update automatically.

---

## Launch Template: Harvard

Start with one template: **Harvard** — classic single-column, ATS-friendly layout.

### Import from Overleaf

1. Open the Harvard template on Overleaf (or your preferred source).
2. **Menu → Download → Source** — you get a `.zip` with `.tex`, `.cls`, `.bib`, images, etc.
3. Create `engine/templates/harvard/` in the project.
4. Copy files:
   - Main `.tex` → rename to `resume.tex`
   - Any required `.cls`, `.sty`, `.bib` → same folder (or `_shared/` if reused later)
5. **Do not copy** Overleaf's build artifacts (`*.aux`, `*.log`, `*.pdf`).

### Convert static LaTeX to Handlebars

Replace hardcoded resume content with Handlebars placeholders matching the DeepSeek JSON schema from `engine/types.ts`:

| JSON field | Handlebars example |
| ---------- | ------------------ |
| `personalInfo.fullName` | `{{personalInfo.fullName}}` |
| `personalInfo.email` | `{{personalInfo.email}}` |
| `experience[]` | `{{#each experience}}...{{/each}}` |
| `education[]` | `{{#each education}}...{{/each}}` |
| `skills[]` | `{{#each skills}}...{{/each}}` |
| Watermark flag | Injected by compiler: `{{watermarkEnabled}}` |

**Rules:**

- DeepSeek never generates LaTeX — only JSON. All `\section`, `\textbf`, layout commands stay in the `.tex` file.
- Escape literal braces in LaTeX that are not Handlebars: `\{{` and `\}}` if needed, or use `\newcommand` blocks Handlebars won't touch.
- Test compile locally after every edit: `pdflatex` on the rendered output in a tmp folder.

### Register in registry.ts

Every template must be registered before it appears in the UI or compiler:

```typescript
// engine/templates/registry.ts

export type TemplateDefinition = {
  id: string;
  name: string;
  description: string;
  texPath: string;
  thumbnailPath: string;
  status: "active" | "coming_soon" | "disabled";
  requiredPackages: string[];
};

export const TEMPLATE_REGISTRY: TemplateDefinition[] = [
  {
    id: "harvard",
    name: "Harvard",
    description: "Classic single-column layout. ATS-friendly.",
    texPath: "harvard/resume.tex",
    thumbnailPath: "/templates/thumbnails/harvard.png",
    status: "active",
    requiredPackages: ["texlive-latex-extra"],
  },
];

export const DEFAULT_TEMPLATE_ID = "harvard";

export function getTemplateById(id: string): TemplateDefinition | undefined {
  return TEMPLATE_REGISTRY.find((t) => t.id === id && t.status === "active");
}

export function getActiveTemplates(): TemplateDefinition[] {
  return TEMPLATE_REGISTRY.filter((t) => t.status === "active");
}
```

### Thumbnail for TemplatePicker

1. Compile a sample resume with the Harvard template locally.
2. Export first page as PNG (screenshot or `pdftoppm`).
3. Save to `public/templates/thumbnails/harvard.png`.
4. Reference in registry as `thumbnailPath`.

The TemplatePicker component reads `getActiveTemplates()` — no hardcoded template list in UI code.

---

## How the Compiler Loads Templates

```typescript
// engine/compiler.ts (pattern)

import fs from "fs";
import path from "path";
import { getTemplateById } from "./templates/registry";

const TEMPLATES_ROOT = path.join(process.cwd(), "engine/templates");

export function loadTemplateTex(templateId: string): string {
  const def = getTemplateById(templateId);
  if (!def) throw new Error(`Unknown template: ${templateId}`);

  const absolutePath = path.join(TEMPLATES_ROOT, def.texPath);
  return fs.readFileSync(absolutePath, "utf-8");
}
```

`selected_template` in the `resumes` DB table stores the template **id** (e.g. `"harvard"`), not a file path.

---

## Watermark (Preview vs Download)

Watermark logic is **not** duplicated per template. One shared approach:

**Option A — Compiler injects flag into every template:**

```latex
% At top of resume.tex (Harvard)
\input{../_shared/watermark-setup.tex}
```

**Option B — Compiler wraps rendered content** (simpler for v1):

Pass `watermarkEnabled: true | false` in Handlebars context. Each template includes:

```latex
{{#if watermarkEnabled}}
\usepackage{draftwatermark}
\SetWatermarkText{PREVIEW}
{{/if}}
```

Preview compiles (`/api/compile` with `watermark: true`) → watermarked.
Download compiles (`watermark: false`) → clean PDF to InsForge Storage.

---

## Adding More Templates Later

Follow this checklist for each new template (e.g. Modern, Minimal, Two-Column):

### 1. Create folder

```
engine/templates/modern/
├── resume.tex
└── (any .cls / .sty / assets)
```

Use lowercase **kebab-case** for folder and id: `modern`, `two-column`, `software-engineer`.

### 2. Convert Overleaf source to Handlebars

- Reuse the **same JSON schema** — all templates consume identical `resume_data` from DeepSeek.
- Do not create template-specific JSON fields unless you extend `engine/types.ts` and the DeepSeek prompt for all templates.

### 3. Register in registry.ts

```typescript
{
  id: "modern",
  name: "Modern",
  description: "Clean layout with subtle accent line.",
  texPath: "modern/resume.tex",
  thumbnailPath: "/templates/thumbnails/modern.png",
  status: "active",
  requiredPackages: ["texlive-latex-extra", "texlive-fonts-extra"],
},
```

### 4. Add thumbnail

`public/templates/thumbnails/modern.png`

### 5. Verify TeX packages in Dockerfile

If the new template needs fonts or packages beyond the base install, add to Dockerfile:

```dockerfile
RUN apt-get update && apt-get install -y \
    texlive-latex-base \
    texlive-fonts-recommended \
    texlive-latex-extra \
    texlive-fonts-extra \
    && rm -rf /var/lib/apt/lists/*
```

Rebuild and redeploy.

### 6. Test locally, then production

- [ ] Compiles with sample JSON — no LaTeX errors
- [ ] Watermarked preview looks correct
- [ ] Clean download looks correct
- [ ] Appears in TemplatePicker grid
- [ ] `selected_template` saves correctly to InsForge
- [ ] PostHog `preview_rendered` includes correct `templateId`

### 7. "Coming soon" templates

Register with `status: "coming_soon"` to show greyed-out cards in TemplatePicker without enabling compile. Switch to `"active"` when ready.

---

## Template ID Conventions

| Rule | Example |
| ---- | ------- |
| Lowercase kebab-case id | `harvard`, `two-column` |
| Matches folder name | `engine/templates/harvard/` → id `"harvard"` |
| Never change id after users have drafts | Breaks existing `selected_template` values — add new template instead |
| `DEFAULT_TEMPLATE_ID` in registry | Used when creating new resume drafts |

---

## Schema Contract (All Templates Must Support)

Every template receives the same Handlebars context derived from `resume_data`:

```typescript
type ResumeData = {
  personalInfo: {
    fullName: string;
    email: string;
    phone?: string;
    location?: string;
    website?: string;
    linkedin?: string;
  };
  experience: Array<{
    company: string;
    role: string;
    startDate: string;
    endDate?: string;
    bullets: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    major?: string;
    graduationDate?: string;
  }>;
  skills: string[];
  watermarkEnabled?: boolean; // injected by compiler, not stored in DB
};
```

If a template cannot render a field (e.g. no LinkedIn line), omit the section with `{{#if personalInfo.linkedin}}`.

---

## Build Plan Integration

| Phase | Template work |
| ----- | ------------- |
| Phase 3 — Feature 10 (LaTeX Compiler) | Add Harvard template + registry + `_shared` watermark |
| Phase 2 — Feature 06 (Builder UI) | TemplatePicker reads `getActiveTemplates()` |
| Post-launch | Add templates one at a time via registry checklist above |

---

## Files to Create at Build Time

```
engine/templates/registry.ts
engine/templates/_shared/watermark.sty (or inline in templates)
engine/templates/harvard/resume.tex
public/templates/thumbnails/harvard.png
```

Do not add template content to `context/` — templates are application code in `engine/templates/`.
