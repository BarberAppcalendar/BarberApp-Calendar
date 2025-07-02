import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";

export default function Legal() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline mb-4 inline-block">
            ← {t("Volver al inicio")}
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {t("Información Legal")}
          </h1>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-3 text-primary">
                {t("Política de Cookies")}
              </h2>
              <p className="text-muted-foreground mb-4">
                {t("Información sobre el uso de cookies en nuestra aplicación")}
              </p>
              <Link href="/cookies" className="text-primary hover:underline">
                {t("Leer política de cookies")} →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-3 text-primary">
                {t("Política de Privacidad")}
              </h2>
              <p className="text-muted-foreground mb-4">
                {t("Cómo protegemos y utilizamos tus datos personales")}
              </p>
              <Link href="/privacy" className="text-primary hover:underline">
                {t("Leer política de privacidad")} →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-3 text-primary">
                {t("Términos y Condiciones")}
              </h2>
              <p className="text-muted-foreground mb-4">
                {t("Condiciones de uso de BarberApp Calendar")}
              </p>
              <Link href="/terms" className="text-primary hover:underline">
                {t("Leer términos y condiciones")} →
              </Link>
            </div>

            <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
              <h2 className="text-xl font-semibold mb-3 text-primary">
                {t("Aviso Legal")}
              </h2>
              <p className="text-muted-foreground mb-4">
                {t("Información legal sobre BarberApp Calendar")}
              </p>
              <Link href="/legal-notice" className="text-primary hover:underline">
                {t("Leer aviso legal")} →
              </Link>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-6 mt-8">
            <h3 className="text-lg font-semibold mb-3">
              {t("Contacto Legal")}
            </h3>
            <p className="text-muted-foreground">
              {t("Para cualquier consulta legal o relacionada con la privacidad, puedes contactarnos en")}:
            </p>
            <p className="mt-2">
              <a href="mailto:barberappinfo@gmail.com" className="text-primary hover:underline">
                barberappinfo@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}