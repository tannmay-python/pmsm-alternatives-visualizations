# IAS officer walkthrough implementation report

Last updated: 2 September 2026

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

The opening is implemented in `src/pages/Landing.tsx`. The September 2026 course pass deliberately left that file untouched.

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

- Visual explanations autoplay for about 4.8 seconds.
- User scrolling cancels the current motion immediately.
- After scrolling stops, the selected frame resumes from its current visual state.
- Semantic state changes land immediately, so the text cannot move ahead of the named component.
- Each 3D frame resets to its authored camera shot, while direct drag remains available.
- At tablet widths, the visual occupies the upper half and the active text card the lower half.
- Inactive upcoming text is fully hidden.
- Dense phone tables use a short horizontal strip so rows are not vertically cropped.

## Verification record

Verified locally on 2 September 2026:

- Opening still shows all nine Group 2 minerals.
- 21 public frames remain in place.
- Rapid scrolling during animation stops motion without blocking scroll and restarts the selected demonstration after scroll idle.
- Exploded-motor shaft label stays inside the viewport.
- Rotor-following-field, SynRM, SRM and ferrite comparison views render at desktop and phone widths.
- The six-route table fits at 900 px and keeps all six rows visible at 390 px.
- Next chapter begins at the first frame.
- Next chapter remains at the bottom of the chapter scroll.
- TypeScript check passes.
- 57 tests pass.
- Production build passes.
- ESLint reports no errors; one pre-existing Fast Refresh warning remains in `src/shell/MotorInspector.tsx`.
