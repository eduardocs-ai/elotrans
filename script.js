const ADMIN_USERS = {
  "eduardo.calegari": "Eduardo Calegari",
  "rhanaiza.kinack": "Rhanaiza Kinack",
  "livia.neves": "Livia Neves",
  "amanda.barbosa": "Amanda Barbosa",
};

const FEMALE_ADMIN_USERS = new Set([
  "rhanaiza.kinack",
  "livia.neves",
  "amanda.barbosa",
]);

const STORAGE_KEYS = {
  users: "viafluxo-users-v1",
  routes: "viafluxo-routes-v2",
  session: "viafluxo-session-v1",
  emails: "viafluxo-emails-v1",
  tickets: "viafluxo-tickets-v1",
  occurrences: "viafluxo-occurrences-v1",
  audits: "viafluxo-audits-v1",
  vehicles: "viafluxo-vehicles-v1",
};

const DOCUMENT_DATABASE = {
  name: "viafluxo-documents-v1",
  store: "documents",
};

const ROLE_LABELS = {
  admin: "Administrador",
  company: "Empresa embarcadora",
  carrier: "Transportador",
};

const NAVIGATION = {
  admin: [
    ["overview", "Visao geral"],
    ["registrations", "Cadastros"],
    ["users", "Usuarios"],
    ["operations", "Operacoes"],
    ["occurrences", "Ocorrencias"],
    ["communications", "Comunicacoes"],
    ["audit", "Auditoria"],
    ["settings", "Configuracoes"],
    ["finance", "Financeiro"],
  ],
  company: [
    ["overview", "Visao geral"],
    ["routes", "Minhas rotas"],
    ["proposals", "Propostas"],
    ["deliveries", "Entregas"],
    ["delivery-chat", "Conversas"],
    ["finance", "Financeiro"],
    ["team", "Equipe"],
    ["communications", "Suporte"],
    ["settings", "Configuracoes"],
  ],
  carrier: [
    ["overview", "Visao geral"],
    ["opportunities", "Oportunidades"],
    ["offers", "Minhas propostas"],
    ["deliveries", "Entregas"],
    ["vehicles", "Veiculos"],
    ["documents", "Documentos"],
    ["reviews", "Avaliacoes"],
    ["delivery-chat", "Conversas"],
    ["communications", "Suporte"],
    ["settings", "Configuracoes"],
    ["finance", "Financeiro"],
  ],
};

const pageShell = document.querySelector(".page-shell");
const appShell = document.querySelector("#app-shell");
const appNav = document.querySelector("#app-nav");
const appMobileNav = document.querySelector("#app-mobile-nav");
const appMenuBackdrop = document.querySelector("#app-menu-backdrop");
const mobileMenuButton = document.querySelector("#mobile-menu");
const appContent = document.querySelector("#app-content");
const appPageTitle = document.querySelector("#app-page-title");
const appSectionLabel = document.querySelector("#app-section-label");
const appPrimaryAction = document.querySelector("#app-primary-action");
const accountName = document.querySelector("#account-name");
const accountRole = document.querySelector("#account-role");
const accountAvatar = document.querySelector("#account-avatar");
const authDialog = document.querySelector("#auth-dialog");
const loginForm = document.querySelector("#login-form");
const registerForm = document.querySelector("#register-form");
const loginFeedback = document.querySelector("#login-feedback");
const registerFeedback = document.querySelector("#register-feedback");
const documentDialog = document.querySelector("#document-dialog");
const documentDialogTitle = document.querySelector("#document-dialog-title");
const documentUserMeta = document.querySelector("#document-user-meta");
const documentUserDetails = document.querySelector("#document-user-details");
const documentReviewList = document.querySelector("#document-review-list");
const documentPreview = document.querySelector("#document-preview");
const documentApprove = document.querySelector("#document-approve");
const documentReject = document.querySelector("#document-reject");
const documentDecisionActions = document.querySelector("#document-decision-actions");
const documentReviewNote = document.querySelector(".document-review-footer > p");
const approvalEmailDialog = document.querySelector("#approval-email-dialog");
const approvalEmailRecipient = document.querySelector("#approval-email-recipient");
const approvalEmailSubject = document.querySelector("#approval-email-subject");
const approvalEmailPreview = document.querySelector("#approval-email-preview");
const copyEmailHtmlButton = document.querySelector("#copy-email-html");
const supportDialog = document.querySelector("#support-dialog");
const supportForm = document.querySelector("#support-form");
const routeDialog = document.querySelector("#route-dialog");
const routeForm = document.querySelector("#route-form");
const proposalDialog = document.querySelector("#proposal-dialog");
const proposalRouteName = document.querySelector("#proposal-route-name");
const proposalList = document.querySelector(".proposal-list");
const offerDialog = document.querySelector("#offer-dialog");
const offerForm = document.querySelector("#offer-form");
const offerRouteName = document.querySelector("#offer-route-name");
const toast = document.querySelector("#product-toast");
const installAppButtons = [...document.querySelectorAll(".install-app-button")];
const pickupInput = routeForm?.elements.pickup;
const routeWizardSteps = [...document.querySelectorAll("[data-route-step]")];
const routeWizardIndicators = [...document.querySelectorAll("[data-route-step-indicator]")];
const routeStepBack = document.querySelector("#route-step-back");
const routeStepNext = document.querySelector("#route-step-next");
const routeSubmit = document.querySelector("#route-submit");
const routeReview = document.querySelector("#route-review");

let currentUser = null;
let activeSection = "overview";
let activeUserDirectoryFilter = "company";
let activeRegistrationFilter = "company";
let selectedRouteId = null;
let selectedOperationId = null;
let selectedOccurrenceId = null;
let selectedCompanyRouteId = null;
let selectedCarrierRouteId = null;
let activeOperationFilter = "all";
let activeOccurrenceFilter = "open";
let activeCompanyRouteFilter = "all";
let activeCarrierOpportunityFilter = "all";
let routeWizardStep = 1;
let carrierGpsWatchId = null;
let carrierGpsLastWriteAt = 0;
let carrierGpsState = {
  status: "idle",
  accuracy: null,
  updatedAt: null,
  message: "Ative o GPS para iniciar uma entrega.",
};
let selectedReviewUsername = null;
let selectedSupportTicketId = null;
let selectedDeliveryChatRouteId = null;
let currentPreviewUrl = null;
let currentApprovalEmailHtml = "";
let toastTimeout;
let deferredInstallPrompt = null;

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() {
  return readStorage(STORAGE_KEYS.users, []);
}

function saveUsers(users) {
  writeStorage(STORAGE_KEYS.users, users);
}

function seedTestUsers() {
  const testUsers = [
    {
      username: "empresa.demo",
      password: "empresa123",
      fullName: "Alvorada Autopecas",
      email: "empresa.demo@viafluxo.test",
      phone: "(27) 3333-4821",
      role: "company",
      companyName: "Alvorada Autopecas",
      companyDocument: "12.345.678/0001-90",
      carrierDocument: "",
      vehicle: "",
      status: "approved",
      createdAt: "2026-07-20T10:00:00.000Z",
    },
    {
      username: "motorista.demo",
      password: "motorista123",
      fullName: "Marcos Fretes",
      email: "motorista.demo@viafluxo.test",
      phone: "(27) 99999-2140",
      role: "carrier",
      companyName: "",
      companyDocument: "",
      carrierDocument: "123.456.789-00",
      vehicle: "Utilitario",
      status: "approved",
      createdAt: "2026-07-20T10:30:00.000Z",
    },
  ];
  const users = getUsers();
  testUsers.forEach((testUser) => {
    const existingIndex = users.findIndex((user) => user.username === testUser.username);
    if (existingIndex >= 0) {
      users[existingIndex] = { ...users[existingIndex], ...testUser };
    } else {
      users.push(testUser);
    }
  });
  saveUsers(users);
}

function seedRoutes() {
  const routes = readStorage(STORAGE_KEYS.routes, null);
  if (routes) {
    const sharedDemoRoute = routes.find((route) => route.id === "route-demo-3");
    if (sharedDemoRoute && !sharedDemoRoute.selectedCarrierUsername) {
      sharedDemoRoute.selectedCarrier = "Marcos Fretes";
      sharedDemoRoute.selectedCarrierUsername = "motorista.demo";
      sharedDemoRoute.conversation = sharedDemoRoute.conversation ?? [
        {
          id: "message-demo-welcome",
          senderRole: "system",
          senderName: "ViaFluxo",
          text: "Canal operacional criado. Empresa e transportador ja podem alinhar a coleta e a entrega por aqui.",
          createdAt: "2026-07-24T07:20:00.000Z",
        },
      ];
      writeStorage(STORAGE_KEYS.routes, routes);
    }
    return routes;
  }

  const initialRoutes = [
    {
      id: "route-demo-1",
      owner: "empresa.demo",
      companyName: "Alvorada Autopecas",
      origin: "Vitoria, ES",
      destination: "Campos, RJ",
      cargo: "Pecas automotivas",
      vehicle: "Van",
      pickup: "2026-08-04",
      deadline: "Em ate 24 horas",
      status: "open",
      createdAt: "2026-07-25T10:15:00.000Z",
      progress: 12,
      lastUpdate: "Publicada ha 2 horas",
      proposals: [
        { carrier: "Foco Entregas", amount: 238, deliveryTime: "18 horas", score: 99.1 },
        { carrier: "JL Fretes", amount: 221, deliveryTime: "24 horas", score: 96.9 },
        { carrier: "Expresso Norte Sul", amount: 252, deliveryTime: "14 horas", score: 97.8 },
      ],
    },
    {
      id: "route-demo-2",
      owner: "comercial.demo",
      companyName: "Minas Componentes",
      origin: "Belo Horizonte, MG",
      destination: "Juiz de Fora, MG",
      cargo: "Carga fracionada",
      vehicle: "Utilitario",
      pickup: "2026-08-06",
      deadline: "Em ate 48 horas",
      status: "in-transit",
      selectedCarrier: "Marcos Fretes",
      selectedCarrierUsername: "motorista.demo",
      acceptedAmount: 468,
      progress: 62,
      lastUpdate: "Check-in em Barbacena ha 38 min",
      deadlineAt: "2026-07-26T18:00:00.000Z",
      createdAt: "2026-07-24T13:40:00.000Z",
      proposals: [
        { username: "motorista.demo", carrier: "Marcos Fretes", amount: 468, deliveryTime: "20 horas", score: 98.2 },
      ],
      timeline: [
        ["Rota publicada", "24 jul · 10:40", "done"],
        ["Transportador selecionado", "24 jul · 13:18", "done"],
        ["Coleta confirmada", "25 jul · 08:05", "done"],
        ["Carga em transito", "Check-in ha 38 min", "current"],
        ["Entrega e comprovante", "Prevista para 26 jul", "next"],
      ],
    },
    {
      id: "route-demo-3",
      owner: "empresa.demo",
      companyName: "Alvorada Autopecas",
      origin: "Serra, ES",
      destination: "Teixeira de Freitas, BA",
      cargo: "Vidros e componentes",
      vehicle: "VUC",
      pickup: "2026-07-24",
      deadline: "Entrega em 18 horas",
      deadlineAt: "2026-07-25T12:00:00.000Z",
      status: "delayed",
      selectedCarrier: "Marcos Fretes",
      selectedCarrierUsername: "motorista.demo",
      acceptedAmount: 690,
      progress: 74,
      lastUpdate: "Sem atualizacao ha 3h 12min",
      createdAt: "2026-07-23T14:10:00.000Z",
      proposals: [],
      conversation: [
        {
          id: "message-demo-welcome",
          senderRole: "system",
          senderName: "ViaFluxo",
          text: "Canal operacional criado. Empresa e transportador ja podem alinhar a coleta e a entrega por aqui.",
          createdAt: "2026-07-24T07:20:00.000Z",
        },
      ],
      timeline: [
        ["Rota publicada", "23 jul · 11:10", "done"],
        ["Transportador selecionado", "23 jul · 14:32", "done"],
        ["Coleta confirmada", "24 jul · 07:18", "done"],
        ["Prazo de entrega excedido", "25 jul · 12:00", "alert"],
        ["Entrega e comprovante", "Pendente", "next"],
      ],
    },
    {
      id: "route-demo-4",
      owner: "norte.demo",
      companyName: "Norte Sul Distribuicao",
      origin: "Linhares, ES",
      destination: "Vitoria, ES",
      cargo: "Carga fracionada",
      vehicle: "Utilitario",
      pickup: "2026-07-25",
      deadline: "Entrega no mesmo dia",
      deadlineAt: "2026-07-25T20:00:00.000Z",
      status: "assigned",
      selectedCarrier: "Expresso Norte Sul",
      acceptedAmount: 315,
      progress: 35,
      lastUpdate: "Coleta agendada para 14:30",
      createdAt: "2026-07-25T09:05:00.000Z",
      proposals: [],
    },
    {
      id: "route-demo-5",
      owner: "empresa.demo",
      companyName: "Alvorada Autopecas",
      origin: "Vila Velha, ES",
      destination: "Guarapari, ES",
      cargo: "Pecas leves",
      vehicle: "Van",
      pickup: "2026-07-22",
      deadline: "Entrega no mesmo dia",
      deadlineAt: "2026-07-22T18:00:00.000Z",
      deliveredAt: "2026-07-22T16:42:00.000Z",
      status: "delivered",
      selectedCarrier: "Foco Entregas",
      acceptedAmount: 189,
      progress: 100,
      lastUpdate: "Entregue com comprovante",
      createdAt: "2026-07-22T09:00:00.000Z",
      proposals: [],
    },
  ];

  writeStorage(STORAGE_KEYS.routes, initialRoutes);
  return initialRoutes;
}

function getRoutes() {
  return readStorage(STORAGE_KEYS.routes, seedRoutes());
}

function saveRoutes(routes) {
  writeStorage(STORAGE_KEYS.routes, routes);
}

function seedVehicles() {
  const vehicles = readStorage(STORAGE_KEYS.vehicles, null);
  if (vehicles) return vehicles;
  const initialVehicles = [
    {
      id: "vehicle-demo-1",
      owner: "motorista.demo",
      plate: "RBA-4J21",
      model: "Fiat Fiorino Endurance",
      type: "Utilitario",
      capacity: "650 kg",
      year: "2023",
      status: "available",
      documentStatus: "valid",
    },
  ];
  writeStorage(STORAGE_KEYS.vehicles, initialVehicles);
  return initialVehicles;
}

function getVehicles() {
  return readStorage(STORAGE_KEYS.vehicles, seedVehicles());
}

function saveVehicles(vehicles) {
  writeStorage(STORAGE_KEYS.vehicles, vehicles);
}

function seedOccurrences() {
  const occurrences = readStorage(STORAGE_KEYS.occurrences, null);
  if (occurrences) return occurrences;

  const initialOccurrences = [
    {
      id: "occ-demo-1",
      routeId: "route-demo-3",
      category: "Atraso",
      severity: "critical",
      status: "open",
      title: "Entrega fora do prazo e sem atualizacao",
      company: "Alvorada Autopecas",
      carrier: "JL Fretes",
      openedAt: "2026-07-25T12:18:00.000Z",
      dueAt: "2026-07-25T16:00:00.000Z",
      owner: "",
      description: "A entrega ultrapassou o prazo acordado e o rastreamento nao recebe atualizacao ha mais de tres horas.",
      evidence: ["Rastreamento da rota", "Historico de check-ins"],
      updates: [
        ["Empresa comunicou atraso", "25 jul · 12:18"],
        ["Transportador notificado automaticamente", "25 jul · 12:20"],
      ],
    },
    {
      id: "occ-demo-2",
      routeId: "route-demo-2",
      category: "Avaria",
      severity: "high",
      status: "in-review",
      title: "Embalagem externa danificada na coleta",
      company: "Minas Componentes",
      carrier: "Marcos Fretes",
      openedAt: "2026-07-25T08:22:00.000Z",
      dueAt: "2026-07-26T12:00:00.000Z",
      owner: "rhanaiza.kinack",
      description: "O motorista registrou uma embalagem amassada antes do carregamento. A empresa foi acionada para confirmar a liberacao.",
      evidence: ["3 fotos da coleta", "Termo de ressalva"],
      updates: [
        ["Ocorrencia aberta pelo transportador", "25 jul · 08:22"],
        ["Analise assumida por Rhanaiza Kinack", "25 jul · 08:40"],
        ["Empresa confirmou continuidade", "25 jul · 09:05"],
      ],
    },
    {
      id: "occ-demo-3",
      routeId: "route-demo-5",
      category: "Comprovante",
      severity: "medium",
      status: "resolved",
      title: "Assinatura do recebedor estava ilegivel",
      company: "Alvorada Autopecas",
      carrier: "Foco Entregas",
      openedAt: "2026-07-22T17:02:00.000Z",
      resolvedAt: "2026-07-22T18:10:00.000Z",
      dueAt: "2026-07-23T12:00:00.000Z",
      owner: "livia.neves",
      description: "Foi solicitado um novo comprovante com identificacao legivel do recebedor.",
      evidence: ["Comprovante original", "Comprovante corrigido"],
      updates: [
        ["Pendencia identificada", "22 jul · 17:02"],
        ["Novo comprovante recebido", "22 jul · 18:04"],
        ["Ocorrencia resolvida por Livia Neves", "22 jul · 18:10"],
      ],
    },
  ];

  writeStorage(STORAGE_KEYS.occurrences, initialOccurrences);
  return initialOccurrences;
}

function getOccurrences() {
  return readStorage(STORAGE_KEYS.occurrences, seedOccurrences());
}

function saveOccurrences(occurrences) {
  writeStorage(STORAGE_KEYS.occurrences, occurrences);
}

function seedAudits() {
  const audits = readStorage(STORAGE_KEYS.audits, null);
  if (audits) return audits;
  const initialAudits = [
    {
      id: "audit-demo-1",
      admin: "rhanaiza.kinack",
      adminName: "Rhanaiza Kinack",
      action: "Assumiu uma ocorrencia",
      target: "Embalagem externa danificada na coleta",
      category: "Operacao",
      createdAt: "2026-07-25T08:40:00.000Z",
    },
    {
      id: "audit-demo-2",
      admin: "livia.neves",
      adminName: "Livia Neves",
      action: "Resolveu uma ocorrencia",
      target: "Assinatura do recebedor estava ilegivel",
      category: "Ocorrencia",
      createdAt: "2026-07-22T18:10:00.000Z",
    },
  ];
  writeStorage(STORAGE_KEYS.audits, initialAudits);
  return initialAudits;
}

function getAudits() {
  return readStorage(STORAGE_KEYS.audits, seedAudits());
}

function logAudit(action, target, category) {
  if (!currentUser || currentUser.role !== "admin") return;
  const audits = getAudits();
  audits.unshift({
    id: createId(),
    admin: currentUser.username,
    adminName: currentUser.fullName,
    action,
    target,
    category,
    createdAt: new Date().toISOString(),
  });
  writeStorage(STORAGE_KEYS.audits, audits.slice(0, 100));
}

function seedTickets() {
  const tickets = readStorage(STORAGE_KEYS.tickets, null);
  if (tickets) return tickets;

  const initialTickets = [
    {
      id: "ticket-demo-1",
      ownerUsername: "empresa.demo",
      ownerName: "Alvorada Autopecas",
      ownerRole: "company",
      category: "Dúvida",
      subject: "Como alterar o prazo de uma rota publicada?",
      status: "open",
      createdAt: "2026-07-25T13:20:00.000Z",
      updatedAt: "2026-07-25T13:20:00.000Z",
      messages: [
        {
          senderRole: "company",
          senderName: "Alvorada Autopecas",
          text: "Publicamos uma rota com prazo incorreto. Ainda nao recebemos propostas. Podemos editar ou precisamos cancelar?",
          createdAt: "2026-07-25T13:20:00.000Z",
        },
      ],
    },
    {
      id: "ticket-demo-2",
      ownerUsername: "motorista.demo",
      ownerName: "Marcos Fretes",
      ownerRole: "carrier",
      category: "Relato de bug",
      subject: "Botao de enviar proposta nao respondeu",
      status: "waiting-user",
      createdAt: "2026-07-24T18:05:00.000Z",
      updatedAt: "2026-07-25T10:15:00.000Z",
      messages: [
        {
          senderRole: "carrier",
          senderName: "Marcos Fretes",
          text: "Tentei enviar uma proposta pelo celular e o botao ficou carregando.",
          createdAt: "2026-07-24T18:05:00.000Z",
        },
        {
          senderRole: "admin",
          senderName: "Equipe ViaFluxo",
          text: "Obrigado pelo aviso. Voce consegue informar o modelo do aparelho e se estava usando Wi-Fi ou rede movel?",
          createdAt: "2026-07-25T10:15:00.000Z",
        },
      ],
    },
  ];

  writeStorage(STORAGE_KEYS.tickets, initialTickets);
  return initialTickets;
}

function getTickets() {
  return readStorage(STORAGE_KEYS.tickets, seedTickets());
}

