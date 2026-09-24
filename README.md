# FlagellaScope — Flagellar Rotation Measurement Simulator

An English/Japanese, static, browser-based virtual bead assay for comparing slowdown caused by reduced proton motive force, fewer engaged stators, or greater viscous load. Open `dist/index.html` locally or host all files in `dist/` at one web root. No server, user account, analytics, external script, or data upload is used. CSV, SVG, and PNG exports are generated in the browser.

## What the curves represent

The default phenomenological motor has eight engaged stators, a proton motive force derived from membrane potential and pH difference, and a **piecewise linear illustrative** torque–speed relationship. The curve's plateau and knee are motivated by Xing, Bai, Berry and Oster, *PNAS* (2006), https://doi.org/10.1073/pnas.0507959103. Model parameters are **not digitized, fitted, or validated** against the figures in that article. The plot marks intersections with the load lines, using model drift speed rather than camera-estimated speed.

The three intervention settings produce equal steady-state **mean-field** model speeds. The default uses deterministic stator relaxation so a single simulation illustrates this comparison. Enabling stochastic integer stators can yield substantially different speeds in one realization: the app displays the realized means for 15–20 seconds and flags a discrepancy above 5% of the target. At zero inward motive force, the three slowdown causes cannot be distinguished. Matching a speed alone cannot identify the experimental cause.

The motor ignores Na⁺ coupling, reverse rotation, near-wall hydrodynamics, cell-body drag, flexible motor–bead linkage, photophysics, and load-dependent stator recruitment. The model window describes instantaneous motor drift; camera values are calculated from noisy, exposure-averaged bead coordinates with principal-value angle differences, which can alias above half the frame rate. See **Model & assumptions** inside the app for equations, units, and random seeds.

## Run checks

Run `node tests/release.test.cjs` with a recent Node.js. This checks parameter matching, torque/load intersections, default and stochastic trajectories, low-frame-rate sampling, and asset availability. It does not establish biological predictive accuracy or verify rendering in a real browser.

Before external scientific use, compare curves and time series with independently acquired rotation, stator count and proton motive force measurements under calibrated load. No license has been selected for redistribution or adaptation; choose one before encouraging reuse of the source.
