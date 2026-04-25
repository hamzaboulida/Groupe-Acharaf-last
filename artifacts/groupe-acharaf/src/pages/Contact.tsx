import React from "react";
import { Layout } from "@/components/layout/Layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateLead } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin } from "lucide-react";
import heroBg from "@/assets/hero-bg.png";

const formSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  subject: z.string().optional(),
  message: z.string().min(10),
  projectInterest: z.string().optional(),
});


export default function Contact() {
  const { toast } = useToast();
  const createLead = useCreateLead();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { firstName: "", lastName: "", email: "", phone: "", subject: "", message: "", projectInterest: "" },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createLead.mutate(
      { data: values },
      {
        onSuccess: () => {
          if (typeof window !== "undefined" && (window as any).dataLayer) {
            (window as any).dataLayer.push({ event: "lead_conversion", form_type: "contact" });
          }
          toast({ title: "Message envoyé", description: "Nous vous contacterons dans les plus brefs délais." });
          form.reset();
        },
        onError: () => {
          toast({ title: "Erreur", description: "Une erreur est survenue lors de l'envoi.", variant: "destructive" });
        },
      }
    );
  }

  const inputDark = "bg-transparent border-[#8EA4AF]/20 rounded-none focus-visible:ring-[#8EA4AF]/40 text-[#082634] placeholder:text-[#082634]/55 font-light";

  return (
    <Layout>
      {/* ── Hero ── */}
      <section className="relative h-[65vh] w-full flex items-end pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={heroBg} alt="" className="w-full h-full object-cover scale-105 brightness-[0.72]" />
        </div>
        <div className="absolute inset-0 bg-black/22" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-transparent" />
        <div className="relative z-10 container mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}>
            <p className="text-[#8EA4AF] text-xs tracking-[0.2em] uppercase mb-6 opacity-80">Parlons-en</p>
            <div className="overflow-hidden">
              <motion.h1
                className="text-6xl md:text-8xl font-serif font-light text-white leading-none tracking-tight"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                Discutons de<br />votre projet
              </motion.h1>
            </div>
            <p className="text-white/60 text-sm font-light mt-5 max-w-sm">
              Nos conseillers sont à votre disposition pour vous accompagner dans votre acquisition d'exception.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── Contact Info Bar ── */}
      <section className="bg-[#DCE0E7] border-y border-[#8EA4AF]/12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#8EA4AF]/15">
            {[
              { icon: <Phone size={14} />, label: "Téléphone", value: "+212 522 00 00 00", href: "tel:+212522000000" },
              { icon: <Mail size={14} />, label: "Email", value: "contact@groupeacharaf.ma", href: "mailto:contact@groupeacharaf.ma" },
              { icon: <MapPin size={14} />, label: "Bureaux", value: "Boulevard d'Anfa, Casablanca", href: "#map" },
            ].map((item, i) => (
              <a
                key={i}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="flex items-center gap-4 px-7 py-5 hover:bg-[#8EA4AF]/10 transition-colors group"
              >
                <div className="text-[#5C7480] group-hover:text-[#082634] transition-colors">{item.icon}</div>
                <div>
                  <div className="text-[#5C7480] text-xs tracking-[0.15em] uppercase mb-0.5 font-light">{item.label}</div>
                  <div className="text-[#3B5661] text-sm font-light group-hover:text-[#082634] transition-colors">{item.value}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── Form + Map ── */}
      <section className="py-28 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Form */}
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-[#5C7480] mb-4">Formulaire</p>
              <h2 className="text-3xl font-serif text-[#082634] mb-10 font-light">Envoyez-nous un message</h2>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField control={form.control} name="firstName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs tracking-[0.15em] uppercase text-[#5C7480] font-normal">Prénom</FormLabel>
                        <FormControl><Input placeholder="Votre prénom" {...field} className={inputDark} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="lastName" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs tracking-[0.15em] uppercase text-[#5C7480] font-normal">Nom</FormLabel>
                        <FormControl><Input placeholder="Votre nom" {...field} className={inputDark} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs tracking-[0.15em] uppercase text-[#5C7480] font-normal">Email</FormLabel>
                        <FormControl><Input type="email" placeholder="votre@email.com" {...field} className={inputDark} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs tracking-[0.15em] uppercase text-[#5C7480] font-normal">Téléphone</FormLabel>
                        <FormControl><Input placeholder="+212 600 000 000" {...field} className={inputDark} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField control={form.control} name="projectInterest" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs tracking-[0.15em] uppercase text-[#5C7480] font-normal">Projet d'intérêt</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-transparent border-[#8EA4AF]/20 rounded-none focus:ring-[#8EA4AF]/40 text-[#3B5661] font-light">
                            <SelectValue placeholder="Sélectionnez un projet" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-white border-[#8EA4AF]/20 rounded-none">
                          <SelectItem value="le-sommet-anfa">Le Sommet Anfa (Estya)</SelectItem>
                          <SelectItem value="villa-majorelle">Villa Majorelle (Estya)</SelectItem>
                          <SelectItem value="jardins-acharaf">Les Jardins d'Acharaf</SelectItem>
                          <SelectItem value="other">Autre / Renseignements</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs tracking-[0.15em] uppercase text-[#5C7480] font-normal">Message</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Comment pouvons-nous vous aider ?" className={`${inputDark} min-h-[110px] resize-none`} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <Button
                    type="submit"
                    className="w-full bg-[#8EA4AF] text-[#082634] hover:bg-[#B2BED0] transition-colors rounded-none py-5 tracking-[0.15em] uppercase text-xs font-medium"
                    disabled={createLead.isPending}
                  >
                    {createLead.isPending ? "Envoi en cours..." : "Envoyer le message"}
                  </Button>
                </form>
              </Form>
            </div>

            {/* Map + info */}
            <div>
              <p className="text-xs tracking-[0.2em] uppercase text-[#5C7480] mb-4">Localisation</p>
              <h2 className="text-3xl font-serif text-[#082634] mb-10 font-light">Nos bureaux</h2>
              <div id="map" className="w-full h-60 mb-8 overflow-hidden border border-[#8EA4AF]/15">
                <iframe
                  title="Groupe Acharaf — Casablanca"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=-7.6870%2C33.5800%2C-7.5800%2C33.6200&layer=mapnik&marker=33.5992%2C-7.6322"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: "brightness(0.95) contrast(0.9)" }}
                  loading="lazy"
                />
              </div>
              <div className="space-y-7">
                <div>
                  <p className="text-[#5C7480] text-xs tracking-[0.18em] uppercase mb-2">Adresse</p>
                  <p className="text-[#3B5661] font-light text-sm">Boulevard d'Anfa, Casablanca 20050</p>
                </div>
                <div>
                  <p className="text-[#5C7480] text-xs tracking-[0.18em] uppercase mb-2">Heures d'ouverture</p>
                  <p className="text-[#3B5661] font-light text-sm">Lundi – Vendredi : 9h – 18h</p>
                  <p className="text-[#3B5661] font-light text-sm">Samedi : 10h – 14h</p>
                </div>
                <a href="tel:+212600000000" className="btn-outline-dark">
                  <Phone size={12} /> Appeler directement
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

    </Layout>
  );
}
