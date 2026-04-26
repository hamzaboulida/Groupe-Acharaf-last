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
import { X, Plus, Image as ImageIcon, Trash2, MapPin, Info, Layout as LayoutIcon, Search, Download } from "lucide-react";

type Tab = "projects" | "leads" | "articles" | "careers" | "applications";



function FileUpload({ 
  value, 
  onChange, 
  label 
}: { 
  value: string; 
  onChange: (url: string) => void; 
  label: string 
}) {
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.url) {
        onChange(data.url);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</label>
      <div className="flex items-center gap-4">
        {value && (
          <div className="relative w-20 h-20 border border-white/10 rounded overflow-hidden bg-white/5">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <button 
              type="button"
              onClick={() => onChange("")}
              className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl"
            >
              <X size={12} />
            </button>
          </div>
        )}
        <label className="cursor-pointer bg-white/5 border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors rounded">
          {uploading ? "Chargement..." : value ? "Changer" : "Choisir une image"}
          <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
        </label>
      </div>
    </div>
  );
}




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
    tagline: "",
    shortDescription: "",
    storyTitle: "",
    storyText: "",
    lifestyleTitle: "",
    lifestyleText: "",
    locationAdvantages: "" as string | string[],
    mapLocation: "",
    financingDetails: "",
    ctaText: "",
    seoTitle: "",
    seoDescription: "",
    amenities: "" as string | string[],
    images: [] as string[],
  });

  function resetForm() {
    setForm({ 
      brandId: 1, title: "", slug: "", description: "", location: "", city: "", 
      status: "upcoming", priceMin: 0, priceMax: 0, surfaceMin: 0, surfaceMax: 0, 
      deliveryDate: "", featured: false, coverImageUrl: "",
      tagline: "", shortDescription: "", storyTitle: "", storyText: "",
      lifestyleTitle: "", lifestyleText: "", locationAdvantages: "", 
      mapLocation: "", financingDetails: "", ctaText: "",
      seoTitle: "", seoDescription: "", amenities: "", images: []
    });
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
      tagline: p.tagline ?? "",
      shortDescription: p.shortDescription ?? "",
      storyTitle: p.storyTitle ?? "",
      storyText: p.storyText ?? "",
      lifestyleTitle: p.lifestyleTitle ?? "",
      lifestyleText: p.lifestyleText ?? "",
      locationAdvantages: p.locationAdvantages?.join("\n") ?? "",
      mapLocation: p.mapLocation ?? "",
      financingDetails: p.financingDetails ?? "",
      ctaText: p.ctaText ?? "",
      seoTitle: p.seoTitle ?? "",
      seoDescription: p.seoDescription ?? "",
      amenities: p.amenities?.join("\n") ?? "",
      images: p.images ?? [],
    });
    setEditing(p.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { 
      ...form, 
      amenities: typeof form.amenities === 'string' ? form.amenities.split("\n").filter(Boolean) : form.amenities,
      locationAdvantages: typeof form.locationAdvantages === 'string' ? form.locationAdvantages.split("\n").filter(Boolean) : form.locationAdvantages,
    };
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-end">
          <div className="w-full max-w-4xl h-full bg-[#0a0f1e] border-l border-white/10 shadow-2xl overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                <div>
                  <h2 className="text-2xl font-serif text-white">
                    {editing !== null ? "Modifier le projet" : "Nouveau projet"}
                  </h2>
                  <p className="text-sm text-white/40 mt-1">Configurez tous les détails du projet immobilier.</p>
                </div>
                <button onClick={resetForm} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-12 pb-24">
                {/* Section 1: Informations de base */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <LayoutIcon size={14} className="text-[#c9a84c]" />
                    <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest">Informations Générales</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Marque</label>
                      <select
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none"
                        value={form.brandId}
                        onChange={(e) => setForm({ ...form, brandId: Number(e.target.value) })}
                      >
                        {brands?.map((b) => <option key={b.id} value={b.id} className="bg-[#0a0f1e]">{b.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Titre du projet</label>
                      <input
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Ex: Les Terrasses d'Acharaf"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Slug (URL)</label>
                      <input
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        placeholder="Ex: les-terrasses-acharaf"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Accroche (Tagline)</label>
                      <input
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none"
                        value={form.tagline as string}
                        onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                        placeholder="Ex: Un panorama d'exception sur la ville"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Description Principale (Intro)</label>
                    <textarea
                      className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none h-32 resize-none"
                      value={form.description as string}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                </div>

                {/* Section 2: Médias */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <ImageIcon size={14} className="text-[#c9a84c]" />
                    <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest">Images & Album</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FileUpload 
                      label="Image de Couverture" 
                      value={form.coverImageUrl as string} 
                      onChange={(url) => setForm({ ...form, coverImageUrl: url })} 
                    />
                    
                    <div className="space-y-4">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Galerie / Album Photos</label>
                      <div className="grid grid-cols-3 gap-2">
                        {form.images.map((img, i) => (
                          <div key={i} className="relative aspect-square border border-white/10 rounded overflow-hidden group">
                            <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                            <button 
                              type="button" 
                              onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })}
                              className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        ))}
                        <label className="aspect-square border border-dashed border-white/10 rounded flex flex-col items-center justify-center cursor-pointer hover:border-[#c9a84c]/50 hover:bg-[#c9a84c]/5 transition-all text-white/20 hover:text-[#c9a84c]">
                          <Plus size={20} />
                          <span className="text-[9px] mt-1 font-bold uppercase tracking-widest">Ajouter</span>
                          <input 
                            type="file" 
                            className="hidden" 
                            multiple 
                            onChange={async (e) => {
                              const files = Array.from(e.target.files || []);
                              for (const file of files) {
                                const formData = new FormData();
                                formData.append("file", file);
                                const res = await fetch("/api/uploads", { method: "POST", body: formData });
                                const data = await res.json();
                                if (data.url) {
                                  setForm(prev => ({ ...prev, images: [...prev.images, data.url] }));
                                }
                              }
                            }} 
                          />
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Statut & Prix */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <Info size={14} className="text-[#c9a84c]" />
                    <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest">Disponibilités & Tarifs</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Statut</label>
                      <select
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none"
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                      >
                        <option value="upcoming" className="bg-[#0a0f1e]">À venir</option>
                        <option value="ongoing" className="bg-[#0a0f1e]">En cours</option>
                        <option value="completed" className="bg-[#0a0f1e]">Livré</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Prix Min (DH)</label>
                      <input
                        type="number"
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none"
                        value={form.priceMin}
                        onChange={(e) => setForm({ ...form, priceMin: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Prix Max (DH)</label>
                      <input
                        type="number"
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none"
                        value={form.priceMax}
                        onChange={(e) => setForm({ ...form, priceMax: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Surface Min (m²)</label>
                      <input
                        type="number"
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none"
                        value={form.surfaceMin}
                        onChange={(e) => setForm({ ...form, surfaceMin: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Surface Max (m²)</label>
                      <input
                        type="number"
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none"
                        value={form.surfaceMax}
                        onChange={(e) => setForm({ ...form, surfaceMax: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Date de livraison</label>
                      <input
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none"
                        value={form.deliveryDate as string}
                        onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
                        placeholder="Ex: Fin 2025"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 bg-white/5 p-4 rounded-lg border border-white/5">
                    <input
                      type="checkbox"
                      id="featured"
                      className="w-4 h-4 text-[#c9a84c] bg-white/10 border-white/20 rounded focus:ring-[#c9a84c]"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    />
                    <label htmlFor="featured" className="text-sm font-medium text-white/70 select-none cursor-pointer">
                      Mettre en avant sur la page d'accueil
                    </label>
                  </div>
                </div>

                {/* Section 4: Story & Lifestyle */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <Search size={14} className="text-[#c9a84c]" />
                    <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest">Story & Lifestyle</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Section "Le Projet" (Détaillé)</h4>
                      <input
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none"
                        placeholder="Titre (défaut: Le Projet)"
                        value={form.storyTitle as string}
                        onChange={(e) => setForm({ ...form, storyTitle: e.target.value })}
                      />
                      <textarea
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none h-32 resize-none"
                        placeholder="Texte détaillé de la section story"
                        value={form.storyText as string}
                        onChange={(e) => setForm({ ...form, storyText: e.target.value })}
                      />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Section "Art de Vivre"</h4>
                      <input
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none"
                        placeholder="Titre (défaut: Art de vivre)"
                        value={form.lifestyleTitle as string}
                        onChange={(e) => setForm({ ...form, lifestyleTitle: e.target.value })}
                      />
                      <textarea
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none h-32 resize-none"
                        placeholder="Texte de la section lifestyle"
                        value={form.lifestyleText as string}
                        onChange={(e) => setForm({ ...form, lifestyleText: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 5: Localisation & Prestations */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <MapPin size={14} className="text-[#c9a84c]" />
                    <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest">Localisation & Prestations</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Localisation</h4>
                      <input
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none"
                        placeholder="Ville"
                        value={form.city as string}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                      />
                      <input
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none"
                        placeholder="Quartier / Adresse"
                        value={form.location as string}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                      />
                      <textarea
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none h-24 resize-none"
                        placeholder="Points forts de l'emplacement (un par ligne)"
                        value={form.locationAdvantages as string}
                        onChange={(e) => setForm({ ...form, locationAdvantages: e.target.value })}
                      />
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Prestations & CTA</h4>
                      <textarea
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none h-24 resize-none"
                        placeholder="Prestations (Points forts du projet, un par ligne)"
                        value={form.amenities as string}
                        onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                      />
                      <input
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none"
                        placeholder="Note financement (ex: Financement à 100% possible)"
                        value={form.financingDetails as string}
                        onChange={(e) => setForm({ ...form, financingDetails: e.target.value })}
                      />
                      <input
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none"
                        placeholder="Texte du bouton CTA (défaut: Prendre rendez-vous)"
                        value={form.ctaText as string}
                        onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 6: SEO */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                    <Search size={14} className="text-[#c9a84c]" />
                    <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest">Optimisation SEO</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Méta Titre</label>
                      <input
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none"
                        value={form.seoTitle as string}
                        onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                        placeholder="Titre pour Google"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Méta Description</label>
                      <textarea
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none h-24 resize-none"
                        value={form.seoDescription as string}
                        onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                        placeholder="Description pour les résultats de recherche"
                      />
                    </div>
                  </div>
                </div>
              </form>

              <div className="fixed bottom-0 right-0 w-full max-w-4xl bg-[#0a0f1e] border-t border-white/10 p-6 flex items-center justify-end gap-4 z-10">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 text-sm font-medium text-white/50 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={createProject.isPending || updateProject.isPending}
                  className="bg-[#c9a84c] text-[#0e1327] px-10 py-2.5 rounded text-sm font-bold uppercase tracking-widest hover:bg-[#b8973b] transition-all disabled:opacity-50"
                >
                  {createProject.isPending || updateProject.isPending ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </div>
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
  const [form, setForm] = useState({ 
    title: "", 
    slug: "", 
    excerpt: "", 
    content: "", 
    coverImageUrl: "", 
    category: "", 
    metaTitle: "", 
    metaDescription: "", 
    published: false 
  });

  function resetForm() {
    setForm({ title: "", slug: "", excerpt: "", content: "", coverImageUrl: "", category: "", metaTitle: "", metaDescription: "", published: false });
    setEditing(null);
    setShowForm(false);
  }

  function startEdit(a: (typeof articles)[0]) {
    setForm({ 
      title: a.title, 
      slug: a.slug, 
      excerpt: a.excerpt ?? "", 
      content: a.content ?? "", 
      coverImageUrl: a.coverImageUrl ?? "", 
      category: a.category ?? "", 
      metaTitle: a.metaTitle ?? "", 
      metaDescription: a.metaDescription ?? "", 
      published: a.published 
    });
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
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-[#c9a84c] text-[#0e1327] px-4 py-2 text-sm font-semibold tracking-wider hover:bg-[#b8973b] transition-colors"
        >
          + Ajouter
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-end">
          <div className="w-full max-w-3xl h-full bg-[#0a0f1e] border-l border-white/10 shadow-2xl overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                <div>
                  <h2 className="text-2xl font-serif text-white">
                    {editing !== null ? "Modifier l'article" : "Nouvel article"}
                  </h2>
                  <p className="text-sm text-white/40 mt-1">Publiez des actualités ou des articles de blog.</p>
                </div>
                <button onClick={resetForm} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10 pb-24">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Titre *</label>
                      <input
                        required
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Ex: Lancement de la résidence Estya"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Slug *</label>
                      <input
                        required
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        placeholder="ex-article-titre"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Catégorie</label>
                      <input
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        placeholder="Actualités, Prestige, etc."
                      />
                    </div>
                  </div>

                  <FileUpload 
                    label="Image de Couverture" 
                    value={form.coverImageUrl} 
                    onChange={(url) => setForm({ ...form, coverImageUrl: url })} 
                  />

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Extrait (Résumé)</label>
                    <textarea
                      className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none h-20 resize-none"
                      value={form.excerpt}
                      onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Contenu complet</label>
                    <textarea
                      className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none h-64 resize-none"
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 p-4 rounded-lg border border-white/5">
                    <input
                      type="checkbox"
                      id="published"
                      className="w-4 h-4 text-[#c9a84c] bg-white/10 border-white/20 rounded focus:ring-[#c9a84c]"
                      checked={form.published}
                      onChange={(e) => setForm({ ...form, published: e.target.checked })}
                    />
                    <label htmlFor="published" className="text-sm font-medium text-white/70 select-none cursor-pointer">
                      Publier l'article immédiatement
                    </label>
                  </div>
                </div>

                {/* SEO */}
                <div className="space-y-6 pt-6 border-t border-white/5">
                  <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest flex items-center gap-2">
                    <Search size={14} className="text-[#c9a84c]" />
                    Optimisation SEO
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Méta Titre</label>
                      <input
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none"
                        value={form.metaTitle}
                        onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Méta Description</label>
                      <textarea
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none h-24 resize-none"
                        value={form.metaDescription}
                        onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </form>

              <div className="fixed bottom-0 right-0 w-full max-w-3xl bg-[#0a0f1e] border-t border-white/10 p-6 flex items-center justify-end gap-4 z-10">
                <button type="button" onClick={resetForm} className="px-6 py-2.5 text-sm font-medium text-white/50 hover:text-white transition-colors">Annuler</button>
                <button
                  onClick={handleSubmit}
                  disabled={createArticle.isPending || updateArticle.isPending}
                  className="bg-[#c9a84c] text-[#0e1327] px-10 py-2.5 rounded text-sm font-bold uppercase tracking-widest hover:bg-[#b8973b] transition-all disabled:opacity-50"
                >
                  {createArticle.isPending || updateArticle.isPending ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </div>
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
  const [form, setForm] = useState({ 
    title: "", 
    slug: "",
    department: "", 
    location: "", 
    type: "full-time" as "full-time" | "part-time" | "internship" | "freelance", 
    description: "", 
    coverImageUrl: "",
    metaTitle: "",
    metaDescription: "",
    active: true 
  });

  function resetForm() {
    setForm({ 
      title: "", slug: "", department: "", location: "", type: "full-time", 
      description: "", coverImageUrl: "", metaTitle: "", metaDescription: "", active: true 
    });
    setEditing(null);
    setShowForm(false);
  }

  function startEdit(c: (typeof careers)[0]) {
    setForm({ 
      title: c.title, 
      slug: c.slug,
      department: c.department, 
      location: c.location ?? "", 
      type: (c.type as "full-time" | "part-time" | "internship" | "freelance") ?? "full-time", 
      description: c.description ?? "", 
      coverImageUrl: c.coverImageUrl ?? "",
      metaTitle: c.metaTitle ?? "",
      metaDescription: c.metaDescription ?? "",
      active: c.active 
    });
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
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-[#c9a84c] text-[#0e1327] px-4 py-2 text-sm font-semibold tracking-wider hover:bg-[#b8973b] transition-colors"
        >
          + Ajouter
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-end">
          <div className="w-full max-w-3xl h-full bg-[#0a0f1e] border-l border-white/10 shadow-2xl overflow-y-auto">
            <div className="p-8">
              <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                <div>
                  <h2 className="text-2xl font-serif text-white">
                    {editing !== null ? "Modifier l'offre" : "Nouvelle offre"}
                  </h2>
                  <p className="text-sm text-white/40 mt-1">Gérez les opportunités de carrière au sein du groupe.</p>
                </div>
                <button onClick={resetForm} className="p-2 hover:bg-white/5 rounded-full transition-colors text-white/40 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-10 pb-24">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Titre du poste *</label>
                      <input
                        required
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Ex: Architecte d'intérieur Senior"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Slug (URL) *</label>
                      <input
                        required
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        placeholder="architecte-interieur-senior"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Département *</label>
                      <input
                        required
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none"
                        value={form.department}
                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                        placeholder="Ex: Design & Architecture"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Ville</label>
                      <input
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        placeholder="Ex: Casablanca"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Type de contrat</label>
                      <select
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none"
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                      >
                        <option value="full-time" className="bg-[#0a0f1e]">CDI</option>
                        <option value="part-time" className="bg-[#0a0f1e]">Temps partiel</option>
                        <option value="internship" className="bg-[#0a0f1e]">Stage</option>
                        <option value="freelance" className="bg-[#0a0f1e]">Freelance</option>
                      </select>
                    </div>
                  </div>

                  <FileUpload 
                    label="Image d'en-tête (Optionnel)" 
                    value={form.coverImageUrl} 
                    onChange={(url) => setForm({ ...form, coverImageUrl: url })} 
                  />

                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Description du poste</label>
                    <textarea
                      className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none h-64 resize-none"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center gap-3 bg-white/5 p-4 rounded-lg border border-white/5">
                    <input
                      type="checkbox"
                      id="active"
                      className="w-4 h-4 text-[#c9a84c] bg-white/10 border-white/20 rounded focus:ring-[#c9a84c]"
                      checked={form.active}
                      onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    />
                    <label htmlFor="active" className="text-sm font-medium text-white/70 select-none cursor-pointer">
                      Offre active (visible sur le site)
                    </label>
                  </div>
                </div>

                {/* SEO */}
                <div className="space-y-6 pt-6 border-t border-white/5">
                  <h3 className="text-xs font-bold text-white/80 uppercase tracking-widest flex items-center gap-2">
                    <Search size={14} className="text-[#c9a84c]" />
                    Optimisation SEO
                  </h3>
                  <div className="grid grid-cols-1 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Méta Titre</label>
                      <input
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none"
                        value={form.metaTitle}
                        onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-white/40 uppercase tracking-widest">Méta Description</label>
                      <textarea
                        className="w-full bg-white/5 border border-white/10 text-white px-4 py-2.5 rounded text-sm focus:border-[#c9a84c]/50 transition-all outline-none h-24 resize-none"
                        value={form.metaDescription}
                        onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </form>

              <div className="fixed bottom-0 right-0 w-full max-w-3xl bg-[#0a0f1e] border-t border-white/10 p-6 flex items-center justify-end gap-4 z-10">
                <button type="button" onClick={resetForm} className="px-6 py-2.5 text-sm font-medium text-white/50 hover:text-white transition-colors">Annuler</button>
                <button
                  onClick={handleSubmit}
                  disabled={createCareer.isPending || updateCareer.isPending}
                  className="bg-[#c9a84c] text-[#0e1327] px-10 py-2.5 rounded text-sm font-bold uppercase tracking-widest hover:bg-[#b8973b] transition-all disabled:opacity-50"
                >
                  {createCareer.isPending || updateCareer.isPending ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>
        </div>
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
                {a.cvUrl && (
                  <div className="mt-4">
                    <a 
                      href={a.cvUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded text-xs text-white/70 hover:bg-white/10 hover:text-white transition-all"
                    >
                      <Download size={14} className="text-[#c9a84c]" />
                      Voir le CV (PDF)
                    </a>
                  </div>
                )}
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
