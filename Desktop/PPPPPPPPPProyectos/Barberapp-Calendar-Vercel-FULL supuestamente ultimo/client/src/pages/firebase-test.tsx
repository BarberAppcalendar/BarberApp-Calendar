
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, XCircle, AlertTriangle, Info } from "lucide-react";

export default function FirebaseTest() {
  const [testResult, setTestResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "success" | "error">("idle");

  const getEnvStatus = () => {
    const envVars = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };

    const missing = Object.entries(envVars).filter(([key, value]) => !value);
    return { envVars, missing };
  };

  const testFirebaseConnection = async () => {
    setIsLoading(true);
    setTestResult("🔄 Probando Firebase...");

    try {
      const { missing } = getEnvStatus();
      
      if (missing.length > 0) {
        setTestResult(`❌ Variables de entorno faltantes:\n${missing.map(([key]) => `- VITE_FIREBASE_${key.toUpperCase()}`).join('\n')}\n\n💡 Configura estas variables en los Secrets de Replit`);
        setConnectionStatus("error");
        setIsLoading(false);
        return;
      }

      // Test Firebase connection
      const { db, auth, isFirebaseConfigured } = await import('@/lib/firebase');
      
      if (!isFirebaseConfigured) {
        setTestResult("❌ Firebase no configurado - variables de entorno faltantes");
        setConnectionStatus("error");
        setIsLoading(false);
        return;
      }

      if (!auth || !db) {
        setTestResult("❌ Firebase no inicializado correctamente");
        setConnectionStatus("error");
        setIsLoading(false);
        return;
      }

      // Test Firestore connection
      const { doc, getDoc } = await import('firebase/firestore');
      const testDoc = doc(db, 'test', 'connection');
      
      await getDoc(testDoc);
      setTestResult("✅ Firebase conectado correctamente\n✅ Firestore funcional\n✅ Authentication disponible\n\n🎉 Todo listo para usar!");
      setConnectionStatus("success");
      
    } catch (error: any) {
      console.error("Firebase test error:", error);
      let errorMsg = "❌ Error desconocido";
      
      if (error.message.includes("offline")) {
        errorMsg = "❌ Firebase está en modo offline\n💡 Verifica tu conexión a internet\n💡 Verifica las reglas de Firestore";
      } else if (error.code === 'permission-denied') {
        errorMsg = "❌ Permisos denegados en Firestore\n💡 Verifica las reglas de seguridad en Firebase Console";
      } else if (error.code === 'auth/invalid-api-key') {
        errorMsg = "❌ API Key inválida\n💡 Verifica VITE_FIREBASE_API_KEY en Secrets";
      } else if (error.code === 'auth/invalid-credential') {
        errorMsg = "❌ Credenciales inválidas\n💡 Verifica todas las variables VITE_FIREBASE_* en Secrets";
      } else {
        errorMsg = `❌ Error: ${error.message}\n💡 Código: ${error.code || 'N/A'}`;
      }
      
      setTestResult(errorMsg);
      setConnectionStatus("error");
    }
    
    setIsLoading(false);
  };

  const testRegistration = async () => {
    setIsLoading(true);
    setTestResult("🔄 Probando registro...");

    try {
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = "123456";

      const { firebaseAuth } = await import('@/lib/firebase-auth');
      const result = await firebaseAuth.register(testEmail, testPassword);
      
      setTestResult(`✅ Registro exitoso\n📧 Email: ${testEmail}\n🆔 UID: ${result.uid}\n\n⚠️ Este es un usuario de prueba - puedes eliminarlo desde Firebase Console`);
      setConnectionStatus("success");
      
    } catch (error: any) {
      console.error("Registration test error:", error);
      let errorMsg = `❌ Error en registro: ${error.message}`;
      
      if (error.code === 'auth/operation-not-allowed') {
        errorMsg = "❌ Email/Password auth no habilitado\n💡 Ve a Firebase Console > Authentication > Sign-in method > Email/Password > Enable";
      }
      
      setTestResult(errorMsg);
      setConnectionStatus("error");
    }
    
    setIsLoading(false);
  };

  const { envVars, missing } = getEnvStatus();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">
          🔥 Diagnóstico Firebase
        </h1>
        
        {/* Status Alert */}
        {connectionStatus === "success" && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              ✅ Firebase configurado correctamente
            </AlertDescription>
          </Alert>
        )}
        
        {connectionStatus === "error" && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              ❌ Problemas detectados en la configuración
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Pruebas de Conectividad
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testFirebaseConnection}
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "🔄 Probando..." : "🔥 Probar Conexión Firebase"}
            </Button>
            
            <Button 
              onClick={testRegistration}
              disabled={isLoading || missing.length > 0}
              variant="outline"
              className="w-full"
            >
              {isLoading ? "🔄 Probando..." : "📝 Probar Registro"}
            </Button>
            
            {testResult && (
              <div className="mt-6 p-4 bg-gray-100 rounded-md">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {testResult}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Variables de Entorno
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(envVars).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="font-medium">VITE_FIREBASE_{key.toUpperCase()}:</span>
                  <div className="flex items-center gap-2">
                    {value ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-green-600 text-sm">Configurada</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-red-600 text-sm">Faltante</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
            
            {missing.length > 0 && (
              <Alert className="mt-4 border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-700">
                  <strong>Acción requerida:</strong> Configura las variables faltantes en Replit Secrets (🔒 ícono en la barra lateral)
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        
        <div className="mt-6 text-center">
          <Button asChild variant="outline">
            <a href="/" className="inline-flex items-center gap-2">
              ← Volver al inicio
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
