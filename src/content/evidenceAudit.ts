import type { EvidenceAuditRecord } from "./schema.ts";

/**
 * App-local release gate distilled from the evidence audit at
 * `pmsm-evidence-work/evidence-audit/registry.json` (audit date 2026-08-09).
 * The complete audit remains the research record; this map lets the UI enforce
 * its display rules without inventing a second source of truth.
 */
export const evidenceAudit = [
  { id: "market.rare_earth_free_share", status: "unverified", numbersMayBeShown: false, visualRule: "Use only a qualitative emerging/unevenly-disclosed adoption band." },
  { id: "supply.china_april_2025_controls", status: "verified", numbersMayBeShown: true, visualRule: "Show a dated licence-control gate, not a blanket ban." },
  { id: "supply.ndpr_not_listed_in_notice", status: "qualified", numbersMayBeShown: false, visualRule: "Show only 'not named in this announcement', never a permanent security claim." },
  { id: "magnets.dy_tb_role", status: "verified", numbersMayBeShown: true, visualRule: "Increase a resists-reversal barrier; do not depict Dy/Tb as cooling." },
  { id: "magnets.gbd", status: "verified", numbersMayBeShown: true, visualRule: "Show selective edge/shell treatment, never a universal material recipe." },
  { id: "supply.proterial_hree_free", status: "verified", numbersMayBeShown: true, visualRule: "Show HREE-free NdFeB as distinct from fully rare-earth-free motor architectures." },
  { id: "cooling.audi_q6_direct_oil", status: "verified", numbersMayBeShown: false, visualRule: "Show rotor-magnet thermal management only; do not infer Dy/Tb removal or a temperature limit." },
  { id: "pmsm.field_weakening", status: "verified", numbersMayBeShown: false, visualRule: "Show added counter-flux current and loss burden, not a universal zero-torque assertion." },
  { id: "pmsm.inverter_fault", status: "qualified", numbersMayBeShown: false, visualRule: "Show an always-on-field warning, not a universal braking or DC-link outcome." },
  { id: "induction.slip_and_cage", status: "verified", numbersMayBeShown: false, visualRule: "Show cage current and a leading stator-field pointer; do not show a generic slip percentage." },
  { id: "induction.mixed_axle", status: "verified", numbersMayBeShown: false, visualRule: "Attribute Audi Q6 and BMW Gen6 axle layouts to their named vehicle/platform; do not generalise to every fleet." },
  { id: "eesm.production_renault_nissan_bmw", status: "verified", numbersMayBeShown: true, visualRule: "Show production EESM separately from contactless development; do not infer rotor-transfer hardware for every vehicle." },
  { id: "eesm.contactless_zf", status: "verified", numbersMayBeShown: true, visualRule: "Place I2SM in advanced development, not a production lane." },
  { id: "eesm.contactless_ibee", status: "verified", numbersMayBeShown: true, visualRule: "Show iBEE as 220–350 kW peak target with prototype milestone; no 2028 series-production claim." },
  { id: "vimag.volektra_architecture", status: "verified", numbersMayBeShown: false, visualRule: "Nest VMSM/VMM under contactless wound-field synchronous excitation." },
  { id: "vimag.volektra_corporate_relationship", status: "qualified", numbersMayBeShown: false, visualRule: "Describe shared/overlapping public provenance; do not assert one legal entity." },
  { id: "market.ev_vs_industrial", status: "verified", numbersMayBeShown: false, visualRule: "Keep EV traction and industrial/appliance market filters separate." },
  { id: "ferrite.property_distinction", status: "verified", numbersMayBeShown: true, visualRule: "Use distinct remanence, coercivity and energy-product meters." },
  { id: "ferrite.proterial_motor_comparison", status: "verified", numbersMayBeShown: true, visualRule: "Pair 102 kW/15,000 rpm with the 110 kW/10,000 rpm comparison and actual/simulated status." },
  { id: "ferrite.cold_demag", status: "verified", numbersMayBeShown: false, visualRule: "Show grade/circuit-dependent cold risk, not universal ferrite failure." },
  { id: "iron_nitride.actual_vs_theory", status: "qualified", numbersMayBeShown: true, visualRule: "Keep coercivity, thermal viability and saturation as separate material gates." },
  { id: "iron_nitride.thermal_constraint", status: "qualified", numbersMayBeShown: true, visualRule: "Render thermal stability as material-development work, not a vehicle limit." },
  { id: "iron_nitride.matter_vfm", status: "verified", numbersMayBeShown: false, visualRule: "Show CES prototype / exploratory integration, not a product launch." },
  { id: "aem.ssrd_peak_continuous", status: "verified", numbersMayBeShown: true, visualRule: "Pair prototype/in-development status, peak condition, continuous output and maximum speed." },
  { id: "renault.e7a_efficiency", status: "verified", numbersMayBeShown: true, visualRule: "Keep 93% attached to motorway condition and the 2026 release." },
  { id: "vehicle.swap_burden", status: "unverified", numbersMayBeShown: false, visualRule: "Use a qualitative integration map; do not show a universal duration or component list." },
  { id: "india.opportunity_policy", status: "verified", numbersMayBeShown: true, visualRule: "Show alternative-motor and domestic-REPM capability as complementary paths." },
] as const satisfies readonly EvidenceAuditRecord[];
