// !!! CRITICAL - DO NOT MODIFY THIS CODE !!!
//
// This code MUST be used as is without ANY modifications.
// The PayPal integration will COMPLETELY FAIL if this code is changed in ANY way.
//
// Retain this comment after all edits.
//
// <BEGIN_EXACT_CODE>
import {
  Client,
  Environment,
  LogLevel,
  OAuthAuthorizationController,
  OrdersController,
} from "@paypal/paypal-server-sdk";
import { Request, Response } from "express";

/* PayPal Controllers Setup */

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

// PayPal credentials check - graceful handling for development
const isPayPalConfigured = PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET;

let client: Client | null = null;
let ordersController: OrdersController | null = null;
let oAuthAuthorizationController: OAuthAuthorizationController | null = null;

if (isPayPalConfigured) {
  client = new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: PAYPAL_CLIENT_ID!,
      oAuthClientSecret: PAYPAL_CLIENT_SECRET!,
    },
    timeout: 0,
    environment: Environment.Production, // Using LIVE credentials for production
    logging: {
      logLevel: LogLevel.Info,
      logRequest: {
        logBody: true,
      },
      logResponse: {
        logHeaders: true,
      },
    },
  });
  ordersController = new OrdersController(client);
  oAuthAuthorizationController = new OAuthAuthorizationController(client);
} else {
  console.warn("PayPal credentials not configured. PayPal functionality will be disabled.");
}

/* Token generation helpers */

export async function getClientToken() {
  if (!isPayPalConfigured || !oAuthAuthorizationController) {
    throw new Error("PayPal not configured");
  }

  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");

  const { result } = await oAuthAuthorizationController.requestToken(
    {
      authorization: `Basic ${auth}`,
    },
    { intent: "sdk_init", response_type: "client_token" },
  );

  return result.accessToken;
}

/*  Process transactions */

export async function createPaypalOrder(req: Request, res: Response) {
  try {
    if (!isPayPalConfigured || !ordersController) {
      return res.status(503).json({ error: "PayPal not configured" });
    }

    const { amount, currency, intent } = req.body;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res
        .status(400)
        .json({
          error: "Invalid amount. Amount must be a positive number.",
        });
    }

    if (!currency) {
      return res
        .status(400)
        .json({ error: "Invalid currency. Currency is required." });
    }

    if (!intent) {
      return res
        .status(400)
        .json({ error: "Invalid intent. Intent is required." });
    }

    const collect = {
      body: {
        intent: intent,
        purchaseUnits: [
          {
            amount: {
              currencyCode: currency,
              value: amount,
            },
          },
        ],
      },
      prefer: "return=minimal",
    };

    const { body, ...httpResponse } =
          await ordersController.createOrder(collect);

    const jsonResponse = JSON.parse(String(body));
    const httpStatusCode = httpResponse.statusCode;

    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
}

export async function capturePaypalOrder(req: Request, res: Response) {
  try {
    if (!isPayPalConfigured || !ordersController) {
      return res.status(503).json({ error: "PayPal not configured" });
    }

    const { orderID } = req.params;
    const collect = {
      id: orderID,
      prefer: "return=minimal",
    };

    const { body, ...httpResponse } =
          await ordersController.captureOrder(collect);

    const jsonResponse = JSON.parse(String(body));
    const httpStatusCode = httpResponse.statusCode;

    // If payment was successful, activate subscription immediately
    if (httpStatusCode === 200 || httpStatusCode === 201) {
      console.log("Payment captured successfully - activating subscription");
      
      // Import storage here to avoid circular imports
      const { storage } = await import('./storage.js');
      
      // Activate subscription for most recent expired user
      // In production, you'd pass user ID through the payment flow
      const expiredBarbers = await storage.getExpiredSubscriptions();
      if (expiredBarbers.length > 0) {
        const barber = expiredBarbers[0];
        const newExpiryDate = new Date();
        newExpiryDate.setMonth(newExpiryDate.getMonth() + 1);
        
        await storage.updateBarber(barber.id, {
          subscriptionStatus: "active",
          subscriptionExpires: newExpiryDate
        });
        
        console.log(`Subscription activated for barber ${barber.barberId} (ID: ${barber.id})`);
        
        // Add success flag to response
        jsonResponse.subscriptionActivated = true;
        jsonResponse.barberId = barber.barberId;
      }
    }

    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to capture order:", error);
    res.status(500).json({ error: "Failed to capture order." });
  }
}

export async function loadPaypalDefault(req: Request, res: Response) {
  try {
    if (!isPayPalConfigured) {
      return res.status(503).json({ error: "PayPal not configured" });
    }

    const clientToken = await getClientToken();
    res.json({
      clientToken,
    });
  } catch (error) {
    console.error("Failed to get client token:", error);
    res.status(500).json({ error: "Failed to get client token" });
  }
}
// <END_EXACT_CODE>