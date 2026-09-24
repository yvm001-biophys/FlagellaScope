# Publication review — 2026-09-24

Scope: FlagellaScope static Site, English/Japanese interface, model, time series, knee-curve plot and downloads. Review of code and numerical behavior; no independent experimental calibration.

## Corrected

- Default stochastic exchange produced 15–20 s means of approximately 105, 63 and 121 Hz despite a nominal 106 Hz target. Initial conditions now use deterministic mean-field exchange (approximately 105.7, 106.1 and 105.7 Hz). The stochastic option remains available and achieved means are displayed alongside the target, with a warning above 5% relative deviation.
- When inward motive force is zero, the app explicitly states that a three-cause comparison is unavailable instead of presenting zero as a meaningful speed match.
- The first pair of valid camera frames is now measured; previously the second frame was incorrectly forced to missing.
- English and Japanese descriptions now explain how a single stochastic trajectory may differ from a matched mean-field speed.

## Inspected

- Mathematical intersection of the piecewise knee curve with the load line and three theoretical matching methods over a parameter sweep; bead drag units and the PMF sign convention.
- Internal angles, Gaussian thermal/localization noise, frame rate, exposure integration, alias warning, seeded reproducibility, late-intervention summary, torque SVG/CSV export, and text translation paths.
- The static output uses no third-party runtime scripts, backend, tracking, credentials, or network API. All linked literature is external and opens in a separate tab.

## Limits

- The knee shape follows the qualitative plateau-and-drop behavior described in the linked PNAS paper, but the coefficients are illustrative and have no experimental fit. This simplified model should not be presented as that paper's mechanochemical equations.
- At very low mean stator occupancy, integer stochastic traces can have extended zero-occupancy periods. High exchange time constants can prevent a 15–20 s average from reaching the steady-state target.
- Camera readout has phase wrapping and exposure blur; no subframe tracking or motion-corrected localization is implemented.
- The tests below are code-level and numerical. Rendering, interactions, and PNG downloads have not been checked in a real browser here.
