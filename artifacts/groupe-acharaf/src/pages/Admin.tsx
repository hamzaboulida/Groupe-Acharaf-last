import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListProjects,
  useListBrands,
  useListArticles,
  useListCareers,
  useListLeads,
  useListApplications,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  useCreateArticle,
  useUpdateArticle,
  useDeleteArticle,
  useCreateCareer,
  useUpdateCareer,
  useDeleteCareer,
  useDeleteLead,
  getListProjectsQueryKey,
  getListArticlesQueryKey,
  getListCareersQueryKey,
  getListLeadsQueryKey,
  getListApplicationsQueryKey,
} from "@workspace/api-client-react";
import { motion } from "framer-motion";

type Tab = "projects" | "leads" | "articles" | "careers" | "applications";

const NAV_ITEMS: { id: Tab; label: string }[] = [
  { id: "projects", label: "Projets" },
  { id: "leads", label: "Leads" },
  { id: "articles", label: "Articles" },
  { id: "careers", label: "Offres d'emploi" },
  { id: "applications", label: "Candidatures" },
];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("fr-MA", { year: "numeric", month: "short", day: "numeric" });
}

function Badge({ children, color = "gold" }: { children: React.ReactNode; color?: "gold" | "blue" | "green" | "red" | "gray" }) {
  const colors = {
    gold: "bg-[#c9a84c]/20 text-[#c9a84c] border border-[#c9a84c]/30",
    blue: "bg-blue-500/20 text-blue-300 border border-blue-500/30",
    green: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    red: "bg-red-500/20 text-red-300 border border-red-500/30",
    gray: "bg-white/10 text-white/60 border border-white/10",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-medium tracking-wide ${colors[color]}`}>{children}</span>
  );
}

function ConfirmButton({ onConfirm, label = "Supprimer" }: { onConfirm: () => void; label?: string }) {
  const [step, setStep] = useState(0);
  if (step === 0) {
    return (
      <button
        onClick={() => setStep(1)}
        className="text-red-400 hover:text-red-300 text-sm px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
      >
        {label}
      </button>
    );
  }
  return (
    <span className="flex gap-2">
      <button
        onClick={() => { onConfirm(); setStep(0); }}
        className="text-red-400 text-sm font-semibold"
      >
        Confirmer
      </button>
      <button onClick={() => setStep(0)} className="text-white/40 text-sm">
        Annuler
      </button>
    </span>
  );
}

// ──────────────────────────────────────────────────────────
// PROJECTS TAB
// ──────────────────────────────────────────────────────────
function ProjectsTab() {
  const qc = useQueryClient();
  const { data: projects = [] } = useListProjects();
  const { data: brands = [] } = useListBrands();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();
  const [editing, setEditing] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    brandId: 1,
    title: "",
    slug: "",
    description: "",
    location: "",
    city: "",
    status: "upcoming" as "upcoming" | "ongoing" | "completed",
    priceMin: 0,
    priceMax: 0,
    surfaceMin: 0,
    surfaceMax: 0,
    deliveryDate: "",
    featured: false,
    coverImageUrl: "",
  });

  function resetForm() {
    setForm({ brandId: 1, title: "", slug: "", description: "", location: "", city: "", status: "upcoming", priceMin: 0, priceMax: 0, surfaceMin: 0, surfaceMax: 0, deliveryDate: "", featured: false, coverImageUrl: "" });
    setEditing(null);
    setShowForm(false);
  }

  function startEdit(p: (typeof projects)[0]) {
    setForm({
      brandId: p.brandId,
      title: p.title,
      slug: p.slug,
      description: p.description ?? "",
      location: p.location ?? "",
      city: p.city ?? "",
      status: (p.status as "upcoming" | "ongoing" | "completed") ?? "upcoming",
      priceMin: p.priceMin ?? 0,
      priceMax: p.priceMax ?? 0,
      surfaceMin: p.surfaceMin ?? 0,
      surfaceMax: p.surfaceMax ?? 0,
      deliveryDate: p.deliveryDate ?? "",
      featured: p.featured,
      coverImageUrl: p.coverImageUrl ?? "",
    });
    setEditing(p.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, images: [], amenities: [] };
    if (editing !== null) {
      await updateProject.mutateAsync({ id: editing, data: payload });
    } else {
      await createProject.mutateAsync({ data: payload });
    }
    qc.invalidateQueries({ queryKey: getListProjectsQueryKey() });
    resetForm();
  }

  const statusColor = (s: string) => s === "completed" ? "green" : s === "ongoing" ? "gold" : "blue";
  const statusLabel = (s: string) => s === "completed" ? "Livré" : s === "ongoing" ? "En cours" : "À venir";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif text-white">Projets <span className="text-white/30 text-lg ml-2">({projects.length})</span></h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-[#c9a84c] text-[#0e1327] px-4 py-2 text-sm font-semibold tracking-wider hover:bg-[#b8973b] transition-colors"
        >
          + Ajouter
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-6 mb-6 space-y-4">
          <h3 className="text-white font-serif text-lg mb-4">{editing !== null ? "Modifier le projet" : "Nouveau projet"}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/50 text-xs block mb-1">Marque</label>
              <select
                value={form.brandId}
                onChange={(e) => setForm({ ...form, brandId: Number(e.target.value) })}
                className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 text-sm"
              >
                {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-white/50 text-xs block mb-1">Statut</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as "upcoming" | "ongoing" | "completed" })}
                className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 text-sm"
              >
                <option value="upcoming">À venir</option>
                <option value="ongoing">En cours</option>
                <option value="completed">Livré</option>
              </select>
            </div>
            <div>
              <label className="text-white/50 text-xs block mb-1">Titre *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-white/50 text-xs block mb-1">Slug *</label>
              <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-white/50 text-xs block mb-1">Ville</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-white/50 text-xs block mb-1">Localisation</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-white/50 text-xs block mb-1">Prix min (MAD)</label>
              <input type="number" value={form.priceMin} onChange={(e) => setForm({ ...form, priceMin: Number(e.target.value) })} className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-white/50 text-xs block mb-1">Prix max (MAD)</label>
              <input type="number" value={form.priceMax} onChange={(e) => setForm({ ...form, priceMax: Number(e.target.value) })} className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-white/50 text-xs block mb-1">Surface min (m²)</label>
              <input type="number" value={form.surfaceMin} onChange={(e) => setForm({ ...form, surfaceMin: Number(e.target.value) })} className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-white/50 text-xs block mb-1">Surface max (m²)</label>
              <input type="number" value={form.surfaceMax} onChange={(e) => setForm({ ...form, surfaceMax: Number(e.target.value) })} className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-white/50 text-xs block mb-1">Date de livraison</label>
              <input value={form.deliveryDate} onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })} className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 text-sm" placeholder="ex: T4 2025" />
            </div>
            <div>
              <label className="text-white/50 text-xs block mb-1">Image de couverture (URL)</label>
              <input value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-white/50 text-xs block mb-1">Description</label>
            <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 text-sm" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            <label htmlFor="featured" className="text-white/70 text-sm">Projet mis en avant</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="bg-[#c9a84c] text-[#0e1327] px-6 py-2 text-sm font-semibold tracking-wider">
              {editing !== null ? "Enregistrer" : "Créer"}
            </button>
            <button type="button" onClick={resetForm} className="text-white/50 text-sm px-4 py-2 border border-white/20 hover:border-white/40">
              Annuler
            </button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {projects.map((p) => (
          <div key={p.id} className="bg-white/5 border border-white/10 p-4 flex items-center justify-between hover:border-white/20 transition-colors">
            <div className="flex items-center gap-4">
              {p.coverImageUrl && <img src={p.coverImageUrl} alt="" className="w-16 h-12 object-cover opacity-70" />}
              <div>
                <div className="text-white font-medium">{p.title}</div>
                <div className="text-white/40 text-sm">{p.city} · {p.brand?.name}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge color={statusColor(p.status) as "gold" | "blue" | "green" | "red" | "gray"}>{statusLabel(p.status)}</Badge>
              {p.featured && <Badge color="gold">En vedette</Badge>}
              <div className="text-white/30 text-xs">{formatDate(p.createdAt)}</div>
              <button onClick={() => startEdit(p)} className="text-white/50 hover:text-white text-sm px-2 py-1 hover:bg-white/10 transition-colors">
                Modifier
              </button>
              <ConfirmButton onConfirm={async () => {
                await deleteProject.mutateAsync({ id: p.id });
                qc.invalidateQueries({ queryKey: getListProjectsQueryKey() });
              }} />
            </div>
          </div>
        ))}
        {projects.length === 0 && <p className="text-white/30 text-sm py-8 text-center">Aucun projet.</p>}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// LEADS TAB
// ──────────────────────────────────────────────────────────
function LeadsTab() {
  const qc = useQueryClient();
  const { data: leads = [] } = useListLeads();
  const deleteLead = useDeleteLead();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif text-white">Leads <span className="text-white/30 text-lg ml-2">({leads.length})</span></h2>
      </div>
      <div className="space-y-2">
        {leads.map((l) => (
          <div key={l.id} className="bg-white/5 border border-white/10 p-4 hover:border-white/20 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-white font-medium">{l.firstName} {l.lastName}</div>
                <div className="text-[#c9a84c] text-sm">{l.email} {l.phone && `· ${l.phone}`}</div>
                {l.projectInterest && <div className="text-white/50 text-sm mt-1">Intérêt: {l.projectInterest}</div>}
                {l.message && <div className="text-white/40 text-sm mt-2 max-w-2xl">{l.message}</div>}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-white/30 text-xs">{formatDate(l.createdAt)}</div>
                <ConfirmButton onConfirm={async () => {
                  await deleteLead.mutateAsync({ id: l.id });
                  qc.invalidateQueries({ queryKey: getListLeadsQueryKey() });
                }} />
              </div>
            </div>
          </div>
        ))}
        {leads.length === 0 && <p className="text-white/30 text-sm py-8 text-center">Aucun lead.</p>}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// ARTICLES TAB
// ──────────────────────────────────────────────────────────
function ArticlesTab() {
  const qc = useQueryClient();
  const { data: articles = [] } = useListArticles();
  const createArticle = useCreateArticle();
  const updateArticle = useUpdateArticle();
  const deleteArticle = useDeleteArticle();
  const [editing, setEditing] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", excerpt: "", content: "", coverImageUrl: "", category: "", metaTitle: "", metaDescription: "", published: false });

  function resetForm() {
    setForm({ title: "", slug: "", excerpt: "", content: "", coverImageUrl: "", category: "", metaTitle: "", metaDescription: "", published: false });
    setEditing(null);
    setShowForm(false);
  }

  function startEdit(a: (typeof articles)[0]) {
    setForm({ title: a.title, slug: a.slug, excerpt: a.excerpt ?? "", content: a.content ?? "", coverImageUrl: a.coverImageUrl ?? "", category: a.category ?? "", metaTitle: a.metaTitle ?? "", metaDescription: a.metaDescription ?? "", published: a.published });
    setEditing(a.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, tags: [], publishedAt: form.published ? new Date().toISOString() : undefined };
    if (editing !== null) {
      await updateArticle.mutateAsync({ id: editing, data: payload });
    } else {
      await createArticle.mutateAsync({ data: payload });
    }
    qc.invalidateQueries({ queryKey: getListArticlesQueryKey() });
    resetForm();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif text-white">Articles <span className="text-white/30 text-lg ml-2">({articles.length})</span></h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-[#c9a84c] text-[#0e1327] px-4 py-2 text-sm font-semibold tracking-wider hover:bg-[#b8973b] transition-colors">
          + Ajouter
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-6 mb-6 space-y-4">
          <h3 className="text-white font-serif text-lg mb-4">{editing !== null ? "Modifier l'article" : "Nouvel article"}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/50 text-xs block mb-1">Titre *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-white/50 text-xs block mb-1">Slug *</label>
              <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-white/50 text-xs block mb-1">Catégorie</label>
              <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-white/50 text-xs block mb-1">Image de couverture (URL)</label>
              <input value={form.coverImageUrl} onChange={(e) => setForm({ ...form, coverImageUrl: e.target.value })} className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-white/50 text-xs block mb-1">Meta Title (SEO)</label>
              <input value={form.metaTitle} onChange={(e) => setForm({ ...form, metaTitle: e.target.value })} className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-white/50 text-xs block mb-1">Meta Description (SEO)</label>
              <input value={form.metaDescription} onChange={(e) => setForm({ ...form, metaDescription: e.target.value })} className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-white/50 text-xs block mb-1">Extrait</label>
            <textarea rows={2} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-white/50 text-xs block mb-1">Contenu</label>
            <textarea rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 text-sm" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="published" checked={form.published} onChange={(e) => setForm({ ...form, published: e.target.checked })} />
            <label htmlFor="published" className="text-white/70 text-sm">Publié</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="bg-[#c9a84c] text-[#0e1327] px-6 py-2 text-sm font-semibold tracking-wider">{editing !== null ? "Enregistrer" : "Créer"}</button>
            <button type="button" onClick={resetForm} className="text-white/50 text-sm px-4 py-2 border border-white/20 hover:border-white/40">Annuler</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {articles.map((a) => (
          <div key={a.id} className="bg-white/5 border border-white/10 p-4 flex items-center justify-between hover:border-white/20 transition-colors">
            <div className="flex items-center gap-4">
              {a.coverImageUrl && <img src={a.coverImageUrl} alt="" className="w-16 h-12 object-cover opacity-70" />}
              <div>
                <div className="text-white font-medium">{a.title}</div>
                <div className="text-white/40 text-sm">{a.category}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge color={a.published ? "green" : "gray"}>{a.published ? "Publié" : "Brouillon"}</Badge>
              <div className="text-white/30 text-xs">{formatDate(a.createdAt)}</div>
              <button onClick={() => startEdit(a)} className="text-white/50 hover:text-white text-sm px-2 py-1 hover:bg-white/10 transition-colors">Modifier</button>
              <ConfirmButton onConfirm={async () => {
                await deleteArticle.mutateAsync({ id: a.id });
                qc.invalidateQueries({ queryKey: getListArticlesQueryKey() });
              }} />
            </div>
          </div>
        ))}
        {articles.length === 0 && <p className="text-white/30 text-sm py-8 text-center">Aucun article.</p>}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// CAREERS TAB
// ──────────────────────────────────────────────────────────
function CareersTab() {
  const qc = useQueryClient();
  const { data: careers = [] } = useListCareers();
  const createCareer = useCreateCareer();
  const updateCareer = useUpdateCareer();
  const deleteCareer = useDeleteCareer();
  const [editing, setEditing] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", department: "", location: "", type: "full-time" as "full-time" | "part-time" | "internship" | "freelance", description: "", active: true });

  function resetForm() {
    setForm({ title: "", department: "", location: "", type: "full-time", description: "", active: true });
    setEditing(null);
    setShowForm(false);
  }

  function startEdit(c: (typeof careers)[0]) {
    setForm({ title: c.title, department: c.department, location: c.location ?? "", type: (c.type as "full-time" | "part-time" | "internship" | "freelance") ?? "full-time", description: c.description ?? "", active: c.active });
    setEditing(c.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...form, requirements: [] };
    if (editing !== null) {
      await updateCareer.mutateAsync({ id: editing, data: payload });
    } else {
      await createCareer.mutateAsync({ data: payload });
    }
    qc.invalidateQueries({ queryKey: getListCareersQueryKey() });
    resetForm();
  }

  const typeLabel = (t: string) => ({ "full-time": "CDI", "part-time": "Temps partiel", internship: "Stage", freelance: "Freelance" }[t] ?? t);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif text-white">Offres d'emploi <span className="text-white/30 text-lg ml-2">({careers.length})</span></h2>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="bg-[#c9a84c] text-[#0e1327] px-4 py-2 text-sm font-semibold tracking-wider hover:bg-[#b8973b] transition-colors">
          + Ajouter
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 p-6 mb-6 space-y-4">
          <h3 className="text-white font-serif text-lg mb-4">{editing !== null ? "Modifier l'offre" : "Nouvelle offre"}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-white/50 text-xs block mb-1">Titre *</label>
              <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-white/50 text-xs block mb-1">Département *</label>
              <input required value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-white/50 text-xs block mb-1">Ville</label>
              <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-white/50 text-xs block mb-1">Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as "full-time" | "part-time" | "internship" | "freelance" })} className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 text-sm">
                <option value="full-time">CDI</option>
                <option value="part-time">Temps partiel</option>
                <option value="internship">Stage</option>
                <option value="freelance">Freelance</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-white/50 text-xs block mb-1">Description</label>
            <textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-white/10 border border-white/20 text-white px-3 py-2 text-sm" />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="active" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
            <label htmlFor="active" className="text-white/70 text-sm">Offre active</label>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" className="bg-[#c9a84c] text-[#0e1327] px-6 py-2 text-sm font-semibold tracking-wider">{editing !== null ? "Enregistrer" : "Créer"}</button>
            <button type="button" onClick={resetForm} className="text-white/50 text-sm px-4 py-2 border border-white/20 hover:border-white/40">Annuler</button>
          </div>
        </form>
      )}

      <div className="space-y-2">
        {careers.map((c) => (
          <div key={c.id} className="bg-white/5 border border-white/10 p-4 flex items-center justify-between hover:border-white/20 transition-colors">
            <div>
              <div className="text-white font-medium">{c.title}</div>
              <div className="text-white/40 text-sm">{c.department} · {c.location}</div>
            </div>
            <div className="flex items-center gap-4">
              <Badge color="blue">{typeLabel(c.type)}</Badge>
              <Badge color={c.active ? "green" : "gray"}>{c.active ? "Active" : "Inactive"}</Badge>
              <div className="text-white/30 text-xs">{formatDate(c.createdAt)}</div>
              <button onClick={() => startEdit(c)} className="text-white/50 hover:text-white text-sm px-2 py-1 hover:bg-white/10 transition-colors">Modifier</button>
              <ConfirmButton onConfirm={async () => {
                await deleteCareer.mutateAsync({ id: c.id });
                qc.invalidateQueries({ queryKey: getListCareersQueryKey() });
              }} />
            </div>
          </div>
        ))}
        {careers.length === 0 && <p className="text-white/30 text-sm py-8 text-center">Aucune offre.</p>}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// APPLICATIONS TAB
// ──────────────────────────────────────────────────────────
function ApplicationsTab() {
  const { data: applications = [] } = useListApplications();

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-serif text-white">Candidatures <span className="text-white/30 text-lg ml-2">({applications.length})</span></h2>
      </div>
      <div className="space-y-2">
        {applications.map((a) => (
          <div key={a.id} className="bg-white/5 border border-white/10 p-4 hover:border-white/20 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-white font-medium">{a.firstName} {a.lastName}</div>
                <div className="text-[#c9a84c] text-sm">{a.email} {a.phone && `· ${a.phone}`}</div>
                {a.career && <div className="text-white/50 text-sm mt-1">Poste: {a.career.title}</div>}
                {a.message && <div className="text-white/40 text-sm mt-2 max-w-2xl">{a.message}</div>}
              </div>
              <div className="text-white/30 text-xs">{formatDate(a.createdAt)}</div>
            </div>
          </div>
        ))}
        {applications.length === 0 && <p className="text-white/30 text-sm py-8 text-center">Aucune candidature.</p>}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────
// MAIN ADMIN PAGE
// ──────────────────────────────────────────────────────────
export default function Admin() {
  const [activeTab, setActiveTab] = useState<Tab>("projects");

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0e1327] border-r border-white/10 flex-shrink-0">
        <div className="p-6 border-b border-white/10">
          <div className="text-[#c9a84c] font-serif text-xl tracking-widest">GROUPE</div>
          <div className="text-white font-serif text-xl tracking-widest">ACHARAF</div>
          <div className="text-white/30 text-xs tracking-widest mt-1">BACK-OFFICE</div>
        </div>
        <nav className="p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-4 py-3 text-sm tracking-wide transition-colors ${
                activeTab === item.id
                  ? "bg-[#c9a84c]/10 text-[#c9a84c] border-l-2 border-[#c9a84c]"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
        <div className="absolute bottom-6 left-0 w-64 px-6">
          <a href="/" className="text-white/30 text-xs hover:text-white/60 transition-colors tracking-wide">
            &larr; Retour au site
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto">
        <header className="bg-[#0e1327] border-b border-white/10 px-8 py-4">
          <h1 className="text-white/60 text-sm tracking-widest uppercase">{NAV_ITEMS.find((n) => n.id === activeTab)?.label}</h1>
        </header>
        <div className="p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "projects" && <ProjectsTab />}
            {activeTab === "leads" && <LeadsTab />}
            {activeTab === "articles" && <ArticlesTab />}
            {activeTab === "careers" && <CareersTab />}
            {activeTab === "applications" && <ApplicationsTab />}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
