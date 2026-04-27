# Mobile-friendly Unity app (Merger / survival game)

This repository’s **GitHub Pages** site serves the **WebGL** build under `survival/`. A **native** Android or iOS app must be built with **Unity Editor** on your machine; that cannot be done from Cursor or GitHub Actions without a Unity license and build pipeline.

## Where the Unity project is

On your disk, next to this repo (or inside your workspace), the full project is:

- **`MergerHMGame/`** — Unity **6000.4.0f1**, merge game (`Ilumisoft/Merge Dice` scenes).

That folder is **not** part of the `4x4_game` GitHub repo (it is large and untracked). Keep it in your own backup or a private Unity repo if you want version control.

## What was configured for mobile

Inside **`MergerHMGame/ProjectSettings/`**:

| Setting | Change |
|--------|--------|
| `applicationIdentifier` | `com.howtorebuildcivilization.survivalmerger` for **Android** and **iPhone** (required for store / device installs). |
| `overrideDefaultApplicationIdentifier` | `1` |
| `AndroidEnableSustainedPerformanceMode` | `1` (more stable game clock on many devices). |
| `QualitySettings` — `m_PerPlatformDefaultQuality` | **Android** and **iPhone** default quality set from **Medium (2)** to **Low (1)**. |

See **`MergerHMGame/MOBILE_BUILD.md`** for step-by-step **Build** instructions.

## Optional local PNG assets

If you still have the **“Merge Survival game”** export with:

- `Game assets/Items/Items/*.png`
- `Game assets/Game layers/Game layers/*.png`

copy them into **`MergerHMGame/Assets/ExternalSourceArt/`** (create the folder in Unity), set import type to **Sprite** where appropriate, then wire them into your UI or merge board in the editor.

## Honest limits

- **WebGL in Safari/Chrome on a phone** will never match a **native** build for startup time and memory; for the best mobile experience, ship **Android APK/AAB** or **iOS** from this Unity project.
- Fixing “broken in multiple places” on **mobile web** may still need **Unity-side** UI scaling, safe area, and input — do that in the **MergerHMGame** scenes and UI Canvas, then re-export WebGL **and** ship native builds as above.
