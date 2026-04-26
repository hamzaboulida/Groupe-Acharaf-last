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
import { X, Plus, Image as ImageIcon, Trash2, MapPin, Info, Layout as LayoutIcon, Search, Download, Briefcase } from "lucide-react";

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
      <label className="block text-[10px] font-medium text-[#8EA4AF] uppercase tracking-[0.2em]">{label}</label>
      <div className="flex items-center gap-4">
        {value && (
          <div className="relative w-24 h-24 border border-white/10 overflow-hidden bg-white/5">
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
            <button 
              type="button"
              onClick={() => onChange("")}
              className="absolute top-0 right-0 bg-[#082634] text-[#D8C7A3] p-1.5 hover:bg-[#D8C7A3] hover:text-[#082634] transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )}
        <label className="cursor-pointer bg-white/5 border border-white/10 px-5 py-3 text-[10px] uppercase tracking-[0.15em] text-[#D8C7A3] hover:bg-[#D8C7A3] hover:text-[#082634] transition-all">
          {uploading ? "Chargement..." : value ? "Changer" : "Choisir une image"}
          <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
        </label>
      </div>
    </div>
  );
}




const BRAND_DEEP = "#082634";
const BRAND_GOLD = "#D8C7A3";
const BRAND_MEDIUM = "#8EA4AF";
const BRAND_LIGHT = "#DCE0E7";

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
    gold: "bg-[#D8C7A3]/10 text-[#D8C7A3] border border-[#D8C7A3]/20",
    blue: "bg-[#8EA4AF]/10 text-[#8EA4AF] border border-[#8EA4AF]/20",
    green: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    red: "bg-red-500/10 text-red-400 border border-red-500/20",
    gray: "bg-white/5 text-white/40 border border-white/10",
  };
  return (
    <span className={`px-2.5 py-1 text-[10px] font-medium tracking-[0.15em] uppercase ${colors[color]}`}>{children}</span>
  );
}

