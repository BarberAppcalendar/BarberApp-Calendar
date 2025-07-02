import { Link } from "wouter";
import { useI18n } from "@/lib/i18n";

export default function Privacy() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/legal" className="text-primary hover:underline mb-4 inline-block">
            ← {t("Volver a información legal")}
          </Link>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {t("Política de Privacidad")}
          </h1>
        </div>

        <div className="prose prose-slate max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Responsable del tratamiento")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              El responsable del tratamiento de los datos personales recogidos a través de la PWA 'BarberApp Calendar' 
              es un particular, identificado como el desarrollador de la aplicación. En este momento, no está registrado 
              como autónomo ni empresa.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              <strong>Correo de contacto:</strong> <a href="mailto:barberappinfo@gmail.com" className="text-primary hover:underline">barberappinfo@gmail.com</a>
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Esta política es válida para los datos recogidos a través del sitio web y la app BarberApp Calendar alojados en Replit.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Datos personales que se recogen")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Los datos personales recogidos pueden incluir:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Nombre</li>
              <li>Correo electrónico</li>
              <li>Información de citas</li>
              <li>Servicios prestados</li>
              <li>Historial de ingresos</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Estos datos son facilitados directamente por el usuario al registrarse o utilizar la aplicación.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Finalidades del tratamiento")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Los datos se recopilan con las siguientes finalidades:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Gestionar las cuentas de usuario</li>
              <li>Control de citas y servicios</li>
              <li>Visualización de ingresos</li>
              <li>Facturación mediante PayPal</li>
              <li>Envío de notificaciones relacionadas con el uso de la app</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Base legal del tratamiento")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              La base legal para el tratamiento de los datos personales es el consentimiento del usuario, 
              que se otorga al aceptar esta Política de Privacidad al registrarse en la app.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Destinatarios de los datos")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              Los datos no se comparten con terceros, salvo los servicios necesarios para el funcionamiento de la aplicación:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Replit (hosting y base de datos)</li>
              <li>PayPal (procesamiento de pagos)</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Estos servicios pueden almacenar datos en servidores fuera del Espacio Económico Europeo.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Conservación de los datos")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Los datos personales se conservarán mientras el usuario mantenga su cuenta activa. 
              Si el usuario elimina su cuenta, los datos serán eliminados de forma definitiva en un plazo máximo de 30 días.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Derechos del usuario")}
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              El usuario tiene derecho a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
              <li>Acceder a sus datos personales</li>
              <li>Solicitar la rectificación o supresión de los mismos</li>
              <li>Limitar u oponerse al tratamiento</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-3">
              Para ejercer estos derechos, puede enviar un correo electrónico al desarrollador.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Seguridad de los datos")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              El responsable ha adoptado las medidas técnicas y organizativas necesarias para garantizar 
              la seguridad de los datos personales, teniendo en cuenta el estado actual de la tecnología.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-3">
              {t("Cambios en esta política")}
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Esta política puede actualizarse en cualquier momento. Se recomienda revisar periódicamente 
              esta sección para estar informado de cualquier cambio.
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