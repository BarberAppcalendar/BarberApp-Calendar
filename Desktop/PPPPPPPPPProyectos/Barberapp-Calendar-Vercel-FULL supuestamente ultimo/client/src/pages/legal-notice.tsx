import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";

export default function LegalNotice() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/legal" className="text-primary hover:underline mb-4 inline-block">
            ← {t("Volver a información legal")}
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {t("Aviso Legal")}
          </h1>
          <p className="text-muted-foreground">
            Aviso Legal - BarberApp Calendar
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Información general")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              En cumplimiento con el deber de información establecido en la Ley 34/2002, de servicios de la 
              sociedad de la información y del comercio electrónico (LSSI-CE), se ofrecen a continuación los 
              datos de información general del responsable de esta aplicación web (PWA).
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Titular de la plataforma")}
            </h2>
            <div className="bg-muted/50 rounded-lg p-6">
              <div className="grid gap-3">
                <div>
                  <span className="font-medium">Nombre del responsable:</span>
                  <span className="ml-2 text-muted-foreground">Barber App Calendar</span>
                </div>
                <div>
                  <span className="font-medium">Condición:</span>
                  <span className="ml-2 text-muted-foreground">Particular (no autónomo ni empresa de momento)</span>
                </div>
                <div>
                  <span className="font-medium">Correo electrónico de contacto:</span>
                  <span className="ml-2">
                    <a href="mailto:barberappinfo@gmail.com" className="text-primary hover:underline">
                      barberappinfo@gmail.com
                    </a>
                  </span>
                </div>
                <div>
                  <span className="font-medium">Sede operativa:</span>
                  <span className="ml-2 text-muted-foreground">España</span>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed mt-4">
              La plataforma BarberApp Calendar está desarrollada y gestionada por un particular que opera desde 
              España con fines informativos y funcionales para profesionales del sector de la barbería.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Finalidad del sitio web")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              La finalidad de BarberApp Calendar es proporcionar a barberos una herramienta digital para la 
              gestión de citas, servicios, clientes e ingresos. A través de esta app, se ofrece un servicio 
              digital bajo suscripción mensual tras un periodo gratuito de prueba.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Propiedad intelectual")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Todos los contenidos, diseño, logotipo y funcionalidades de BarberApp Calendar son propiedad 
              del desarrollador. Está prohibida su reproducción total o parcial sin autorización expresa del titular.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Responsabilidad")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              El titular no se hace responsable del mal uso de la aplicación, de posibles caídas temporales 
              del servicio ni de decisiones tomadas por los usuarios basadas en la información mostrada por la app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Legislación aplicable")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Este aviso legal se interpreta bajo la legislación española. Para la resolución de cualquier 
              conflicto que pueda surgir con relación a esta app o sitio web, las partes se someten a la 
              jurisdicción de los tribunales españoles.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Contacto")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Para cualquier cuestión, sugerencia o reclamación relacionada con esta aplicación web, 
              puede contactarse al correo electrónico:
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