function ConfirmButton({ onConfirm, label = "Supprimer" }: { onConfirm: () => void; label?: string }) {
  const [step, setStep] = useState(0);
  if (step === 0) {
    return (
      <button
        onClick={() => setStep(1)}
        className="text-white/40 hover:text-red-400 text-[10px] uppercase tracking-widest transition-colors px-2 py-1"
      >
        {label}
      </button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onConfirm}
        className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] uppercase tracking-widest px-3 py-1 hover:bg-red-500 hover:text-white transition-all"
      >
        Confirmer
      </button>
      <button
        onClick={() => setStep(0)}
        className="text-white/40 hover:text-white text-[10px] uppercase tracking-widest px-2"
      >
        Annuler
      </button>
    </div>
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
        <div className="fixed inset-0 bg-[#082634]/40 backdrop-blur-md z-[60] flex items-center justify-end">
          <div className="w-full max-w-4xl h-full bg-white shadow-2xl overflow-y-auto">
            <div className="p-12">
              <div className="flex items-center justify-between mb-12 border-b border-[#DCE0E7] pb-8">
                <div>
                  <p className="text-[#8EA4AF] text-[10px] uppercase tracking-[0.2em] mb-2 font-medium">Edition Catalogue</p>
                  <h2 className="text-3xl font-serif text-[#082634] font-light">
                    {editing !== null ? "Modifier le projet" : "Nouveau projet immobilier"}
                  </h2>
                </div>
                <button 
                  onClick={resetForm} 
                  className="p-3 hover:bg-[#F8F9FA] transition-colors text-[#8EA4AF] hover:text-[#082634]"
                >
                  <X size={24} strokeWidth={1.5} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-16 pb-32">
                {/* Section 1: Informations de base */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3 border-b border-[#DCE0E7] pb-3">
                    <LayoutIcon size={16} className="text-[#D8C7A3]" />
                    <h3 className="text-[10px] font-bold text-[#082634] uppercase tracking-[0.2em]">Informations Générales</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Marque</label>
                      <select
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none appearance-none"
                        value={form.brandId}
                        onChange={(e) => setForm({ ...form, brandId: Number(e.target.value) })}
                      >
                        {brands?.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Titre du projet</label>
                      <input
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none placeholder:text-[#8EA4AF]/50"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Ex: Les Terrasses d'Acharaf"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Slug (URL)</label>
                      <input
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none placeholder:text-[#8EA4AF]/50"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        placeholder="Ex: les-terrasses-acharaf"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Accroche (Tagline)</label>
                      <input
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none placeholder:text-[#8EA4AF]/50"
                        value={form.tagline as string}
                        onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                        placeholder="Ex: Un panorama d'exception sur la ville"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Description Principale (Intro)</label>
                    <textarea
                      className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none h-32 resize-none placeholder:text-[#8EA4AF]/50"
                      value={form.description as string}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>
                </div>

                {/* Section 2: Médias */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3 border-b border-[#DCE0E7] pb-3">
                    <ImageIcon size={16} className="text-[#D8C7A3]" />
                    <h3 className="text-[10px] font-bold text-[#082634] uppercase tracking-[0.2em]">Images & Album</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <FileUpload 
                      label="Image de Couverture" 
                      value={form.coverImageUrl as string} 
                      onChange={(url) => setForm({ ...form, coverImageUrl: url })} 
                    />
                    
                    <div className="space-y-4">
                      <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Galerie / Album Photos</label>
                      <div className="grid grid-cols-3 gap-3">
                        {form.images.map((img, i) => (
                          <div key={i} className="relative aspect-square border border-[#DCE0E7] overflow-hidden group bg-[#F8F9FA]">
                            <img src={img} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-700" />
                            <button 
                              type="button" 
                              onClick={() => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) })}
                              className="absolute top-0 right-0 bg-[#082634] text-[#D8C7A3] p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        ))}
                        <label className="aspect-square border border-dashed border-[#DCE0E7] flex flex-col items-center justify-center cursor-pointer hover:border-[#D8C7A3] hover:bg-[#F8F9FA] transition-all text-[#8EA4AF]">
                          <Plus size={24} strokeWidth={1.5} />
                          <span className="text-[9px] mt-2 font-bold uppercase tracking-widest">Ajouter</span>
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
                <div className="space-y-8">
                  <div className="flex items-center gap-3 border-b border-[#DCE0E7] pb-3">
                    <Info size={16} className="text-[#D8C7A3]" />
                    <h3 className="text-[10px] font-bold text-[#082634] uppercase tracking-[0.2em]">Disponibilités & Tarifs</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Statut</label>
                      <select
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none appearance-none"
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                      >
                        <option value="upcoming">À venir</option>
                        <option value="ongoing">En cours</option>
                        <option value="completed">Livré</option>
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Prix Min (DH)</label>
                      <input
                        type="number"
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none"
                        value={form.priceMin}
                        onChange={(e) => setForm({ ...form, priceMin: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Prix Max (DH)</label>
                      <input
                        type="number"
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none"
                        value={form.priceMax}
                        onChange={(e) => setForm({ ...form, priceMax: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Surface Min (m²)</label>
                      <input
                        type="number"
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none"
                        value={form.surfaceMin}
                        onChange={(e) => setForm({ ...form, surfaceMin: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Surface Max (m²)</label>
                      <input
                        type="number"
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none"
                        value={form.surfaceMax}
                        onChange={(e) => setForm({ ...form, surfaceMax: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Date de livraison</label>
                      <input
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none"
                        value={form.deliveryDate as string}
                        onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
                        placeholder="Ex: Fin 2025"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 bg-[#F8F9FA] p-6 border border-[#DCE0E7]">
                    <input
                      type="checkbox"
                      id="featured"
                      className="w-5 h-5 text-[#082634] border-[#DCE0E7] focus:ring-[#D8C7A3] cursor-pointer"
                      checked={form.featured}
                      onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    />
                    <label htmlFor="featured" className="text-xs font-bold text-[#082634] uppercase tracking-widest select-none cursor-pointer">
                      Mettre en avant sur la page d'accueil
                    </label>
                  </div>
                </div>

                {/* Section 4: Story & Lifestyle */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3 border-b border-[#DCE0E7] pb-3">
                    <Search size={16} className="text-[#D8C7A3]" />
                    <h3 className="text-[10px] font-bold text-[#082634] uppercase tracking-[0.2em]">Story & Lifestyle</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-5">
                      <h4 className="text-[10px] font-bold text-[#8EA4AF] uppercase tracking-widest border-l-2 border-[#D8C7A3] pl-3">Section "Le Projet"</h4>
                      <input
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none placeholder:text-[#8EA4AF]/50"
                        placeholder="Titre (défaut: Le Projet)"
                        value={form.storyTitle as string}
                        onChange={(e) => setForm({ ...form, storyTitle: e.target.value })}
                      />
                      <textarea
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none h-40 resize-none placeholder:text-[#8EA4AF]/50"
                        placeholder="Texte détaillé de la section story"
                        value={form.storyText as string}
                        onChange={(e) => setForm({ ...form, storyText: e.target.value })}
                      />
                    </div>
                    <div className="space-y-5">
                      <h4 className="text-[10px] font-bold text-[#8EA4AF] uppercase tracking-widest border-l-2 border-[#D8C7A3] pl-3">Section "Art de Vivre"</h4>
                      <input
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none placeholder:text-[#8EA4AF]/50"
                        placeholder="Titre (défaut: Art de vivre)"
                        value={form.lifestyleTitle as string}
                        onChange={(e) => setForm({ ...form, lifestyleTitle: e.target.value })}
                      />
                      <textarea
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none h-40 resize-none placeholder:text-[#8EA4AF]/50"
                        placeholder="Texte de la section lifestyle"
                        value={form.lifestyleText as string}
                        onChange={(e) => setForm({ ...form, lifestyleText: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 5: Localisation & Prestations */}
                <div className="space-y-8">
                  <div className="flex items-center gap-3 border-b border-[#DCE0E7] pb-3">
                    <MapPin size={16} className="text-[#D8C7A3]" />
                    <h3 className="text-[10px] font-bold text-[#082634] uppercase tracking-[0.2em]">Localisation & Prestations</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-5">
                      <h4 className="text-[10px] font-bold text-[#8EA4AF] uppercase tracking-widest border-l-2 border-[#D8C7A3] pl-3">Localisation</h4>
                      <input
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none placeholder:text-[#8EA4AF]/50"
                        placeholder="Ville"
                        value={form.city as string}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                      />
                      <input
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none placeholder:text-[#8EA4AF]/50"
                        placeholder="Quartier / Adresse"
                        value={form.location as string}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                      />
                      <textarea
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none h-32 resize-none placeholder:text-[#8EA4AF]/50"
                        placeholder="Points forts de l'emplacement (un par ligne)"
                        value={form.locationAdvantages as string}
                        onChange={(e) => setForm({ ...form, locationAdvantages: e.target.value })}
                      />
                    </div>
                    <div className="space-y-5">
                      <h4 className="text-[10px] font-bold text-[#8EA4AF] uppercase tracking-widest border-l-2 border-[#D8C7A3] pl-3">Prestations & CTA</h4>
                      <textarea
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none h-32 resize-none placeholder:text-[#8EA4AF]/50"
                        placeholder="Prestations (Points forts du projet, un par ligne)"
                        value={form.amenities as string}
                        onChange={(e) => setForm({ ...form, amenities: e.target.value })}
                      />
                      <input
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none placeholder:text-[#8EA4AF]/50"
                        placeholder="Note financement (ex: Financement à 100% possible)"
                        value={form.financingDetails as string}
                        onChange={(e) => setForm({ ...form, financingDetails: e.target.value })}
                      />
                      <input
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none placeholder:text-[#8EA4AF]/50"
                        placeholder="Texte du bouton CTA (défaut: Prendre rendez-vous)"
                        value={form.ctaText as string}
                        onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* Section 6: SEO */}
                <div className="space-y-8 pb-12">
                  <div className="flex items-center gap-3 border-b border-[#DCE0E7] pb-3">
                    <Search size={16} className="text-[#D8C7A3]" />
                    <h3 className="text-[10px] font-bold text-[#082634] uppercase tracking-[0.2em]">Optimisation SEO</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Méta Titre</label>
                      <input
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none placeholder:text-[#8EA4AF]/50"
                        value={form.seoTitle as string}
                        onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                        placeholder="Titre pour Google"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Méta Description</label>
                      <textarea
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none h-32 resize-none placeholder:text-[#8EA4AF]/50"
                        value={form.seoDescription as string}
                        onChange={(e) => setForm({ ...form, seoDescription: e.target.value })}
                        placeholder="Description pour les résultats de recherche"
                      />
                    </div>
                  </div>
                </div>
              </form>

              <div className="fixed bottom-0 right-0 w-full max-w-4xl bg-white border-t border-[#DCE0E7] p-8 flex items-center justify-end gap-6 z-[70] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-[#8EA4AF] text-[10px] font-bold uppercase tracking-[0.2em] hover:text-[#082634] transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={createProject.isPending || updateProject.isPending}
                  className="bg-[#082634] text-[#D8C7A3] px-12 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#0a3245] transition-all disabled:opacity-50 shadow-xl shadow-[#082634]/10"
                >
                  {createProject.isPending || updateProject.isPending ? "Enregistrement..." : "Enregistrer le projet"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projects Tab Re-design */}
      {(() => {
        const statusColor = (s: string) => s === "completed" ? "green" : s === "ongoing" ? "gold" : "blue";
        const statusLabel = (s: string) => s === "completed" ? "Livré" : s === "ongoing" ? "En cours" : "À venir";

        return (
          <div className="space-y-10">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-serif text-[#082634] tracking-tight">Liste des Projets</h2>
                <p className="text-[#8EA4AF] text-[10px] uppercase tracking-[0.2em] mt-1">Gérez votre catalogue immobilier</p>
              </div>
              <button
                onClick={() => { resetForm(); setShowForm(true); }}
                className="bg-[#082634] text-[#D8C7A3] px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#0a3245] transition-all flex items-center gap-2 shadow-lg shadow-[#082634]/10"
              >
                <Plus size={14} />
                Ajouter un Projet
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {projects.map((p) => (
                <div 
                  key={p.id} 
                  className="group bg-white border border-[#DCE0E7] p-6 flex items-center justify-between hover:border-[#D8C7A3] hover:shadow-xl hover:shadow-[#082634]/5 transition-all duration-500"
                >
                  <div className="flex items-center gap-8">
                    <div className="relative w-24 h-24 overflow-hidden bg-[#F8F9FA]">
                      {p.coverImageUrl ? (
                        <img src={p.coverImageUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#8EA4AF]/30">
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <Badge color={statusColor(p.status) as any}>{statusLabel(p.status)}</Badge>
                        {p.featured && <Badge color="gold">Vedette</Badge>}
                      </div>
                      <h3 className="text-[#082634] font-serif text-xl font-light">{p.title}</h3>
                      <div className="text-[#8EA4AF] text-[10px] uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
                        <MapPin size={10} className="text-[#D8C7A3]" />
                        {p.city} <span className="opacity-30">|</span> {p.brand?.name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right hidden md:block">
                      <div className="text-[#8EA4AF] text-[10px] uppercase tracking-widest mb-1 opacity-60">Créé le</div>
                      <div className="text-[#082634] text-xs font-medium">{formatDate(p.createdAt)}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => startEdit(p)} 
                        className="bg-[#F8F9FA] text-[#082634] px-5 py-2.5 text-[10px] uppercase tracking-widest font-bold hover:bg-[#082634] hover:text-white transition-all"
                      >
                        Modifier
                      </button>
                      <ConfirmButton onConfirm={async () => {
                        await deleteProject.mutateAsync({ id: p.id });
                        qc.invalidateQueries({ queryKey: getListProjectsQueryKey() });
                      }} />
                    </div>
                  </div>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="py-20 text-center border-2 border-dashed border-[#DCE0E7] bg-white">
                  <p className="text-[#8EA4AF] text-sm font-light">Aucun projet trouvé dans votre catalogue.</p>
                </div>
              )}
            </div>
          </div>
        );
      })()}
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
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-serif text-[#082634] tracking-tight">Gestion des Leads</h2>
        <p className="text-[#8EA4AF] text-[10px] uppercase tracking-[0.2em] mt-1">Suivez les demandes de renseignements</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {leads.map((l) => (
          <div key={l.id} className="bg-white border border-[#DCE0E7] p-8 hover:border-[#D8C7A3] hover:shadow-xl transition-all duration-500">
            <div className="flex items-start justify-between">
              <div className="space-y-4">
                <div>
                  <div className="text-[#082634] font-serif text-2xl font-light">{l.firstName} {l.lastName}</div>
                  <div className="text-[#D8C7A3] text-[10px] uppercase tracking-[0.2em] font-bold mt-1">
                    {l.email} {l.phone && <span className="mx-2 opacity-30">·</span>} {l.phone}
                  </div>
                </div>
                
                {l.projectInterest && (
                  <div className="inline-flex items-center gap-2 bg-[#F8F9FA] px-3 py-1.5 border border-[#DCE0E7]">
                    <span className="text-[#8EA4AF] text-[9px] uppercase tracking-widest font-bold">Intérêt:</span>
                    <span className="text-[#082634] text-xs font-medium">{l.projectInterest}</span>
                  </div>
                )}
                
                {l.message && (
                  <div className="text-[#3B5661] text-sm font-light leading-relaxed max-w-3xl italic">
                    "{l.message}"
                  </div>
                )}
              </div>
              
              <div className="flex flex-col items-end gap-6">
                <div className="text-right">
                  <div className="text-[#8EA4AF] text-[10px] uppercase tracking-widest mb-1 opacity-60">Reçu le</div>
                  <div className="text-[#082634] text-xs font-medium">{formatDate(l.createdAt)}</div>
                </div>
                <ConfirmButton 
                  label="Supprimer le lead"
                  onConfirm={async () => {
                    await deleteLead.mutateAsync({ id: l.id });
                    qc.invalidateQueries({ queryKey: getListLeadsQueryKey() });
                  }} 
                />
              </div>
            </div>
          </div>
        ))}
        {leads.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-[#DCE0E7] bg-white">
            <p className="text-[#8EA4AF] text-sm font-light">Aucun lead n'a été enregistré pour le moment.</p>
          </div>
        )}
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
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif text-[#082634] tracking-tight">Articles & Actualités</h2>
          <p className="text-[#8EA4AF] text-[10px] uppercase tracking-[0.2em] mt-1">Gérez le blog et les publications</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-[#082634] text-[#D8C7A3] px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#0a3245] transition-all flex items-center gap-2 shadow-lg shadow-[#082634]/10"
        >
          <Plus size={14} />
          Nouvel Article
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-[#082634]/40 backdrop-blur-md z-[60] flex items-center justify-end">
          <div className="w-full max-w-4xl h-full bg-white shadow-2xl overflow-y-auto">
            <div className="p-12">
              <div className="flex items-center justify-between mb-12 border-b border-[#DCE0E7] pb-8">
                <div>
                  <p className="text-[#8EA4AF] text-[10px] uppercase tracking-[0.2em] mb-2 font-medium">Contenu Éditorial</p>
                  <h2 className="text-3xl font-serif text-[#082634] font-light">
                    {editing !== null ? "Modifier l'article" : "Rédiger un nouvel article"}
                  </h2>
                </div>
                <button 
                  onClick={resetForm} 
                  className="p-3 hover:bg-[#F8F9FA] transition-colors text-[#8EA4AF] hover:text-[#082634]"
                >
                  <X size={24} strokeWidth={1.5} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-16 pb-32">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Titre de l'article</label>
                      <input
                        required
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Ex: L'avenir de l'immobilier de luxe à Casablanca"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Slug (URL)</label>
                      <input
                        required
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        placeholder="avenir-immobilier-luxe-casablanca"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Catégorie</label>
                      <input
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none"
                        value={form.category}
                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                        placeholder="Ex: Actualités, Lifestyle..."
                      />
                    </div>
                  </div>

                  <FileUpload 
                    label="Image de Couverture" 
                    value={form.coverImageUrl} 
                    onChange={(url) => setForm({ ...form, coverImageUrl: url })} 
                  />

                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Résumé (Extrait)</label>
                    <textarea
                      className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none h-24 resize-none"
                      value={form.excerpt}
                      onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Contenu de l'article</label>
                    <textarea
                      className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none h-[400px] resize-none"
                      value={form.content}
                      onChange={(e) => setForm({ ...form, content: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center gap-4 bg-[#F8F9FA] p-6 border border-[#DCE0E7]">
                    <input
                      type="checkbox"
                      id="published"
                      className="w-5 h-5 text-[#082634] border-[#DCE0E7] focus:ring-[#D8C7A3] cursor-pointer"
                      checked={form.published}
                      onChange={(e) => setForm({ ...form, published: e.target.checked })}
                    />
                    <label htmlFor="published" className="text-xs font-bold text-[#082634] uppercase tracking-widest select-none cursor-pointer">
                      Publier l'article immédiatement
                    </label>
                  </div>
                </div>

                {/* SEO */}
                <div className="space-y-8 pb-12">
                  <div className="flex items-center gap-3 border-b border-[#DCE0E7] pb-3">
                    <Search size={16} className="text-[#D8C7A3]" />
                    <h3 className="text-[10px] font-bold text-[#082634] uppercase tracking-[0.2em]">Optimisation SEO</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Méta Titre</label>
                      <input
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none"
                        value={form.metaTitle}
                        onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Méta Description</label>
                      <textarea
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none h-32 resize-none"
                        value={form.metaDescription}
                        onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </form>

              <div className="fixed bottom-0 right-0 w-full max-w-4xl bg-white border-t border-[#DCE0E7] p-8 flex items-center justify-end gap-6 z-[70] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <button type="button" onClick={resetForm} className="text-[#8EA4AF] text-[10px] font-bold uppercase tracking-[0.2em] hover:text-[#082634] transition-colors">Annuler</button>
                <button
                  onClick={handleSubmit}
                  disabled={createArticle.isPending || updateArticle.isPending}
                  className="bg-[#082634] text-[#D8C7A3] px-12 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#0a3245] transition-all disabled:opacity-50 shadow-xl shadow-[#082634]/10"
                >
                  {createArticle.isPending || updateArticle.isPending ? "Enregistrement..." : "Enregistrer l'article"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {articles.map((a) => (
          <div key={a.id} className="group bg-white border border-[#DCE0E7] p-6 flex items-center justify-between hover:border-[#D8C7A3] hover:shadow-xl transition-all duration-500">
            <div className="flex items-center gap-8">
              <div className="relative w-32 h-20 overflow-hidden bg-[#F8F9FA]">
                {a.coverImageUrl ? (
                  <img src={a.coverImageUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#8EA4AF]/30">
                    <ImageIcon size={20} />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Badge color={a.published ? "green" : "gray"}>{a.published ? "Publié" : "Brouillon"}</Badge>
                  {a.category && <Badge color="blue">{a.category}</Badge>}
                </div>
                <h3 className="text-[#082634] font-serif text-lg font-light">{a.title}</h3>
                <div className="text-[#8EA4AF] text-[10px] uppercase tracking-[0.2em] mt-1">
                  Par l'équipe Acharaf <span className="mx-2 opacity-30">·</span> {formatDate(a.createdAt)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => startEdit(a)} className="bg-[#F8F9FA] text-[#082634] px-5 py-2.5 text-[10px] uppercase tracking-widest font-bold hover:bg-[#082634] hover:text-white transition-all">Modifier</button>
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
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-serif text-[#082634] tracking-tight">Offres d'Emploi</h2>
          <p className="text-[#8EA4AF] text-[10px] uppercase tracking-[0.2em] mt-1">Gérez vos opportunités de carrière</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="bg-[#082634] text-[#D8C7A3] px-8 py-3.5 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#0a3245] transition-all flex items-center gap-2 shadow-lg shadow-[#082634]/10"
        >
          <Plus size={14} />
          Nouvelle Offre
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-[#082634]/40 backdrop-blur-md z-[60] flex items-center justify-end">
          <div className="w-full max-w-4xl h-full bg-white shadow-2xl overflow-y-auto">
            <div className="p-12">
              <div className="flex items-center justify-between mb-12 border-b border-[#DCE0E7] pb-8">
                <div>
                  <p className="text-[#8EA4AF] text-[10px] uppercase tracking-[0.2em] mb-2 font-medium">Gestion RH</p>
                  <h2 className="text-3xl font-serif text-[#082634] font-light">
                    {editing !== null ? "Modifier l'offre" : "Publier une nouvelle offre"}
                  </h2>
                </div>
                <button 
                  onClick={resetForm} 
                  className="p-3 hover:bg-[#F8F9FA] transition-colors text-[#8EA4AF] hover:text-[#082634]"
                >
                  <X size={24} strokeWidth={1.5} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-16 pb-32">
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Titre du poste *</label>
                      <input
                        required
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Ex: Architecte d'intérieur Senior"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Slug (URL) *</label>
                      <input
                        required
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                        placeholder="architecte-interieur-senior"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Département *</label>
                      <input
                        required
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none"
                        value={form.department}
                        onChange={(e) => setForm({ ...form, department: e.target.value })}
                        placeholder="Ex: Design & Architecture"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Ville</label>
                      <input
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                        placeholder="Ex: Casablanca"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Type de contrat</label>
                      <select
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none appearance-none"
                        value={form.type}
                        onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                      >
                        <option value="full-time">CDI</option>
                        <option value="part-time">Temps partiel</option>
                        <option value="internship">Stage</option>
                        <option value="freelance">Freelance</option>
                      </select>
                    </div>
                  </div>

                  <FileUpload 
                    label="Image d'en-tête (Optionnel)" 
                    value={form.coverImageUrl} 
                    onChange={(url) => setForm({ ...form, coverImageUrl: url })} 
                  />

                  <div className="space-y-3">
                    <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Description du poste</label>
                    <textarea
                      className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none h-64 resize-none"
                      value={form.description}
                      onChange={(e) => setForm({ ...form, description: e.target.value })}
                    />
                  </div>

                  <div className="flex items-center gap-4 bg-[#F8F9FA] p-6 border border-[#DCE0E7]">
                    <input
                      type="checkbox"
                      id="active"
                      className="w-5 h-5 text-[#082634] border-[#DCE0E7] focus:ring-[#D8C7A3] cursor-pointer"
                      checked={form.active}
                      onChange={(e) => setForm({ ...form, active: e.target.checked })}
                    />
                    <label htmlFor="active" className="text-xs font-bold text-[#082634] uppercase tracking-widest select-none cursor-pointer">
                      Offre active (visible sur le site)
                    </label>
                  </div>
                </div>

                {/* SEO */}
                <div className="space-y-8 pb-12">
                  <div className="flex items-center gap-3 border-b border-[#DCE0E7] pb-3">
                    <Search size={16} className="text-[#D8C7A3]" />
                    <h3 className="text-[10px] font-bold text-[#082634] uppercase tracking-[0.2em]">Optimisation SEO</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-8">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Méta Titre</label>
                      <input
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none"
                        value={form.metaTitle}
                        onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold text-[#8EA4AF] uppercase tracking-[0.2em]">Méta Description</label>
                      <textarea
                        className="w-full bg-[#F8F9FA] border border-[#DCE0E7] text-[#082634] px-5 py-4 text-sm focus:border-[#D8C7A3] transition-all outline-none h-32 resize-none"
                        value={form.metaDescription}
                        onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
              </form>

              <div className="fixed bottom-0 right-0 w-full max-w-4xl bg-white border-t border-[#DCE0E7] p-8 flex items-center justify-end gap-6 z-[70] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <button type="button" onClick={resetForm} className="text-[#8EA4AF] text-[10px] font-bold uppercase tracking-[0.2em] hover:text-[#082634] transition-colors">Annuler</button>
                <button
                  onClick={handleSubmit}
                  disabled={createCareer.isPending || updateCareer.isPending}
                  className="bg-[#082634] text-[#D8C7A3] px-12 py-4 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#0a3245] transition-all disabled:opacity-50 shadow-xl shadow-[#082634]/10"
                >
                  {createCareer.isPending || updateCareer.isPending ? "Enregistrement..." : "Enregistrer l'offre"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {careers.map((c) => (
          <div key={c.id} className="bg-white border border-[#DCE0E7] p-6 flex items-center justify-between hover:border-[#D8C7A3] hover:shadow-xl transition-all duration-500">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 bg-[#F8F9FA] flex items-center justify-center text-[#D8C7A3]">
                <Briefcase size={20} strokeWidth={1.5} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <Badge color="blue">{typeLabel(c.type)}</Badge>
                  <Badge color={c.active ? "green" : "gray"}>{c.active ? "Active" : "Brouillon"}</Badge>
                </div>
                <h3 className="text-[#082634] font-serif text-lg font-light">{c.title}</h3>
                <div className="text-[#8EA4AF] text-[10px] uppercase tracking-[0.2em] mt-1">
                  {c.department} <span className="mx-2 opacity-30">·</span> {c.location}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right hidden md:block">
                <div className="text-[#8EA4AF] text-[10px] uppercase tracking-widest mb-1 opacity-60">Publiée le</div>
                <div className="text-[#082634] text-xs font-medium">{formatDate(c.createdAt)}</div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => startEdit(c)} className="bg-[#F8F9FA] text-[#082634] px-5 py-2.5 text-[10px] uppercase tracking-widest font-bold hover:bg-[#082634] hover:text-white transition-all">Modifier</button>
                <ConfirmButton onConfirm={async () => {
                  await deleteCareer.mutateAsync({ id: c.id });
                  qc.invalidateQueries({ queryKey: getListCareersQueryKey() });
                }} />
              </div>
            </div>
          </div>
        ))}
        {careers.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-[#DCE0E7] bg-white">
            <p className="text-[#8EA4AF] text-sm font-light">Aucune offre d'emploi disponible.</p>
          </div>
        )}
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
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-serif text-[#082634] tracking-tight">Candidatures Reçues</h2>
        <p className="text-[#8EA4AF] text-[10px] uppercase tracking-[0.2em] mt-1">Consultez les dossiers des candidats</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {applications.map((a) => (
          <div key={a.id} className="bg-white border border-[#DCE0E7] p-8 hover:border-[#D8C7A3] hover:shadow-xl transition-all duration-500">
            <div className="flex items-start justify-between">
              <div className="space-y-6">
                <div>
                  <div className="text-[#082634] font-serif text-2xl font-light">{a.firstName} {a.lastName}</div>
                  <div className="text-[#D8C7A3] text-[10px] uppercase tracking-[0.2em] font-bold mt-1">
                    {a.email} {a.phone && <span className="mx-2 opacity-30">·</span>} {a.phone}
                  </div>
                </div>

                {a.career && (
                  <div className="inline-flex items-center gap-2 bg-[#082634]/5 px-3 py-1.5 border border-[#082634]/10">
                    <span className="text-[#8EA4AF] text-[9px] uppercase tracking-widest font-bold">Poste:</span>
                    <span className="text-[#082634] text-xs font-medium">{a.career.title}</span>
                  </div>
                )}

                {a.message && (
                  <div className="text-[#3B5661] text-sm font-light leading-relaxed max-w-2xl italic border-l-2 border-[#D8C7A3]/30 pl-4">
                    "{a.message}"
                  </div>
                )}

                {a.cvUrl && (
                  <div className="pt-2">
                    <a 
                      href={a.cvUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-3 bg-[#082634] text-[#D8C7A3] px-6 py-3 text-[10px] uppercase tracking-[0.2em] font-bold hover:bg-[#0a3245] transition-all shadow-lg shadow-[#082634]/10"
                    >
                      <Download size={14} />
                      Télécharger le CV (PDF)
                    </a>
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-[#8EA4AF] text-[10px] uppercase tracking-widest mb-1 opacity-60">Candidature du</div>
                <div className="text-[#082634] text-xs font-medium">{formatDate(a.createdAt)}</div>
              </div>
            </div>
          </div>
        ))}
        {applications.length === 0 && (
          <div className="py-20 text-center border-2 border-dashed border-[#DCE0E7] bg-white">
            <p className="text-[#8EA4AF] text-sm font-light">Aucune candidature reçue pour le moment.</p>
          </div>
        )}
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
    <div className="min-h-screen bg-[#F8F9FA] flex font-sans">
      {/* Sidebar */}
      <aside className="w-72 bg-[#082634] flex-shrink-0 flex flex-col sticky top-0 h-screen">
        <div className="p-10">
          <div className="text-[#D8C7A3] font-serif text-2xl tracking-[0.15em] leading-none mb-1">GROUPE</div>
          <div className="text-white font-serif text-2xl tracking-[0.15em] leading-none">ACHARAF</div>
          <div className="text-[#8EA4AF] text-[10px] tracking-[0.3em] uppercase mt-4 font-medium opacity-60">Back-Office</div>
        </div>

        <nav className="flex-1 px-6 space-y-2">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-6 py-4 text-[10px] uppercase tracking-[0.2em] transition-all duration-300 ${
                activeTab === item.id
                  ? "bg-[#D8C7A3] text-[#082634] font-semibold"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-10">
          <a 
            href="/" 
            className="text-[#8EA4AF] text-[10px] uppercase tracking-[0.2em] hover:text-[#D8C7A3] transition-colors"
          >
            &larr; Retour au site
          </a>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-[#DCE0E7] px-12 py-8 flex items-center justify-between">
          <div>
            <h1 className="text-[#082634] font-serif text-3xl font-light tracking-tight">
              {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
            </h1>
            <p className="text-[#8EA4AF] text-[10px] uppercase tracking-[0.2em] mt-2">
              Gestion de la plateforme
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[#082634] text-xs font-medium">Administrateur</div>
              <div className="text-[#8EA4AF] text-[10px] uppercase tracking-wider">Accès Complet</div>
            </div>
            <div className="w-10 h-10 bg-[#082634] text-[#D8C7A3] flex items-center justify-center font-serif text-lg">
              A
            </div>
          </div>
        </header>

        <div className="p-12 max-w-7xl">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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
