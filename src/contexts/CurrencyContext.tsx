import { createContext, useContext, useState, ReactNode } from "react";

export type CurrencyCode = "USD" | "EUR" | "GBP" | "BDT" | "INR" | "AED";

interface Currency {
  code: CurrencyCode;
  symbol: string;
  rate: number; // relative to USD
  label: string;
}

export const CURRENCIES: Record<CurrencyCode, Currency> = {
  USD: { code: "USD", symbol: "$", rate: 1, label: "US Dollar" },
  EUR: { code: "EUR", symbol: "€", rate: 0.92, label: "Euro" },
  GBP: { code: "GBP", symbol: "£", rate: 0.79, label: "British Pound" },
  BDT: { code: "BDT", symbol: "৳", rate: 110, label: "Bangladeshi Taka" },
  INR: { code: "INR", symbol: "₹", rate: 83, label: "Indian Rupee" },
  AED: { code: "AED", symbol: "د.إ", rate: 3.67, label: "UAE Dirham" },
};

interface CurrencyContextValue {
  currency: Currency;
  setCurrency: (code: CurrencyCode) => void;
  format: (usdAmount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [code, setCode] = useState<CurrencyCode>("USD");
  const currency = CURRENCIES[code];

  const format = (usd: number) => {
    const converted = usd * currency.rate;
    const formatted = converted.toLocaleString(undefined, {
      minimumFractionDigits: code === "BDT" || code === "INR" ? 0 : 2,
      maximumFractionDigits: 2,
    });
    return `${currency.symbol}${formatted}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: setCode, format }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
