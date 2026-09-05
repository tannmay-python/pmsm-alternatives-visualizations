# IAS officer walkthrough implementation report

Last updated: 5 September 2026

## Non-negotiable constraint

Do not change the opening. It must continue to open with the Group 2 list of nine minerals:

1. Tellurium
2. Terbium
3. Yttrium
4. Dysprosium
5. Erbium
6. Holmium
7. Ytterbium
8. Lutetium
9. Thulium

The opening is implemented in `src/pages/Landing.tsx`. Its substantive copy and mineral list remain locked. On 4 September 2026, the small eyebrow line `The Takshashila Institution · Mineralpolitik` was removed at the user's request; no opening content was otherwise changed.

## What the course must answer

The walkthrough can lose some technical detail as long as a non-specialist leaves with three answers:

1. What a permanent-magnet motor is, where it sits in a car, and broadly how it works.
2. What the main alternatives are and what turns the rotor in each one.
3. What each alternative costs in efficiency, size, heat, controls or vehicle integration, and how close it is to automotive use.

## Public course structure

The course remains a five-chapter, 21-frame walkthrough.

### Chapter 1: The motor in the car

- Battery, inverter, motor, reduction gear and wheels.
- The stationary stator, rotating rotor and shaft.
- Permanent-magnet synchronous motor (PMSM) and neodymium–iron–boron (NdFeB) are expanded on first use.
- The air gap shows how force crosses without mechanical contact.

### Chapter 2: How it turns

- Right-hand grip rule for one electromagnet.
- Three alternating phase currents combine into one rotating stator field.
- The rotor magnetic axis trails the stator field by a small, steady angle; that offset produces shaft torque.
- A buried-magnet rotor also gains torque from shaped-steel alignment.

### Chapter 3: Why the rare earths

- Iron supplies most of the magnetic strength.
- Nd/Pr help the field resist reversal.
- Boron stabilises the crystal structure.
- Heavy rare earth elements (HREEs), especially Dy/Tb, protect the magnet at high temperature.
- Crossing the reversal limit causes permanent loss of magnetisation and torque.
- Cooling, grain-boundary diffusion and lower-HREE magnets reduce exposure while retaining the PMSM.

### Chapter 4: The alternatives

Every family answers the same three questions: what turns the rotor, what rare-earth exposure disappears, and what engineering cost appears.

- Permanent magnet: magnet follows the rotating stator field.
- Induction: slip induces cage current; the penalty is rotor heat and some efficiency loss.
- Wound field: a powered rotor coil replaces the permanent magnet; the penalty is power-transfer and cooling hardware.
- Synchronous reluctance motor (SynRM): shaped steel aligns with the stator field; the penalty can be motor or inverter size.
- Switched reluctance motor (SRM): stator poles pull rotor teeth in sequence; the penalty is less-even torque, noise and control work.
- Ferrite PMSM: the motor principle stays, but the weaker magnet needs more material, more size, more speed or different geometry.

### Chapter 5: Trade-offs and readiness

- Reduced-Dy/Tb NdFeB, ferrite PMSM, induction, wound field, SynRM and SRM are compared using the same columns.
- The final frame separates action into three horizons: now, the next vehicle platform, and targeted R&D.

## Interaction and motion rules

- One frame at a time. A wheel tick, a swipe on the card, or an arrow key moves exactly one frame; a trackpad flick cannot skip a frame. Deep links (`#rotor`) open on that frame.
- The card holds only the active frame's words and sizes itself to them. On the last frame of a chapter it also carries the next chapter's one-line lede and the "next" button.
- Visual explanations autoplay for about 4.8 seconds when a frame arrives; angle-driven mechanisms then keep turning slowly. The grip rule is the one frame whose state changes only when tapped.
- Each 3D frame resets to its authored camera shot; drag-to-orbit remains, wheel-zoom is off so the wheel always means "next frame".
- Alternative rotors (cage, wound) are shown without their stator, with the sweeping field arrow in front.
- At tablet and phone widths the visual takes the upper half and the card the lower half; 3D callouts keep their labels on phones.

## Verification record

Verified locally on 5 September 2026:

- Opening still shows all nine Group 2 minerals.
- 21 public frames remain in place; copy rewritten in plain conversational voice, every line under 320 characters and through the copy lint.
- ArrowRight/ArrowLeft, Enter, wheel and swipe each move one frame; deep links land on the named frame; Back from a chapter's first frame lands on the previous chapter's last frame.
- No callout leaves the stage at 1440×900, 1280×720 or 390×844.
- TypeScript check, ESLint (one pre-existing Fast Refresh warning), 64 tests and the production build pass.
