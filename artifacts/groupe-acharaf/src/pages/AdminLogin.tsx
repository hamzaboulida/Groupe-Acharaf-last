import React, { useState } from "react";
import { useLocation } from "wouter";
import { usePageSeo } from "@/lib/seo";

export default function AdminLogin() {
  usePageSeo({
    title: "Connexion Admin | Groupe Acharaf",
    description: "Connexion sécurisée à l’espace d’administration Groupe Acharaf.",
    path: "/admin/login",
    noIndex: true,
  });

  const [, navigate] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        setError(payload.error || "Identifiants invalides.");
        return;
      }
      navigate("/admin", { replace: true });
    } catch {
      setError("Impossible de contacter le serveur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-md border border-[#DCE0E7] bg-white p-8 md:p-10">
        <div className="text-center mb-8">
          <p className="text-[#8EA4AF] text-xs tracking-[0.2em] uppercase mb-3">Back-office</p>
          <h1 className="text-[#082634] font-serif text-4xl font-light leading-none">Groupe Acharaf</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[#082634] text-xs uppercase tracking-[0.15em] mb-2 block">Nom d’utilisateur</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full border border-[#DCE0E7] px-4 py-3 text-[#082634] focus:outline-none focus:border-[#8EA4AF]"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="text-[#082634] text-xs uppercase tracking-[0.15em] mb-2 block">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#DCE0E7] px-4 py-3 text-[#082634] focus:outline-none focus:border-[#8EA4AF]"
              autoComplete="current-password"
              required
            />
          </div>
          {error && (
            <p className="text-[#082634] text-sm bg-[#DCE0E7]/45 px-3 py-2 border border-[#8EA4AF]/35">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#082634] text-white py-3 text-xs tracking-[0.15em] uppercase hover:bg-[#8EA4AF] hover:text-[#082634] transition-colors disabled:opacity-60"
          >
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
}

