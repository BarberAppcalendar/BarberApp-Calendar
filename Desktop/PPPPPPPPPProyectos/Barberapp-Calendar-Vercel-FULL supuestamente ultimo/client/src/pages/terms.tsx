import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";

export default function Terms() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/legal" className="text-primary hover:underline mb-4 inline-block">
            ← {t("Volver a información legal")}
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {t("Términos y Condiciones")}
          </h1>
          <p className="text-muted-foreground">
            Términos y Condiciones de Uso - BarberApp Calendar
          </p>
        </div>

        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Objeto")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Los presentes Términos y Condiciones regulan el acceso y uso de la aplicación BarberApp Calendar, 
              una herramienta digital que permite a barberos gestionar sus citas, servicios, clientes e ingresos 
              de forma profesional.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Registro y acceso")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Para utilizar la aplicación, el usuario debe registrarse con un correo electrónico válido. 
              Al registrarse, se le concede acceso inmediato a la versión Pro de forma gratuita durante 30 días. 
              No se requiere tarjeta bancaria para el registro ni durante el periodo gratuito.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Periodo gratuito y suscripción")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              El usuario disfrutará de una prueba gratuita completa durante 30 días desde su primer registro. 
              Finalizado este periodo, el acceso a la app se suspenderá hasta que se realice el pago de la 
              suscripción mensual Premium, cuyo precio es de 4,99 EUR (IVA incluido).
            </p>
            <p className="text-muted-foreground leading-relaxed">
              El pago se realizará a través de PayPal, una vez el usuario decida continuar. No se aplican 
              cobros automáticos ni renovaciones forzadas, ya que no se solicita información de pago durante 
              la prueba gratuita.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Funcionalidades")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              La aplicación ofrece las siguientes funcionalidades:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Agenda de citas</li>
              <li>Gestión de clientes</li>
              <li>Registro de servicios prestados</li>
              <li>Control de ingresos generados</li>
              <li>Panel profesional de uso diario</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Cancelación")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Dado que no se requiere método de pago para acceder a la versión gratuita, no se aplican cargos 
              automáticos. La suscripción puede iniciarse o no al finalizar la prueba. El usuario puede decidir 
              libremente si continuar y efectuar el pago manual.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Uso permitido")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              El usuario se compromete a hacer un uso adecuado y legal de la aplicación. Queda prohibido el uso 
              de la plataforma para actividades ilícitas, fraudulentas o contrarias a la moral.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Limitación de responsabilidad")}
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>El desarrollador no garantiza que la app esté libre de errores ni que su funcionamiento sea ininterrumpido.</li>
              <li>No se responsabiliza por pérdidas económicas o fallos derivados del uso de la app.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Propiedad intelectual")}
            </h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Todos los contenidos, logotipos, diseño e interfaz de BarberApp Calendar son propiedad del desarrollador.</li>
              <li>Queda prohibida su reproducción, distribución o modificación sin autorización.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Legislación aplicable")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Los presentes términos se rigen por la legislación española. Para cualquier controversia que pueda 
              surgir, las partes se someten a los juzgados competentes.
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