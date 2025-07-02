import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n";

export function LanguageSelector() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="fixed bottom-4 left-4 z-40">
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger className="w-20 h-8 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full px-2 text-xs shadow-sm hover:bg-white transition-colors">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="es">🇪🇸 ES</SelectItem>
          <SelectItem value="en">🇬🇧 EN</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
