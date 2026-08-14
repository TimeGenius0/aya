import {
  CalendarIcon,
  ClientsIcon,
  DashboardIcon,
  InvoiceIcon,
  SettingsIcon,
} from "./icons";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Accueil", icon: DashboardIcon },
  { href: "/clients", label: "Clients", icon: ClientsIcon },
  { href: "/calendar", label: "Calendrier", icon: CalendarIcon },
  { href: "/invoices", label: "Factures", icon: InvoiceIcon },
  { href: "/settings", label: "Réglages", icon: SettingsIcon },
] as const;
