import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#DCE0E7] px-6">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-[#8EA4AF]" />
            <h1 className="text-2xl font-serif font-light text-[#082634]">Page introuvable</h1>
          </div>

          <p className="mt-4 text-sm text-[#082634]/70 font-light">
            Cette adresse ne correspond à aucune page publiée.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
