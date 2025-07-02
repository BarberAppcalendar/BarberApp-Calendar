import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";

export default function Cookies() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/legal" className="text-primary hover:underline mb-4 inline-block">
            ← {t("Volver a información legal")}
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {t("Política de Cookies")}
          </h1>
          <p className="text-muted-foreground">
            Política de Cookies - BarberApp Calendar
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              1. {t("¿Qué son las cookies?")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Las cookies son pequeños archivos de texto que los sitios web pueden utilizar para mejorar 
              la experiencia del usuario. Estas se almacenan en el navegador del usuario y pueden ser 
              recuperadas por el sitio web en visitas posteriores.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Uso de cookies en BarberApp Calendar")}
            </h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-green-800 leading-relaxed">
                <strong>Estado actual:</strong> BarberApp Calendar utiliza únicamente cookies técnicas necesarias 
                para el funcionamiento de las sesiones de usuario (autenticación y mantenimiento de sesión).
              </p>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              No utilizamos cookies de terceros para análisis, seguimiento o publicidad. Las cookies técnicas 
              que empleamos son esenciales para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4 mt-3">
              <li>Mantener la sesión de usuario activa</li>
              <li>Recordar preferencias de idioma</li>
              <li>Garantizar la seguridad de la aplicación</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Posibles cambios futuros")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Es posible que en el futuro se implementen cookies adicionales con fines analíticos para mejorar 
              la experiencia de usuario. En ese caso, se actualizará esta política y se solicitará el 
              consentimiento explícito del usuario a través de un aviso de cookies conforme al RGPD.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Gestión de cookies")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Los usuarios pueden gestionar las cookies en cualquier momento desde la configuración de su navegador. 
              Sin embargo, tenga en cuenta que:
            </p>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-amber-800 leading-relaxed">
                <strong>Advertencia:</strong> Deshabilitar las cookies técnicas puede afectar el funcionamiento 
                normal de la aplicación, especialmente las funciones de inicio de sesión y mantenimiento de sesión.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Tipos de cookies que utilizamos")}
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border rounded-lg">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="border border-border p-3 text-left">Tipo</th>
                    <th className="border border-border p-3 text-left">Propósito</th>
                    <th className="border border-border p-3 text-left">Duración</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-border p-3 font-medium">Cookies de sesión</td>
                    <td className="border border-border p-3 text-muted-foreground">
                      Mantener la sesión de usuario autenticado
                    </td>
                    <td className="border border-border p-3 text-muted-foreground">2 semanas</td>
                  </tr>
                  <tr className="bg-muted/25">
                    <td className="border border-border p-3 font-medium">Preferencias</td>
                    <td className="border border-border p-3 text-muted-foreground">
                      Recordar idioma seleccionado
                    </td>
                    <td className="border border-border p-3 text-muted-foreground">Permanente</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Contacto")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Para cualquier consulta relacionada con esta Política de Cookies, puede contactar al desarrollador en:
            </p>
            <p className="mt-2">
              <a href="mailto:barberappinfo@gmail.com" className="text-primary hover:underline">
                barberappinfo@gmail.com
              </a>
            </p>
          </section>

          <div className="bg-muted/50 rounded-lg p-6 mt-8">
            <p className="text-sm text-muted-foreground">
              <strong>Última actualización:</strong> Diciembre 2024
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}