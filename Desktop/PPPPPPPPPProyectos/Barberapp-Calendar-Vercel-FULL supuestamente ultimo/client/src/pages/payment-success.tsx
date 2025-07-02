import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PaymentSuccess() {
  const [location, setLocation] = useLocation();
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('Verificando pago...');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const orderID = urlParams.get('token') || urlParams.get('orderID');
    const customerEmail = localStorage.getItem('customerEmail') || urlParams.get('email');

    if (!orderID) {
      setVerificationStatus('error');
      setMessage('No se encontró información del pago');
      return;
    }

    // Verificar el pago automáticamente
    verifyPayment(orderID, customerEmail);
  }, []);

  const verifyPayment = async (orderID: string, customerEmail: string | null) => {
    try {
      console.log('🔍 Verificando pago - Order:', orderID, 'Email:', customerEmail);
      
      const response = await fetch('/api/paypal/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderID,
          customerEmail
        })
      });

      const result = await response.json();

      if (result.success) {
        setVerificationStatus('success');
        setMessage('¡Pago verificado! Tu cuenta ha sido activada exitosamente');
        
        // Limpiar datos temporales
        localStorage.removeItem('customerEmail');
        
        // Redirigir al dashboard después de 3 segundos
        setTimeout(() => {
          setLocation('/dashboard');
        }, 3000);
      } else {
        setVerificationStatus('error');
        setMessage(result.error || 'Error verificando el pago');
      }
    } catch (error) {
      console.error('Error verificando pago:', error);
      setVerificationStatus('error');
      setMessage('Error de conexión al verificar el pago');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        
        {verificationStatus === 'verifying' && (
          <>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Verificando Pago
            </h1>
            <p className="text-gray-600 mb-6">
              Estamos verificando tu pago con PayPal. Esto puede tomar unos segundos...
            </p>
          </>
        )}

        {verificationStatus === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              ¡Pago Exitoso!
            </h1>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <p className="text-green-800 text-sm">
                ✅ Cuenta activada<br/>
                ✅ Suscripción mensual activa<br/>
                ✅ Acceso completo al dashboard
              </p>
            </div>
            <p className="text-sm text-gray-500">
              Serás redirigido al dashboard en unos segundos...
            </p>
          </>
        )}

        {verificationStatus === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Error en Verificación
            </h1>
            <p className="text-gray-600 mb-6">
              {message}
            </p>
            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()}
                className="w-full bg-amber-600 hover:bg-amber-700"
              >
                Reintentar Verificación
              </Button>
              <Button 
                variant="outline"
                onClick={() => setLocation('/subscription')}
                className="w-full"
              >
                Volver a Suscripción
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}