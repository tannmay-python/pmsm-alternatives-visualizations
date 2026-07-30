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

The experience uses a single persistent WebGL scene. Scroll progress transforms that one scene through six physical chapters:

1. transparent dual-motor vehicle;
2. extracted rear drive unit;
3. exploded PMSM;
4. rotating stator field and following rotor;
5. magnet mass and supply-chain scale;
6. five mechanically distinct rotor architectures.

The field chapter includes a pause control and shaft-load input. The alternatives chapter is keyboard-operable and updates both the 3D specimen and its tradeoff explanation.

## Sources

- [International Energy Agency, Rare Earth Elements](https://www.iea.org/reports/rare-earth-elements/executive-summary)
- [US Department of Energy, Rare Earth Permanent Magnets Supply Chain Deep Dive](https://www.energy.gov/sites/default/files/2024-12/Neodymium%2520Magnets%2520Supply%2520Chain%2520Report%2520-%2520Final%5B1%5D.pdf)
- [US Department of Energy, Electric Motors Research and Development](https://www.energy.gov/cmei/vehicles/electric-motors-research-and-development)
- [Renault Group, electric motors without rare earths](https://www.renaultgroup.com/en/magazine/energy-and-motorization/all-about-electric-motors-with-no-rare-earths/)
- [ABB, synchronous reluctance motors](https://www.abb.com/global/en/areas/motion/motors-generators/low-voltage-motors/iec-low-voltage-motors/synchronous-reluctance-motors)

The 1-2 kg figure refers to typical permanent-magnet material per EV motor in the cited DOE supply-chain assessment. Vehicle and motor designs vary.

## Visual references

The image-first art-direction renders used for this build are preserved under `design/references/`. The live experience is rendered in WebGL rather than using those images as the primary explanatory medium.
