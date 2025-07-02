import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Copy, ExternalLink, CheckCircle, AlertTriangle } from "lucide-react";
import { useState } from "react";

const FIREBASE_RULES = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir acceso completo durante desarrollo
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;

export function FirebaseSetupInstructions() {
  const [copied, setCopied] = useState(false);

  const copyRules = () => {
    navigator.clipboard.writeText(FIREBASE_RULES);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-brown-800 mb-2">
          Configuración de Firebase
        </h1>
        <p className="text-gray-600">
          Para que la aplicación funcione correctamente, necesitas configurar las reglas de seguridad de Firebase.
        </p>
      </div>

      <div className="space-y-6">
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Importante:</strong> Actualmente hay errores de permisos en Firebase. 
            Sigue estos pasos para solucionarlos.
          </AlertDescription>
        </Alert>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-brown-100 text-brown-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">1</span>
              Acceder a la Consola de Firebase
            </CardTitle>
            <CardDescription>
              Ve a la consola de Firebase y selecciona tu proyecto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto"
              onClick={() => window.open('https://console.firebase.google.com', '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Abrir Consola de Firebase
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-brown-100 text-brown-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">2</span>
              Navegar a Firestore Database
            </CardTitle>
            <CardDescription>
              En el menú lateral, busca "Firestore Database" y haz clic en "Rules"
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Una vez en tu proyecto de Firebase:
            </p>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-gray-600">
              <li>Haz clic en "Firestore Database" en el menú lateral</li>
              <li>Selecciona la pestaña "Rules" (Reglas)</li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-brown-100 text-brown-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">3</span>
              Copiar y Aplicar las Reglas
            </CardTitle>
            <CardDescription>
              Reemplaza las reglas existentes con las siguientes reglas de desarrollo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{FIREBASE_RULES}</code>
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={copyRules}
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                  {copied ? 'Copiado' : 'Copiar'}
                </Button>
              </div>
              
              <Alert className="border-blue-200 bg-blue-50">
                <AlertDescription className="text-blue-800">
                  <strong>Nota:</strong> Estas reglas permiten acceso completo para desarrollo. 
                  En producción, deberías usar reglas más restrictivas.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="bg-brown-100 text-brown-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">4</span>
              Publicar las Reglas
            </CardTitle>
            <CardDescription>
              Aplica los cambios para activar las nuevas reglas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Después de pegar las reglas:
            </p>
            <ol className="list-decimal list-inside mt-2 space-y-1 text-gray-600">
              <li>Haz clic en el botón "Publish" (Publicar)</li>
              <li>Confirma los cambios si aparece un diálogo</li>
              <li>Espera a que se apliquen los cambios (unos segundos)</li>
            </ol>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <CheckCircle className="w-5 h-5" />
              ¡Listo!
            </CardTitle>
            <CardDescription className="text-green-700">
              Una vez aplicadas las reglas, la aplicación debería funcionar correctamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-green-700">
              Ahora puedes cerrar esta página y comenzar a usar BarberApp Calendar. 
              Si sigues experimentando problemas, verifica que hayas seguido todos los pasos correctamente.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}