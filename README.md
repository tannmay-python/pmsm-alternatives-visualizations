# PMSM Visualizations

A standalone 3D visual story about the electric traction motor inside a car:

- where one or more motors sit in an EV;
- how the drive unit connects to the wheels;
- how a permanent-magnet synchronous motor fits together;
- how three timed currents create a rotating magnetic field;
- where rare-earth materials enter the rotor;
- how wound-field, induction, synchronous-reluctance, and switched-reluctance motors remove rare-earth magnets.

This project is intentionally separate from the main `PMSM-alternatives` issue brief. It is built as a visual companion, not a replacement.

## Run locally

```bash
npm install
npm run dev
```

The local route is:

```text
http://127.0.0.1:5173/PMSM-Visualizations/
```

## Production build

```bash
npm run build
npm run preview
```

## Interaction model

The experience uses one continuous, light-theme WebGL scene. Scroll progress
transforms it through eight chapters:

1. the rare-earth question;
2. a transparent dual-motor vehicle;
3. an extracted drive unit shown at real scale;
4. an exploded PMSM teardown;
5. the rotating stator field and following rotor;
6. the sixteen individual NdFeB magnet blocks;
7. six mechanically distinct rotor architectures;
8. the rare-earth-free conclusion.

The field chapter includes a pause control and shaft-load input. The alternatives
chapter switches between permanent-magnet, wound-field, induction, synchronous-
reluctance, switched-reluctance, and ferrite-assisted rotors while preserving the
same stator.

## Sources

- [International Energy Agency, Rare Earth Elements](https://www.iea.org/reports/rare-earth-elements/executive-summary)
- [US Department of Energy, Rare Earth Permanent Magnets Supply Chain Deep Dive](https://www.energy.gov/sites/default/files/2024-12/Neodymium%2520Magnets%2520Supply%2520Chain%2520Report%2520-%2520Final%5B1%5D.pdf)
- [US Department of Energy, Electric Motors Research and Development](https://www.energy.gov/cmei/vehicles/electric-motors-research-and-development)
- [Renault Group, electric motors without rare earths](https://www.renaultgroup.com/en/magazine/energy-and-motorization/all-about-electric-motors-with-no-rare-earths/)
- [ABB, synchronous reluctance motors](https://www.abb.com/global/en/areas/motion/motors-generators/low-voltage-motors/iec-low-voltage-motors/synchronous-reluctance-motors)

The 1-2 kg figure refers to typical permanent-magnet material per EV motor in the cited DOE supply-chain assessment. Vehicle and motor designs vary.

## Implementation

The supplied redesign is implemented directly in `index.html`. `public/support.js`
provides the small declarative component runtime used by that source file; the
motor, vehicle, magnets, and alternative rotors are all generated as live Three.js
geometry rather than pre-rendered images.