function saveTickets(tickets) {
  writeStorage(STORAGE_KEYS.tickets, tickets);
}

function openDocumentDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DOCUMENT_DATABASE.name, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(DOCUMENT_DATABASE.store)) {
        database.createObjectStore(DOCUMENT_DATABASE.store);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveDocumentFile(storageKey, file) {
  const database = await openDocumentDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(DOCUMENT_DATABASE.store, "readwrite");
    transaction.objectStore(DOCUMENT_DATABASE.store).put(file, storageKey);
    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
  });
}

async function readDocumentFile(storageKey) {
  const database = await openDocumentDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(DOCUMENT_DATABASE.store, "readonly");
    const request = transaction.objectStore(DOCUMENT_DATABASE.store).get(storageKey);
    request.onsuccess = () => {
      database.close();
      resolve(request.result ?? null);
    };
    request.onerror = () => {
      database.close();
      reject(request.error);
    };
  });
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function initials(name = "ViaFluxo") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function adminRoleLabel(username) {
  return FEMALE_ADMIN_USERS.has(username) ? "Administradora" : ROLE_LABELS.admin;
}

function createId() {
  return globalThis.crypto?.randomUUID?.()
    ?? `vf-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

function formatDate(value) {
  if (!value) return "Data a confirmar";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function formatDateTime(value) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusLabel(status) {
  return {
    pending: "Em analise",
    approved: "Aprovado",
    rejected: "Reprovado",
    open: "Recebendo propostas",
    assigned: "Transportador selecionado",
    "in-transit": "Em transito",
    delayed: "Atrasada",
    delivered: "Entregue",
    "awaiting-provider": "Aguardando envio",
  }[status] ?? status;
}

function ticketStatusLabel(status) {
  return {
    open: "Novo",
    "waiting-user": "Aguardando cliente",
    "waiting-admin": "Aguardando equipe",
    resolved: "Resolvido",
  }[status] ?? status;
}

function statusClass(status) {
  if (["approved", "delivered"].includes(status)) return "status-live";
  if (["pending", "assigned", "in-transit"].includes(status)) return "status-review";
  if (["delayed", "rejected"].includes(status)) return "status-danger";
  return "";
}

function approvalEmailProfileContent(user) {
  if (user.role === "company") {
    return {
      profile: "empresa embarcadora",
      headline: "Sua empresa ja pode transformar demandas em rotas.",
      steps: [
        "Publique rotas com origem, destino, carga e prazo.",
        "Compare propostas por valor, prazo e reputacao.",
        "Acompanhe contratacoes, entregas e comprovantes em um unico painel.",
      ],
    };
  }

  return {
    profile: "transportador",
    headline: "Novas oportunidades ja podem fazer parte da sua rota.",
    steps: [
      "Encontre oportunidades compativeis com seu veiculo e regiao.",
      "Envie propostas com valor e prazo estimado.",
      "Acompanhe contratacoes, entregas, repasses e sua reputacao.",
    ],
  };
}

function buildApprovalEmail(user) {
  const content = approvalEmailProfileContent(user);
  const firstName = user.fullName.split(" ")[0];
  const logoUrl = new URL("assets/brand-symbol.png", window.location.href).href;
  const loginUrl = window.location.href.split("#")[0];

  return `<!doctype html>
  <html lang="pt-BR">
  <head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Cadastro aprovado</title></head>
  <body style="margin:0;padding:0;background:#e8eef2;color:#101419;font-family:Arial,Helvetica,sans-serif;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">Sua conta foi verificada e ja pode acessar a ViaFluxo.</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#e8eef2;">
      <tr><td align="center" style="padding:30px 12px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:620px;background:#fff;border-radius:24px;overflow:hidden;">
          <tr><td style="height:8px;background:#ffc928;font-size:0;">&nbsp;</td></tr>
          <tr><td style="padding:26px 34px;background:#062b55;">
            <img src="${escapeHtml(logoUrl)}" width="46" height="46" alt="" style="display:inline-block;width:46px;height:46px;vertical-align:middle;border:0;">
            <span style="display:inline-block;margin-left:9px;color:#fff;font-size:23px;font-weight:700;vertical-align:middle;">ViaFluxo</span>
          </td></tr>
          <tr><td style="padding:38px 34px 18px;">
            <span style="display:inline-block;padding:7px 12px;border-radius:999px;background:#e4f7ee;color:#148558;font-size:12px;font-weight:700;">Verificacao concluida</span>
            <h1 style="margin:19px 0 12px;color:#062b55;font-size:32px;line-height:1.08;">Boas-vindas, ${escapeHtml(firstName)}.</h1>
            <p style="margin:0;color:#5f6b76;font-size:16px;line-height:1.65;">Analisamos seus dados e documentos. Seu cadastro como <strong style="color:#27313b;">${escapeHtml(content.profile)}</strong> foi aprovado.</p>
          </td></tr>
          <tr><td style="padding:8px 34px 20px;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #dce3e8;border-radius:18px;">
              <tr><td style="padding:23px;">
                <p style="margin:0 0 8px;color:#101419;font-size:15px;font-weight:700;">${escapeHtml(content.headline)}</p>
                ${content.steps
                  .map(
                    (step, index) =>
                      `<p style="margin:12px 0 0;color:#5f6b76;font-size:14px;line-height:1.5;"><span style="display:inline-block;width:23px;height:23px;margin-right:8px;border-radius:50%;background:#eff7ff;color:#0874df;font-size:12px;font-weight:700;line-height:23px;text-align:center;">${index + 1}</span>${escapeHtml(step)}</p>`
                  )
                  .join("")}
              </td></tr>
            </table>
          </td></tr>
          <tr><td align="center" style="padding:8px 34px 30px;">
            <a href="${escapeHtml(loginUrl)}" style="display:inline-block;padding:15px 28px;border-radius:999px;background:#0874df;color:#fff;font-size:14px;font-weight:700;text-decoration:none;">Acessar minha conta</a>
          </td></tr>
          <tr><td style="padding:20px 34px;background:#f6f8fa;border-top:1px solid #dce3e8;">
            <p style="margin:0 0 7px;color:#27313b;font-size:13px;font-weight:700;">Proteja sua conta</p>
            <p style="margin:0;color:#5f6b76;font-size:12px;line-height:1.6;">A ViaFluxo nunca solicitara sua senha por e-mail. Mantenha documentos e dados de contato atualizados.</p>
          </td></tr>
          <tr><td style="padding:24px 34px;background:#06192e;">
            <p style="margin:0 0 6px;color:#fff;font-size:13px;font-weight:700;">Movendo entregas, conectando oportunidades.</p>
            <p style="margin:0;color:#7794b1;font-size:11px;line-height:1.55;">Mensagem destinada a ${escapeHtml(user.email)} porque este cadastro foi aprovado na ViaFluxo.</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body></html>`;
}

function prepareApprovalEmail(user) {
  const subject = `${user.fullName.split(" ")[0]}, seu cadastro na ViaFluxo foi aprovado`;
  const html = buildApprovalEmail(user);
  const emails = readStorage(STORAGE_KEYS.emails, []);
  emails.unshift({
    id: createId(),
    type: "registration-approved",
    recipient: user.email,
    username: user.username,
    subject,
    html,
    status: "awaiting-provider",
    createdAt: new Date().toISOString(),
    createdBy: currentUser.username,
  });
  writeStorage(STORAGE_KEYS.emails, emails);

  currentApprovalEmailHtml = html;
  approvalEmailRecipient.textContent = `Para: ${user.fullName} <${user.email}>`;
  approvalEmailSubject.textContent = subject;
  approvalEmailPreview.srcdoc = html;

  if (documentDialog.open) documentDialog.close();
  window.setTimeout(() => openDialog(approvalEmailDialog), 0);
}

function requiredDocuments(user) {
  if (user.role === "company") {
    return [
      ["company-registration", "Contrato social ou comprovante do CNPJ"],
      ["representative", "Documento do responsavel pela conta"],
      ["address", "Comprovante de endereco da empresa"],
      ["bank", "Comprovante de dados bancarios"],
    ];
  }

  return [
    ["identity-license", "Documento pessoal e CNH"],
    ["vehicle", "CRLV e fotos do veiculo"],
    ["address", "Comprovante de endereco"],
    ["bank", "Comprovante de dados bancarios"],
  ];
}

function documentProgress(user) {
  const documents = user.documents ?? {};
  const required = requiredDocuments(user);
  return {
    sent: required.filter(([key]) => {
      const document = documents[key];
      return document && typeof document === "object" && document.storageKey;
    }).length,
    total: required.length,
  };
}

function documentName(document) {
  if (!document) return "";
  return typeof document === "string" ? document : document.name;
}

function openDialog(dialog) {
  if (dialog && !dialog.open) dialog.showModal();
}

function renderRouteWizardReview() {
  const data = Object.fromEntries(new FormData(routeForm).entries());
  routeReview.innerHTML = `
    <div><span>Trajeto</span><strong>${escapeHtml(data.origin || "Origem")} → ${escapeHtml(data.destination || "Destino")}</strong></div>
    <div><span>Carga</span><strong>${escapeHtml(data.cargo || "Nao informada")} · ${escapeHtml(data.weight || "Peso nao informado")}</strong></div>
    <div><span>Veiculo</span><strong>${escapeHtml(data.vehicle || "Nao selecionado")}</strong></div>
    <div><span>Coleta</span><strong>${formatDate(data.pickup)}</strong></div>
    <div><span>Prazo</span><strong>${escapeHtml(data.deadline || "Nao selecionado")}</strong></div>
    <div><span>Referencia</span><strong>${escapeHtml(data.reference || "Sem referencia interna")}</strong></div>
  `;
}

function setRouteWizardStep(step) {
  routeWizardStep = Math.min(3, Math.max(1, step));
  routeWizardSteps.forEach((panel) => {
    const isActive = Number(panel.dataset.routeStep) === routeWizardStep;
    panel.hidden = !isActive;
    panel.classList.toggle("is-active", isActive);
  });
  routeWizardIndicators.forEach((indicator) => {
    const indicatorStep = Number(indicator.dataset.routeStepIndicator);
    indicator.classList.toggle("is-active", indicatorStep === routeWizardStep);
    indicator.classList.toggle("is-complete", indicatorStep < routeWizardStep);
  });
  routeStepBack.hidden = routeWizardStep === 1;
  routeStepNext.hidden = routeWizardStep === 3;
  routeSubmit.hidden = routeWizardStep !== 3;
  if (routeWizardStep === 3) renderRouteWizardReview();
}

function validateRouteWizardStep() {
  const activePanel = routeWizardSteps.find((panel) => Number(panel.dataset.routeStep) === routeWizardStep);
  const invalidControl = [...activePanel.querySelectorAll("input, select, textarea")]
    .find((control) => !control.checkValidity());
  if (!invalidControl) return true;
  invalidControl.reportValidity();
  invalidControl.focus();
  return false;
}

function openRouteDialog() {
  routeForm.reset();
  if (pickupInput) pickupInput.min = new Date().toISOString().split("T")[0];
  setRouteWizardStep(1);
  openDialog(routeDialog);
}

function showToast(message) {
  window.clearTimeout(toastTimeout);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimeout = window.setTimeout(() => toast.classList.remove("is-visible"), 4200);
}

function setAuthView(view, requestedRole) {
  document.querySelectorAll(".auth-tab").forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.authTab === view);
  });
  document.querySelectorAll(".auth-view").forEach((panel) => {
    panel.classList.toggle("is-active", panel.id === `${view}-view`);
  });

  if (view === "register" && requestedRole) {
    const roleInput = registerForm.querySelector(`[name="role"][value="${requestedRole}"]`);
    if (roleInput) {
      roleInput.checked = true;
      updateRegistrationFields();
    }
  }
}

function showAuth(view = "login", requestedRole) {
  loginFeedback.textContent = "";
  registerFeedback.textContent = "";
  setAuthView(view, requestedRole);
  openDialog(authDialog);
}

function updateRegistrationFields() {
  const selectedRole = registerForm.elements.role.value;
  document.querySelectorAll(".company-field").forEach((field) => {
    field.hidden = selectedRole !== "company";
    field.querySelector("input").required = selectedRole === "company";
  });
  document.querySelectorAll(".carrier-field").forEach((field) => {
    field.hidden = selectedRole !== "carrier";
    const control = field.querySelector("input, select");
    control.required = selectedRole === "carrier";
  });
}

function resolveSession() {
  const session = readStorage(STORAGE_KEYS.session, null);
  if (!session) return null;

  if (session.role === "admin" && ADMIN_USERS[session.username]) {
    return {
      username: session.username,
      fullName: ADMIN_USERS[session.username],
      role: "admin",
      status: "approved",
    };
  }

  return getUsers().find((user) => user.username === session.username) ?? null;
}

function defaultSectionFor(user) {
  if (user.status !== "approved") return "verification";
  if (user.role === "carrier") return "overview";
  return "overview";
}

function availableNavigation(user) {
  if (user.status !== "approved") {
    return [
      ["verification", "Minha verificacao"],
      ["settings", "Configuracoes"],
    ];
  }
  return NAVIGATION[user.role];
}

function showApp(user) {
  currentUser = user;
  activeSection = defaultSectionFor(user);
  pageShell.hidden = true;
  appShell.hidden = false;
  authDialog.close();
  document.body.classList.add("app-mode");
  writeStorage(STORAGE_KEYS.session, { username: user.username, role: user.role });

  accountName.textContent = user.fullName;
  accountRole.textContent = user.role === "admin"
    ? adminRoleLabel(user.username)
    : `${ROLE_LABELS[user.role]} · ${statusLabel(user.status)}`;
  accountAvatar.textContent = initials(user.fullName);
  renderNavigation();
  renderCurrentSection();
}

function logout() {
  stopCarrierGpsTracking();
  currentUser = null;
  localStorage.removeItem(STORAGE_KEYS.session);
  appShell.hidden = true;
  pageShell.hidden = false;
  setAppMenuOpen(false);
  document.body.classList.remove("app-mode");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function mobileNavigationItems(user) {
  const preferred = {
    admin: ["overview", "registrations", "operations", "occurrences"],
    company: ["overview", "routes", "deliveries", "delivery-chat"],
    carrier: ["overview", "opportunities", "deliveries", "delivery-chat"],
  }[user.role] ?? [];
  const navigation = availableNavigation(user);
  const preferredItems = preferred
    .map((id) => navigation.find(([navigationId]) => navigationId === id))
    .filter(Boolean);
  return preferredItems.length ? preferredItems : navigation.slice(0, 4);
}

function mobileNavigationLabel(id, label) {
  const labels = {
    overview: "Inicio",
    registrations: "Cadastros",
    operations: "Operacoes",
    occurrences: "Alertas",
    routes: "Rotas",
    opportunities: "Rotas",
    deliveries: "Entregas",
    "delivery-chat": "Conversas",
    verification: "Cadastro",
    settings: "Ajustes",
  };
  return labels[id] ?? label;
}

function renderMobileNavigation() {
  if (!appMobileNav) return;
  const items = mobileNavigationItems(currentUser);
  const itemIds = new Set(items.map(([id]) => id));
  appMobileNav.innerHTML = items.map(([id, label]) => {
    const mobileLabel = mobileNavigationLabel(id, label);
    return `
      <button type="button" data-section="${id}" class="${id === activeSection ? "is-active" : ""}">
        <b aria-hidden="true">${escapeHtml(mobileLabel.slice(0, 1))}</b>
        <span>${escapeHtml(mobileLabel)}</span>
      </button>
    `;
  }).join("") + `
    <button type="button" data-mobile-menu class="${itemIds.has(activeSection) ? "" : "is-active"}">
      <b aria-hidden="true">M</b>
      <span>Menu</span>
    </button>
  `;
}

function renderNavigation() {
  appNav.replaceChildren();
  availableNavigation(currentUser).forEach(([id, label]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.dataset.section = id;
    button.textContent = label;
    button.classList.toggle("is-active", id === activeSection);
    appNav.append(button);
  });
  renderMobileNavigation();
}

function setAppMenuOpen(isOpen) {
  appShell.classList.toggle("menu-open", isOpen);
  mobileMenuButton?.setAttribute("aria-expanded", String(isOpen));
}

function navigateToAppSection(section) {
  activeSection = section;
  selectedOperationId = null;
  selectedOccurrenceId = null;
  selectedCompanyRouteId = null;
  selectedCarrierRouteId = null;
  setAppMenuOpen(false);
  renderCurrentSection();
}

function renderCurrentSection() {
  appShell.classList.toggle("support-mode", ["communications", "delivery-chat"].includes(activeSection));
  renderNavigation();
  const navigation = availableNavigation(currentUser);
  const currentLabel = navigation.find(([id]) => id === activeSection)?.[1] ?? "Painel";
  appPageTitle.textContent = currentLabel;
  appSectionLabel.textContent = ROLE_LABELS[currentUser.role];

  configurePrimaryAction();

  if (activeSection === "verification") {
    renderVerification();
    return;
  }

  if (activeSection === "settings") {
    renderSettings();
    return;
  }

  if (activeSection === "communications") {
    renderSupportSection();
    return;
  }

  if (activeSection === "delivery-chat") {
    renderDeliveryChatSection();
    return;
  }

  if (currentUser.role === "admin") {
    renderAdminSection();
  } else if (currentUser.role === "company") {
    renderCompanySection();
  } else {
    renderCarrierSection();
  }
}

function configurePrimaryAction() {
  appPrimaryAction.hidden = currentUser.status !== "approved";
  appPrimaryAction.dataset.action = "";

  if (activeSection === "communications") {
    if (currentUser.role === "admin") {
      appPrimaryAction.hidden = true;
    } else {
      appPrimaryAction.hidden = false;
      appPrimaryAction.textContent = "Novo chamado";
      appPrimaryAction.dataset.action = "new-ticket";
    }
    return;
  }

  if (activeSection === "delivery-chat") {
    appPrimaryAction.hidden = true;
    return;
  }

  if (currentUser.role === "company") {
    appPrimaryAction.textContent = "Nova rota";
    appPrimaryAction.dataset.action = "new-route";
  } else if (currentUser.role === "carrier") {
    appPrimaryAction.textContent = "Ver oportunidades";
    appPrimaryAction.dataset.action = "opportunities";
  } else {
    appPrimaryAction.hidden = !["overview", "registrations"].includes(activeSection);
    appPrimaryAction.textContent = "Analisar cadastros";
    appPrimaryAction.dataset.action = "registrations";
  }
}

function renderWelcome(title, copy, badge) {
  return `
    <section class="app-welcome">
      <div>
        <span class="verification-pill">${escapeHtml(badge)}</span>
        <h2>${escapeHtml(title)}</h2>
        <p>${escapeHtml(copy)}</p>
      </div>
    </section>
  `;
}

function renderAdminSection() {
  const users = getUsers();
  const routes = getRoutes();
  const occurrences = getOccurrences();
  const pending = users.filter((user) => user.status === "pending");
  const pendingCompanies = pending.filter((user) => user.role === "company");
  const pendingCarriers = pending.filter((user) => user.role === "carrier");

  if (activeSection === "overview") {
    const activeOperations = routes.filter((route) => ["assigned", "in-transit", "delayed"].includes(route.status));
    const openOccurrences = occurrences.filter((occurrence) => occurrence.status !== "resolved");
    const criticalOccurrences = openOccurrences.filter((occurrence) => occurrence.severity === "critical");
    appContent.innerHTML = `
      ${renderWelcome(
        `Ola, ${currentUser.fullName.split(" ")[0]}.`,
        "Acompanhe a saude da operacao e priorize o que precisa de intervencao da equipe.",
        "Acesso administrativo"
      )}
      <div class="operations-dashboard">
        <div class="operations-metrics">
          ${operationMetricCard(activeOperations.length, "Entregas em andamento", "Em toda a plataforma", "blue")}
          ${operationMetricCard(routes.filter((route) => route.status === "open").length, "Aguardando propostas", "Demandas disponiveis", "navy")}
          ${operationMetricCard(routes.filter((route) => route.status === "delayed").length, "Entregas atrasadas", "Exigem acompanhamento", "red")}
          ${operationMetricCard(criticalOccurrences.length, "Ocorrencias criticas", `${openOccurrences.length} abertas no total`, "amber")}
          ${operationMetricCard("94%", "Entregas no prazo", "Resultado dos ultimos 30 dias", "green")}
        </div>
        <div class="operations-overview-grid">
          <article class="app-card attention-card">
            <div class="card-section-head">
              <div>
                <p class="mini-label">Atencao necessaria</p>
                <h3>Prioridades da equipe</h3>
              </div>
              <span class="attention-count">${criticalOccurrences.length + routes.filter((route) => route.status === "delayed").length}</span>
            </div>
            ${renderAttentionItems(routes, occurrences, pending)}
          </article>
          <article class="app-card performance-card">
            <p class="mini-label">Desempenho mensal</p>
            <h3>Entregas no prazo</h3>
            <div class="performance-score"><strong>94%</strong><span>+3,2% comparado ao mes anterior</span></div>
            <div class="performance-bars" aria-label="Desempenho das ultimas cinco semanas">
              ${[68, 82, 76, 91, 94].map((value, index) => `<span style="--bar:${value}%"><i>S${index + 1}</i></span>`).join("")}
            </div>
          </article>
          <article class="app-card span-12 operations-watch-card">
            <div class="card-section-head">
              <div>
                <p class="mini-label">Operacao ao vivo</p>
                <h3>Entregas que merecem acompanhamento</h3>
              </div>
              <button class="table-button" type="button" data-action="go-section" data-section-target="operations">Ver todas</button>
            </div>
            ${renderOperationRows(activeOperations.slice(0, 4), true)}
          </article>
        </div>
      `;
    return;
  }

  if (activeSection === "registrations") {
    const showingCompanies = activeRegistrationFilter === "company";
    const visibleRegistrations = showingCompanies ? pendingCompanies : pendingCarriers;
    appContent.innerHTML = `
      <div class="registration-directory">
        <div class="user-directory-tabs" role="tablist" aria-label="Tipo de cadastro">
          <button class="user-directory-tab ${showingCompanies ? "is-active" : ""}" type="button" role="tab" aria-selected="${showingCompanies}" data-action="filter-registrations" data-registration-filter="company">
            Empresas <span>${pendingCompanies.length}</span>
          </button>
          <button class="user-directory-tab ${!showingCompanies ? "is-active" : ""}" type="button" role="tab" aria-selected="${!showingCompanies}" data-action="filter-registrations" data-registration-filter="carrier">
            Transportadores <span>${pendingCarriers.length}</span>
          </button>
        </div>
        <section class="registration-column registration-column-full">
          <div class="registration-column-head">
            <div>
              <p class="mini-label">${showingCompanies ? "Empresas" : "Transportadores"}</p>
              <h3>${showingCompanies ? "Contas para publicar rotas" : "Parceiros para realizar entregas"}</h3>
              <p>${showingCompanies
                ? "Analise os dados comerciais e documentos das empresas que querem contratar entregas."
                : "Verifique identidade, veiculo e documentos dos parceiros que querem receber oportunidades."}</p>
            </div>
            <span class="registration-count" aria-label="${visibleRegistrations.length} cadastros pendentes">${visibleRegistrations.length}</span>
          </div>
          ${renderRegistrationRows(
            visibleRegistrations,
            showingCompanies ? "Nenhuma empresa pendente" : "Nenhum transportador pendente",
            showingCompanies
              ? "Novas empresas aparecerao aqui para validacao comercial."
              : "Novos motoristas e transportadoras aparecerao aqui para verificacao."
          )}
        </section>
      </div>
    `;
    return;
  }

  if (activeSection === "users") {
    const companies = users.filter((user) => user.role === "company");
    const carriers = users.filter((user) => user.role === "carrier");
    const showingCompanies = activeUserDirectoryFilter === "company";
    const visibleUsers = showingCompanies ? companies : carriers;
    appContent.innerHTML = `
      <div class="user-directory">
        <div class="user-directory-tabs" role="tablist" aria-label="Tipo de usuario">
          <button class="user-directory-tab ${showingCompanies ? "is-active" : ""}" type="button" role="tab" aria-selected="${showingCompanies}" data-action="filter-users" data-user-filter="company">
            Empresas <span>${companies.length}</span>
          </button>
          <button class="user-directory-tab ${!showingCompanies ? "is-active" : ""}" type="button" role="tab" aria-selected="${!showingCompanies}" data-action="filter-users" data-user-filter="carrier">
            Transportadores <span>${carriers.length}</span>
          </button>
        </div>
        <article class="app-card span-12 user-directory-card">
          <div class="user-directory-head">
            <div>
              <p class="mini-label">${showingCompanies ? "Empresas" : "Transportadores"}</p>
              <h3>Base de usuarios</h3>
              <p>${showingCompanies
                ? "Contas que publicam rotas e contratam transportadores."
                : "Motoristas e transportadoras que recebem oportunidades e realizam entregas."}</p>
            </div>
            <span class="registration-count" aria-label="${visibleUsers.length} usuarios">${visibleUsers.length}</span>
          </div>
          ${renderUserRows(
            visibleUsers,
            showingCompanies ? "Nenhuma empresa cadastrada" : "Nenhum transportador cadastrado"
          )}
        </article>
      </div>
    `;
    return;
  }

  if (activeSection === "operations") {
    renderAdminOperations(routes);
    return;
  }

  if (activeSection === "occurrences") {
    renderAdminOccurrences(occurrences);
    return;
  }

  if (activeSection === "audit") {
    renderAdminAudit();
    return;
  }

  renderGenericSection({
    finance: ["Financeiro", "Este modulo sera conectado depois da estrutura operacional, com repasses, taxas e conciliacao."],
  }[activeSection]);
}

function operationMetricCard(value, title, detail, tone) {
  return `
    <article class="operation-metric is-${tone}">
      <span class="operation-metric-icon" aria-hidden="true"></span>
      <strong>${escapeHtml(value)}</strong>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(detail)}</p>
    </article>
  `;
}

function renderAttentionItems(routes, occurrences, pending) {
  const delayed = routes.filter((route) => route.status === "delayed");
  const critical = occurrences.filter((occurrence) => occurrence.status !== "resolved" && occurrence.severity === "critical");
  const items = [
    ...critical.map((occurrence) => ({
      tone: "red",
      title: occurrence.title,
      detail: `${occurrence.company} · ${occurrence.carrier}`,
      action: "view-occurrence",
      id: occurrence.id,
    })),
    ...delayed.map((route) => ({
      tone: "amber",
      title: `${route.origin} → ${route.destination}`,
      detail: route.lastUpdate,
      action: "view-operation",
      id: route.id,
    })),
  ];

  if (pending.length) {
    items.push({
      tone: "blue",
      title: `${pending.length} cadastro${pending.length > 1 ? "s" : ""} aguardando analise`,
      detail: "Fila de verificacao de empresas e transportadores",
      action: "go-section",
      id: "registrations",
    });
  }

  if (!items.length) return emptyState("Operacao sob controle", "Nenhuma prioridade critica neste momento.");
  return `
    <div class="attention-list">
      ${items.slice(0, 4).map((item) => `
        <button class="attention-item" type="button" data-action="${item.action}" ${item.action === "go-section" ? `data-section-target="${item.id}"` : item.action === "view-occurrence" ? `data-occurrence-id="${item.id}"` : `data-route-id="${item.id}"`}>
          <span class="attention-dot is-${item.tone}"></span>
          <span><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.detail)}</small></span>
          <i aria-hidden="true">›</i>
        </button>
      `).join("")}
    </div>
  `;
}

function renderAdminOperations(routes) {
  if (selectedOperationId) {
    const route = routes.find((item) => item.id === selectedOperationId);
    if (route) {
      appContent.innerHTML = renderOperationDetail(route);
      return;
    }
    selectedOperationId = null;
  }

  const filters = [
    ["all", "Todas"],
    ["open", "Aguardando propostas"],
    ["active", "Em andamento"],
    ["delayed", "Atrasadas"],
    ["delivered", "Entregues"],
  ];
  const visibleRoutes = routes.filter((route) => {
    if (activeOperationFilter === "all") return true;
    if (activeOperationFilter === "active") return ["assigned", "in-transit"].includes(route.status);
    return route.status === activeOperationFilter;
  });

  appContent.innerHTML = `
    <section class="module-intro">
      <div>
        <span class="verification-pill">Supervisao operacional</span>
        <h2>Operacoes da plataforma</h2>
        <p>Acompanhe rotas publicadas por empresas, entregas em andamento e situacoes que exigem intervencao.</p>
      </div>
      <div class="module-summary">
        <span><strong>${routes.length}</strong> operacoes</span>
        <span><strong>${routes.filter((route) => route.status === "delayed").length}</strong> atrasadas</span>
      </div>
    </section>
    <div class="operations-filter" role="tablist" aria-label="Filtrar operacoes">
      ${filters.map(([id, label]) => `
        <button class="${activeOperationFilter === id ? "is-active" : ""}" type="button" role="tab" aria-selected="${activeOperationFilter === id}" data-action="filter-operations" data-operation-filter="${id}">
          ${label}
        </button>
      `).join("")}
    </div>
    <article class="app-card span-12 operation-directory-card">
      <div class="card-section-head">
        <div><p class="mini-label">Monitoramento</p><h3>${visibleRoutes.length} operacoes encontradas</h3></div>
      </div>
      ${renderOperationRows(visibleRoutes)}
    </article>
  `;
}

function renderOperationRows(routes, compact = false) {
  if (!routes.length) return emptyState("Nenhuma operacao neste filtro", "As operacoes aparecerao aqui conforme avancarem.");
  return `
    <div class="operation-list ${compact ? "is-compact" : ""}">
      ${routes.map((route) => `
        <article class="operation-row ${route.status === "delayed" ? "is-delayed" : ""}">
          <div class="operation-route">
            <span class="operation-code">#${escapeHtml(route.id.replace("route-", "").toUpperCase())}</span>
            <strong>${escapeHtml(route.origin)} <i>→</i> ${escapeHtml(route.destination)}</strong>
            <small>${escapeHtml(route.companyName ?? route.owner)} · ${escapeHtml(route.cargo)}</small>
          </div>
          <div class="operation-partner">
            <small>Transportador</small>
            <strong>${escapeHtml(route.selectedCarrier ?? "Ainda nao selecionado")}</strong>
            <span>${escapeHtml(route.lastUpdate ?? `${route.proposals.length} proposta(s) recebida(s)`)}</span>
          </div>
          <div class="operation-progress">
            <span class="status ${statusClass(route.status)}">${escapeHtml(statusLabel(route.status))}</span>
            <div><i style="width:${Number(route.progress ?? (route.status === "open" ? 12 : 35))}%"></i></div>
          </div>
          <button class="table-button is-primary" type="button" data-action="view-operation" data-route-id="${route.id}">Acompanhar</button>
        </article>
      `).join("")}
    </div>
  `;
}

function renderOperationDetail(route) {
  const occurrences = getOccurrences().filter((occurrence) => occurrence.routeId === route.id);
  const timeline = route.timeline ?? [
    ["Rota publicada", formatDate(route.pickup), "done"],
    [route.selectedCarrier ? "Transportador selecionado" : "Aguardando propostas", route.selectedCarrier ?? `${route.proposals.length} propostas recebidas`, route.selectedCarrier ? "done" : "current"],
    ["Coleta confirmada", "Aguardando atualizacao", "next"],
    ["Carga em transito", "Aguardando coleta", "next"],
    ["Entrega e comprovante", "Pendente", "next"],
  ];

  return `
    <button class="module-back" type="button" data-action="close-operation-detail">← Voltar para operacoes</button>
    <section class="operation-detail-hero ${route.status === "delayed" ? "is-delayed" : ""}">
      <div>
        <span class="operation-code">#${escapeHtml(route.id.replace("route-", "").toUpperCase())}</span>
        <h2>${escapeHtml(route.origin)} <i>→</i> ${escapeHtml(route.destination)}</h2>
        <p>${escapeHtml(route.cargo)} · ${escapeHtml(route.vehicle)} · coleta em ${formatDate(route.pickup)}</p>
      </div>
      <span class="status ${statusClass(route.status)}">${escapeHtml(statusLabel(route.status))}</span>
    </section>
    <div class="operation-detail-grid">
      <article class="app-card operation-timeline-card">
        <p class="mini-label">Linha do tempo</p>
        <h3>Acompanhamento da entrega</h3>
        <div class="operation-timeline">
          ${timeline.map(([title, detail, state]) => `
            <div class="is-${state}">
              <span></span>
              <strong>${escapeHtml(title)}</strong>
              <small>${escapeHtml(detail)}</small>
            </div>
          `).join("")}
        </div>
      </article>
      <aside class="operation-side-stack">
        <article class="app-card operation-info-card">
          <p class="mini-label">Participantes</p>
          <dl>
            <div><dt>Empresa</dt><dd>${escapeHtml(route.companyName ?? route.owner)}</dd></div>
            <div><dt>Transportador</dt><dd>${escapeHtml(route.selectedCarrier ?? "Nao selecionado")}</dd></div>
            <div><dt>Valor aceito</dt><dd>${route.acceptedAmount ? formatCurrency(route.acceptedAmount) : "Em negociacao"}</dd></div>
            <div><dt>Prazo</dt><dd>${escapeHtml(route.deadline)}</dd></div>
          </dl>
        </article>
        <article class="app-card operation-info-card">
          <p class="mini-label">Documentos da entrega</p>
          <div class="document-link-list">
            <span>Ordem de coleta <b>${route.status === "open" ? "Pendente" : "Disponivel"}</b></span>
            <span>Comprovante de entrega <b>${route.status === "delivered" ? "Disponivel" : "Pendente"}</b></span>
          </div>
        </article>
      </aside>
      <article class="app-card span-12 related-occurrences">
        <div class="card-section-head"><div><p class="mini-label">Ocorrencias relacionadas</p><h3>${occurrences.length ? `${occurrences.length} registro(s)` : "Nenhuma ocorrencia"}</h3></div></div>
        ${occurrences.length ? renderOccurrenceRows(occurrences, true) : emptyState("Entrega sem ocorrencias", "Nenhum problema foi registrado nesta operacao.")}
      </article>
    </div>
  `;
}

function renderAdminOccurrences(occurrences) {
  if (selectedOccurrenceId) {
    const occurrence = occurrences.find((item) => item.id === selectedOccurrenceId);
    if (occurrence) {
      appContent.innerHTML = renderOccurrenceDetail(occurrence);
      return;
    }
    selectedOccurrenceId = null;
  }

  const filters = [["open", "Abertas"], ["in-review", "Em analise"], ["resolved", "Resolvidas"], ["all", "Todas"]];
  const visibleOccurrences = occurrences.filter((occurrence) => activeOccurrenceFilter === "all" || occurrence.status === activeOccurrenceFilter);
  const critical = occurrences.filter((occurrence) => occurrence.severity === "critical" && occurrence.status !== "resolved").length;

  appContent.innerHTML = `
    <section class="module-intro occurrence-intro">
      <div>
        <span class="verification-pill">Central de ocorrencias</span>
        <h2>Controle de problemas operacionais</h2>
        <p>Organize atrasos, avarias, cancelamentos e disputas com responsavel, prazo e historico de decisao.</p>
      </div>
      <div class="module-summary">
        <span><strong>${occurrences.filter((item) => item.status !== "resolved").length}</strong> pendentes</span>
        <span class="is-critical"><strong>${critical}</strong> criticas</span>
      </div>
    </section>
    <div class="operations-filter" role="tablist" aria-label="Filtrar ocorrencias">
      ${filters.map(([id, label]) => `
        <button class="${activeOccurrenceFilter === id ? "is-active" : ""}" type="button" role="tab" aria-selected="${activeOccurrenceFilter === id}" data-action="filter-occurrences" data-occurrence-filter="${id}">
          ${label}
        </button>
      `).join("")}
    </div>
    <article class="app-card span-12 operation-directory-card">
      ${renderOccurrenceRows(visibleOccurrences)}
    </article>
  `;
}

function occurrenceSeverityLabel(severity) {
  return { critical: "Critica", high: "Alta", medium: "Media", low: "Baixa" }[severity] ?? severity;
}

function occurrenceStatusLabel(status) {
  return { open: "Aberta", "in-review": "Em analise", resolved: "Resolvida" }[status] ?? status;
}

function renderOccurrenceRows(occurrences, compact = false) {
  if (!occurrences.length) return emptyState("Nenhuma ocorrencia neste filtro", "Novos registros aparecerao aqui para acompanhamento.");
  return `
    <div class="occurrence-list ${compact ? "is-compact" : ""}">
      ${occurrences.map((occurrence) => `
        <article class="occurrence-row">
          <span class="severity is-${escapeHtml(occurrence.severity)}">${escapeHtml(occurrenceSeverityLabel(occurrence.severity))}</span>
          <div class="occurrence-main">
            <small>${escapeHtml(occurrence.category)} · ${formatDateTime(occurrence.openedAt)}</small>
            <strong>${escapeHtml(occurrence.title)}</strong>
            <span>${escapeHtml(occurrence.company)} · ${escapeHtml(occurrence.carrier)}</span>
          </div>
          <div class="occurrence-owner">
            <small>Responsavel</small>
            <strong>${escapeHtml(ADMIN_USERS[occurrence.owner] ?? "Nao atribuido")}</strong>
            <span>${escapeHtml(occurrenceStatusLabel(occurrence.status))}</span>
          </div>
          <button class="table-button is-primary" type="button" data-action="view-occurrence" data-occurrence-id="${occurrence.id}">Analisar</button>
        </article>
      `).join("")}
    </div>
  `;
}

function renderOccurrenceDetail(occurrence) {
  return `
    <button class="module-back" type="button" data-action="close-occurrence-detail">← Voltar para ocorrencias</button>
    <section class="occurrence-detail-hero">
      <div>
        <div class="occurrence-detail-badges">
          <span class="severity is-${escapeHtml(occurrence.severity)}">${escapeHtml(occurrenceSeverityLabel(occurrence.severity))}</span>
          <span class="status status-review">${escapeHtml(occurrenceStatusLabel(occurrence.status))}</span>
        </div>
        <h2>${escapeHtml(occurrence.title)}</h2>
        <p>${escapeHtml(occurrence.category)} · aberta em ${formatDateTime(occurrence.openedAt)}</p>
      </div>
      ${occurrence.status !== "resolved" ? `
        <button class="button button-primary button-small" type="button" data-action="${occurrence.owner ? "resolve-occurrence" : "assign-occurrence"}" data-occurrence-id="${occurrence.id}">
          ${occurrence.owner ? "Marcar como resolvida" : "Assumir ocorrencia"}
        </button>
      ` : ""}
    </section>
    <div class="occurrence-detail-grid">
      <article class="app-card occurrence-description">
        <p class="mini-label">Relato</p>
        <h3>O que aconteceu</h3>
        <p>${escapeHtml(occurrence.description)}</p>
        <dl>
          <div><dt>Empresa</dt><dd>${escapeHtml(occurrence.company)}</dd></div>
          <div><dt>Transportador</dt><dd>${escapeHtml(occurrence.carrier)}</dd></div>
          <div><dt>Prazo de resposta</dt><dd>${formatDateTime(occurrence.dueAt)}</dd></div>
          <div><dt>Responsavel</dt><dd>${escapeHtml(ADMIN_USERS[occurrence.owner] ?? "Nao atribuido")}</dd></div>
        </dl>
      </article>
      <article class="app-card occurrence-evidence">
        <p class="mini-label">Evidencias</p>
        <h3>Arquivos recebidos</h3>
        ${occurrence.evidence.map((item) => `<span>${escapeHtml(item)} <b>Visualizar</b></span>`).join("")}
      </article>
      <article class="app-card span-12 occurrence-history">
        <p class="mini-label">Historico</p>
        <h3>Andamento da analise</h3>
        ${occurrence.updates.map(([title, date]) => `<div><span></span><strong>${escapeHtml(title)}</strong><small>${escapeHtml(date)}</small></div>`).join("")}
      </article>
    </div>
  `;
}

function renderAdminAudit() {
  const audits = getAudits();
  appContent.innerHTML = `
    <section class="module-intro audit-intro">
      <div>
        <span class="verification-pill">Rastreabilidade</span>
        <h2>Auditoria administrativa</h2>
        <p>Consulte quem aprovou cadastros, tratou ocorrencias e tomou decisoes dentro da plataforma.</p>
      </div>
      <div class="module-summary"><span><strong>${audits.length}</strong> eventos registrados</span></div>
    </section>
    <article class="app-card span-12 audit-card">
      <div class="audit-head"><span>Administrador</span><span>Acao realizada</span><span>Categoria</span><span>Data e hora</span></div>
      <div class="audit-list">
        ${audits.map((audit) => `
          <div class="audit-row">
            <div><span class="audit-avatar">${initials(audit.adminName)}</span><strong>${escapeHtml(audit.adminName)}</strong></div>
            <div><strong>${escapeHtml(audit.action)}</strong><small>${escapeHtml(audit.target)}</small></div>
            <span class="audit-category">${escapeHtml(audit.category)}</span>
            <time>${formatDateTime(audit.createdAt)}</time>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

function assignOccurrence(occurrenceId) {
  const occurrences = getOccurrences();
  const occurrence = occurrences.find((item) => item.id === occurrenceId);
  if (!occurrence || occurrence.status === "resolved") return;
  occurrence.owner = currentUser.username;
  occurrence.status = "in-review";
  occurrence.updates.push([`Analise assumida por ${currentUser.fullName}`, formatDateTime(new Date().toISOString())]);
  saveOccurrences(occurrences);
  logAudit("Assumiu uma ocorrencia", occurrence.title, "Ocorrencia");
  renderCurrentSection();
  showToast("Ocorrencia atribuida a voce.");
}

function resolveOccurrence(occurrenceId) {
  const occurrences = getOccurrences();
  const occurrence = occurrences.find((item) => item.id === occurrenceId);
  if (!occurrence || occurrence.status === "resolved") return;
  occurrence.status = "resolved";
  occurrence.resolvedAt = new Date().toISOString();
  occurrence.updates.push([`Ocorrencia resolvida por ${currentUser.fullName}`, formatDateTime(occurrence.resolvedAt)]);
  saveOccurrences(occurrences);
  logAudit("Resolveu uma ocorrencia", occurrence.title, "Ocorrencia");
  renderCurrentSection();
  showToast("Ocorrencia marcada como resolvida.");
}

function renderRegistrationRows(
  users,
  emptyTitle = "Nenhum cadastro pendente",
  emptyCopy = "Quando uma nova conta for criada, ela aparecera aqui para analise."
) {
  if (!users.length) {
    return emptyState(emptyTitle, emptyCopy);
  }

  return `
    <div class="app-list">
      ${users
        .map((user) => {
          const progress = documentProgress(user);
          return `
            <article class="registration-card">
              <div class="registration-card-head">
                <div>
                  <strong>${escapeHtml(user.fullName)}</strong>
                  <small>${escapeHtml(user.username)} · ${escapeHtml(user.email)}</small>
                </div>
                <span class="status status-review">Em analise</span>
              </div>
              <div class="registration-card-progress">
                <span></span>
                ${progress.sent}/${progress.total} documentos enviados
              </div>
              <div class="registration-card-actions">
                <button class="table-button is-danger" type="button" data-action="reject-user" data-username="${escapeHtml(user.username)}">Reprovar</button>
                <button class="table-button review-button" type="button" data-action="review-user" data-username="${escapeHtml(user.username)}">Analisar documentos</button>
                <button class="table-button is-primary" type="button" data-action="approve-user" data-username="${escapeHtml(user.username)}">Aprovar</button>
              </div>
            </article>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderUserRows(users, emptyTitle) {
  if (!users.length) return emptyState(emptyTitle, "Os novos cadastros deste perfil aparecerao nesta lista.");

  return `
    <div class="app-list">
      ${users
        .map(
          (user) => `
            <div class="app-list-row">
              <div><strong>${escapeHtml(user.fullName)}</strong><small>${escapeHtml(user.email)}</small></div>
              <span class="status ${statusClass(user.status)}">${escapeHtml(statusLabel(user.status))}</span>
              <div class="app-list-actions">
                <button class="table-button is-primary" type="button" data-action="review-user" data-username="${escapeHtml(user.username)}">Ver cadastro</button>
              </div>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function renderCompanySection() {
  const routes = getRoutes().filter((route) => route.owner === currentUser.username);
  const proposals = routes.reduce((total, route) => total + route.proposals.length, 0);
  const activeRoutes = routes.filter((route) => ["assigned", "in-transit", "delayed"].includes(route.status));
  const routeIds = new Set(routes.map((route) => route.id));
  const companyOccurrences = getOccurrences().filter((occurrence) => routeIds.has(occurrence.routeId));

  if (activeSection === "overview") {
    const routesWithOffers = routes.filter((route) => route.status === "open" && route.proposals.length);
    const deliveredRoutes = routes.filter((route) => route.status === "delivered");
    appContent.innerHTML = `
      ${renderWelcome(
        "Sua operacao, do pedido ao comprovante.",
        "Publique demandas, compare parceiros verificados e acompanhe cada etapa sem perder o contexto.",
        "Empresa verificada"
      )}
      <div class="company-dashboard">
        <div class="company-metrics">
          ${operationMetricCard(activeRoutes.length, "Entregas em andamento", "Coleta, transito e atrasos", "blue")}
          ${operationMetricCard(routesWithOffers.length, "Rotas com propostas", `${proposals} ofertas recebidas`, "navy")}
          ${operationMetricCard(routes.filter((route) => route.status === "delayed").length, "Entregas atrasadas", "Precisam de acompanhamento", "red")}
          ${operationMetricCard(deliveredRoutes.length, "Entregas concluidas", "Comprovantes disponiveis", "green")}
        </div>
        <div class="company-overview-grid">
          <article class="app-card company-priority-card">
            <div class="company-card-heading">
              <div><p class="mini-label">Prioridades</p><h3>O que precisa de voce</h3></div>
              <span>${routesWithOffers.length + companyOccurrences.filter((item) => item.status !== "resolved").length}</span>
            </div>
            ${renderCompanyPriorities(routesWithOffers, companyOccurrences)}
          </article>
          <article class="app-card company-quick-card">
            <p class="mini-label">Atalho operacional</p>
            <h3>Nova demanda em poucos passos</h3>
            <p>Cadastre rota, carga, prazo e requisitos. Somente transportadores compativeis poderao enviar propostas.</p>
            <button class="button button-primary" type="button" data-action="new-route">Publicar nova rota</button>
          </article>
          <article class="app-card company-recent-card">
            <div class="company-card-heading">
              <div><p class="mini-label">Operacao recente</p><h3>Ultimas rotas</h3></div>
              <button class="route-link" type="button" data-action="go-section" data-section-target="routes">Ver todas</button>
            </div>
            ${renderCompanyRouteCards(routes.slice(0, 4))}
          </article>
        </div>
      </div>
    `;
    return;
  }

  if (activeSection === "routes") {
    const filteredRoutes = routes.filter((route) => {
      if (activeCompanyRouteFilter === "open") return route.status === "open";
      if (activeCompanyRouteFilter === "active") return ["assigned", "in-transit", "delayed"].includes(route.status);
      if (activeCompanyRouteFilter === "delivered") return route.status === "delivered";
      return true;
    });
    appContent.innerHTML = `
      <section class="module-intro company-module-intro">
        <div><p class="mini-label">Gestao de demandas</p><h2>Minhas rotas</h2><p>Consulte propostas, parceiros contratados e o andamento de cada operacao.</p></div>
        <button class="button button-primary button-small" type="button" data-action="new-route">Publicar rota</button>
      </section>
      ${renderCompanyRouteFilters(routes)}
      <article class="app-card company-routes-card">
        ${renderCompanyRouteCards(filteredRoutes)}
      </article>
    `;
    return;
  }

  if (activeSection === "proposals") {
    const proposalRoutes = routes.filter((route) => route.proposals.length);
    appContent.innerHTML = `
      <section class="module-intro company-module-intro">
        <div><p class="mini-label">Central de ofertas</p><h2>Propostas recebidas</h2><p>Compare preco, prazo e reputacao antes de contratar um parceiro.</p></div>
        <div class="module-summary"><span><strong>${proposalRoutes.length}</strong> rotas com ofertas</span><span><strong>${proposals}</strong> propostas</span></div>
      </section>
      <div class="company-proposal-groups">${renderCompanyProposalGroups(proposalRoutes)}</div>
    `;
    return;
  }

  if (activeSection === "deliveries") {
    const selectedRoute = routes.find((route) => route.id === selectedCompanyRouteId);
    if (selectedRoute) {
      appContent.innerHTML = renderCompanyDeliveryDetail(selectedRoute, companyOccurrences);
      return;
    }
    const deliveryRoutes = routes.filter((route) => route.status !== "open");
    appContent.innerHTML = `
      <section class="module-intro company-module-intro">
        <div><p class="mini-label">Torre de acompanhamento</p><h2>Entregas contratadas</h2><p>Acompanhe checkpoints, prazos, ocorrencias e comprovantes em um unico lugar.</p></div>
        <div class="module-summary"><span><strong>${activeRoutes.length}</strong> em andamento</span><span><strong>${deliveryRoutes.filter((route) => route.status === "delivered").length}</strong> concluidas</span></div>
      </section>
      <article class="app-card company-routes-card">${renderCompanyRouteCards(deliveryRoutes, true)}</article>
    `;
    return;
  }

  renderGenericSection({
    finance: ["Financeiro", "Pagamentos, notas fiscais, taxas e historico financeiro da empresa."],
    team: ["Equipe", "Convide usuarios e defina quem pode publicar, contratar ou apenas acompanhar rotas."],
  }[activeSection]);
}

function renderCompanyPriorities(routesWithOffers, occurrences) {
  const items = [
    ...routesWithOffers.map((route) => ({
      tone: "blue",
      title: `${route.proposals.length} proposta(s) para comparar`,
      copy: `${route.origin} → ${route.destination}`,
      action: "compare-route",
      routeId: route.id,
      label: "Comparar",
    })),
    ...occurrences.filter((item) => item.status !== "resolved").map((occurrence) => ({
      tone: occurrence.severity === "critical" ? "red" : "amber",
      title: occurrence.title,
      copy: `Ocorrencia ${occurrenceStatusLabel(occurrence.status).toLowerCase()}`,
      action: "view-company-route",
      routeId: occurrence.routeId,
      label: "Acompanhar",
    })),
  ].slice(0, 4);

  if (!items.length) {
    return emptyState("Tudo em dia", "Nao ha propostas ou ocorrencias aguardando uma acao.");
  }

  return `<div class="company-priority-list">${items.map((item) => `
    <div class="company-priority-item is-${item.tone}">
      <i></i>
      <div><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.copy)}</small></div>
      <button class="table-button" type="button" data-action="${item.action}" data-route-id="${item.routeId}">${item.label}</button>
    </div>
  `).join("")}</div>`;
}

function renderCompanyRouteFilters(routes) {
  const filters = [
    ["all", "Todas", routes.length],
    ["open", "Recebendo propostas", routes.filter((route) => route.status === "open").length],
    ["active", "Em andamento", routes.filter((route) => ["assigned", "in-transit", "delayed"].includes(route.status)).length],
    ["delivered", "Concluidas", routes.filter((route) => route.status === "delivered").length],
  ];
  return `<div class="operations-filter company-route-filters">${filters.map(([id, label, count]) => `
    <button class="${activeCompanyRouteFilter === id ? "is-active" : ""}" type="button" data-action="filter-company-routes" data-company-route-filter="${id}">
      ${label}<span>${count}</span>
    </button>
  `).join("")}</div>`;
}

function renderCompanyRouteCards(routes, deliveryMode = false) {
  if (!routes.length) {
    return emptyState("Nenhuma rota nesta etapa", "Publique uma nova demanda ou selecione outro filtro.");
  }

  return `<div class="company-route-list">${routes.map((route) => {
    const progress = Number(route.progress ?? (route.status === "open" ? 12 : 30));
    const primaryAction = route.status === "open" && route.proposals.length
      ? `<button class="table-button is-primary" type="button" data-action="compare-route" data-route-id="${route.id}">Comparar ${route.proposals.length}</button>`
      : `<button class="table-button is-primary" type="button" data-action="view-company-route" data-route-id="${route.id}">${deliveryMode ? "Acompanhar" : "Ver detalhes"}</button>`;
    return `
      <article class="company-route-row ${route.status === "delayed" ? "is-delayed" : ""}">
        <div class="company-route-main">
          <span>${escapeHtml(route.reference || `#${route.id.replace("route-", "").slice(0, 8).toUpperCase()}`)}</span>
          <strong>${escapeHtml(route.origin)} <i>→</i> ${escapeHtml(route.destination)}</strong>
          <small>${escapeHtml(route.cargo)} · ${escapeHtml(route.vehicle)} · coleta ${formatDate(route.pickup)}</small>
        </div>
        <div class="company-route-provider">
          <small>${route.selectedCarrier ? "Transportador" : "Propostas"}</small>
          <strong>${escapeHtml(route.selectedCarrier || `${route.proposals.length} recebida(s)`)}</strong>
          <span>${escapeHtml(route.lastUpdate || route.deadline)}</span>
        </div>
        <div class="company-route-progress">
          <span class="status ${statusClass(route.status)}">${escapeHtml(statusLabel(route.status))}</span>
          <div><i style="width:${progress}%"></i></div>
        </div>
        <div class="company-route-actions">${primaryAction}</div>
      </article>
    `;
  }).join("")}</div>`;
}

function renderCompanyProposalGroups(routes) {
  if (!routes.length) {
    return emptyState("Nenhuma proposta recebida", "Quando um transportador enviar uma oferta, ela aparecera aqui.");
  }

  return routes.map((route) => {
    const ranked = [...route.proposals].sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
    const best = ranked[0];
    const lowest = Math.min(...route.proposals.map((proposal) => Number(proposal.amount)));
    return `
      <article class="app-card company-proposal-group">
        <div class="company-proposal-heading">
          <div><span>${escapeHtml(route.reference || "Rota publicada")}</span><h3>${escapeHtml(route.origin)} → ${escapeHtml(route.destination)}</h3><p>${escapeHtml(route.cargo)} · coleta ${formatDate(route.pickup)}</p></div>
          <span class="status ${statusClass(route.status)}">${escapeHtml(statusLabel(route.status))}</span>
        </div>
        <div class="company-proposal-summary">
          <div><small>Melhor score</small><strong>${escapeHtml(best.carrier)}</strong><span>${escapeHtml(best.score ?? "Novo")} pontos</span></div>
          <div><small>Menor valor</small><strong>${formatCurrency(lowest)}</strong><span>entre ${route.proposals.length} ofertas</span></div>
          <div><small>Prazo mais rapido</small><strong>${escapeHtml(best.deliveryTime)}</strong><span>consulte o comparativo</span></div>
          <button class="button button-primary button-small" type="button" data-action="compare-route" data-route-id="${route.id}">Comparar propostas</button>
        </div>
      </article>
    `;
  }).join("");
}

function renderCompanyLiveTracking(route) {
  const progress = Math.min(92, Math.max(8, Number(route.progress ?? 12)));
  const fallbackLocation = {
    open: "Aguardando contratacao do transportador",
    assigned: `Aguardando coleta em ${route.origin}`,
    "in-transit": route.id === "route-demo-2" ? "Barbacena, MG" : "Em deslocamento para o destino",
    delayed: "Parada operacional informada",
    delivered: route.destination,
  }[route.status] ?? route.origin;
  const location = route.tracking?.location || fallbackLocation;
  const updatedAt = route.tracking?.updatedAt || route.deliveredAt || route.createdAt;
  const updatedLabel = updatedAt?.includes?.("T") ? formatDateTime(updatedAt) : (updatedAt || "Aguardando atualizacao");
  const checkins = route.checkins?.length
    ? route.checkins.slice(0, 4)
    : [{
        location,
        note: route.tracking?.note || route.lastUpdate || "Operacao registrada na plataforma",
        updatedAt,
      }];
  const gpsAge = updatedAt?.includes?.("T") ? Date.now() - new Date(updatedAt).getTime() : Infinity;
  const hasGpsCoordinates = route.tracking?.source === "gps"
    && Number.isFinite(route.tracking.latitude)
    && Number.isFinite(route.tracking.longitude);
  const isLive = hasGpsCoordinates
    && ["assigned", "in-transit", "delayed"].includes(route.status)
    && gpsAge < 120000;
  const trackingBadge = isLive
    ? "GPS ao vivo"
    : ["assigned", "in-transit", "delayed"].includes(route.status)
      ? "GPS sem sinal recente"
      : statusLabel(route.status);
  const mapsUrl = hasGpsCoordinates
    ? `https://www.google.com/maps?q=${route.tracking.latitude},${route.tracking.longitude}`
    : "";

  return `
    <article class="app-card span-12 company-live-tracking">
      <div class="live-tracking-heading">
        <div>
          <span class="live-tracking-badge ${isLive ? "is-live" : ""}"><i></i>${trackingBadge}</span>
          <h3>Localizacao da entrega</h3>
          <p>${hasGpsCoordinates ? "Ultima coordenada capturada automaticamente" : "Aguardando coordenadas automaticas do dispositivo"} em ${escapeHtml(updatedLabel)}.</p>
        </div>
        <button class="table-button" type="button" data-action="refresh-company-tracking" data-route-id="${route.id}">Atualizar agora</button>
      </div>
      <div class="live-tracking-grid">
        <div class="live-route-map">
          <div class="live-map-pattern"></div>
          <div class="live-route-line"><i style="width:${progress}%"></i><span class="live-vehicle-marker" style="left:${progress}%">V</span></div>
          <div class="live-route-label is-origin"><i></i><strong>Origem</strong><small>${escapeHtml(route.origin)}</small></div>
          <div class="live-route-label is-destination"><i></i><strong>Destino</strong><small>${escapeHtml(route.destination)}</small></div>
          <div class="live-current-location"><span>Posicao atual</span><strong>${escapeHtml(location)}</strong></div>
        </div>
        <aside class="live-tracking-panel">
          <div><span>Progresso estimado</span><strong>${progress}%</strong></div>
          <div><span>Previsao contratada</span><strong>${escapeHtml(route.tracking?.eta || route.deadline)}</strong></div>
          <div><span>Transportador</span><strong>${escapeHtml(route.selectedCarrier || "Nao selecionado")}</strong></div>
          <div><span>Precisao do GPS</span><strong>${hasGpsCoordinates ? `${Math.round(route.tracking.accuracy || 0)} metros` : "Sem sinal"}</strong></div>
          ${mapsUrl ? `<a class="live-map-link" href="${mapsUrl}" target="_blank" rel="noreferrer">Abrir coordenadas no mapa</a>` : ""}
          <div class="live-checkins">
            <span>Ultimos check-ins</span>
            ${checkins.map((checkin) => `
              <div><i></i><p><strong>${escapeHtml(checkin.location)}</strong><small>${escapeHtml(checkin.note || "Localizacao atualizada")} · ${checkin.updatedAt?.includes?.("T") ? formatDateTime(checkin.updatedAt) : escapeHtml(checkin.updatedAt || "agora")}</small></p></div>
            `).join("")}
          </div>
        </aside>
      </div>
    </article>
  `;
}

function renderCompanyDeliveryDetail(route, companyOccurrences) {
  const timeline = route.timeline ?? [
    ["Rota publicada", formatDate(route.pickup), "done"],
    [route.selectedCarrier ? "Transportador selecionado" : "Aguardando propostas", route.selectedCarrier || `${route.proposals.length} proposta(s)`, route.selectedCarrier ? "done" : "current"],
    ["Coleta confirmada", "Aguardando atualizacao", "next"],
    ["Carga em transito", "Aguardando coleta", "next"],
    ["Entrega e comprovante", "Pendente", "next"],
  ];
  const occurrences = companyOccurrences.filter((occurrence) => occurrence.routeId === route.id);
  const proof = route.proof ?? (route.status === "delivered" ? {
    fileName: "comprovante-de-entrega.pdf",
    receiver: "Recebimento confirmado",
    deliveredAt: route.deliveredAt || route.lastUpdate,
  } : null);
  const proofDate = proof?.deliveredAt?.includes?.("T")
    ? formatDateTime(proof.deliveredAt)
    : proof?.deliveredAt;

  return `
    <button class="module-back" type="button" data-action="close-company-route">← Voltar para entregas</button>
    <section class="operation-detail-hero ${route.status === "delayed" ? "is-delayed" : ""}">
      <div>
        <span class="status ${statusClass(route.status)}">${escapeHtml(statusLabel(route.status))}</span>
        <h2>${escapeHtml(route.origin)} → ${escapeHtml(route.destination)}</h2>
        <p>${escapeHtml(route.reference || route.cargo)} · ${escapeHtml(route.lastUpdate || route.deadline)}</p>
      </div>
      ${route.status === "open" && route.proposals.length ? `<button class="button button-primary button-small" type="button" data-action="compare-route" data-route-id="${route.id}">Comparar propostas</button>` : ""}
    </section>
    <div class="operation-detail-grid company-delivery-detail">
      ${renderCompanyLiveTracking(route)}
      ${route.selectedCarrier ? renderEmbeddedDeliveryChat(route) : ""}
      <article class="app-card operation-timeline-card">
        <p class="mini-label">Linha do tempo</p>
        <h3>Andamento da entrega</h3>
        <div class="operation-timeline">${timeline.map(([title, detail, state]) => `
          <div class="is-${state}"><i></i><div><strong>${escapeHtml(title)}</strong><small>${escapeHtml(detail)}</small></div></div>
        `).join("")}</div>
      </article>
      <aside class="operation-side-stack">
        <article class="app-card operation-info-card">
          <p class="mini-label">Dados da contratacao</p>
          <dl>
            <div><dt>Transportador</dt><dd>${escapeHtml(route.selectedCarrier || "Nao selecionado")}</dd></div>
            <div><dt>Valor contratado</dt><dd>${route.acceptedAmount ? formatCurrency(route.acceptedAmount) : "Em negociacao"}</dd></div>
            <div><dt>Veiculo</dt><dd>${escapeHtml(route.vehicle)}</dd></div>
            <div><dt>Peso e volumes</dt><dd>${escapeHtml(route.weight || "Nao informado")} · ${escapeHtml(route.volumes || "—")}</dd></div>
            <div><dt>Prazo</dt><dd>${escapeHtml(route.deadline)}</dd></div>
          </dl>
        </article>
        <article class="app-card operation-info-card">
          <p class="mini-label">Documentos</p>
          <div class="document-link-list">
            <span>Ordem de coleta <b>Disponivel</b></span>
            <span>Comprovante de entrega <b>${proof ? "Visualizar" : "Pendente"}</b></span>
          </div>
          ${proof ? `<div class="company-proof"><strong>${escapeHtml(proof.fileName)}</strong><small>${escapeHtml(proof.receiver)} · ${escapeHtml(proofDate)}</small></div>` : ""}
        </article>
      </aside>
      <article class="app-card span-12 company-occurrence-card">
        <div class="company-card-heading">
          <div><p class="mini-label">Ocorrencias</p><h3>Registro da operacao</h3></div>
          <span>${occurrences.length}</span>
        </div>
        ${occurrences.length ? `<div class="company-occurrence-list">${occurrences.map((occurrence) => `
          <div><span class="severity is-${escapeHtml(occurrence.severity)}">${escapeHtml(occurrenceSeverityLabel(occurrence.severity))}</span><div><strong>${escapeHtml(occurrence.title)}</strong><small>${escapeHtml(occurrenceStatusLabel(occurrence.status))} · ${formatDateTime(occurrence.openedAt)}</small></div></div>
        `).join("")}</div>` : `<p class="company-no-occurrence">Nenhuma ocorrencia registrada para esta entrega.</p>`}
        <form class="company-occurrence-form" data-route-id="${route.id}">
          <h4>Abrir nova ocorrencia</h4>
          <div class="form-grid">
            <label>Categoria<select name="category" required><option value="">Selecione</option><option>Atraso</option><option>Avaria na carga</option><option>Coleta</option><option>Comprovante</option><option>Comunicacao</option></select></label>
            <label>Prioridade<select name="severity" required><option value="medium">Media</option><option value="high">Alta</option><option value="critical">Critica</option><option value="low">Baixa</option></select></label>
            <label class="form-span">Titulo<input name="title" type="text" placeholder="Resuma o que aconteceu" required></label>
            <label class="form-span">Descricao<textarea name="description" rows="3" placeholder="Informe detalhes, horarios e o impacto na operacao" required></textarea></label>
            <label class="form-span">Evidencia opcional<input name="evidence" type="file" accept="image/*,.pdf"></label>
          </div>
          <button class="button button-primary button-small" type="submit">Enviar ocorrencia</button>
        </form>
      </article>
    </div>
  `;
}

function createCompanyOccurrence(form) {
  const route = getRoutes().find((item) => item.id === form.dataset.routeId);
  if (!route || route.owner !== currentUser.username) return;
  const data = Object.fromEntries(new FormData(form).entries());
  const evidenceFile = form.elements.evidence.files[0];
  const openedAt = new Date();
  const responseHours = ["critical", "high"].includes(data.severity) ? 2 : 4;
  const dueAt = new Date(openedAt.getTime() + responseHours * 60 * 60 * 1000);
  const occurrences = getOccurrences();
  occurrences.unshift({
    id: createId(),
    routeId: route.id,
    category: data.category,
    severity: data.severity,
    status: "open",
    title: data.title,
    company: route.companyName || currentUser.fullName,
    carrier: route.selectedCarrier || "Ainda nao selecionado",
    openedAt: openedAt.toISOString(),
    dueAt: dueAt.toISOString(),
    owner: "",
    description: data.description,
    evidence: evidenceFile ? [evidenceFile.name] : [],
    updates: [["Ocorrencia registrada pela empresa", formatDateTime(openedAt.toISOString())]],
  });
  saveOccurrences(occurrences);
  renderCurrentSection();
  showToast("Ocorrencia enviada para a equipe administrativa.");
}

function renderCarrierSection() {
  const routes = getRoutes();
  const openRoutes = routes.filter((route) => route.status === "open");
  const myOffers = routes.flatMap((route) =>
    route.proposals
      .filter((proposal) => proposal.username === currentUser.username)
      .map((proposal) => ({ ...proposal, route }))
  );
  const myDeliveries = routes.filter((route) =>
    route.selectedCarrierUsername === currentUser.username
    || route.selectedCarrier === currentUser.fullName
  );
  const myVehicles = getVehicles().filter((vehicle) => vehicle.owner === currentUser.username);

  if (activeSection === "overview") {
    const activeDeliveries = myDeliveries.filter((route) => route.status !== "delivered");
    appContent.innerHTML = `
      ${renderWelcome(
        `Boa rota, ${currentUser.fullName.split(" ")[0]}.`,
        "Encontre novas oportunidades, acompanhe suas entregas e mantenha o perfil pronto para contratar.",
        "Transportador verificado"
      )}
      ${activeDeliveries.length ? renderCarrierGpsRequirement(activeDeliveries.length) : ""}
      <div class="carrier-dashboard">
        <div class="carrier-metrics">
          ${operationMetricCard(openRoutes.length, "Oportunidades abertas", "Rotas disponiveis agora", "blue")}
          ${operationMetricCard(myOffers.length, "Propostas enviadas", "Aguardando decisao da empresa", "navy")}
          ${operationMetricCard(activeDeliveries.length, "Entregas em andamento", "Operacoes contratadas", "amber")}
          ${operationMetricCard(myDeliveries.length ? "98,2" : "—", "Seu score", "Prazo, cuidado e comunicacao", "green")}
        </div>
        <div class="carrier-overview-grid">
          <article class="app-card carrier-next-card">
            <div class="company-card-heading"><div><p class="mini-label">Proxima acao</p><h3>Sua operacao agora</h3></div><span>${activeDeliveries.length}</span></div>
            ${activeDeliveries.length ? renderCarrierDeliveryRows(activeDeliveries.slice(0, 2)) : emptyState("Nenhuma entrega ativa", "Quando uma proposta for aceita, a operacao aparecera aqui.")}
          </article>
          <article class="app-card carrier-profile-card">
            <p class="mini-label">Pronto para rodar</p>
            <h3>${myVehicles.length ? `${myVehicles.length} veiculo(s) ativo(s)` : "Cadastre seu primeiro veiculo"}</h3>
            <p>Documentos validos e disponibilidade atualizada aumentam a compatibilidade com novas rotas.</p>
            <button class="button button-primary button-small" type="button" data-action="go-section" data-section-target="${myVehicles.length ? "opportunities" : "vehicles"}">${myVehicles.length ? "Ver oportunidades" : "Cadastrar veiculo"}</button>
          </article>
          <article class="app-card carrier-opportunity-preview">
            <div class="company-card-heading"><div><p class="mini-label">Oportunidades recentes</p><h3>Rotas para avaliar</h3></div><button class="route-link" type="button" data-action="go-section" data-section-target="opportunities">Ver todas</button></div>
            ${renderCarrierOpportunityCards(openRoutes.slice(0, 3), myOffers)}
          </article>
        </div>
      </div>
    `;
    return;
  }

  if (activeSection === "opportunities") {
    const selectedRoute = openRoutes.find((route) => route.id === selectedCarrierRouteId);
    if (selectedRoute) {
      appContent.innerHTML = renderCarrierOpportunityDetail(selectedRoute, myOffers);
      return;
    }
    const filteredRoutes = openRoutes.filter((route) => {
      if (activeCarrierOpportunityFilter === "all") return true;
      if (activeCarrierOpportunityFilter === "mine") {
        return myOffers.some((offer) => offer.route.id === route.id);
      }
      return route.vehicle.toLowerCase() === activeCarrierOpportunityFilter;
    });
    appContent.innerHTML = `
      <section class="module-intro carrier-module-intro">
        <div><p class="mini-label">Leiloes abertos</p><h2>Oportunidades</h2><p>Analise carga, prazo e trajeto antes de definir o valor da sua proposta.</p></div>
        <div class="module-summary"><span><strong>${openRoutes.length}</strong> disponiveis</span><span><strong>${myOffers.length}</strong> propostas enviadas</span></div>
      </section>
      ${renderCarrierOpportunityFilters(openRoutes, myOffers)}
      <article class="app-card carrier-opportunities-card">${renderCarrierOpportunityCards(filteredRoutes, myOffers)}</article>
    `;
    return;
  }

  if (activeSection === "offers") {
    appContent.innerHTML = `
      <section class="module-intro carrier-module-intro">
        <div><p class="mini-label">Historico comercial</p><h2>Minhas propostas</h2><p>Acompanhe ofertas em aberto, contratacoes e propostas encerradas.</p></div>
        <div class="module-summary"><span><strong>${myOffers.length}</strong> enviadas</span><span><strong>${myDeliveries.length}</strong> contratadas</span></div>
      </section>
      <div class="carrier-offer-list">${renderCarrierOfferCards(myOffers)}</div>
    `;
    return;
  }

  if (activeSection === "deliveries") {
    const selectedRoute = myDeliveries.find((route) => route.id === selectedCarrierRouteId);
    if (selectedRoute) {
      appContent.innerHTML = renderCarrierDeliveryDetail(selectedRoute);
      return;
    }
    appContent.innerHTML = `
      <section class="module-intro carrier-module-intro">
        <div><p class="mini-label">Rotas contratadas</p><h2>Minhas entregas</h2><p>Confirme a coleta, informe o andamento e finalize com o comprovante.</p></div>
        <div class="module-summary"><span><strong>${myDeliveries.filter((route) => route.status !== "delivered").length}</strong> em andamento</span><span><strong>${myDeliveries.filter((route) => route.status === "delivered").length}</strong> concluidas</span></div>
      </section>
      <article class="app-card carrier-deliveries-card">${renderCarrierDeliveryRows(myDeliveries)}</article>
    `;
    return;
  }

  if (activeSection === "vehicles") {
    appContent.innerHTML = renderCarrierVehicles(myVehicles);
    return;
  }

  if (activeSection === "documents") {
    appContent.innerHTML = renderDocumentCenter();
    return;
  }

  if (activeSection === "reviews") {
    appContent.innerHTML = renderCarrierReviews(myDeliveries);
    return;
  }

  renderGenericSection({
    finance: ["Financeiro", "Repasses, saldo disponivel, dados bancarios e comprovantes."],
  }[activeSection]);
}

function renderCarrierOpportunityFilters(routes, offers) {
  const filters = [
    ["all", "Todas", routes.length],
    ["utilitario", "Utilitario", routes.filter((route) => route.vehicle.toLowerCase() === "utilitario").length],
    ["van", "Van", routes.filter((route) => route.vehicle.toLowerCase() === "van").length],
    ["pickup", "Pickup", routes.filter((route) => route.vehicle.toLowerCase() === "pickup").length],
    ["mine", "Com proposta", offers.length],
  ];
  return `<div class="operations-filter carrier-opportunity-filters">${filters.map(([id, label, count]) => `
    <button class="${activeCarrierOpportunityFilter === id ? "is-active" : ""}" type="button" data-action="filter-carrier-opportunities" data-carrier-filter="${id}">
      ${label}<span>${count}</span>
    </button>
  `).join("")}</div>`;
}

function renderCarrierOpportunityCards(routes, offers) {
  if (!routes.length) {
    return emptyState("Nenhuma oportunidade neste filtro", "Novas demandas compativeis aparecerao assim que forem publicadas.");
  }

  return `<div class="carrier-opportunity-list">${routes.map((route) => {
    const myOffer = offers.find((offer) => offer.route.id === route.id);
    return `
      <article class="carrier-opportunity-row">
        <div class="carrier-opportunity-route">
          <span>${escapeHtml(route.vehicle)} · coleta ${formatDate(route.pickup)}</span>
          <strong>${escapeHtml(route.origin)} <i>→</i> ${escapeHtml(route.destination)}</strong>
          <small>${escapeHtml(route.cargo)} · ${escapeHtml(route.weight || "Peso a confirmar")} · ${escapeHtml(route.volumes || "—")} volume(s)</small>
        </div>
        <div class="carrier-opportunity-condition">
          <small>Prazo solicitado</small>
          <strong>${escapeHtml(route.deadline)}</strong>
          <span>${route.budget ? `Referencia ${formatCurrency(route.budget)}` : "Valor aberto para proposta"}</span>
        </div>
        <div class="carrier-opportunity-state">
          <span class="status ${myOffer ? "status-review" : ""}">${myOffer ? "Proposta enviada" : "Disponivel"}</span>
          ${myOffer ? `<small>${formatCurrency(myOffer.amount)} · ${escapeHtml(myOffer.deliveryTime)}</small>` : `<small>${route.proposals.length} proposta(s) no leilao</small>`}
        </div>
        <button class="table-button is-primary" type="button" data-action="view-carrier-opportunity" data-route-id="${route.id}">${myOffer ? "Revisar" : "Analisar"}</button>
      </article>
    `;
  }).join("")}</div>`;
}

function renderCarrierOpportunityDetail(route, offers) {
  const myOffer = offers.find((offer) => offer.route.id === route.id);
  return `
    <button class="module-back" type="button" data-action="close-carrier-route">← Voltar para oportunidades</button>
    <section class="carrier-opportunity-hero">
      <div>
        <span class="verification-pill">Oportunidade verificada</span>
        <h2>${escapeHtml(route.origin)} → ${escapeHtml(route.destination)}</h2>
        <p>${escapeHtml(route.companyName || route.owner)} · coleta ${formatDate(route.pickup)} · ${escapeHtml(route.deadline)}</p>
      </div>
      <button class="button button-primary" type="button" data-action="offer-route" data-route-id="${route.id}">${myOffer ? "Editar proposta" : "Enviar proposta"}</button>
    </section>
    <div class="carrier-opportunity-detail-grid">
      <article class="app-card carrier-cargo-card">
        <p class="mini-label">Detalhes da carga</p>
        <h3>O que sera transportado</h3>
        <dl>
          <div><dt>Tipo de carga</dt><dd>${escapeHtml(route.cargo)}</dd></div>
          <div><dt>Peso aproximado</dt><dd>${escapeHtml(route.weight || "A confirmar")}</dd></div>
          <div><dt>Volumes</dt><dd>${escapeHtml(route.volumes || "A confirmar")}</dd></div>
          <div><dt>Dimensoes</dt><dd>${escapeHtml(route.dimensions || "Nao informadas")}</dd></div>
          <div><dt>Valor declarado</dt><dd>${route.cargoValue ? formatCurrency(route.cargoValue) : "Nao informado"}</dd></div>
          <div><dt>Cuidado especial</dt><dd>${escapeHtml(route.handling || "Carga comum")}</dd></div>
        </dl>
      </article>
      <article class="app-card carrier-requirement-card">
        <p class="mini-label">Requisitos</p>
        <h3>Condicoes da operacao</h3>
        <div><span>Veiculo</span><strong>${escapeHtml(route.vehicle)}</strong></div>
        <div><span>Coleta</span><strong>${formatDate(route.pickup)}</strong></div>
        <div><span>Prazo</span><strong>${escapeHtml(route.deadline)}</strong></div>
        <div><span>Contato liberado</span><strong>Apos contratacao</strong></div>
      </article>
      <article class="app-card span-12 carrier-route-notes">
        <p class="mini-label">Orientacoes da empresa</p>
        <h3>Observacoes operacionais</h3>
        <p>${escapeHtml(route.notes || "A empresa nao adicionou observacoes para esta rota.")}</p>
        ${myOffer ? `<div class="carrier-current-offer"><span>Sua proposta atual</span><strong>${formatCurrency(myOffer.amount)}</strong><small>${escapeHtml(myOffer.deliveryTime)}</small></div>` : ""}
      </article>
    </div>
  `;
}

function renderCarrierOfferCards(offers) {
  if (!offers.length) {
    return emptyState("Nenhuma proposta enviada", "Abra Oportunidades para encontrar uma rota compativel.");
  }
  return offers.map((offer) => {
    const contracted = offer.route.selectedCarrierUsername === currentUser.username
      || offer.route.selectedCarrier === currentUser.fullName;
    return `
      <article class="app-card carrier-offer-card ${contracted ? "is-contracted" : ""}">
        <div>
          <span>${contracted ? "Proposta contratada" : "Proposta enviada"}</span>
          <h3>${escapeHtml(offer.route.origin)} → ${escapeHtml(offer.route.destination)}</h3>
          <p>${escapeHtml(offer.route.cargo)} · ${escapeHtml(offer.route.vehicle)} · coleta ${formatDate(offer.route.pickup)}</p>
        </div>
        <dl><div><dt>Seu valor</dt><dd>${formatCurrency(offer.amount)}</dd></div><div><dt>Seu prazo</dt><dd>${escapeHtml(offer.deliveryTime)}</dd></div><div><dt>Status</dt><dd>${contracted ? "Contratada" : statusLabel(offer.route.status)}</dd></div></dl>
        <button class="table-button is-primary" type="button" data-action="${contracted ? "view-carrier-delivery" : "offer-route"}" data-route-id="${offer.route.id}">${contracted ? "Acompanhar entrega" : "Editar proposta"}</button>
      </article>
    `;
  }).join("");
}

function renderCarrierDeliveryRows(routes) {
  if (!routes.length) {
    return emptyState("Nenhuma entrega contratada", "As propostas aceitas pelas empresas aparecerao nesta area.");
  }
  return `<div class="carrier-delivery-list">${routes.map((route) => `
    <article class="carrier-delivery-row ${route.status === "delayed" ? "is-delayed" : ""}">
      <div><span>${escapeHtml(route.companyName || route.owner)}</span><strong>${escapeHtml(route.origin)} <i>→</i> ${escapeHtml(route.destination)}</strong><small>${escapeHtml(route.cargo)} · ${escapeHtml(route.lastUpdate || route.deadline)}</small></div>
      <div><span class="status ${statusClass(route.status)}">${escapeHtml(statusLabel(route.status))}</span><small>${route.acceptedAmount ? formatCurrency(route.acceptedAmount) : "Valor confirmado"}</small></div>
      <button class="table-button is-primary" type="button" data-action="view-carrier-delivery" data-route-id="${route.id}">Acompanhar</button>
    </article>
  `).join("")}</div>`;
}

function renderCarrierDeliveryDetail(route) {
  const timeline = route.timeline ?? [];
  const canConfirmPickup = route.status === "assigned";
  const canDeliver = ["in-transit", "delayed"].includes(route.status);
  const gpsActive = isCarrierGpsActive();
  return `
    <button class="module-back" type="button" data-action="close-carrier-route">← Voltar para entregas</button>
    <section class="operation-detail-hero ${route.status === "delayed" ? "is-delayed" : ""}">
      <div><span class="status ${statusClass(route.status)}">${escapeHtml(statusLabel(route.status))}</span><h2>${escapeHtml(route.origin)} → ${escapeHtml(route.destination)}</h2><p>${escapeHtml(route.companyName || route.owner)} · ${escapeHtml(route.lastUpdate || route.deadline)}</p></div>
      ${canConfirmPickup ? `<button class="button button-primary" type="button" data-action="${gpsActive ? "carrier-confirm-pickup" : "enable-carrier-gps"}" data-route-id="${route.id}">${gpsActive ? "Confirmar coleta" : "Ativar GPS para coletar"}</button>` : ""}
    </section>
    ${["assigned", "in-transit", "delayed"].includes(route.status) ? renderCarrierGpsRequirement(1) : ""}
    <div class="operation-detail-grid carrier-delivery-detail">
      <article class="app-card operation-timeline-card">
        <p class="mini-label">Andamento</p><h3>Etapas da entrega</h3>
        <div class="operation-timeline">${timeline.map(([title, detail, state]) => `<div class="is-${state}"><i></i><div><strong>${escapeHtml(title)}</strong><small>${escapeHtml(detail)}</small></div></div>`).join("")}</div>
      </article>
      <aside class="operation-side-stack">
        <article class="app-card operation-info-card">
          <p class="mini-label">Resumo da operacao</p>
          <dl><div><dt>Empresa</dt><dd>${escapeHtml(route.companyName || route.owner)}</dd></div><div><dt>Carga</dt><dd>${escapeHtml(route.cargo)}</dd></div><div><dt>Veiculo</dt><dd>${escapeHtml(route.vehicle)}</dd></div><div><dt>Valor</dt><dd>${route.acceptedAmount ? formatCurrency(route.acceptedAmount) : "Confirmado"}</dd></div><div><dt>Prazo</dt><dd>${escapeHtml(route.deadline)}</dd></div></dl>
        </article>
        <article class="app-card carrier-contact-card">
          <p class="mini-label">Contato operacional</p><h3>${escapeHtml(route.contactName || "Responsavel pela coleta")}</h3><p>${escapeHtml(route.contactPhone || "Contato disponibilizado pela empresa")}</p>
        </article>
      </aside>
      ${renderEmbeddedDeliveryChat(route)}
      ${canDeliver && gpsActive ? `
        <article class="app-card span-12 carrier-checkin-card">
          <div><p class="mini-label">Rastreamento compartilhado</p><h3>Atualizar localizacao</h3><p>A empresa recebera este check-in imediatamente no acompanhamento da entrega.</p></div>
          <form class="carrier-tracking-form" data-route-id="${route.id}">
            <div class="carrier-gps-coordinate"><span>Coordenadas do dispositivo</span><strong>${escapeHtml(route.tracking?.location || "Capturando GPS...")}</strong><small>Precisao: ${Math.round(carrierGpsState.accuracy || 0)} metros</small></div>
            <label>Observacao<input name="note" type="text" placeholder="Ex.: Transito normal, sem ocorrencias"></label>
            <label>Nova previsao<input name="eta" type="text" placeholder="Ex.: Hoje, 18:30" value="${escapeHtml(route.tracking?.eta || "")}"></label>
            <button class="button button-primary button-small" type="submit">Enviar check-in</button>
          </form>
        </article>
        <article class="app-card span-12 carrier-proof-card">
          <div><p class="mini-label">Finalizar entrega</p><h3>Envie o comprovante</h3><p>Informe quem recebeu e anexe uma foto ou PDF legivel.</p></div>
          <form class="carrier-proof-form" data-route-id="${route.id}">
            <label>Nome de quem recebeu<input name="receiver" type="text" required></label>
            <label>Comprovante<input name="proof" type="file" accept="image/*,.pdf" required></label>
            <button class="button button-primary button-small" type="submit">Confirmar entrega</button>
          </form>
        </article>
      ` : ""}
      ${route.status === "delivered" ? `<article class="app-card span-12 carrier-delivered-card"><span>Entrega concluida</span><div><strong>${escapeHtml(route.proof?.fileName || "Comprovante enviado")}</strong><small>${escapeHtml(route.proof?.receiver || "Recebimento confirmado")} · ${route.deliveredAt ? formatDateTime(route.deliveredAt) : "Finalizada"}</small></div></article>` : ""}
    </div>
  `;
}

function renderCarrierVehicles(vehicles) {
  return `
    <section class="module-intro carrier-module-intro">
      <div><p class="mini-label">Frota cadastrada</p><h2>Meus veiculos</h2><p>Mantenha capacidade, disponibilidade e documentos sempre atualizados.</p></div>
      <div class="module-summary"><span><strong>${vehicles.length}</strong> cadastrados</span><span><strong>${vehicles.filter((vehicle) => vehicle.status === "available").length}</strong> disponiveis</span></div>
    </section>
    <div class="carrier-vehicle-grid">
      ${vehicles.map((vehicle) => `
        <article class="app-card carrier-vehicle-card">
          <div class="carrier-vehicle-icon">V</div>
          <span class="status ${vehicle.status === "available" ? "status-live" : "status-review"}">${vehicle.status === "available" ? "Disponivel" : "Indisponivel"}</span>
          <h3>${escapeHtml(vehicle.model)}</h3><p>${escapeHtml(vehicle.type)} · ${escapeHtml(vehicle.year)}</p>
          <dl><div><dt>Placa</dt><dd>${escapeHtml(vehicle.plate)}</dd></div><div><dt>Capacidade</dt><dd>${escapeHtml(vehicle.capacity)}</dd></div><div><dt>Documentos</dt><dd>${vehicle.documentStatus === "valid" ? "Validos" : "Revisar"}</dd></div></dl>
          <button class="table-button" type="button" data-action="toggle-carrier-vehicle" data-vehicle-id="${vehicle.id}">${vehicle.status === "available" ? "Marcar indisponivel" : "Marcar disponivel"}</button>
        </article>
      `).join("")}
      <article class="app-card carrier-vehicle-form-card">
        <p class="mini-label">Novo veiculo</p><h3>Adicionar a frota</h3>
        <form class="carrier-vehicle-form">
          <label>Modelo<input name="model" type="text" placeholder="Ex.: Fiat Fiorino" required></label>
          <label>Placa<input name="plate" type="text" placeholder="ABC-1D23" required></label>
          <label>Tipo<select name="type" required><option value="">Selecione</option><option>Utilitario</option><option>Van</option><option>Pickup</option><option>VUC</option><option>Caminhao leve</option></select></label>
          <label>Capacidade<input name="capacity" type="text" placeholder="Ex.: 650 kg" required></label>
          <label>Ano<input name="year" type="number" min="1980" max="2030" required></label>
          <button class="button button-primary button-small" type="submit">Cadastrar veiculo</button>
        </form>
      </article>
    </div>
  `;
}

function renderCarrierReviews(deliveries) {
  const completed = deliveries.filter((route) => route.status === "delivered").length;
  return `
    <section class="carrier-reputation-hero">
      <div><p class="mini-label">Reputacao</p><h2>${deliveries.length ? "98,2" : "—"}</h2><span>Score operacional</span></div>
      <p>O score considera pontualidade, cuidado com a carga, comprovantes e comunicacao durante a entrega.</p>
    </section>
    <div class="carrier-review-grid">
      <article class="app-card carrier-score-breakdown">
        <p class="mini-label">Desempenho</p><h3>Seus indicadores</h3>
        <div><span>Pontualidade</span><strong>${completed ? "98%" : "Sem dados"}</strong><i><b style="width:${completed ? 98 : 0}%"></b></i></div>
        <div><span>Cuidado com a carga</span><strong>${completed ? "100%" : "Sem dados"}</strong><i><b style="width:${completed ? 100 : 0}%"></b></i></div>
        <div><span>Comunicacao</span><strong>${completed ? "96%" : "Sem dados"}</strong><i><b style="width:${completed ? 96 : 0}%"></b></i></div>
      </article>
      <article class="app-card carrier-review-comments">
        <p class="mini-label">Avaliacoes recebidas</p><h3>O que as empresas dizem</h3>
        ${completed ? `<blockquote>“Coleta pontual, boa comunicacao e comprovante enviado rapidamente.”<footer>Alvorada Autopecas · 5,0</footer></blockquote>` : emptyState("Ainda sem avaliacoes", "As avaliacoes aparecerao apos suas primeiras entregas.")}
      </article>
    </div>
  `;
}

function carrierOwnsRoute(route) {
  return route
    && (route.selectedCarrierUsername === currentUser.username || route.selectedCarrier === currentUser.fullName);
}

function isCarrierGpsActive() {
  return carrierGpsState.status === "active" && carrierGpsWatchId !== null;
}

function renderCarrierGpsRequirement(activeDeliveryCount = 1) {
  const isActive = isCarrierGpsActive();
  const isRequesting = carrierGpsState.status === "requesting";
  const statusLabelText = {
    active: "GPS ativo e compartilhando",
    requesting: "Aguardando autorizacao",
    denied: "Permissao de GPS bloqueada",
    unavailable: "Localizacao indisponivel",
    unsupported: "GPS nao suportado",
    idle: "GPS obrigatorio",
  }[carrierGpsState.status] || "GPS obrigatorio";
  const detail = isActive
    ? `Precisao aproximada de ${Math.round(carrierGpsState.accuracy || 0)} metros · ${activeDeliveryCount} entrega(s) monitorada(s).`
    : carrierGpsState.message;

  return `
    <section class="app-card carrier-gps-gate ${isActive ? "is-active" : "is-blocked"}">
      <div class="carrier-gps-icon"><i></i></div>
      <div><span>${statusLabelText}</span><strong>${isActive ? "Localizacao enviada automaticamente" : "Ative a localizacao para operar"}</strong><p>${escapeHtml(detail)}</p></div>
      ${isActive ? `<span class="carrier-gps-live"><i></i> Ao vivo</span>` : `<button class="button button-primary button-small" type="button" data-action="enable-carrier-gps" ${isRequesting ? "disabled" : ""}>${isRequesting ? "Ativando..." : "Ativar GPS"}</button>`}
    </section>
  `;
}

function syncCarrierGpsPosition(position) {
  const now = Date.now();
  if (now - carrierGpsLastWriteAt < 8000) return;
  carrierGpsLastWriteAt = now;
  const { latitude, longitude, accuracy } = position.coords;
  const updatedAt = new Date(position.timestamp || now).toISOString();
  const routes = getRoutes();
  let changed = false;
  routes.forEach((route) => {
    if (!carrierOwnsRoute(route) || !["assigned", "in-transit", "delayed"].includes(route.status)) return;
    route.tracking = {
      ...route.tracking,
      source: "gps",
      latitude,
      longitude,
      accuracy,
      location: `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
      updatedAt,
      eta: route.tracking?.eta || route.deadline,
      note: route.tracking?.note || "Localizacao capturada automaticamente pelo GPS",
    };
    route.lastUpdate = "GPS atualizado agora";
    changed = true;
  });
  if (changed) saveRoutes(routes);
}

function enableCarrierGpsTracking() {
  if (!currentUser || currentUser.role !== "carrier") return;
  if (!navigator.geolocation) {
    carrierGpsState = {
      status: "unsupported",
      accuracy: null,
      updatedAt: null,
      message: "Este navegador nao oferece acesso a geolocalizacao.",
    };
    renderCurrentSection();
    return;
  }
  if (carrierGpsWatchId !== null) navigator.geolocation.clearWatch(carrierGpsWatchId);
  carrierGpsState = {
    status: "requesting",
    accuracy: null,
    updatedAt: null,
    message: "Autorize o uso da localizacao precisa no navegador.",
  };
  renderCurrentSection();
  carrierGpsWatchId = navigator.geolocation.watchPosition(
    (position) => {
      const wasActive = carrierGpsState.status === "active";
      carrierGpsState = {
        status: "active",
        accuracy: position.coords.accuracy,
        updatedAt: new Date(position.timestamp).toISOString(),
        message: "Localizacao precisa compartilhada durante a entrega.",
      };
      syncCarrierGpsPosition(position);
      if (!wasActive) {
        renderCurrentSection();
        showToast("GPS ativo. Sua localizacao esta sendo compartilhada com a empresa.");
      }
    },
    (error) => {
      carrierGpsState = {
        status: error.code === 1 ? "denied" : "unavailable",
        accuracy: null,
        updatedAt: null,
        message: error.code === 1
          ? "Permita a localizacao nas configuracoes do navegador para continuar."
          : "Nao foi possivel obter uma posicao precisa. Verifique o GPS e tente novamente.",
      };
      carrierGpsWatchId = null;
      renderCurrentSection();
    },
    {
      enableHighAccuracy: true,
      maximumAge: 5000,
      timeout: 15000,
    }
  );
}

function stopCarrierGpsTracking() {
  if (carrierGpsWatchId !== null && navigator.geolocation) {
    navigator.geolocation.clearWatch(carrierGpsWatchId);
  }
  carrierGpsWatchId = null;
  carrierGpsLastWriteAt = 0;
  carrierGpsState = {
    status: "idle",
    accuracy: null,
    updatedAt: null,
    message: "Ative o GPS para iniciar uma entrega.",
  };
}

function confirmCarrierPickup(routeId) {
  const routes = getRoutes();
  const route = routes.find((item) => item.id === routeId);
  if (!carrierOwnsRoute(route) || route.status !== "assigned") return;
  if (!isCarrierGpsActive()) {
    showToast("Ative o GPS antes de confirmar a coleta.");
    return;
  }
  const now = new Date().toISOString();
  route.status = "in-transit";
  route.progress = 58;
  route.lastUpdate = "Coleta confirmada agora";
  route.tracking = {
    ...route.tracking,
    note: "Carga coletada e viagem iniciada",
    eta: route.tracking?.eta || route.deadline,
  };
  route.checkins = [
    {
      location: route.tracking.location,
      note: "Coleta confirmada pelo transportador com GPS ativo",
      updatedAt: now,
    },
    ...(route.checkins || []),
  ];
  route.timeline = [
    ["Rota publicada", formatDate(route.pickup), "done"],
    ["Transportador selecionado", route.selectedCarrier, "done"],
    ["Coleta confirmada", formatDateTime(now), "done"],
    ["Carga em transito", "Em andamento", "current"],
    ["Entrega e comprovante", "Pendente", "next"],
  ];
  saveRoutes(routes);
  renderCurrentSection();
  showToast("Coleta confirmada. A empresa ja pode acompanhar o transito.");
}

function updateCarrierTracking(form) {
  const routes = getRoutes();
  const route = routes.find((item) => item.id === form.dataset.routeId);
  if (!carrierOwnsRoute(route) || !["in-transit", "delayed"].includes(route.status)) return;
  if (!isCarrierGpsActive() || route.tracking?.source !== "gps") {
    showToast("O GPS precisa estar ativo para enviar um check-in.");
    return;
  }
  const data = Object.fromEntries(new FormData(form).entries());
  const updatedAt = new Date().toISOString();
  route.progress = Math.min(90, Math.max(60, Number(route.progress || 58) + 6));
  route.lastUpdate = "Check-in confirmado com GPS agora";
  route.tracking = {
    ...route.tracking,
    note: data.note || "Deslocamento em andamento",
    eta: data.eta || route.tracking?.eta || route.deadline,
  };
  route.checkins = [
    {
      location: route.tracking.location,
      note: data.note || "Localizacao atualizada pelo transportador",
      updatedAt,
    },
    ...(route.checkins || []),
  ].slice(0, 12);
  saveRoutes(routes);
  renderCurrentSection();
  showToast("Check-in enviado. A empresa ja recebeu a nova localizacao.");
}

function completeCarrierDelivery(form) {
  const routes = getRoutes();
  const route = routes.find((item) => item.id === form.dataset.routeId);
  if (!carrierOwnsRoute(route) || !["in-transit", "delayed"].includes(route.status)) return;
  if (!isCarrierGpsActive() || route.tracking?.source !== "gps") {
    showToast("Ative o GPS para confirmar o local da entrega.");
    return;
  }
  const proofFile = form.elements.proof.files[0];
  const receiver = form.elements.receiver.value.trim();
  const deliveredAt = new Date().toISOString();
  route.status = "delivered";
  route.progress = 100;
  route.deliveredAt = deliveredAt;
  route.lastUpdate = "Entregue com comprovante";
  route.tracking = {
    ...route.tracking,
    note: "Entrega concluida",
    eta: "Concluida",
  };
  route.checkins = [
    {
      location: route.tracking.location,
      note: `Recebido por ${receiver}`,
      updatedAt: deliveredAt,
    },
    ...(route.checkins || []),
  ].slice(0, 12);
  route.proof = {
    fileName: proofFile.name,
    receiver,
    deliveredAt,
  };
  route.timeline = [
    ["Rota publicada", formatDate(route.pickup), "done"],
    ["Transportador selecionado", route.selectedCarrier, "done"],
    ["Coleta confirmada", "Concluida", "done"],
    ["Carga em transito", "Concluida", "done"],
    ["Entrega e comprovante", formatDateTime(deliveredAt), "done"],
  ];
  saveRoutes(routes);
  const hasAnotherActiveDelivery = routes.some((item) =>
    item.id !== route.id
    && carrierOwnsRoute(item)
    && ["assigned", "in-transit", "delayed"].includes(item.status)
  );
  if (!hasAnotherActiveDelivery) stopCarrierGpsTracking();
  renderCurrentSection();
  showToast("Entrega concluida e comprovante registrado.");
}

function addCarrierVehicle(form) {
  const data = Object.fromEntries(new FormData(form).entries());
  const vehicles = getVehicles();
  vehicles.unshift({
    id: createId(),
    owner: currentUser.username,
    model: data.model,
    plate: data.plate.trim().toUpperCase(),
    type: data.type,
    capacity: data.capacity,
    year: data.year,
    status: "available",
    documentStatus: "valid",
  });
  saveVehicles(vehicles);
  renderCurrentSection();
  showToast("Veiculo cadastrado e marcado como disponivel.");
}

function toggleCarrierVehicle(vehicleId) {
  const vehicles = getVehicles();
  const vehicle = vehicles.find((item) => item.id === vehicleId && item.owner === currentUser.username);
  if (!vehicle) return;
  vehicle.status = vehicle.status === "available" ? "unavailable" : "available";
  saveVehicles(vehicles);
  renderCurrentSection();
  showToast(`Veiculo marcado como ${vehicle.status === "available" ? "disponivel" : "indisponivel"}.`);
}

function canAccessDeliveryChat(route) {
  if (!route?.selectedCarrier) return false;
  if (currentUser.role === "company") return route.owner === currentUser.username;
  if (currentUser.role === "carrier") {
    return route.selectedCarrierUsername === currentUser.username
      || route.selectedCarrier === currentUser.fullName;
  }
  return false;
}

function deliveryChatPartner(route) {
  if (currentUser.role === "company") {
    return {
      name: route.selectedCarrier,
      role: "Transportador responsavel",
    };
  }
  return {
    name: route.companyName || route.owner,
    role: "Empresa contratante",
  };
}

function renderDeliveryChatSection() {
  const routes = getRoutes()
    .filter((route) => canAccessDeliveryChat(route))
    .sort((a, b) => {
      const aDate = a.conversation?.at(-1)?.createdAt || a.createdAt;
      const bDate = b.conversation?.at(-1)?.createdAt || b.createdAt;
      return new Date(bDate) - new Date(aDate);
    });

  if (!routes.some((route) => route.id === selectedDeliveryChatRouteId)) {
    selectedDeliveryChatRouteId = routes[0]?.id ?? null;
  }

  const selectedRoute = routes.find((route) => route.id === selectedDeliveryChatRouteId);

  appContent.innerHTML = `
    <section class="delivery-chat-workspace">
      <aside class="delivery-chat-inbox">
        <div class="delivery-chat-inbox-head">
          <div>
            <p class="mini-label">Arquivo operacional</p>
            <h2>Historico</h2>
          </div>
          <span class="support-count">${routes.length}</span>
        </div>
        <p class="delivery-chat-guidance">Consulte as mensagens de cada entrega. Para responder, abra a entrega correspondente.</p>
        <div class="delivery-chat-route-list">
          ${routes.length ? routes.map((route) => renderDeliveryChatRouteItem(route)).join("") : renderDeliveryChatInboxEmpty()}
        </div>
      </aside>
      <section class="delivery-chat-conversation">
        ${selectedRoute ? renderDeliveryChatConversation(selectedRoute, true) : renderDeliveryChatConversationEmpty()}
      </section>
    </section>
  `;
}

function renderDeliveryChatRouteItem(route) {
  const partner = deliveryChatPartner(route);
  const lastMessage = route.conversation?.at(-1);
  return `
    <button class="delivery-chat-route ${route.id === selectedDeliveryChatRouteId ? "is-active" : ""}" type="button" data-action="select-delivery-chat" data-route-id="${route.id}">
      <span class="delivery-chat-route-top">
        <strong>${escapeHtml(partner.name)}</strong>
        <span class="status ${statusClass(route.status)}">${escapeHtml(statusLabel(route.status))}</span>
      </span>
      <span class="delivery-chat-route-path">${escapeHtml(route.origin)} <i>→</i> ${escapeHtml(route.destination)}</span>
      <span class="delivery-chat-route-preview">${escapeHtml(lastMessage?.text || "Conversa pronta para comecar.")}</span>
      <small>${lastMessage ? formatDateTime(lastMessage.createdAt) : escapeHtml(route.reference || route.cargo)}</small>
    </button>
  `;
}

function renderDeliveryChatConversation(route, historyOnly = false) {
  const partner = deliveryChatPartner(route);
  const messages = route.conversation ?? [];
  return `
    <header class="delivery-chat-head">
      <div>
        <div class="delivery-chat-partner">
          <span>${escapeHtml(initials(partner.name))}</span>
          <div><strong>${escapeHtml(partner.name)}</strong><small>${escapeHtml(partner.role)}</small></div>
        </div>
        <p>${escapeHtml(route.origin)} → ${escapeHtml(route.destination)} · ${escapeHtml(route.reference || route.cargo)}</p>
      </div>
      ${historyOnly ? `<button class="table-button is-primary" type="button" data-action="${currentUser.role === "company" ? "view-company-route" : "view-carrier-delivery"}" data-route-id="${route.id}">Abrir entrega</button>` : ""}
    </header>
    <div class="delivery-chat-messages">
      ${messages.length
        ? messages.map((message) => renderDeliveryChatMessage(message)).join("")
        : `<div class="delivery-chat-first-message"><strong>Conversa iniciada</strong><span>Envie a primeira mensagem para alinhar os detalhes desta operacao.</span></div>`}
    </div>
    ${historyOnly
      ? `<div class="delivery-chat-history-note"><strong>Historico somente para consulta</strong><span>Abra a entrega para continuar esta conversa.</span></div>`
      : renderDeliveryChatComposer(route, partner)}
  `;
}

function renderEmbeddedDeliveryChat(route) {
  const partner = deliveryChatPartner(route);
  const messages = route.conversation ?? [];
  return `
    <article class="app-card span-12 delivery-chat-embedded">
      <header class="delivery-chat-embedded-head">
        <div>
          <p class="mini-label">Comunicacao operacional</p>
          <h3>Chat da entrega</h3>
          <span>Conversa direta com ${escapeHtml(partner.name)}</span>
        </div>
        <div class="delivery-chat-partner">
          <span>${escapeHtml(initials(partner.name))}</span>
          <div><strong>${escapeHtml(partner.name)}</strong><small>${escapeHtml(partner.role)}</small></div>
        </div>
      </header>
      <div class="delivery-chat-messages">
        ${messages.length
          ? messages.map((message) => renderDeliveryChatMessage(message)).join("")
          : `<div class="delivery-chat-first-message"><strong>Conversa iniciada</strong><span>Envie a primeira mensagem para alinhar os detalhes desta operacao.</span></div>`}
      </div>
      ${route.status === "delivered"
        ? `<div class="delivery-chat-history-note"><strong>Conversa arquivada</strong><span>Esta entrega foi concluida. O historico permanece disponivel em Conversas.</span></div>`
        : renderDeliveryChatComposer(route, partner)}
    </article>
  `;
}

function renderDeliveryChatComposer(route, partner) {
  return `
    <form class="delivery-chat-form" data-route-id="${route.id}">
      <label for="delivery-chat-message">Mensagem para ${escapeHtml(partner.name)}</label>
      <div>
        <textarea id="delivery-chat-message" name="message" rows="2" maxlength="1200" placeholder="Escreva sobre coleta, acesso ao local, previsao ou entrega..." required></textarea>
        <button class="button button-primary button-small" type="submit">Enviar</button>
      </div>
      <small>Use o Suporte para duvidas sobre a plataforma ou para relatar problemas tecnicos.</small>
    </form>
  `;
}

function renderDeliveryChatMessage(message) {
  if (message.senderRole === "system") {
    return `<div class="delivery-chat-system">${escapeHtml(message.text)}</div>`;
  }
  const isMine = message.senderUsername === currentUser.username;
  return `
    <article class="delivery-chat-message ${isMine ? "is-mine" : ""}">
      <div><strong>${escapeHtml(isMine ? "Voce" : message.senderName)}</strong><time>${formatDateTime(message.createdAt)}</time></div>
      <p>${escapeHtml(message.text)}</p>
    </article>
  `;
}

function renderDeliveryChatInboxEmpty() {
  return `
    <div class="delivery-chat-empty">
      <strong>Nenhuma conversa disponivel</strong>
      <span>O canal sera criado quando uma empresa contratar um transportador.</span>
    </div>
  `;
}

function renderDeliveryChatConversationEmpty() {
  return `
    <div class="delivery-chat-empty is-conversation">
      <strong>Historico de conversas</strong>
      <span>As mensagens das entregas contratadas aparecerao aqui para consulta.</span>
    </div>
  `;
}

function sendDeliveryChatMessage(routeId, text) {
  const routes = getRoutes();
  const route = routes.find((item) => item.id === routeId);
  if (!route || !canAccessDeliveryChat(route)) return;
  if (route.status === "delivered") {
    showToast("Esta conversa foi arquivada porque a entrega ja foi concluida.");
    return;
  }

  route.conversation = route.conversation ?? [];
  route.conversation.push({
    id: createId(),
    senderUsername: currentUser.username,
    senderName: currentUser.fullName,
    senderRole: currentUser.role,
    text: text.trim(),
    createdAt: new Date().toISOString(),
  });
  saveRoutes(routes);
  selectedDeliveryChatRouteId = route.id;
  renderCurrentSection();
  showToast("Mensagem enviada para o parceiro da entrega.");
}

function renderSupportSection() {
  const allTickets = getTickets().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  const tickets = currentUser.role === "admin"
    ? allTickets
    : allTickets.filter((ticket) => ticket.ownerUsername === currentUser.username);

  if (!tickets.some((ticket) => ticket.id === selectedSupportTicketId)) {
    selectedSupportTicketId = tickets[0]?.id ?? null;
  }

  const selectedTicket = tickets.find((ticket) => ticket.id === selectedSupportTicketId);
  const openCount = tickets.filter((ticket) => ticket.status !== "resolved").length;

  appContent.innerHTML = `
    <section class="support-workspace">
      <aside class="support-inbox">
        <div class="support-inbox-head">
          <div>
            <p class="mini-label">${currentUser.role === "admin" ? "Caixa de entrada" : "Meus atendimentos"}</p>
            <h2>Chamados</h2>
          </div>
          <span class="support-count">${openCount}</span>
        </div>
        ${
          currentUser.role !== "admin"
            ? '<button class="button button-primary button-small support-new-ticket" type="button" data-action="new-ticket">Abrir novo chamado</button>'
            : ""
        }
        <div class="support-ticket-list">
          ${tickets.length ? tickets.map((ticket) => renderTicketListItem(ticket)).join("") : renderSupportInboxEmpty()}
        </div>
      </aside>
      <section class="support-conversation">
        ${selectedTicket ? renderTicketConversation(selectedTicket) : renderSupportConversationEmpty()}
      </section>
    </section>
  `;
}

function renderTicketListItem(ticket) {
  const lastMessage = ticket.messages.at(-1);
  return `
    <button class="support-ticket ${ticket.id === selectedSupportTicketId ? "is-active" : ""}" type="button" data-action="select-ticket" data-ticket-id="${ticket.id}">
      <span class="support-ticket-topline">
        <span class="support-category">${escapeHtml(ticket.category)}</span>
        <small>${formatDateTime(ticket.updatedAt)}</small>
      </span>
      <strong>${escapeHtml(ticket.subject)}</strong>
      <span class="support-ticket-preview">${escapeHtml(lastMessage?.text ?? "")}</span>
      <span class="support-ticket-bottom">
        <small>${escapeHtml(ticket.ownerName)}</small>
        <span class="support-ticket-status is-${escapeHtml(ticket.status)}">${escapeHtml(ticketStatusLabel(ticket.status))}</span>
      </span>
    </button>
  `;
}

function renderTicketConversation(ticket) {
  const canReply = ticket.status !== "resolved";
  const statusAction = currentUser.role === "admin"
    ? `<button class="table-button" type="button" data-action="toggle-ticket-status" data-ticket-id="${ticket.id}">
        ${ticket.status === "resolved" ? "Reabrir chamado" : "Marcar como resolvido"}
      </button>`
    : "";

  return `
    <header class="support-conversation-head">
      <div>
        <div class="support-conversation-meta">
          <span>${escapeHtml(ticket.category)}</span>
          <span class="support-ticket-status is-${escapeHtml(ticket.status)}">${escapeHtml(ticketStatusLabel(ticket.status))}</span>
        </div>
        <h2>${escapeHtml(ticket.subject)}</h2>
        <p>${escapeHtml(ticket.ownerName)} · ${escapeHtml(ROLE_LABELS[ticket.ownerRole])} · aberto em ${formatDateTime(ticket.createdAt)}</p>
      </div>
      ${statusAction}
    </header>
    <div class="support-messages">
      ${ticket.messages
        .map(
          (message) => `
            <article class="support-message ${message.senderRole === "admin" ? "is-admin" : "is-customer"}">
              <div>
                <strong>${escapeHtml(message.senderName)}</strong>
                <time>${formatDateTime(message.createdAt)}</time>
              </div>
              <p>${escapeHtml(message.text)}</p>
            </article>
          `
        )
        .join("")}
    </div>
    ${
      canReply
        ? `
          <form class="support-reply-form" data-ticket-id="${ticket.id}">
            <label for="support-reply">Responder chamado</label>
            <div>
              <textarea id="support-reply" name="reply" rows="3" maxlength="1800" placeholder="${currentUser.role === "admin" ? "Escreva uma resposta clara para o solicitante..." : "Adicione informações ou responda à equipe..."}" required></textarea>
              <button class="button button-primary button-small" type="submit">Enviar resposta</button>
            </div>
          </form>
        `
        : `
          <div class="support-resolved">
            <strong>Chamado resolvido</strong>
            <span>${currentUser.role === "admin" ? "Reabra o atendimento se ainda houver alguma pendencia." : "Se precisar de nova ajuda, abra outro chamado."}</span>
          </div>
        `
    }
  `;
}

function renderSupportInboxEmpty() {
  return `
    <div class="support-inbox-empty">
      <strong>Nenhum chamado</strong>
      <span>${currentUser.role === "admin" ? "Novas mensagens aparecerao aqui." : "Use o botao acima para falar com a ViaFluxo."}</span>
    </div>
  `;
}

function renderSupportConversationEmpty() {
  return `
    <div class="support-conversation-empty">
      <strong>Central de atendimento</strong>
      <span>Selecione um chamado para acompanhar a conversa.</span>
    </div>
  `;
}

function createSupportTicket(data) {
  if (currentUser.role === "admin") return null;
  const tickets = getTickets();
  const now = new Date().toISOString();
  const ticket = {
    id: createId(),
    ownerUsername: currentUser.username,
    ownerName: currentUser.fullName,
    ownerRole: currentUser.role,
    category: data.category,
    subject: data.subject.trim(),
    status: "waiting-admin",
    createdAt: now,
    updatedAt: now,
    messages: [
      {
        senderRole: currentUser.role,
        senderName: currentUser.fullName,
        text: data.message.trim(),
        createdAt: now,
      },
    ],
  };
  tickets.unshift(ticket);
  saveTickets(tickets);
  selectedSupportTicketId = ticket.id;
  return ticket;
}

function replyToTicket(ticketId, text) {
  const tickets = getTickets();
  const ticket = tickets.find((item) => item.id === ticketId);
  if (!ticket || (currentUser.role !== "admin" && ticket.ownerUsername !== currentUser.username)) return;

  const now = new Date().toISOString();
  ticket.messages.push({
    senderRole: currentUser.role,
    senderName: currentUser.role === "admin" ? "Equipe ViaFluxo" : currentUser.fullName,
    text: text.trim(),
    createdAt: now,
  });
  ticket.status = currentUser.role === "admin" ? "waiting-user" : "waiting-admin";
  ticket.updatedAt = now;
  saveTickets(tickets);
  renderSupportSection();
  showToast("Resposta enviada no chamado.");
}

function toggleTicketStatus(ticketId) {
  if (currentUser.role !== "admin") return;
  const tickets = getTickets();
  const ticket = tickets.find((item) => item.id === ticketId);
  if (!ticket) return;
  ticket.status = ticket.status === "resolved" ? "waiting-admin" : "resolved";
  ticket.updatedAt = new Date().toISOString();
  saveTickets(tickets);
  renderSupportSection();
  showToast(ticket.status === "resolved" ? "Chamado marcado como resolvido." : "Chamado reaberto.");
}

function renderRouteRows(routes, mode) {
  if (!routes.length) {
    const action = mode === "company"
      ? '<button class="table-button is-primary" type="button" data-action="new-route">Publicar primeira rota</button>'
      : "";
    return emptyState("Nenhuma rota por aqui", `As novas demandas aparecerao nesta area.${action}`);
  }

  return `
    <div class="app-list">
      ${routes
        .map((route) => {
          const action =
            mode === "carrier"
              ? `<button class="table-button is-primary" type="button" data-action="offer-route" data-route-id="${route.id}">Enviar proposta</button>`
              : mode === "company" && route.proposals.length
                ? `<button class="table-button is-primary" type="button" data-action="compare-route" data-route-id="${route.id}">Comparar ${route.proposals.length}</button>`
                : "";

          return `
            <div class="app-list-row">
              <div>
                <strong>${escapeHtml(route.origin)} → ${escapeHtml(route.destination)}</strong>
                <small>${escapeHtml(route.cargo)} · ${escapeHtml(route.vehicle)} · ${formatDate(route.pickup)}</small>
              </div>
              <span class="status ${statusClass(route.status)}">${escapeHtml(statusLabel(route.status))}</span>
              <div class="app-list-actions">${action}</div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderOfferRows(offers) {
  if (!offers.length) {
    return emptyState("Nenhuma proposta enviada", "Abra Oportunidades para encontrar uma rota compativel.");
  }

  return `
    <div class="app-list">
      ${offers
        .map(
          ({ route, amount, deliveryTime }) => `
            <div class="app-list-row">
              <div><strong>${escapeHtml(route.origin)} → ${escapeHtml(route.destination)}</strong><small>${escapeHtml(route.cargo)}</small></div>
              <span>${formatCurrency(amount)} · ${escapeHtml(deliveryTime)}</span>
              <span class="status ${statusClass(route.status)}">${escapeHtml(statusLabel(route.status))}</span>
            </div>
          `
        )
        .join("")}
    </div>
  `;
}

function metricCard(value, caption) {
  return `
    <article class="app-card">
      <p class="mini-label">Indicador</p>
      <strong class="metric-value">${escapeHtml(value)}</strong>
      <span class="metric-caption">${escapeHtml(caption)}</span>
    </article>
  `;
}

function emptyState(title, copy) {
  return `<div class="empty-state"><div><strong>${escapeHtml(title)}</strong><span>${copy}</span></div></div>`;
}

function renderVerification() {
  const roleCopy = currentUser.role === "company"
    ? "Validaremos CNPJ, responsaveis, endereco e dados comerciais."
    : "Validaremos identidade, CNH, veiculo, regioes atendidas e dados bancarios.";

  appContent.innerHTML = `
    <div class="verification-layout">
      <section class="verification-status">
        <span class="verification-pill">${escapeHtml(statusLabel(currentUser.status))}</span>
        <h2>Seu cadastro esta sendo verificado.</h2>
        <p>${escapeHtml(roleCopy)} Enquanto isso, voce pode revisar seus dados e acompanhar o andamento.</p>
      </section>
      <section class="verification-checklist">
        <p class="mini-label">Etapas da liberacao</p>
        ${requiredDocuments(currentUser)
          .map(([key, label]) => verificationUploadItem(key, label, currentUser.documents?.[key]))
          .join("")}
        ${verificationItem("Aceite dos termos de uso", "Recebido")}
      </section>
    </div>
  `;
}

function verificationItem(label, status) {
  return `<div class="verification-item"><span>${escapeHtml(label)}</span><small>${escapeHtml(status)}</small></div>`;
}

function verificationUploadItem(key, label, fileName) {
  const savedName = documentName(fileName);
  return `
    <div class="verification-item">
      <div>
        <span>${escapeHtml(label)}</span>
        <small>${savedName ? escapeHtml(savedName) : "Arquivo ainda nao enviado"}</small>
      </div>
      <button class="table-button ${savedName ? "" : "is-primary"}" type="button" data-action="upload-document" data-document-key="${escapeHtml(key)}">
        ${savedName ? "Substituir" : "Enviar"}
      </button>
    </div>
  `;
}

function renderDocumentCenter() {
  return `
    <div class="verification-layout">
      <section class="verification-status">
        <span class="verification-pill">Documentacao ativa</span>
        <h2>Mantenha seu perfil pronto para novas rotas.</h2>
        <p>Documentos vencidos podem bloquear automaticamente o envio de propostas.</p>
      </section>
      <section class="verification-checklist">
        <p class="mini-label">Documentos do transportador</p>
        ${verificationItem("Documento pessoal ou empresarial", "Validado")}
        ${verificationItem("CNH e categoria", "Validado")}
        ${verificationItem("CRLV do veiculo", "Validado")}
        ${verificationItem("Seguro ou termo de responsabilidade", "Revisar em 30 dias")}
        ${verificationItem("Dados bancarios", "Validado")}
      </section>
    </div>
  `;
}

function renderSettings() {
  appContent.innerHTML = `
    <div class="app-grid">
      <article class="app-card span-8">
        <p class="mini-label">Conta e preferencias</p>
        <h3>Dados do perfil</h3>
        <div class="app-list">
          <div class="app-list-row"><strong>Nome</strong><span>${escapeHtml(currentUser.fullName)}</span><button class="table-button" type="button">Editar</button></div>
          <div class="app-list-row"><strong>Usuario</strong><span>${escapeHtml(currentUser.username)}</span><button class="table-button" type="button">Alterar senha</button></div>
          <div class="app-list-row"><strong>Perfil</strong><span>${escapeHtml(ROLE_LABELS[currentUser.role])}</span><span class="status ${statusClass(currentUser.status)}">${escapeHtml(statusLabel(currentUser.status))}</span></div>
        </div>
      </article>
      <article class="app-card">
        <p class="mini-label">Seguranca</p>
        <h3>Acesso da conta</h3>
        <p>Ative verificacao em duas etapas e acompanhe dispositivos conectados quando o backend for integrado.</p>
      </article>
    </div>
    ${currentUser.role === "admin" ? '<p class="security-note">As credenciais administrativas fixas existem somente neste prototipo. Na versao real, as senhas devem ser protegidas no servidor, com hash, recuperacao segura e autenticacao em dois fatores.</p>' : ""}
  `;
}

function renderGenericSection(content) {
  const [title, copy] = content ?? ["Em construcao", "Esta area faz parte da arquitetura planejada para a ViaFluxo."];
  appContent.innerHTML = `
    <article class="app-card span-12">
      <p class="mini-label">Modulo do produto</p>
      <h3>${escapeHtml(title)}</h3>
      <p>${escapeHtml(copy)}</p>
      ${emptyState("Estrutura preparada", "Os dados reais deste modulo serao conectados na etapa de backend.")}
    </article>
  `;
}

function approveOrRejectUser(username, status) {
  const users = getUsers();
  const user = users.find((item) => item.username === username);
  if (!user) return;

  if (status === "approved") {
    const progress = documentProgress(user);
    if (progress.sent < progress.total) {
      showToast(`Aprovacao bloqueada: faltam ${progress.total - progress.sent} documento(s).`);
      return;
    }
  }

  user.status = status;
  user.reviewedBy = currentUser.username;
  user.reviewedAt = new Date().toISOString();
  saveUsers(users);
  logAudit(
    status === "approved" ? "Aprovou um cadastro" : "Reprovou um cadastro",
    `${user.fullName} · ${ROLE_LABELS[user.role]}`,
    "Cadastro"
  );
  showToast(`${user.fullName} foi ${status === "approved" ? "aprovado" : "reprovado"}.`);
  renderCurrentSection();
  if (status === "approved") prepareApprovalEmail(user);
}

function renderDocumentPreviewEmpty(title, copy) {
  documentPreview.innerHTML = `
    <div class="document-preview-empty">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(copy)}</span>
    </div>
  `;
}

async function previewDocument(username, documentKey) {
  const user = getUsers().find((item) => item.username === username);
  const metadata = user?.documents?.[documentKey];
  documentReviewList.querySelectorAll(".document-review-item").forEach((item) => {
    item.classList.toggle("is-active", item.dataset.documentKey === documentKey);
  });

  if (!metadata || typeof metadata === "string" || !metadata.storageKey) {
    renderDocumentPreviewEmpty(
      "Previa indisponivel",
      metadata
        ? "Este arquivo foi enviado em uma versao anterior do prototipo. Solicite o reenvio."
        : "O usuario ainda nao enviou este documento."
    );
    return;
  }

  try {
    const file = await readDocumentFile(metadata.storageKey);
    if (!file) {
      renderDocumentPreviewEmpty("Arquivo nao encontrado", "Solicite ao usuario que envie o documento novamente.");
      return;
    }

    if (currentPreviewUrl) URL.revokeObjectURL(currentPreviewUrl);
    currentPreviewUrl = URL.createObjectURL(file);

    if (file.type === "application/pdf") {
      documentPreview.innerHTML = `<iframe src="${currentPreviewUrl}" title="${escapeHtml(metadata.name)}"></iframe>`;
    } else if (file.type.startsWith("image/")) {
      documentPreview.innerHTML = `<img src="${currentPreviewUrl}" alt="${escapeHtml(metadata.name)}">`;
    } else {
      renderDocumentPreviewEmpty("Formato sem previa", "O documento foi recebido, mas este formato nao pode ser exibido.");
    }
  } catch {
    renderDocumentPreviewEmpty("Nao foi possivel abrir", "Tente fechar a janela e analisar o documento novamente.");
  }
}

function openDocumentReview(username) {
  const user = getUsers().find((item) => item.username === username);
  if (!user) return;

  selectedReviewUsername = username;
  const progress = documentProgress(user);
  documentDialogTitle.textContent = user.fullName;
  documentUserMeta.textContent = `${ROLE_LABELS[user.role]} · ${statusLabel(user.status)} · ${progress.sent}/${progress.total} documentos enviados`;
  documentUserDetails.innerHTML = renderUserDetails(user);
  documentReviewList.innerHTML = requiredDocuments(user)
    .map(([key, label]) => {
      const metadata = user.documents?.[key];
      const savedName = documentName(metadata);
      const hasPreview = metadata && typeof metadata === "object" && metadata.storageKey;
      const extension = savedName.includes(".") ? savedName.split(".").pop().slice(0, 4).toUpperCase() : "DOC";
      return `
        <button class="document-review-item" type="button" data-document-key="${escapeHtml(key)}">
          <span class="document-review-icon">${escapeHtml(extension || "DOC")}</span>
          <span>
            <strong>${escapeHtml(label)}</strong>
            <small>${savedName ? escapeHtml(savedName) : "Nao enviado"}</small>
          </span>
          <span class="document-review-state ${hasPreview ? "" : "is-missing"}" aria-hidden="true"></span>
        </button>
      `;
    })
    .join("");

  renderDocumentPreviewEmpty("Selecione um documento", "O arquivo escolhido aparecera aqui para conferencia.");
  documentApprove.disabled = progress.sent < progress.total;
  documentApprove.title = progress.sent < progress.total
    ? `Faltam ${progress.total - progress.sent} documento(s) obrigatorio(s)`
    : "";
  documentDecisionActions.hidden = user.status !== "pending";
  documentReviewNote.textContent = user.status === "pending"
    ? "Confira dados, legibilidade, validade, titularidade e compatibilidade dos documentos antes de tomar uma decisao."
    : "Consulta completa do cadastro e dos documentos armazenados para esta conta.";
  openDialog(documentDialog);
}

function renderUserDetails(user) {
  const commonDetails = [
    ["Nome completo", user.fullName],
    ["Usuario", user.username],
    ["E-mail", user.email],
    ["Telefone", user.phone],
    ["Situacao", statusLabel(user.status)],
    ["Cadastro criado", user.createdAt ? formatDateTime(user.createdAt) : "Nao informado"],
  ];
  const profileDetails = user.role === "company"
    ? [
        ["Razao social", user.companyName || "Nao informado"],
        ["CNPJ", user.companyDocument || "Nao informado"],
      ]
    : [
        ["CPF ou CNPJ", user.carrierDocument || "Nao informado"],
        ["Veiculo principal", user.vehicle || "Nao informado"],
      ];

  return [...commonDetails, ...profileDetails]
    .map(
      ([label, value]) => `
        <div class="document-user-detail">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
        </div>
      `
    )
    .join("");
}

function uploadDocument(documentKey) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".pdf,.png,.jpg,.jpeg";
  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;

    const users = getUsers();
    const user = users.find((item) => item.username === currentUser.username);
    if (!user) return;

    const storageKey = `${user.username}:${documentKey}`;
    try {
      await saveDocumentFile(storageKey, file);
      user.documents = {
        ...(user.documents ?? {}),
        [documentKey]: {
          name: file.name,
          type: file.type,
          size: file.size,
          storageKey,
          uploadedAt: new Date().toISOString(),
        },
      };
      saveUsers(users);
      currentUser = user;
      renderVerification();
      const progress = documentProgress(user);
      showToast(`Documento recebido. Progresso: ${progress.sent}/${progress.total}.`);
    } catch {
      showToast("Nao foi possivel salvar o arquivo. Tente novamente.");
    }
  });
  input.click();
}

function openProposalComparison(routeId) {
  const route = getRoutes().find((item) => item.id === routeId);
  if (!route) return;
  selectedRouteId = routeId;
  proposalRouteName.textContent = `${route.origin} → ${route.destination}`;

  if (!route.proposals.length) {
    proposalList.innerHTML = emptyState("Ainda sem propostas", "Transportadores compativeis receberao esta oportunidade.");
  } else {
    proposalList.innerHTML = route.proposals
      .map(
        (proposal, index) => `
          <article class="proposal-card ${index === 0 ? "is-recommended" : ""}">
            <div class="proposal-profile">
              <span class="proposal-avatar">${initials(proposal.carrier)}</span>
              <div><strong>${escapeHtml(proposal.carrier)}</strong><small>Perfil verificado</small></div>
            </div>
            <dl>
              <div><dt>Proposta</dt><dd>${formatCurrency(proposal.amount)}</dd></div>
              <div><dt>Prazo</dt><dd>${escapeHtml(proposal.deliveryTime)}</dd></div>
              <div><dt>Score</dt><dd>${escapeHtml(proposal.score ?? "Novo")}</dd></div>
            </dl>
            <span class="recommendation">${index === 0 ? "Melhor equilibrio" : "Proposta recebida"}</span>
            <button class="button ${index === 0 ? "button-primary" : "button-cancel"} js-select-proposal" type="button" data-proposal-index="${index}" ${route.status !== "open" ? "disabled" : ""}>
              ${route.status === "open" ? "Selecionar" : route.selectedCarrier === proposal.carrier ? "Contratada" : "Encerrada"}
            </button>
          </article>
        `
      )
      .join("");
  }
  openDialog(proposalDialog);
}

function openOfferForm(routeId) {
  const route = getRoutes().find((item) => item.id === routeId);
  if (!route) return;
  selectedRouteId = routeId;
  offerRouteName.textContent = `${route.origin} → ${route.destination}`;
  offerForm.reset();
  const existingProposal = route.proposals.find((proposal) => proposal.username === currentUser.username);
  if (existingProposal) {
    offerForm.elements.amount.value = existingProposal.amount;
    offerForm.elements.deliveryTime.value = existingProposal.deliveryTime;
    offerForm.elements.message.value = existingProposal.message || "";
  }
  openDialog(offerDialog);
}

document.querySelectorAll(".section, .hero-card, .hero-copy").forEach((item) => {
  item.classList.add("reveal");
  const observer = new IntersectionObserver(
    ([entry]) => entry.isIntersecting && entry.target.classList.add("is-visible"),
    { threshold: 0.12 }
  );
  observer.observe(item);
});

document.querySelectorAll(".js-open-auth").forEach((button) => {
  button.addEventListener("click", () => showAuth(button.dataset.authView, button.dataset.role));
});

document.querySelectorAll(".auth-tab").forEach((tab) => {
  tab.addEventListener("click", () => setAuthView(tab.dataset.authTab));
});

document.querySelectorAll('[name="role"]').forEach((input) => {
  input.addEventListener("change", updateRegistrationFields);
});

document.querySelectorAll(".js-close-dialog").forEach((button) => {
  button.addEventListener("click", () => button.closest("dialog")?.close());
});

document.querySelectorAll("dialog").forEach((dialog) => {
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  loginFeedback.textContent = "";
  const data = Object.fromEntries(new FormData(loginForm).entries());
  const username = data.username.trim().toLowerCase();

  if (ADMIN_USERS[username] && data.password === "admin") {
    showApp({
      username,
      fullName: ADMIN_USERS[username],
      role: "admin",
      status: "approved",
    });
    loginForm.reset();
    return;
  }

  const user = getUsers().find((item) => item.username === username);
  if (!user || user.password !== data.password) {
    loginFeedback.textContent = "Usuario ou senha incorretos.";
    return;
  }

  showApp(user);
  loginForm.reset();
});

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  registerFeedback.textContent = "";
  if (!registerForm.reportValidity()) return;

  const data = Object.fromEntries(new FormData(registerForm).entries());
  const username = data.username.trim().toLowerCase();
  const users = getUsers();

  if (!/^[a-z0-9._-]{3,}$/.test(username)) {
    registerFeedback.textContent = "Use apenas letras minusculas, numeros, ponto, hifen ou underline no usuario.";
    return;
  }
  if (ADMIN_USERS[username] || users.some((user) => user.username === username)) {
    registerFeedback.textContent = "Este nome de usuario ja esta em uso.";
    return;
  }
  if (data.password !== data.passwordConfirm) {
    registerFeedback.textContent = "As senhas informadas nao sao iguais.";
    return;
  }

  const user = {
    id: createId(),
    username,
    password: data.password,
    fullName: data.fullName.trim(),
    email: data.email.trim(),
    phone: data.phone.trim(),
    role: data.role,
    companyName: data.companyName?.trim() ?? "",
    companyDocument: data.companyDocument?.trim() ?? "",
    carrierDocument: data.carrierDocument?.trim() ?? "",
    vehicle: data.vehicle ?? "",
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  saveUsers(users);
  registerForm.reset();
  updateRegistrationFields();
  showApp(user);
  showToast("Cadastro enviado. A equipe administrativa agora pode iniciar a verificacao.");
});

document.querySelector("#forgot-password").addEventListener("click", () => {
  loginFeedback.textContent = "A recuperacao por e-mail sera habilitada quando o backend for conectado.";
});

appNav.addEventListener("click", (event) => {
  const button = event.target.closest("[data-section]");
  if (!button) return;
  navigateToAppSection(button.dataset.section);
});

appMobileNav?.addEventListener("click", (event) => {
  const sectionButton = event.target.closest("[data-section]");
  if (sectionButton) {
    navigateToAppSection(sectionButton.dataset.section);
    return;
  }
  if (event.target.closest("[data-mobile-menu]")) setAppMenuOpen(true);
});

appPrimaryAction.addEventListener("click", () => {
  const action = appPrimaryAction.dataset.action;
  if (action === "new-route") openRouteDialog();
  if (action === "new-ticket") openDialog(supportDialog);
  if (action === "opportunities" || action === "registrations") {
    activeSection = action;
    renderCurrentSection();
  }
});

appContent.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton) return;
  const { action, username, routeId } = actionButton.dataset;

  if (action === "approve-user") approveOrRejectUser(username, "approved");
  if (action === "reject-user") approveOrRejectUser(username, "rejected");
  if (action === "review-user") openDocumentReview(username);
  if (action === "new-route") openRouteDialog();
  if (action === "new-ticket") openDialog(supportDialog);
  if (action === "compare-route") openProposalComparison(routeId);
  if (action === "offer-route") openOfferForm(routeId);
  if (action === "upload-document") uploadDocument(actionButton.dataset.documentKey);
  if (action === "select-ticket") {
    selectedSupportTicketId = actionButton.dataset.ticketId;
    renderSupportSection();
  }
  if (action === "select-delivery-chat") {
    selectedDeliveryChatRouteId = routeId;
    renderDeliveryChatSection();
  }
  if (action === "toggle-ticket-status") toggleTicketStatus(actionButton.dataset.ticketId);
  if (action === "filter-users") {
    activeUserDirectoryFilter = actionButton.dataset.userFilter;
    renderCurrentSection();
  }
  if (action === "filter-registrations") {
    activeRegistrationFilter = actionButton.dataset.registrationFilter;
    renderCurrentSection();
  }
  if (action === "go-section") {
    activeSection = actionButton.dataset.sectionTarget;
    selectedOperationId = null;
    selectedOccurrenceId = null;
    selectedCompanyRouteId = null;
    selectedCarrierRouteId = null;
    renderCurrentSection();
  }
  if (action === "filter-carrier-opportunities") {
    activeCarrierOpportunityFilter = actionButton.dataset.carrierFilter;
    renderCurrentSection();
  }
  if (action === "view-carrier-opportunity") {
    selectedCarrierRouteId = routeId;
    activeSection = "opportunities";
    renderCurrentSection();
  }
  if (action === "view-carrier-delivery") {
    selectedCarrierRouteId = routeId;
    activeSection = "deliveries";
    renderCurrentSection();
  }
  if (action === "close-carrier-route") {
    selectedCarrierRouteId = null;
    renderCurrentSection();
  }
  if (action === "carrier-confirm-pickup") confirmCarrierPickup(routeId);
  if (action === "enable-carrier-gps") enableCarrierGpsTracking();
  if (action === "toggle-carrier-vehicle") toggleCarrierVehicle(actionButton.dataset.vehicleId);
  if (action === "filter-company-routes") {
    activeCompanyRouteFilter = actionButton.dataset.companyRouteFilter;
    renderCurrentSection();
  }
  if (action === "view-company-route") {
    selectedCompanyRouteId = routeId;
    activeSection = "deliveries";
    renderCurrentSection();
  }
  if (action === "refresh-company-tracking") {
    renderCurrentSection();
    showToast("Localizacao sincronizada com a ultima atualizacao do transportador.");
  }
  if (action === "close-company-route") {
    selectedCompanyRouteId = null;
    renderCurrentSection();
  }
  if (action === "filter-operations") {
    activeOperationFilter = actionButton.dataset.operationFilter;
    renderCurrentSection();
  }
  if (action === "view-operation") {
    selectedOperationId = routeId;
    activeSection = "operations";
    renderCurrentSection();
  }
  if (action === "close-operation-detail") {
    selectedOperationId = null;
    renderCurrentSection();
  }
  if (action === "filter-occurrences") {
    activeOccurrenceFilter = actionButton.dataset.occurrenceFilter;
    renderCurrentSection();
  }
  if (action === "view-occurrence") {
    selectedOccurrenceId = actionButton.dataset.occurrenceId;
    activeSection = "occurrences";
    renderCurrentSection();
  }
  if (action === "close-occurrence-detail") {
    selectedOccurrenceId = null;
    renderCurrentSection();
  }
  if (action === "assign-occurrence") assignOccurrence(actionButton.dataset.occurrenceId);
  if (action === "resolve-occurrence") resolveOccurrence(actionButton.dataset.occurrenceId);
});

appContent.addEventListener("submit", (event) => {
  const deliveryChatForm = event.target.closest(".delivery-chat-form");
  if (deliveryChatForm) {
    event.preventDefault();
    const message = new FormData(deliveryChatForm).get("message");
    if (message?.trim()) sendDeliveryChatMessage(deliveryChatForm.dataset.routeId, message);
    return;
  }
  const trackingForm = event.target.closest(".carrier-tracking-form");
  if (trackingForm) {
    event.preventDefault();
    if (trackingForm.reportValidity()) updateCarrierTracking(trackingForm);
    return;
  }
  const proofForm = event.target.closest(".carrier-proof-form");
  if (proofForm) {
    event.preventDefault();
    if (proofForm.reportValidity()) completeCarrierDelivery(proofForm);
    return;
  }
  const vehicleForm = event.target.closest(".carrier-vehicle-form");
  if (vehicleForm) {
    event.preventDefault();
    if (vehicleForm.reportValidity()) addCarrierVehicle(vehicleForm);
    return;
  }
  const occurrenceForm = event.target.closest(".company-occurrence-form");
  if (occurrenceForm) {
    event.preventDefault();
    if (occurrenceForm.reportValidity()) createCompanyOccurrence(occurrenceForm);
    return;
  }
  const replyForm = event.target.closest(".support-reply-form");
  if (!replyForm) return;
  event.preventDefault();
  const reply = new FormData(replyForm).get("reply");
  if (!reply?.trim()) return;
  replyToTicket(replyForm.dataset.ticketId, reply);
});

supportForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!supportForm.reportValidity()) return;
  const ticket = createSupportTicket(Object.fromEntries(new FormData(supportForm).entries()));
  if (!ticket) return;
  supportDialog.close();
  supportForm.reset();
  activeSection = "communications";
  renderCurrentSection();
  showToast("Chamado enviado para a equipe ViaFluxo.");
});

routeStepNext.addEventListener("click", () => {
  if (!validateRouteWizardStep()) return;
  setRouteWizardStep(routeWizardStep + 1);
});

routeStepBack.addEventListener("click", () => {
  setRouteWizardStep(routeWizardStep - 1);
});

routeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!currentUser || currentUser.role !== "company" || currentUser.status !== "approved") {
    routeDialog.close();
    showToast("Somente empresas verificadas podem publicar rotas.");
    return;
  }
  if (!routeForm.reportValidity()) return;

  const data = Object.fromEntries(new FormData(routeForm).entries());
  const { routeConfirmation, ...routeData } = data;
  const routes = getRoutes();
  routes.unshift({
    id: createId(),
    owner: currentUser.username,
    companyName: currentUser.companyName || currentUser.fullName,
    ...routeData,
    cargoValue: Number(routeData.cargoValue || 0),
    budget: Number(routeData.budget || 0),
    volumes: Number(routeData.volumes || 0),
    status: "open",
    progress: 12,
    lastUpdate: "Publicada agora",
    proposals: [],
    createdAt: new Date().toISOString(),
    timeline: [
      ["Rota publicada", formatDateTime(new Date().toISOString()), "current"],
      ["Transportador selecionado", "Aguardando propostas", "next"],
      ["Coleta confirmada", "Pendente", "next"],
      ["Carga em transito", "Pendente", "next"],
      ["Entrega e comprovante", "Pendente", "next"],
    ],
  });
  saveRoutes(routes);
  routeDialog.close();
  routeForm.reset();
  setRouteWizardStep(1);
  activeSection = "routes";
  renderCurrentSection();
  showToast(`Rota ${routeData.origin} → ${routeData.destination} publicada para parceiros compativeis.`);
});

proposalList.addEventListener("click", (event) => {
  const button = event.target.closest(".js-select-proposal");
  if (!button || !selectedRouteId) return;
  const routes = getRoutes();
  const route = routes.find((item) => item.id === selectedRouteId);
  const proposal = route?.proposals[Number(button.dataset.proposalIndex)];
  if (!route || !proposal) return;

  route.status = "assigned";
  route.selectedCarrier = proposal.carrier;
  route.selectedCarrierUsername = proposal.username;
  route.acceptedAmount = Number(proposal.amount);
  route.progress = 30;
  route.lastUpdate = "Transportador selecionado agora";
  route.timeline = [
    ["Rota publicada", formatDate(route.pickup), "done"],
    ["Transportador selecionado", proposal.carrier, "done"],
    ["Coleta confirmada", "Aguardando atualizacao", "current"],
    ["Carga em transito", "Aguardando coleta", "next"],
    ["Entrega e comprovante", "Pendente", "next"],
  ];
  route.conversation = [
    {
      id: createId(),
      senderRole: "system",
      senderName: "ViaFluxo",
      text: "Canal operacional criado. Empresa e transportador ja podem alinhar a coleta e a entrega por aqui.",
      createdAt: new Date().toISOString(),
    },
  ];
  saveRoutes(routes);
  proposalDialog.close();
  selectedCompanyRouteId = route.id;
  activeSection = "deliveries";
  renderCurrentSection();
  showToast(`${proposal.carrier} foi selecionado para a rota.`);
});

offerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!currentUser || currentUser.role !== "carrier" || currentUser.status !== "approved") return;
  if (!offerForm.reportValidity()) return;

  const data = Object.fromEntries(new FormData(offerForm).entries());
  const routes = getRoutes();
  const route = routes.find((item) => item.id === selectedRouteId);
  if (!route) return;
  if (route.status !== "open") {
    offerDialog.close();
    showToast("Esta oportunidade ja foi encerrada pela empresa.");
    return;
  }

  const existingProposal = route.proposals.find((proposal) => proposal.username === currentUser.username);
  if (existingProposal) {
    existingProposal.amount = Number(data.amount);
    existingProposal.deliveryTime = data.deliveryTime;
    existingProposal.message = data.message;
  } else {
    route.proposals.push({
      username: currentUser.username,
      carrier: currentUser.fullName,
      amount: Number(data.amount),
      deliveryTime: data.deliveryTime,
      message: data.message,
      score: "Novo",
    });
  }

  saveRoutes(routes);
  offerDialog.close();
  offerForm.reset();
  selectedCarrierRouteId = null;
  activeSection = "offers";
  renderCurrentSection();
  showToast("Proposta enviada para a empresa responsavel pela rota.");
});

document.querySelector("#logout-button").addEventListener("click", logout);
mobileMenuButton.addEventListener("click", () => {
  setAppMenuOpen(!appShell.classList.contains("menu-open"));
});
appMenuBackdrop?.addEventListener("click", () => setAppMenuOpen(false));

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  installAppButtons.forEach((button) => {
    button.hidden = false;
  });
});

installAppButtons.forEach((button) => {
  button.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installAppButtons.forEach((installButton) => {
      installButton.hidden = true;
    });
  });
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  installAppButtons.forEach((button) => {
    button.hidden = true;
  });
  showToast("ViaFluxo instalado no dispositivo.");
});

window.addEventListener("online", () => showToast("Conexao restabelecida."));
window.addEventListener("offline", () => showToast("Modo offline ativo. Seus dados locais continuam disponiveis."));

window.addEventListener("storage", (event) => {
  if (event.key === STORAGE_KEYS.routes && currentUser && !appShell.hidden) {
    renderCurrentSection();
  }
});

documentReviewList.addEventListener("click", (event) => {
  const item = event.target.closest(".document-review-item");
  if (!item || !selectedReviewUsername) return;
  previewDocument(selectedReviewUsername, item.dataset.documentKey);
});

documentApprove.addEventListener("click", () => {
  if (!selectedReviewUsername) return;
  approveOrRejectUser(selectedReviewUsername, "approved");
  documentDialog.close();
});

documentReject.addEventListener("click", () => {
  if (!selectedReviewUsername) return;
  approveOrRejectUser(selectedReviewUsername, "rejected");
  documentDialog.close();
});

copyEmailHtmlButton.addEventListener("click", async () => {
  if (!currentApprovalEmailHtml) return;
  try {
    await navigator.clipboard.writeText(currentApprovalEmailHtml);
    showToast("HTML do e-mail copiado.");
  } catch {
    const textArea = document.createElement("textarea");
    textArea.value = currentApprovalEmailHtml;
    document.body.append(textArea);
    textArea.select();
    document.execCommand("copy");
    textArea.remove();
    showToast("HTML do e-mail copiado.");
  }
});

documentDialog.addEventListener("close", () => {
  selectedReviewUsername = null;
  if (currentPreviewUrl) {
    URL.revokeObjectURL(currentPreviewUrl);
    currentPreviewUrl = null;
  }
});

if (pickupInput) pickupInput.min = new Date().toISOString().split("T")[0];
updateRegistrationFields();
seedTestUsers();
seedRoutes();
seedVehicles();
seedTickets();
seedOccurrences();
seedAudits();

const restoredUser = resolveSession();
if (restoredUser) showApp(restoredUser);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./service-worker.js").catch(() => {
      // The app remains usable online if service worker registration is unavailable.
    });
  });
}
