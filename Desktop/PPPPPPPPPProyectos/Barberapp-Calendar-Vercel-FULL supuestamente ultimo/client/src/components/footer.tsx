import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";
import { FaTiktok, FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="mt-16 border-t bg-muted/50 py-8">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-primary mb-2">
              BarberApp Calendar
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              {t("Sistema profesional de gestión de citas para barberías")}
            </p>
          </div>
          
          {/* Redes Sociales */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">
              {t("Síguenos en redes sociales")}
            </p>
            <div className="flex justify-center gap-4">
              <a 
                href="https://www.tiktok.com/@barberapp_calendar" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
                aria-label="TikTok"
              >
                <FaTiktok className="w-6 h-6" />
              </a>
              <a 
                href="https://www.instagram.com/barberapp_calendar/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
                aria-label="Instagram"
              >
                <FaInstagram className="w-6 h-6" />
              </a>
              <a 
                href="https://www.linkedin.com/in/barberapp-calendar-22387b371/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-6 h-6" />
              </a>
              <a 
                href="https://www.youtube.com/@BarberAppCalendar" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors duration-200"
                aria-label="YouTube"
              >
                <FaYoutube className="w-6 h-6" />
              </a>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <Link href="/legal" className="hover:text-primary transition-colors">
              {t("Información Legal")}
            </Link>
            <span className="text-muted-foreground/50">|</span>
            <Link href="/privacy" className="hover:text-primary transition-colors">
              {t("Privacidad")}
            </Link>
            <span className="text-muted-foreground/50">|</span>
            <Link href="/terms" className="hover:text-primary transition-colors">
              {t("Términos")}
            </Link>
            <span className="text-muted-foreground/50">|</span>
            <Link href="/cookies" className="hover:text-primary transition-colors">
              {t("Cookies")}
            </Link>
            <span className="text-muted-foreground/50">|</span>
            <Link href="/legal-notice" className="hover:text-primary transition-colors">
              {t("Aviso Legal")}
            </Link>
          </div>
          
          <div className="mt-6 pt-4 border-t text-xs text-muted-foreground">
            <p>© 2025 BarberApp Calendar. {t("Todos los derechos reservados")}.</p>
            <p className="mt-1">
              {t("Contacto")}: <a href="mailto:barberappinfo@gmail.com" className="hover:text-primary">barberappinfo@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}