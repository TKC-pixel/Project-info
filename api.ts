import keycloak from "./keycloak";

const API_URL = `${(import.meta.env.VITE_API_URL ?? "http://localhost:8000").replace(/\/$/, "")}/api/v1`;

export type DashboardKpi = {
    label: string;
    value: string;
    change: string;
    positive: boolean;
    tone: string;
    points: number[];
};

export type DashboardActivity = {
    id: string;
    name: string;
    status: string;
    date: string;
    time: string;
};

export type DashboardQueueItem = {
    customer: string;
    name: string;
    verification: string;
    priority: string;
    waiting: string;
    tone: string;
};

export type DashboardTrendPoint = {
    day: string;
    verified: number;
    pending: number;
    action: number;
    started: number;
};

export type DashboardResponse = {
    kpis: DashboardKpi[];
    activity: DashboardActivity[];
    verification_queue: DashboardQueueItem[];
    trend: DashboardTrendPoint[];
    document_types: Array<{ name: string; value: string }>;
};

export type ScreeningResult = {
    id: string;
    customer: string;
    customerId: string;
    source: string;
    status: string;
    score: string;
    time: string;
};

export type ScreeningDashboardResponse = {
    kpis: Array<{ label: string; value: string; change: string; positive: boolean; tone: string }>;
    trend: Array<{ day: string; screened: number; matches: number }>;
    breakdown: Array<{ name: string; value: number }>;
    sources: Array<{ name: string; matches: number; percentage: number }>;
    results: ScreeningResult[];
    queue: Array<{ title: string; detail: string; priority: string; tone: string }>;
};

async function apiGet<T>(path: string): Promise<T> {
    const response = await fetch(`${API_URL}${path}`);

    if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
}

export function getDashboardData() {
    return apiGet<DashboardResponse>("/dashboard");
}

export function getScreeningResults() {
    return apiGet<ScreeningResult[]>("/screening");
}

export function getScreeningDashboard() {
    return apiGet<ScreeningDashboardResponse>("/screening/dashboard");
}

export function getCustomers() {
    return apiGet<Array<Record<string, unknown>>>("/customers");
}

export function getAlerts() {
    return apiGet<Array<Record<string, unknown>>>("/alerts");
}

export function getInvestigations() {
    return apiGet<Array<Record<string, unknown>>>("/investigations");
}

export function getTransactions() {
    return apiGet<Array<Record<string, unknown>>>("/transactions");
}

export async function getCurrentUser() {
    if (!keycloak.token) {
        throw new Error("Not authenticated");
    }

    await keycloak.updateToken(30);

    const response = await fetch(
        `${API_URL}/auth/me`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${keycloak.token}`,
                "Content-Type": "application/json",
            },
        },
    );

    if (!response.ok) {
        throw new Error(
            `API request failed: ${response.status}`,
        );
    }

    return response.json();
}