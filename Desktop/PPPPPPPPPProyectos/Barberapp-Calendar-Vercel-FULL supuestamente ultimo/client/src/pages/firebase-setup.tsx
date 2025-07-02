
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, ExternalLink, Copy, Key, Database, Shield, Settings } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

export default function FirebaseSetup() {
  const [copiedText, setCopiedText] = useState<string>("");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(""), 2000);
  };

  const envVars = [
    "VITE_FIREBASE_API_KEY",
    "VITE_FIREBASE_AUTH_DOMAIN", 
    "VITE_FIREBASE_PROJECT_ID",
    "VITE_FIREBASE_STORAGE_BUCKET",
    "VITE_FIREBASE_MESSAGING_SENDER_ID",
    "VITE_FIREBASE_APP_ID"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🔥 Configuración de Firebase
          </h1>
          <p className="text-gray-600 text-lg">
            Configura Firebase para habilitar autenticación avanzada y base de datos en tiempo real
          </p>
        </div>

        {/* Quick Status */}
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Estado:</strong> Firebase no está configurado. Sigue los pasos a continuación para habilitarlo.
          </AlertDescription>
        </Alert>

        {/* Step 1: Create Firebase Project */}
        <Card className="border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Database className="w-5 h-5" />
              Paso 1: Crear Proyecto Firebase
            </CardTitle>
            <CardDescription>
              Crea un nuevo proyecto en Firebase Console
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Ve a <strong>Firebase Console</strong></li>
              <li>Haz clic en <strong>"Crear un proyecto"</strong></li>
              <li>Nombra tu proyecto (ej: "mi-barberia-app")</li>
              <li>Acepta los términos y crea el proyecto</li>
            </ol>
            <Button asChild className="w-full">
              <a
                href="https://console.firebase.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                Abrir Firebase Console
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Step 2: Enable Authentication */}
        <Card className="border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800">
              <Shield className="w-5 h-5" />
              Paso 2: Habilitar Autenticación
            </CardTitle>
            <CardDescription>
              Configura autenticación por email y contraseña
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>En tu proyecto Firebase, ve a <strong>"Authentication"</strong></li>
              <li>Haz clic en <strong>"Comenzar"</strong></li>
              <li>Ve a la pestaña <strong>"Sign-in method"</strong></li>
              <li>Habilita <strong>"Email/Password"</strong></li>
              <li>Guarda los cambios</li>
            </ol>
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <AlertDescription className="text-green-700">
                <strong>Importante:</strong> Sin este paso, el registro y login no funcionarán.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Step 3: Create Web App */}
        <Card className="border-purple-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Settings className="w-5 h-5" />
              Paso 3: Crear App Web
            </CardTitle>
            <CardDescription>
              Registra tu aplicación web en Firebase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>En la página principal del proyecto, haz clic en <strong>"Web" (&lt;/&gt;)</strong></li>
              <li>Nombra tu app (ej: "BarberApp Web")</li>
              <li><strong>NO</strong> habilites Firebase Hosting (por ahora)</li>
              <li>Haz clic en <strong>"Registrar app"</strong></li>
              <li>Copia la configuración que aparece (la necesitarás en el siguiente paso)</li>
            </ol>
          </CardContent>
        </Card>

        {/* Step 4: Configure Environment Variables */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <Key className="w-5 h-5" />
              Paso 4: Configurar Variables de Entorno
            </CardTitle>
            <CardDescription>
              Agrega las credenciales de Firebase a Replit Secrets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-700">
                En Replit, haz clic en el ícono <strong>🔒 Secrets</strong> en la barra lateral izquierda.
              </AlertDescription>
            </Alert>
            
            <p className="text-sm text-gray-600 mb-4">
              Agrega estas 6 variables con los valores de tu configuración Firebase:
            </p>
            
            <div className="space-y-3">
              {envVars.map((envVar) => (
                <div key={envVar} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <Badge variant="outline" className="font-mono">
                    {envVar}
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(envVar, envVar)}
                    className="h-8 w-8 p-0"
                  >
                    <Copy className="w-4 h-4" />
                    {copiedText === envVar && <span className="sr-only">Copiado</span>}
                  </Button>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
              <p className="text-gray-300 mb-2">// Ejemplo de configuración Firebase:</p>
              <p>const firebaseConfig = &#123;</p>
              <p className="ml-4">apiKey: "AIzaSyC...", <span className="text-yellow-400">← VITE_FIREBASE_API_KEY</span></p>
              <p className="ml-4">authDomain: "proyecto.firebaseapp.com", <span className="text-yellow-400">← VITE_FIREBASE_AUTH_DOMAIN</span></p>
              <p className="ml-4">projectId: "mi-proyecto", <span className="text-yellow-400">← VITE_FIREBASE_PROJECT_ID</span></p>
              <p className="ml-4">storageBucket: "proyecto.appspot.com", <span className="text-yellow-400">← VITE_FIREBASE_STORAGE_BUCKET</span></p>
              <p className="ml-4">messagingSenderId: "123456789", <span className="text-yellow-400">← VITE_FIREBASE_MESSAGING_SENDER_ID</span></p>
              <p className="ml-4">appId: "1:123:web:abc123", <span className="text-yellow-400">← VITE_FIREBASE_APP_ID</span></p>
              <p>&#125;;</p>
            </div>
          </CardContent>
        </Card>

        {/* Step 5: Test */}
        <Card className="border-indigo-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-800">
              <CheckCircle className="w-5 h-5" />
              Paso 5: Probar Configuración
            </CardTitle>
            <CardDescription>
              Verifica que todo funcione correctamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Una vez configuradas las variables de entorno:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Reinicia tu Replit (Run → Stop → Run)</li>
              <li>Ve a la página de diagnóstico para probar la conexión</li>
              <li>Intenta registrar un usuario de prueba</li>
              <li>Si todo funciona, ¡ya puedes usar Firebase!</li>
            </ol>
            
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link href="/firebase-test">
                  🔧 Diagnóstico Firebase
                </Link>
              </Button>
              <Button asChild>
                <Link href="/firebase-register">
                  📝 Probar Registro
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              <AlertCircle className="w-5 h-5" />
              Solución de Problemas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <strong className="text-yellow-800">Error "operation-not-allowed":</strong>
              <p>Email/Password no está habilitado. Ve al Paso 2.</p>
            </div>
            <div>
              <strong className="text-yellow-800">Error "invalid-api-key":</strong>
              <p>Verifica que VITE_FIREBASE_API_KEY esté correcta en Secrets.</p>
            </div>
            <div>
              <strong className="text-yellow-800">Error "project-not-found":</strong>
              <p>Verifica que VITE_FIREBASE_PROJECT_ID coincida con tu proyecto.</p>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <Button asChild variant="outline">
            <Link href="/">
              ← Volver al inicio
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/login">
              Usar sistema tradicional
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
