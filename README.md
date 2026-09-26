# FlagellaScope — Bacterial Flagellar Rotation Measurement Simulator

**FlagellaScope** is a browser-based virtual bead assay for comparing three different causes of flagellar motor slowdown: reduced proton motive force, fewer engaged stators, and increased viscous load. It demonstrates why the same measured speed does not identify a unique mechanism. The app is a research and teaching aid, **not a diagnostic tool for experimental data**.

In a bead assay, a bead attached to a short flagellar segment is imaged to estimate the motor's rotation speed from its motion.

[English](#english) · [日本語](#日本語)

## English

### Open and use

Open the [FlagellaScope site](https://motor-causality-lab.yvm001.chatgpt.site) if you have access, or open `dist/index.html` locally. For static hosting, place the **contents of** `dist/` at the web root. English is the default interface language; use **Japanese** to switch.

1. Set **Target speed after intervention** as a percentage of baseline (50% by default), then click **Match speed across all three causes**. This calculates a reduced driving force, a target mean stator count, and a viscosity multiplier giving the same predicted steady-state speed.
2. Adjust membrane potential, ΔpH, bead diameter, orbit radius, viscosity, and stator-exchange time. Each condition also has a manual intervention slider. After changing an intervention, use **Match speed** to recalculate matched settings.
3. Use **Play** or the time slider. **0–5 s** is baseline, **5–20 s** is intervention, and **20–30 s** is recovery. The upper motor drawing plays at 1/100 rotation speed for visibility; the lower bead view represents exposure integration and marks the noisy estimated centroid.
4. Change camera rate (**30–2000 fps**), exposure, and localization noise. Compare model drift speed with the camera-estimated speed. Enable stochastic stator exchange or thermal angle fluctuations to inspect individual realizations.
5. Inspect the time-series graph, **15–20 s** summary, and torque–speed panel. The **solid line** is motor torque, the **dashed line** is load torque, and the **circle** is their operating-point intersection for the selected time.

**Enable intervention-induced slowdown** applies one of the three virtual changes from 5–20 s, then restores baseline. Switch it off to simulate baseline throughout all 30 s. The target and three adjustment sliders remain stored but do not change the motor while it is off.

**Import settings CSV** accepts a header and one settings row. Download [the template](conditions-template.csv) for column names and units. Columns may be omitted; omitted general settings retain their current values. `force`, `stators`, and `load` are optional intervention settings; omitted ones are recalculated to match the target. Numeric columns are `target` (%), `voltage` (mV), `dpH`, `diameter` and `radius` (μm), `viscosity` (mPa s), `tau` (s), `fps`, `exposure` (ms), `noise` (nm), and `force` (fraction), `stators` (mean count), `load` (viscosity multiplier). Boolean columns `interventionEnabled`, `stochastic`, and `thermal` use `true` or `false`. The sliders define accepted ranges; invalid files leave the current simulation unchanged. This imports **settings**, not experimental observations or measured trajectories. All parsing is local in the browser.

The matching target describes a **steady-state mean-field model**, whereas the displayed 15–20 s values describe this simulated trajectory. With stochastic integer stators or slow relaxation, a single run can differ greatly from its target. The app displays the realized means and warns if the largest difference exceeds 5% of the target. When inward driving force is zero, speed cannot distinguish the three causes. Summary values such as stator number and driving force are internal model quantities; a bead camera alone does not directly measure all of them.

### Model and scientific scope

This is an illustrative **H⁺-driven phenomenological model**, not fitted to a species, mutant, or data set. At 25 °C, define `V = ψoutside − ψinside`, `ΔpH = pHinside − pHoutside`, and inward driving force `P = max(0, V + 59.16 ΔpH)` mV. Let `p = P / 180` and `N` be the number of engaged stators. Default values: `V = 150 mV`, `ΔpH = 0.5`, `N = 8`.

The illustrative torque–speed relationship has stall torque `τ₀ = 180Np` pN nm, no-load speed `f₀ = 300p` Hz, and a knee at `fₖ = 0.65f₀` with torque `0.9τ₀`. Straight segments join these three points. Speed is the intersection of motor torque with the viscous load `τload = 2πζf`. Under the idealized rigid-coupling bead geometry, `ζ = 6πηar² + 8πηa³`, with bead radius `a`, orbit radius `r`, and viscosity `η`. Using μm and mPa s gives `ζ` in pN nm s. Default bead diameter: 0.5 μm; orbit radius: 0.3 μm; viscosity: 1 mPa s.

The plateau and knee **shape** is motivated by [Xing, Bai, Berry & Oster, *PNAS* (2006), doi:10.1073/pnas.0507959103](https://doi.org/10.1073/pnas.0507959103). The coefficients above are **illustrative, not digitized or fitted values** from that paper. FlagellaScope does not implement the paper's mechanochemical equations.

Default stator exchange is continuous mean-field relaxation. Optional stochastic exchange uses integer occupancy of at most 11 sites. Thermal angular fluctuations and camera-position noise use separate seeded random sequences. Internal integration steps are 0.25 ms. Camera speed comes from wrapped differences between successive noisy, exposure-averaged positions; it can alias above half the frame rate. Frames with insufficient exposure-image contrast are marked missing. The app's **Model & assumptions** dialog contains the full equations and seeds.

The model omits Na⁺-powered motors, directional switching, flexible hook/motor–bead coupling, near-wall and cell-body drag corrections, load-dependent stator recruitment, and full microscope optics. Quantitative research use requires independent experimental checks of rotation, stator occupancy, driving force, and calibrated load.

### Exports and verification

- **Export CSV** saves all conditions frame by frame: time, model speed, camera estimate, stators, driving force, drag, torque, bead coordinates, and settings.
- **Export JSON** saves the same simulation as structured settings, model metadata, and per-frame values. Missing camera estimates are `null`.
- The torque–speed panel exports **PNG** or **SVG** images and **CSV** or **JSON** containing sampled motor curves, load lines, operating points, and parameters at the selected time. Operating points are **model drift speeds**, not fits to camera data.
- Run `node tests/release.test.cjs` from this repository with a recent Node.js. It checks 1,134 positive-driving-force parameter combinations, curve/load intersections, default trajectories, and seeded 30 fps sampling. It does not establish biological predictive validity or verify PNG output in every browser. See [REVIEW.md](REVIEW.md).

Calculations and exports run locally in the browser. No account, server-side analysis, analytics, external runtime libraries, or data upload is used.

**Source-code permissions:** The author does not grant permission to redistribute or modify the source code. Making the source publicly viewable does not change this policy. Contact the author for permission before redistributing or modifying it.

## 日本語

### 概要と操作方法

**FlagellaScope（バクテリアべん毛回転計測シミュレーター）**は、べん毛モーターの同じ速度低下を、**H⁺駆動力の低下・固定子数の減少・粘性負荷の増加**という異なる原因で再現する仮想ビーズ実験です。同じ回転速度だけから原因を一意に決められないことを、時系列・カメラ観察・トルク–スピード曲線で比較できます。**実験データから原因を診断するツールではありません。**ビーズアッセイでは、短いべん毛部分に付けたビーズの動きからモーターの回転速度を推定します。

[FlagellaScope のサイト](https://motor-causality-lab.yvm001.chatgpt.site)を利用できる場合は直接開きます。手元では `dist/index.html` を開きます。静的サイトに置く場合は `dist/` **内のファイル**を公開ディレクトリ直下に配置します。初期表示は英語で、**Japanese** ボタンで日本語に切り替えます。

1. 「介入後の目標速度」を基準速度に対する割合で設定し、「3つの原因を同じ速度に揃える」を押します。初期値は50%です。各条件の介入つまみを手動で変えた後は、このボタンで再設定できます。
2. 膜電位差、ΔpH、ビーズ直径、回転半径、粘度、固定子交換時間を変えます。**0–5秒が基準、5–20秒が介入、20–30秒が回復**です。再生や時刻スライダーで各時点を確認します。モーター図の回転だけは表示用に1/100速で、下段には露光積算したビーズ像と推定重心が現れます。
3. 撮影速度は**30–2000 fps**です。露光と位置ノイズを変え、モデル速度とカメラ推定速度の差を観察します。確率的な固定子交換と熱ゆらぎは別々に設定できます。
4. 時系列、**15–20秒**の比較表、トルク–スピード曲線を確認します。曲線の実線はモータートルク、破線は負荷トルク、丸は選択時刻の交点です。

「介入による低速化を有効にする」をオフにすると、30秒間ずっと基準条件を計算します。介入は5〜20秒間に駆動力・固定子数・負荷の一つを変え、20秒に解除する仮想操作です。オフの間も目標値と調整値は保持されます。

「実験条件CSVを読み込む」では、ヘッダーと設定1行からなるCSVを指定します。[CSVテンプレート](conditions-template.csv)を利用できます。一般設定で省略した列は現在値を保持し、介入値 `force`、`stators`、`load` の省略列は目標速度から再計算します。数値列は `target`（%）、`voltage`（mV）、`dpH`、`diameter`・`radius`（μm）、`viscosity`（mPa s）、`tau`（秒）、`fps`、`exposure`（ms）、`noise`（nm）、`force`（残存割合）、`stators`（平均固定子数）、`load`（粘度倍率）です。`interventionEnabled`、`stochastic`、`thermal` は `true` / `false` です。許容範囲は画面のスライダーと同じです。不正なCSVでは設定を変更しません。これは**条件の読み込み**であり、実測時系列の解析ではありません。

自動設定が揃えるのは**定常状態の平均場速度**です。画面に表示する15–20秒の平均は、その1回の計算結果です。確率的な整数固定子や緩慢な交換によって目標値から大きく外れることがあり、最大の相対差が5%を超えると警告します。内向き駆動力がゼロなら、速度による3原因の比較はできません。表の固定子数や駆動力はシミュレーター内部の値で、通常のビーズ撮影だけで直接得られる測定値ではありません。

### 計算の前提と限界

本ツールは**H⁺駆動モーターの現象論的な例示モデル**です。25 °Cで `V = ψ外 − ψ内`、`ΔpH = pH内 − pH外`、内向き駆動力 `P = max(0, V + 59.16 ΔpH)` mV と定義します。`p = P / 180`、固定子数を `N` とし、最大トルク `τ₀ = 180Np` pN nm、無負荷速度 `f₀ = 300p` Hz、屈曲点 `fₖ = 0.65f₀`、そのトルクを `0.9τ₀` とします。各点を直線で結び、負荷トルク `2πζf` との交点で速度を決めます。ビーズ半径 `a`、回転半径 `r`、粘度 `η` に対し `ζ = 6πηar² + 8πηa³` を仮定します。

[Xing らの論文（PNAS、2006年）](https://doi.org/10.1073/pnas.0507959103)に見られる平坦部と屈曲点の**形状**を参考にしました。ただし係数は**例示値**で、論文の図を数値化・フィットした値ではありません。論文の詳細な機械化学モデルも実装していません。

初期設定は固定子数が連続的に緩和する平均場モデルです。確率的交換では最大11サイトの整数値となります。カメラ速度はノイズを加えた露光中の位置から隣接フレームの角度差で推定するため、高速回転では折り返しや欠測が起こり得ます。式と乱数シードの詳細は画面の「モデルと仮定」に記載しました。Na⁺駆動、回転方向の切り替え、フックの弾性、壁面・細胞体による抵抗補正、負荷依存的な固定子動員、顕微鏡光学の完全な再現は扱いません。実験への定量適用には独立した測定との検証が必要です。

### 出力と検証

上部の「CSV保存」「JSON保存」は各条件のフレームごとのモデル値、カメラ推定値、設定を出力します。JSONの欠測値は `null` です。曲線パネルの **PNG / SVG / CSV / JSON** は、選択時刻のトルク曲線・負荷直線・動作点を画像または数値で保存します。動作点は**モデルのドリフト速度**であり、カメラ測定値のフィットではありません。

ソース一式で `node tests/release.test.cjs` を実行すると、理論的な速度一致、交点、30 fpsの計算などを確認できます。生物学的な予測精度や全ブラウザーでの画像出力を保証するものではありません。公開前の点検記録は [REVIEW.md](REVIEW.md) にあります。

**ソースコードの利用条件：ソースの再配布・改変は許諾しません。**ソースが閲覧可能な状態で公開されても、この方針は変わりません。再配布・改変を希望する場合は、事前に著作者へ許可を求めてください。
