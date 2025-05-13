# Eidolon V

## Gameplay Trailers:
https://www.youtube.com/watch?v=EjstwQHASVw
https://youtube.com/shorts/OIOcZsC4-bk?feature=share

![Scythe](https://github.com/user-attachments/assets/5b0d3bbc-ed54-4401-825f-dc7a62add477)
![Sabres](https://github.com/user-attachments/assets/9da0c22e-6851-46ae-ab3f-b96c15d321ee)
![Bow](https://github.com/user-attachments/assets/5cc64502-39e1-4019-9de7-83ce6c885097)
![Spear](https://github.com/user-attachments/assets/a01ba167-76cf-4808-b008-2777f7f67ea7)
![Sword](https://github.com/user-attachments/assets/f0759b25-2d42-4e25-bc8d-da9583478855)


# Eidolon IV

![Eidolon Cover 1](https://github.com/user-attachments/assets/1535c3e9-b8fa-4581-aaae-669cecab789e)

**NOTE: For optimal experience, close unecessary browser tabs, keep the game tab in focus, and use a mouse.**

---

## Table of Contents

1. [Introduction](#introduction)  
   - [Game Overview](#game-overview)
   - [Core Features](#core-features)
2. [Movement and Camera Controls](#movement-and-camera-controls)
   - [Basic Controls](#basic-controls)
3. [Weapons and Combat](#weapons-and-combat)
   - [Base Attacks](#base-attacks)
   - [Special Abilities](#special-abilities)
   - [Unlockable Abilities](#unlockable-abilities)
4. [Game Mechanics](#game-mechanics)
   - [Orb Charges](#orb-charges)
   - [Health](#health)
   - [Critical Hit Chance](#critical-hit-chance)
   - [Enemies](#enemies)
5. [Custom Model Creation](#custom-model-creation)
   - [Bone Wings](#bone-wings)  
   - [Sword Guard](#sword-guard)  
   - [Shoulder Plates](#shoulder-plates)   
6. [Technical Details](#technical-details)
   - [Unit System](#unit-system)
   - [Animation & Effects](#animation--effects)
   - [Math & Physics](#math--physics)
     - [Vector3 Operations](#vector3-operations)
     - [Quaternion Rotations](#quaternion-rotations)
     - [Interpolation Systems](#interpolation-systems)
   - [State Management](#state-management)
   - [Scene Management](#scene-management)
   - [Performance](#performance)
7. [Early Development](#early-development)
   - [v1.0 - Initial Release](#v10---initial-release)  
   - [v0.9 - Orb Charges](#v09---orb-charges)  
   - [v0.8 - Etherbow](#v08---etherbow)  
   - [v0.7 - Starter Corpse](#v07---starter-corpse)  
   - [v0.6 - Sword Smite](#v06---sword-smite)  
   - [v0.5 - Swing Animations](#v05---swing-animations)  
   - [v0.4 - Weapon Swapping](#v04---weapon-swapping)  
   - [v0.3 - Scene Environment](#v03---scene-environment)  
   - [v0.2 - Weapon Models](#v02---weapon-models)  
   - [v0.1 - Baseline](#v01---baseline)
   - [v0.0 - Inception](#v00---inception)
  8. [Epilogue](#epilogue)

---

![Eidolon Cover 2](https://github.com/user-attachments/assets/8e8d251d-fa7c-40f6-a7cd-58865aeec3bf)


## Introduction
Eidolon IV is a sci-fi fantasy & cosmic horror-themed 3D action combat game built with React Three Fiber (R3F), Three.js, and TypeScript. Drawing inspiration from classic hack-and-slash RPGs and roguelikes, it combines fast-paced combat with character progression and ability unlocks on level completion.

### Game Overview
- **Genre**: Action RPG / Hack-and-Slash / Roguelike
- **Perspective**: Third-person, top-down camera
- **Combat Style**: Real-time combat with 3 distinct weapon classes

### Core Features
- **Weapon System**: Each weapon has unique base attacks and special abilities
- **Progression**: Gain power through enemy defeats and level-up choices
- **Combat Mechanics**: 
  - Tactical positioning, dodging, and timing
  - Weapon-specific combo systems
  - Resource management with orb charges and cooldowns
 
![ScytheQE](https://github.com/user-attachments/assets/d8c8c80c-9156-4f9c-a4b0-20b4f35db74c)

---

## Movement and Camera Controls

### Basic Controls
| Action             | Input                |
|--------------------|----------------------|
| **Movement**       | `W`-`A`-`S`-`D`        |
| **Camera**         | `Right-click` (hold)   |
| **Auto-Attack**    | `Right-click` (hold)   |

- **A mouse is highly recommended for optimal gameplay.**

- Holding the `Right-Click` WHILE moving with `W`-`A`-`S`-`D` keys will allow smooth movement with camera control. This will also allow you to quickly switch targets, reposition, and efficiently aim at targets in front of you. 

- Holding the `Left-Click` will also perform an auto-attack that is the same as the weapon’s ‘Q’ ability, or regular attack swing. All combat ability buttons {`Q`, `E`, `R`, `1`, `2`} can be held down as well; they will cast automatically within their cooldown frame.

- The `A` key to move backwards will come in very handy when you want to evade attacks while also dealing damage to enemies that are encroaching on you. However, **walking backwards will incur a movement speed penalty**. 

- `W`-`A`-`S`-`D` can be held in combinations such as holding `W` and `A` together to go Northwest, `S`-`D` to go Southeast, etc. 

---

## Weapons and Combat


### Base Attacks
- **(‘Q’)**  is the default attack of the weapon that can also be triggered by the Left-Click:

| Weapon    | Range    | Cooldown | Damage | Swing Arc   |
|-----------|----------|----------|--------|-------------|
| Scythe    | 4.75 ft   | 0.75s     | 23     | Medium      |
| Sword     | 5.5 ft   | 1.0s     | 31     | Wide        |
| Sabres    | 4.0 ft   | 0.6s     | 17x2   | Narrow      |

![SwordQE](https://github.com/user-attachments/assets/e1b5db46-bf82-43c3-b99a-e986e6fb95c1)

### Special Abilities
- **('E')** is the weapon’s core special ability: 

| Weapon    | Ability         | Orb Cost | Cooldown | Damage              | Type           | Notes |
|-----------|-----------------|----------|----------|---------------------|----------------|-------|
| Scythe    | Entropic Bolt   | 1        | 0.7s     | 53                 | Single Target  | -     |
| Sword     | Divine Smite    | 0        | 4.0s     | (31+17)+41           | Area of Effect | Smite damage requires successful sword hit |
| Sabres    | Etherbow        | 0        | 0.65s     | 19 + (charge bonus) | Pierces in a Line           | Fully charged shots are guaranteed criticals - Cannot move while charging |

![SabreQE](https://github.com/user-attachments/assets/5dfc8352-71ec-4a60-93e2-9c9ab8e9de5a)

### Unlockable Abilities
- **('R' - '1' - '2')**  hotkeys are for the 3 ability choices that are available for each weapon to unlock at the completion of a level. The designations ‘Active' or ‘Passive’ determine whether or not an ability’s hotkey needs to be pressed to trigger its effect. 

---

## Game Mechanics

### Orb Charges
- All weapons have 8 orb charges, each with an 8 second cooldown. Only the Scythe consumes these orbs with its ‘E’ ability at the beginning of Level 1. Note that abilities that have an orb cost may still possess separate cooldowns. 

### Health
- Each enemy kill grants 1 point of maximum health (the kill counter is the right circle next to the experience bar), which also effectively heals for 1 HP (+1 Current HP /+1 Maximum HP). 
- There is no passive health regeneration; however, the Scythe and Greatsword have option(s) for healing that they may choose to unlock. 

### Critical Hit Chance
- By default is 11%, dealing double damage. 

### Enemies
- When an enemy begins its attack animation, there is a 1-second delay before any damage can be registered, allowing a short window to reposition and evade the attack. ALL attacks outrange enemy attacks, but vary in degree based on weapon choice. 

---

## Custom Model Creation
No external models/imports/assets used. First time I've ever done anything like this, so stuck with a 'bone' theme that seemed easier to work with, given their versatility.
- Built unit and weapon models by combining primitive geometries like cylinders, spheres
- Created unique shapes using Three.js `Shape` class to create 2D shapes using mathematical functions that are then extruded into 3D.
- Glowing effects using emissive materials and point lights
- Particle effects using instanced meshes and shader materials

### Bone Wings
![BONEWING CREATION](https://github.com/user-attachments/assets/dde85184-7ff0-4899-b287-e9c7116630c5)

### Sword Guard
![SWORD GUARD MODEL](https://github.com/user-attachments/assets/ddfd1eb6-b9e6-4314-ada7-3815697372be)

### Shoulder Plates
![SHOULDERPLATE CREATION 1](https://github.com/user-attachments/assets/7ba462a9-649f-41a9-8bdc-835a2b3d56cd)
![SHOULDERPLATE CREATION 2](https://github.com/user-attachments/assets/e680194a-3ae9-4a66-8922-12bb1e2ddab7)


---

## Technical Details

### Unit System
- Models are React components using React Three Fiber (R3F)
- Position tracking via `useRef` and Three.js `Group` components
- Health and state management through React's `useState`
- Collision detection using raycasting and distance calculations

### Animation & Effects
- Weapon swing animations using `useFrame` with pivot and rotation in 3 dimensions 
- Ability particle systems using instanced meshes
- Effect lifecycle management with unique IDs
- Projectile tracking and collision detection

- **Shader Programming**
   - Shader-based visual effects for abilities, terrain, and environment details 
   - GLSL (WebGL Shading Language)
   - Custom fragment shader and vertex shaders

### Math & Physics
- **Vector3 Operations**
  - Position tracking in 3D space (x, y, z)
  - Velocity and direction calculations (projectile trajectories)
  - Distance and collision checks (enemy detection)
  - Normalized direction vectors for character movement

- **Quaternion Rotations**
  - Smooth weapon rotation animations
  - Character orientation
  - Camera angle calculations
  - Preventing gimbal lock in 3D rotations*

- **Interpolation Systems**
  - Linear interpolation (Lerp) for smooth transitions
  - Spherical interpolation (Slerp) for rotations
  - Easing functions for natural movement
  - Special effects and animation curve calculations

### State Management
- React hooks: `useState`, `useEffect`, `useRef`, `useFrame` (R3F) to manage game states, including:
   - Health and damage tracking
   - Ability cooldowns and unlocks
   - Kill count and progression

### Scene Management
- Dynamic enemy spawning system
- Environment generation with procedural elements
- Level progression and state tracking
- Resource cleanup between scenes

### Performance
- Automatic disposal of Three.js resources
- Enemy unit memoization
- Batched updates for state changes
- Memory management and cache clearing
- Object pooling for particles and effects*

--- 

## Early Development

### v1.0 - Initial Release
![1 0](https://github.com/user-attachments/assets/836c0443-cdb9-4aed-82dc-1d6d81a60144)

- Enemy spawning + level-up + experience bar logic

### v0.9 - Orbital Charges
![8orbcharges](https://github.com/user-attachments/assets/90c55e1c-8263-4d38-96b0-38ea42274176)

- Logic for expending orbs to cast abilities. 

### v0.8 - Etherbow
![SabreBow2](https://github.com/user-attachments/assets/4de5e2c6-ce47-4229-9151-49f68e870600)

- Introduced charged bow shot as Sabre's 'E' ability.

### v0.7 - Starter Corpse
![bonewingsribcage](https://github.com/user-attachments/assets/a82fc47a-7fa0-4026-9fc5-9281ae64d43a)

- Initial character model with bone wings + ribcage.

### v0.6 - Sword Smite
![smite2](https://github.com/user-attachments/assets/21244e01-d1bd-45fd-a704-53f1261dcafe)

- Introduced Smite as Sword's 'E' ability.

### v0.5 - Swing Animations
![swing animations](https://github.com/user-attachments/assets/a7cea382-d56e-442f-8ef9-c9d9229f9a38)

- Melee swing animations for Scythe, Sword, and Sabres with hit registration.

### v0.4 - Weapon Swapping
![weapon models+swap](https://github.com/user-attachments/assets/ed580b7c-4e8e-411b-b29e-fe6ae3f4ff36)

- Implemented instant weapon swapping via 1-2-3 hotkeys.

### v0.3 - Scene Environment
![island in space](https://github.com/user-attachments/assets/59274513-1c79-44ea-ab8b-1e81c81812d8)

- Island drifting in space, encased in mountains - basic aesthetic

### v0.2 - Weapon Models
![better scythe](https://github.com/user-attachments/assets/974f8599-24f1-45c0-a624-ba313d6ced2b)

- Sword, Scythe, and Sabres initial model creation. 

### v0.1 - Baseline
![1121 (1)(8)](https://github.com/user-attachments/assets/9247e7c6-6cd0-4a21-8616-d08d82f591cf)

- Initial game logic setup with weapon systems.

### v0.0 - Inception
![0 0](https://github.com/user-attachments/assets/83d421de-dede-4131-82d5-27951e388829)

- Earliest video I could find (11/20/24) with basic movement and camera rotation. Was definitely procrastinating here..

--- 

## Epilogue
Didn't think I'd be able to do this with React at first, but I've always wanted to make a game - and what started off as procrastination turned into an amazing learning experience. There are a million things I'd like to add to this game, as well as what I would do differently from the ground up should i choose to create another one (particularly with component reuse and better optimization of hooks & how to potentially avoid hours of refactoring down the line - OR just not making a game with React next time) BUT this has already gone well past 200 hours of work - glad i got my exp. Considering this my self-assigned 'capstone project' for Rutgers CS '25. 

