export type ComponentKey = "about" | "address" | "birthdate";
export type Placement = 2 | 3;

export type AdminPlacement = Record<ComponentKey, Placement>;

export interface AdminConfigPayload {
  page2: ComponentKey[];
  page3: ComponentKey[];
}