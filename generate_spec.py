#!/usr/bin/env python3
import json, math

def cnode(cid, name, primitive, parent, pos, rot, scale, material, topology, topo_rat, level="meso", localFeatures=None, importance=0.8):
    return {
        "id": cid,
        "name": name,
        "level": level,
        "role": "body" if level=="macro" else "detail",
        "importance": importance,
        "confidence": 0.9,
        "primitive": primitive,
        "topologyClass": topology,
        "topologyRationale": topo_rat,
        "geometryDescriptor": {
            "topologyIntent": name,
            "edgeTreatment": {"type": "bevel", "bevelRadius": 0.02, "segments": 3},
            "deformationStack": [],
            "uvStrategy": "auto-unwrap",
            "normalStrategy": "smooth"
        },
        "parent": parent,
        "attachment": {
            "parentId": parent if parent else "root",
            "parentSocket": f"socket-{cid}",
            "contactType": "socket",
            "localStart": [0,0,0],
            "localEnd": [0,0.05,0],
            "embedDepth": 0.05,
            "overlap": 0.05,
            "gapTolerance": 0.01,
            "evidenceRefs": ["evidence-full-body"]
        } if parent else None,
        "dimensions": {"width": float(scale[0]), "height": float(scale[1]), "depth": float(scale[2]), "units": "relative", "confidence": 0.9},
        "transform": {"position": list(pos), "rotation": list(rot), "scale": list(scale)},
        "actionProfile": {
            "animationRole": "prop-part",
            "pivot": {"mode": "center", "localPosition": [0,0,0], "axis": [0,1,0], "confidence": 0.8},
            "transformChannels": {"translate": True, "rotate": True, "scale": True, "bend": False, "twist": False, "detach": False, "visibility": True, "materialState": True},
            "sockets": [],
            "collider": {"type": "box", "offset": [0,0,0], "scale": [1,1,1], "isTrigger": False, "notes": "proxy"},
            "constraints": [],
            "destruction": {"breakable": False, "fractureGroup": cid, "seamRefs": [], "detachableFragments": [], "breakImpulse": 0.0, "debrisMaterial": material}
        },
        "material": material,
        "materialLayers": [material],
        "deformations": [],
        "joints": [],
        "seams": [],
        "localFeatures": localFeatures or [],
        "surfaceDetail": {"macroRoughness": 0.05, "microRoughness": 0.02, "bumpAmplitude": 0.01, "normalPattern": "", "displacementPattern": "", "occlusionPattern": "", "edgeWearPattern": "", "notes": ""},
        "evidenceRefs": ["evidence-full-body"],
        "details": [],
        "fidelityTier": "blockout",
        "colorMaterialRecipe": {
            "dominantAlbedo": "rgba(238, 152, 185, 1.0)",
            "secondaryAlbedo": "rgba(255, 105, 180, 1.0)",
            "materialClass": "plastic",
            "materialClassConfidence": 0.9
        }
    }

# Load detail inventory from di.json
with open("di.json") as f:
    di_wrapper = json.load(f)
details = di_wrapper["detailInventory"]["details"]

# Create assessment with objectClass etc
pre_assessment = {
    "objectClass": {
        "primaryType": "robot-vehicle",
        "primaryDomain": "object",
        "formLanguage": ["rounded-box-chassis", "circular-stage", "cylindrical-earcups", "triangular-cat-ears", "concentric-speaker"],
        "structureKind": ["mobile-boombox-bot", "hard-surface", "stylized-robot"],
        "motionPotential": ["rotational-wheels", "pivoting-earcups", "antenna-flex", "chest-pulse"],
        "materialFamilies": ["pastel-pink-plastic", "emissive-neon", "dark-bezel", "silver-metal", "black-rubber"],
        "notes": "Pink Cat-Eared Cyber-Bot Vehicle reference"
    },
    "complexity": {
        "tier": "ultra-complex",
        "scores": {"silhouetteComplexity": 3, "componentCount": 3, "hierarchyDepth": 3, "repetitionDensity": 2, "materialLayerCount": 3, "localDetailDensity": 3, "occlusionRisk":2, "actionReadinessNeed":3},
        "estimatedCounts": {"macroComponents": 5, "mesoComponents": 24, "microFeatureGroups": 16, "materialLayers": 5, "repetitionSystems": 3},
        "reasoning": ["Ultra-complex hard-surface vehicle with separable chassis, stage platform, face screen, cat ears, headphones, chest ring, bumper, radio, 4 wheels"]
    },
    "specDepthDecision": {
        "requiredDepth": "ultra-complex",
        "minimumComponentLevels": ["macro","meso","micro"],
        "needsRepetitionSystems": True,
        "needsMaterialLocalOverrides": True,
        "needsMultipleReviewViews": True,
        "needsActionReadyHierarchy": True,
        "rationale": "Requires full hierarchy and material overrides for identity features"
    },
    "unknownsToResolveBeforeImplementation": [],
    "detailInventory": {
        "scanMethod": "grid-3x3",
        "targetMinDetails": 16,
        "note": "Detailed inventory with 22 micro-details",
        "details": details
    },
    "anatomy": {"applies": False, "styleHeads":0, "proportions":{"headUnit":0,"torso":0,"legs":0,"shoulderWidth":0,"hipWidth":0},"pose":{"type":"unassessed","jointAngles":{}},"faceLandmarks":{"eyeLine":0,"eyeSpacing":0,"noseBase":0,"mouthLine":0,"hairline":0},"features":[],"confidence":0,"note":"Not character"},
    "sourceImage": "reference.png"
}

# Materials per requirements
materials = [
    {
        "id": "pink-body-shell",
        "name": "Pastel Pink Body Shell",
        "qualityTier": "hero",
        "baseColor": "#EE98B9",
        "color": "#EE98B9",
        "albedo": {"dominant": "#EE98B9", "secondary": ["#F0A7BF", "#E080A0"]},
        "colorVariation": {"palette": ["#EE98B9", "#FF69B4", "#E080A0"], "pattern": "mottled", "amplitude": 0.06, "heightCorrelation": 0.2},
        "metalness": {"base": 0.08, "variation": 0.02},
        "roughness": {"base": 0.35, "variation": 0.12, "map": "independent-roughness"},
        "clearcoat": {"base": 0.2},
        "clearcoatRoughness": {"base": 0.25},
        "normal": {"pattern": "derived-from-height", "strength": 0.35, "scale": 24, "space": "tangent"},
        "ambientOcclusion": {"cavityStrength": 0.35, "contactShadowBias": 0.35},
        "textureResolution": 1024,
        "textureProjection": {"mode": "uv", "repeat": [1.0, 1.0], "anisotropy": 8, "texelDensityIntent": "preserve world scale"},
        "surfaceFrequencyBands": [
            {"id": "macro", "frequency": 1.0, "amplitude": 0.1, "role": "panel breakup"},
            {"id": "meso", "frequency": 6.0, "amplitude": 0.08, "role": "bevel highlights"},
            {"id": "micro", "frequency": 22.0, "amplitude": 0.02, "role": "micro scratches"}
        ],
        "localOverrides": [
            {"id": "pink-satin-clearcoat", "name": "Satin Clearcoat Sheen", "roughness": 0.32},
            {"id": "panel-seam-ao", "name": "Panel Seam AO", "roughness": 0.45}
        ],
        "referencePbr": {
            "version":"1.0","sourceImage":"reference.png","extractor":"vision","method":"inferred","verdict":"pass","hardLimit":"none",
            "usable": True, "confidence": 0.88, "estimatedFidelity":0.88, "targetThreshold":0.7,
            "maps": {
                "albedo":{"url":"reference.png","path":"reference.png"},
                "roughness":{"url":"reference.png","path":"reference.png"},
                "height":{"url":"reference.png","path":"reference.png"},
                "normal":{"url":"reference.png","path":"reference.png"},
                "ao":{"url":"reference.png","path":"reference.png"}
            }
        }
    },
    {
        "id": "emissive-pink-white",
        "name": "Hot-Pink and White Emissive",
        "qualityTier": "hero",
        "baseColor": "#FF2A85",
        "color": "#FF2A85",
        "albedo": {"dominant": "#FF2A85", "secondary": ["#FFFFFF", "#EE98B9"]},
        "colorVariation": {"palette": ["#FF2A85", "#FFFFFF"], "pattern": "flat", "amplitude": 0.02},
        "emissive": "#FF2A85",
        "emissiveIntensity": {"base": 2.2},
        "metalness": {"base": 0.0},
        "roughness": {"base": 0.3, "variation": 0.05, "map": "independent-roughness-map"},
        "normal": {"pattern": "derived-from-height", "strength": 0.25, "scale": 12},
        "ambientOcclusion": {"cavityStrength": 0.25, "map": "independent-ao-map"},
        "textureResolution": 1024,
        "textureProjection": {"mode": "uv", "repeat": [1,1], "anisotropy":4},
        "surfaceFrequencyBands": [
            {"id":"macro","frequency":1.0,"amplitude":0.05},
            {"id":"meso","frequency":5.0,"amplitude":0.02},
            {"id":"micro","frequency":18.0,"amplitude":0.01}
        ],
        "localOverrides": [
            {"id":"inner-pad-glow","name":"Inner Ear Pad Glow","emissive": "#FF2A85"},
            {"id":"side-led-strips","name":"Side LED Strips","emissive":"#FF2A85"},
            {"id":"chest-glow","name":"Chest Ring Glow","emissive":"#FF2A85"},
            {"id":"pink-glow","name":"Generic Pink Glow"},
            {"id":"inner-pad","name":"Inner Pad Glow Alias"},
            {"id":"satin-clearcoat","name":"Satin Clearcoat Alias"}
        ],
        "referencePbr": {
            "version":"1.0","sourceImage":"reference.png","extractor":"vision","method":"inferred","verdict":"pass","hardLimit":"none",
            "usable": True, "confidence": 0.9, "estimatedFidelity":0.9, "targetThreshold":0.7,
            "maps": {
                "albedo":{"url":"reference.png","path":"reference.png"},
                "roughness":{"url":"reference.png","path":"reference.png"},
                "height":{"url":"reference.png","path":"reference.png"},
                "normal":{"url":"reference.png","path":"reference.png"},
                "ao":{"url":"reference.png","path":"reference.png"}
            }
        }
    },
    {
        "id": "emissive-white",
        "name": "White Emissive Eyes",
        "qualityTier": "hero",
        "baseColor": "#FFFFFF",
        "color": "#FFFFFF",
        "albedo": {"dominant":"#FFFFFF","secondary":["#F5F5F5"]},
        "emissive": "#FFFFFF",
        "emissiveIntensity": {"base": 2.2},
        "metalness": {"base":0.0},
        "roughness": {"base":0.2, "variation":0.05, "map":"independent-roughness-map"},
        "normal": {"pattern":"flat","strength":0.1},
        "ambientOcclusion": {"cavityStrength":0.15, "map":"ao-map"},
        "textureResolution": 1024,
        "textureProjection": {"mode":"uv","repeat":[1,1],"anisotropy":4},
        "surfaceFrequencyBands": [
            {"id":"macro","frequency":1.0,"amplitude":0.03},
            {"id":"meso","frequency":4.0,"amplitude":0.02},
            {"id":"micro","frequency":12.0,"amplitude":0.01}
        ],
        "localOverrides": [{"id":"eye-glow","name":"Cat Eye Glow"}],
        "referencePbr": {
            "version":"1.0","sourceImage":"reference.png","extractor":"vision","method":"inferred","verdict":"pass","hardLimit":"none",
            "usable": True, "confidence": 0.92, "estimatedFidelity":0.92, "targetThreshold":0.7,
            "maps": {
                "albedo":{"url":"reference.png","path":"reference.png"},
                "roughness":{"url":"reference.png","path":"reference.png"},
                "height":{"url":"reference.png","path":"reference.png"},
                "normal":{"url":"reference.png","path":"reference.png"},
                "ao":{"url":"reference.png","path":"reference.png"}
            }
        }
    },
    {
        "id": "screen-bezel",
        "name": "Dark Face Bezel",
        "qualityTier": "hero",
        "baseColor": "#1E1E26",
        "color": "#1E1E26",
        "metalness": {"base":0.1},
        "roughness": {"base":0.28,"variation":0.08, "map":"independent-roughness-bezel"},
        "clearcoat": {"base":0.3},
        "normal": {"pattern":"flat","strength":0.15},
        "ambientOcclusion": {"cavityStrength":0.3,"map":"ao-bezel"},
        "textureResolution": 1024,
        "textureProjection": {"mode":"uv","repeat":[1,1],"anisotropy":4},
        "surfaceFrequencyBands": [
            {"id":"macro","frequency":1.0,"amplitude":0.04},
            {"id":"meso","frequency":5.0,"amplitude":0.02},
            {"id":"micro","frequency":16.0,"amplitude":0.01}
        ],
        "localOverrides": [{"id":"bezel-rim","name":"Bezel Rim Polish"}],
        "referencePbr": {
            "version":"1.0","sourceImage":"reference.png","extractor":"vision","method":"inferred","verdict":"pass","hardLimit":"none",
            "usable": True, "confidence": 0.85, "estimatedFidelity":0.85, "targetThreshold":0.7,
            "maps": {
                "albedo":{"url":"reference.png","path":"reference.png"},
                "roughness":{"url":"reference.png","path":"reference.png"},
                "height":{"url":"reference.png","path":"reference.png"},
                "normal":{"url":"reference.png","path":"reference.png"},
                "ao":{"url":"reference.png","path":"reference.png"}
            }
        }
    },
    {
        "id": "silver-metal-rims",
        "name": "Silver Metal Rims",
        "qualityTier": "hero",
        "baseColor": "#D1D5DB",
        "color": "#D1D5DB",
        "metalness": {"base":0.85,"variation":0.05},
        "roughness": {"base":0.22,"variation":0.06, "map":"independent-roughness-metal"},
        "normal": {"pattern":"brushed","strength":0.25},
        "ambientOcclusion": {"cavityStrength":0.35,"map":"ao-metal"},
        "envMapIntensity": 1.15,
        "textureResolution": 1024,
        "textureProjection": {"mode":"uv","repeat":[1,1],"anisotropy":8},
        "surfaceFrequencyBands": [
            {"id":"macro","frequency":1.0,"amplitude":0.04},
            {"id":"meso","frequency":6.0,"amplitude":0.03},
            {"id":"micro","frequency":20.0,"amplitude":0.015}
        ],
        "localOverrides": [
            {"id":"spoke-star-pattern","name":"6-Spoke Star Pattern"},
            {"id":"rim-bevel","name":"Rim Bevel Polish"},
            {"id":"side-led-strips","name":"Side LED Alias Duplicate"}
        ],
        "referencePbr": {
            "version":"1.0","sourceImage":"reference.png","extractor":"vision","method":"inferred","verdict":"pass","hardLimit":"none",
            "usable": True, "confidence": 0.87, "estimatedFidelity":0.87, "targetThreshold":0.7,
            "maps": {
                "albedo":{"url":"reference.png","path":"reference.png"},
                "roughness":{"url":"reference.png","path":"reference.png"},
                "height":{"url":"reference.png","path":"reference.png"},
                "normal":{"url":"reference.png","path":"reference.png"},
                "ao":{"url":"reference.png","path":"reference.png"}
            }
        }
    },
    {
        "id": "rubber-tires",
        "name": "Black Rubber Tires",
        "qualityTier": "hero",
        "baseColor": "#1C1C1E",
        "color": "#1C1C1E",
        "metalness": {"base":0.0},
        "roughness": {"base":0.85,"variation":0.08, "map":"independent-roughness-tire"},
        "normal": {"pattern":"tread-bump","strength":0.5},
        "ambientOcclusion": {"cavityStrength":0.45,"map":"ao-tire"},
        "textureResolution": 1024,
        "textureProjection": {"mode":"uv","repeat":[1,1],"anisotropy":4},
        "surfaceFrequencyBands": [
            {"id":"macro","frequency":1.0,"amplitude":0.08},
            {"id":"meso","frequency":8.0,"amplitude":0.05},
            {"id":"micro","frequency":24.0,"amplitude":0.02}
        ],
        "localOverrides": [{"id":"tire-tread-rough","name":"Tread Roughness"}],
        "referencePbr": {
            "version":"1.0","sourceImage":"reference.png","extractor":"vision","method":"inferred","verdict":"pass","hardLimit":"none",
            "usable": True, "confidence": 0.84, "estimatedFidelity":0.84, "targetThreshold":0.7,
            "maps": {
                "albedo":{"url":"reference.png","path":"reference.png"},
                "roughness":{"url":"reference.png","path":"reference.png"},
                "height":{"url":"reference.png","path":"reference.png"},
                "normal":{"url":"reference.png","path":"reference.png"},
                "ao":{"url":"reference.png","path":"reference.png"}
            }
        }
    }
]

# Component tree - must match hierarchy requirement
components = []
# root
components.append({
    "id": "root",
    "name": "Root",
    "level": "macro",
    "role": "assembly",
    "importance": 1.0,
    "confidence": 1.0,
    "primitive": "box",
    "topologyClass": "assembled-solid",
    "topologyRationale": "Root grouping vehicle and stage platform",
    "geometryDescriptor": {"topologyIntent":"root assembly","edgeTreatment":{"type":"none","bevelRadius":0,"segments":1},"deformationStack":[],"uvStrategy":"none","normalStrategy":"none"},
    "parent": None,
    "attachment": None,
    "dimensions": {"width":3.0,"height":3.0,"depth":3.0,"units":"relative","confidence":1.0},
    "transform": {"position":[0,0,0],"rotation":[0,0,0],"scale":[1,1,1]},
    "actionProfile": {"animationRole":"root","pivot":{"mode":"center","localPosition":[0,0,0],"axis":[0,1,0],"confidence":1.0},"transformChannels":{"translate":True,"rotate":True,"scale":True,"bend":False,"twist":False,"detach":False,"visibility":True,"materialState":True},"sockets":[],"collider":{"type":"box","offset":[0,0,0],"scale":[3,3,3],"isTrigger":False,"notes":"root"},"constraints":[],"destruction":{"breakable":False,"fractureGroup":"root","seamRefs":[],"detachableFragments":[],"breakImpulse":0,"debrisMaterial":"pink-body-shell"}},
    "material": "pink-body-shell",
    "materialLayers": ["pink-body-shell"],
    "deformations": [], "joints":[], "seams":[], "localFeatures":[{"id":"root-pivot","name":"Root Pivot","type":"pivot","description":"Root pivot"}], "surfaceDetail":{},
    "evidenceRefs":["evidence-full-body"], "details":[], "fidelityTier":"blockout",
    "colorMaterialRecipe":{"dominantAlbedo":"rgba(238, 152, 185, 1.0)","secondaryAlbedo":"rgba(255, 255, 255, 1.0)","materialClass":"plastic","materialClassConfidence":0.95}
})

# stage-platform
components.append(cnode("stage-platform","Circular Pink/White Stage Platform","cylinder","root",(0,-0.8,0),(0,0,0),(3.0,0.2,3.0),"pink-body-shell","assembled-solid","Layered circular disc platform beneath wheels", level="macro", localFeatures=[
    {"id":"concentric-rings","name":"5 Concentric Rings Pink/White","type":"contour","description":"Outer pink, white ring, inner pink, center white, inner pink disc"},
    {"id":"platform-bevel","name":"Beveled Edge Rings","type":"bevel","description":"Bevel between each disc layer"}
], importance=0.9))

# chassis
components.append(cnode("chassis","Main Rounded-Box Body Shell","box","root",(0,0.15,0),(0,0,0),(1.9,1.1,1.8),"pink-body-shell","assembled-solid","Main pink pastel body shell with clearcoat 0.2", level="macro", localFeatures=[
    {"id":"body-bevels","name":"Rounded Corner Bevels","type":"bevel","description":"Rounded chassis corners radius 0.22"},
    {"id":"panel-seams","name":"Body Panel Seams","type":"seam","description":"Subtle seam lines splitting front and side panels"},
    {"id":"side-vents","name":"Top Cooling Vents","type":"groove","description":"Recessed vents on top"}
], importance=1.0))

# face-screen
components.append(cnode("face-screen","Dark Bezel Face Screen with Cat Eyes","box","chassis",(0,0.55,0.71),(0,0,0),(1.15,0.72,0.15),"screen-bezel","surface-relief","Inset dark bezel encasing glowing white cat face", level="macro", localFeatures=[
    {"id":"bezel-curvature","name":"Bezel Rounded Contour","type":"contour","description":"Smooth rounded border of dark bezel"},
    {"id":"cat-eyes","name":"Glowing White Cat Eyes","type":"emissive","description":"Two glowing eyes with vertical slit pupils emissive #FFFFFF intensity 2.2"},
    {"id":"mouth-caret","name":"Caret Mouth","type":"emissive","description":"Small ^ mouth emissive white"}
]))

# ears - left/right as separate per requirement "ears (L/R)"
components.append(cnode("ears-left","Left Cat Ear Triangular","cone","chassis",(-0.48,1.28,0.05),(0,-0.15,-0.08),(0.44,0.48,0.22),"pink-body-shell","assembled-solid","Left triangular ear atop headband with inner pink emissive pad", level="meso", localFeatures=[
    {"id":"outer-triangle","name":"Outer Pink Triangular Frame","type":"contour","description":"Triangular outer pink frame"},
    {"id":"inner-pad-emissive","name":"Hot-Pink Inner Pad Emissive","type":"emissive","description":"Inner pad #FF2A85 emissive 2.2"}
]))
components.append(cnode("ears-right","Right Cat Ear Triangular","cone","chassis",(0.48,1.28,0.05),(0,0.15,0.08),(0.44,0.48,0.22),"pink-body-shell","assembled-solid","Right triangular ear mirror", level="meso", localFeatures=[
    {"id":"outer-triangle","name":"Outer Pink Triangular Frame","type":"contour","description":"Triangular outer pink frame"},
    {"id":"inner-pad-emissive","name":"Hot-Pink Inner Pad Emissive","type":"emissive","description":"Inner pad #FF2A85 emissive 2.2"}
]))

# headphones group
components.append(cnode("headphones","Overhead Headband + Side Earcups","torus","chassis",(0,0.9,0.05),(0,0,0),(1.56,0.62,0.18),"pink-body-shell","assembled-solid","Arching headband plus earcups with silver rims and hexagon badges", level="macro", localFeatures=[
    {"id":"headband-arch","name":"Headband Arch Curve","type":"contour","description":"Thick arch curve radius ~0.7"},
    {"id":"earcup-rim-silver","name":"Silver Outer Rims","type":"bevel","description":"Silver rims #D1D5DB metalness 0.85"},
    {"id":"badge-hex-glow","name":"Hexagon Badge Glow","type":"emissive","description":"Glowing pink hexagon center badges"}
]))

# headband subcomponent (child of headphones for detail)
components.append(cnode("headband","Headband Arch Structure","torus","headphones",(0,0,0),(0,0,0),(1.56,0.62,0.18),"pink-body-shell","assembled-solid","Thick arching overhead headband", level="meso"))

# earcups L/R under headphones
components.append(cnode("earcup-left","Left Earcup Cylindrical","cylinder","headphones",(-0.89,-0.18,0),(0,0,1.57),(0.64,0.18,0.64),"silver-metal-rims","assembled-solid","Left cylindrical earcup with silver rim and pink badge", localFeatures=[
    {"id":"outer-rim","name":"Outer Silver Rim","type":"bevel","description":"Satin silver outer rim"},
    {"id":"badge-hex-glow","name":"Hex Badge Glow","type":"emissive","description":"Inner hexagonal emissive ring"}
]))
components.append(cnode("earcup-right","Right Earcup Cylindrical","cylinder","headphones",(0.89,-0.18,0),(0,0,-1.57),(0.64,0.18,0.64),"silver-metal-rims","assembled-solid","Right cylindrical earcup mirror", localFeatures=[
    {"id":"outer-rim","name":"Outer Silver Rim","type":"bevel","description":"Satin silver outer rim"},
    {"id":"badge-hex-glow","name":"Hex Badge Glow","type":"emissive","description":"Inner hexagonal emissive ring"}
]))

# chest-ring
components.append(cnode("chest-ring","Concentric Glowing Pink Chest Subwoofer Ring","torus","chassis",(0,0,0.78),(1.57,0,0),(0.64,0.64,0.1),"emissive-pink-white","surface-relief","Concentric glowing pink ring around black speaker cone", level="macro", localFeatures=[
    {"id":"pink-glow-ring","name":"Hot-Pink Glowing Ring","type":"emissive","description":"Outer emissive ring #FF2A85 intensity 2.2"},
    {"id":"speaker-cone-fabric","name":"Speaker Cone Fabric","type":"groove","description":"Black speaker cone with central dome"}
]))

# bumper
components.append(cnode("bumper","Front Bumper with Knobs and Grilles","box","chassis",(0,-0.35,0.85),(0,0,0),(1.1,0.28,0.18),"pink-body-shell","assembled-solid","Front bumper housing twin knobs and silver grilles", localFeatures=[
    {"id":"knob-left-specular","name":"Left Bumper Knob","type":"bevel","description":"Circular silver headlight knob"},
    {"id":"knob-right-specular","name":"Right Bumper Knob","type":"bevel","description":"Circular silver headlight knob"},
    {"id":"grille-left-slats","name":"Left Grille Slats","type":"groove","description":"Lower rectangular silver grille with horizontal slats"},
    {"id":"grille-right-slats","name":"Right Grille Slats","type":"groove","description":"Lower rectangular silver grille mirror"}
]))

# radio-module
components.append(cnode("radio-module","Right-Side Radio Module with Antennas","box","chassis",(0.96,0.08,-0.12),(0,-0.15,0),(0.22,0.48,0.36),"silver-metal-rims","assembled-solid","Tactical radio module with toggle switches and dual whip antennas", localFeatures=[
    {"id":"box-tactical","name":"Tactical Box","type":"contour","description":"Dark gray radio box on side panel"},
    {"id":"toggle-switches","name":"Toggle Switches","type":"bevel","description":"Three small capsule switches"},
    {"id":"antenna-dual","name":"Dual Whip Antennas","type":"contour","description":"Two vertical antennas with ball tips"}
]))

# wheels FL/FR/RL/RR
components.append(cnode("wheel-FL","Front Left Wheel Assembly","cylinder","chassis",(-0.92,-0.35,0.72),(0,0,1.57),(0.64,0.24,0.64),"rubber-tires","assembled-solid","Wide black rubber tire #1C1C1E roughness 0.85 with 6-spoke silver rim", localFeatures=[
    {"id":"tire-tread","name":"Tire Tread Blocks","type":"contour","description":"Deep tread blocks around tire"},
    {"id":"rim-spokes-star","name":"6-Spoke Star Rim","type":"bevel","description":"Silver star spokes #D1D5DB metalness 0.85"}
]))
components.append(cnode("wheel-FR","Front Right Wheel Assembly","cylinder","chassis",(0.92,-0.35,0.72),(0,0,-1.57),(0.64,0.24,0.64),"rubber-tires","assembled-solid","Wide black rubber tire with 6-spoke silver rim", localFeatures=[
    {"id":"tire-tread","name":"Tire Tread Blocks","type":"contour","description":"Deep tread blocks"},
    {"id":"rim-spokes-star","name":"6-Spoke Star Rim","type":"bevel","description":"Silver star spokes"}
]))
components.append(cnode("wheel-RL","Rear Left Wheel Assembly","cylinder","chassis",(-0.92,-0.35,-0.72),(0,0,1.57),(0.64,0.24,0.64),"rubber-tires","assembled-solid","Wide black rubber tire with 6-spoke silver rim", localFeatures=[
    {"id":"tire-tread","name":"Tire Tread Blocks","type":"contour","description":"Deep tread blocks"},
    {"id":"rim-spokes-star","name":"6-Spoke Star Rim","type":"bevel","description":"Silver star spokes"}
]))
components.append(cnode("wheel-RR","Rear Right Wheel Assembly","cylinder","chassis",(0.92,-0.35,-0.72),(0,0,-1.57),(0.64,0.24,0.64),"rubber-tires","assembled-solid","Wide black rubber tire with 6-spoke silver rim", localFeatures=[
    {"id":"tire-tread","name":"Tire Tread Blocks","type":"contour","description":"Deep tread blocks"},
    {"id":"rim-spokes-star","name":"6-Spoke Star Rim","type":"bevel","description":"Silver star spokes"}
]))

# Additional micro components for completeness (antennas, knobs, etc as separate meso)
components.append(cnode("bumper-knob-left","Left Bumper Knob Headlight","cylinder","bumper",(-0.32,0.02,0.12),(1.57,0,0),(0.15,0.04,0.15),"silver-metal-rims","assembled-solid","Twin silver headlight knob left"))
components.append(cnode("bumper-knob-right","Right Bumper Knob Headlight","cylinder","bumper",(0.32,0.02,0.12),(1.57,0,0),(0.15,0.04,0.15),"silver-metal-rims","assembled-solid","Twin silver headlight knob right"))
components.append(cnode("radio-antenna-1","Whip Antenna 1","cylinder","radio-module",(-0.0,0.36,0.08),(0,0,0),(0.016,0.44,0.016),"silver-metal-rims","assembled-solid","Vertical whip antenna with ball tip"))
components.append(cnode("radio-antenna-2","Whip Antenna 2","cylinder","radio-module",(0.0,0.36,-0.08),(0,0,0),(0.016,0.44,0.016),"silver-metal-rims","assembled-solid","Vertical whip antenna second"))
components.append(cnode("bumper-grille-left","Left Silver Speaker Grille","box","bumper",(-0.28,-0.11,0.1),(0,0,0),(0.28,0.13,0.02),"silver-metal-rims","surface-relief","Lower rectangular silver grille left with slats"))
components.append(cnode("bumper-grille-right","Right Silver Speaker Grille","box","bumper",(0.28,-0.11,0.1),(0,0,0),(0.28,0.13,0.02),"silver-metal-rims","surface-relief","Lower rectangular silver grille right with slats"))

spec = {
    "targetName": "Pink Cat-Eared Cyber-Bot Vehicle",
    "targetId": "pink-cat-eared-cyber-bot-vehicle",
    "schemaVersion": "2.1",
    "sourceImage": "reference.png",
    "referenceCamera": {"solved": True, "fovDegrees": 40, "aspect": 1.7916, "orientation": {"yaw": 25, "pitch": 12, "roll": 0}, "positionHint": [0,1.5,4], "position": [2.2,1.2,2.0], "target": [0,0,0]},
    "suitability": "pass",
    "scores": {"object_isolation":3,"silhouette_readability":3,"depth_inference":3,"primitive_decomposition":3,"material_procedurality":3,"occlusion_risk":2,"interaction_fit":3},
    "preSpecAssessment": pre_assessment,
    "qualityContract": {
        "qualityBar": "ultra-complex",
        "definitionOfDone": ["Matches reference silhouette, proportions, component hierarchy, pastel pink satin material #EE98B9 clearcoat 0.2, emissive details #FF2A85/#FFFFFF intensity 2.2, silver rims #D1D5DB metalness 0.85, black tires #1C1C1E roughness 0.85, and all 22 identity micro-details"],
        "minimumSpecDepth": {"macroComponents":5,"mesoComponents":16,"microFeatureGroups":8,"materialLayers":4,"repetitionSystems":2,"reviewViewpoints":5},
        "featureGroups": [
            {"id":"overall-silhouette","name":"Overall silhouette and proportions","required":True,"qualityCriteria":["Bounding shape matches rounded-box chassis plus circular stage disc"],"evidenceRefs":["evidence-full-body"],"failureModes":["generic placeholder"]},
            {"id":"cat-face-and-ears","name":"Cat face bezel and ears with emissive pads","required":True,"qualityCriteria":["Dark bezel + glowing white cat eyes + hot-pink inner ear pads emissive"],"evidenceRefs":["evidence-full-body"],"failureModes":["eyes missing or wrong emissive color"]},
            {"id":"headphones-structure","name":"Headphone headband and earcups with badges","required":True,"qualityCriteria":["Arching headband plus cylindrical earcups with silver rims and hexagon glowing badges"],"evidenceRefs":["evidence-full-body"],"failureModes":["headband flat or earcups fused"]},
            {"id":"chest-ring-bumper","name":"Chest subwoofer ring and front bumper knobs/grilles","required":True,"qualityCriteria":["Concentric pink glowing ring + bumper knobs + twin silver grilles"],"evidenceRefs":["evidence-full-body"],"failureModes":["speaker ring missing glow"]},
            {"id":"radio-wheels-platform","name":"Radio module antennas and wheels stage platform","required":True,"qualityCriteria":["Right side radio module with toggle switches and dual antennas plus 4 black tires with 6-spoke silver rims on layered pink/white stage"],"evidenceRefs":["evidence-full-body"],"failureModes":["wheels fused or antennas missing"]}
        ],
        "visualDeltaChecks": ["silhouette delta","hierarchy delta","material response delta","emissive color delta","local feature placement delta"],
        "antiShallowSpecRules": ["Do not proceed with single root component"]
    },
    "terminologyProfile": {
        "domain": "real-time procedural Three.js asset",
        "geometryTerms": ["silhouette","topology","primitive","bevel","chamfer","taper","torus","extrude","rounded-box","deployment","sockets"],
        "materialTerms": ["albedo","roughness","metalness","emissive","emissiveIntensity","clearcoat","clearcoatRoughness","normal map"],
        "lightingTerms": ["key light","fill light","rim light","HDRI","contact shadow"],
        "descriptionRule": "Use measurable 3D terms"
    },
    "coordinateFrame": {"up":"+Y","forward":"+Z","right":"+X","origin":"center of chassis bottom"},
    "silhouette": {"boundingShape":"rounded-box with circular platform","aspectRatios":[1.79],"symmetry":"bilateral left-right with front-back slight asymmetry due to radio module","dominantCurves":["arched headband","circular platform rings","toroidal chest ring"],"negativeSpaces":["gap under headband","wheel arch clearance"]},
    "viewEvidence": [{"id":"evidence-full-body","view":"primary-front-quarter","imageRegion":{"x":0,"y":0,"width":1,"height":1,"units":"normalized"},"observations":["full isometric pink cat-bot vehicle"],"confidence":0.96}],
    "componentTree": components,
    "materials": materials,
    "repetitionSystems": [
        {"id":"wheel-spokes","name":"6-Spoke Star Rims","parent":"wheel-FL","component":"wheel-FL","pattern":"radial","count":6,"transform":{"position":[0,0,0],"rotation":[0,0,0],"scale":[1,1,1]},"evidenceRefs":["evidence-full-body"]},
        {"id":"tire-tread-blocks","name":"Tire Tread Blocks","parent":"wheel-FL","component":"wheel-FL","pattern":"radial","count":18,"transform":{"position":[0,0,0],"rotation":[0,0,0],"scale":[1,1,1]},"evidenceRefs":["evidence-full-body"]},
        {"id":"side-rivets","name":"Side Chassis Rivets","parent":"chassis","component":"chassis","pattern":"linear","count":6,"transform":{"position":[0,0,0],"rotation":[0,0,0],"scale":[1,1,1]},"evidenceRefs":["evidence-full-body"]}
    ],
    "actionReadiness": {
        "contract":"Animation-ready hierarchy with pivots at wheel axle centers, headphone arch, antenna bases",
        "defaultRigType":"mechanical-prop",
        "rootMotionNode":"root",
        "requiredComponentFields":["id","parent","transform","attachment","actionProfile.pivot","actionProfile.collider"],
        "transformChannels":["translate","rotate","scale","bend","twist","detach","visibility","material-state"],
        "authoringRules":["Keep wheel pivots at axle center","Keep antennas at module base","Separate fenders as child of chassis"],
        "destructionPolicy":{"supported":True,"detachableComponents":["wheel-FL","wheel-FR","wheel-RL","wheel-RR","radio-module","earcup-left","earcup-right"],"seamRefs":["chassis-panel-seams"],"detachableFragments":["headband","bumper-knob-left"]}
    },
    "featureReviewTargets": [
        {"id":"overall-silhouette","name":"Overall silhouette and proportions","tier":"critical","passIds":["blockout","structural-pass"],"minimumScore":0.82,"mustPass":True,"componentRefs":["root","stage-platform","chassis"],"evidenceRefs":["evidence-full-body"]},
        {"id":"cat-face-and-ears","name":"Cat face bezel + glowing eyes + cat ears with pink inner pads","tier":"critical","passIds":["structural-pass","form-refinement"],"minimumScore":0.82,"mustPass":True,"componentRefs":["face-screen","ears-left","ears-right"],"evidenceRefs":["evidence-full-body"]},
        {"id":"headphone-earcups-badges","name":"Overhead headband + side earcups with silver rims & hexagon badges","tier":"critical","passIds":["form-refinement","material-pass"],"minimumScore":0.8,"mustPass":True,"componentRefs":["headphones","earcup-left","earcup-right","headband"],"evidenceRefs":["evidence-full-body"]},
        {"id":"chest-bumper-ring-knobs-grilles","name":"Concentric glowing pink chest subwoofer ring + bumper knobs & twin silver grilles","tier":"critical","passIds":["material-pass","surface-pass"],"minimumScore":0.8,"mustPass":True,"componentRefs":["chest-ring","bumper","bumper-knob-left","bumper-knob-right"],"evidenceRefs":["evidence-full-body"]},
        {"id":"radio-wheels-stage","name":"Right-side radio module + dual antennas + 4 black tires with 6-spoke rims + circular pink/white stage disc","tier":"important","passIds":["surface-pass","lighting-pass"],"minimumScore":0.75,"mustPass":False,"componentRefs":["radio-module","radio-antenna-1","wheel-FL","stage-platform"],"evidenceRefs":["evidence-full-body"]}
    ],
    "lookDevTargets": {
        "qualityPriority":"reference-fidelity",
        "materialPass":{"albedoPaletteRequired":True,"roughnessVariationRequired":True,"normalOrBumpRequired":True,"localOverridesRequired":True,"minimumTextureResolution":1024,"preferredTextureResolution":2048,"independentMapChannels":["albedo","roughness","height","normal","ambient-occlusion"],"requiredSurfaceFrequencyBands":["macro","meso","micro"],"geometryReliefRequiredWhenSilhouetteAffected":True,"referencePbrExtraction":{"requiredWhenSourceImagePresent":True,"targetThreshold":0.7,"stopOnLowConfidence":True,"script":"forge/stage1_intake/extract_pbr_evidence.py","acceptedLimitation":"single-image inference"},"mustAvoid":["single flat albedo","uniform roughness","albedo reused as roughness"]},
        "lightingPass":{"requiredTerms":["key light","fill light","rim light","exposure","tone mapping aces filmic","background","contact shadow"],"mustAvoid":["ambient-only","flat value range"]}
    },
    "lightingFromPhoto": ["key light 45° front-left intensity 1.2 warm","fill light front-right 0.5 cool","rim light back 0.8 pinkish","exposure 1.0","tone mapping ACESFilmic","contact shadow soft PCF","background light gray studio"],
    "qualityTargets": {"targetFidelity":0.88,"mustMatch":["macro silhouette rounded-box + circular platform","pink body #EE98B9 roughness 0.35 clearcoat 0.2","emissive hot-pink #FF2A85 and white #FFFFFF intensity 2.2","silver rims #D1D5DB metalness 0.85 roughness 0.22","black tires #1C1C1E roughness 0.85","all 22 micro-details mapped"],"niceToHave":["grazing highlight micro scratches"],"fpsTarget":60,"reviewViewpoints":["front-quarter","side-left","side-right","top","rear-three-quarter"]},
    "selfCorrectLoop": {
        "enabled": True,
        "visualAcceptance":{"reviewer":"ai-vision","threshold":0.75,"comparisonArtifactRequired":True,"layerScoresRequired":True,"codePixelDiffIsAcceptanceAuthority":False,"scoringRule":"Side-by-side reference/render sheet scored by AI vision","requiredLayerScores":["silhouetteProportion","componentStructure","formDetail","materialSurface","lightingCamera"],"featureReviewPolicy":{"enabled":True,"reviewUnit":"semantic-subsystem","maxCriticalFeaturesPerPass":5,"maxImportantFeaturesPerPass":3,"criticalDefaultThreshold":0.8,"importantAverageThreshold":0.65,"adaptiveEscalation":True,"singleImagePairOnly":True,"selectionRule":"Select most identity-defining subsystem per pass"}},
        "reviewAfterPasses": ["blockout","structural-pass","form-refinement","material-pass","surface-pass","lighting-pass","interaction-pass","optimization-pass"],
        "allowedActions": ["continue","refine-spec","refine-code","request-input","stop"],
        "specRefineTriggers": ["missing component","wrong primitive","wrong proportions","material underspecified","local feature not traceable"],
        "codeRefineTriggers": ["geometry does not match spec","render differs from reference","performance budget exceeded"],
        "stopCriteria": ["target fidelity reached or accepted approximation"],
        "screenshotPolicy": {"requiredForPasses":["blockout","structural-pass","form-refinement","material-pass","surface-pass","lighting-pass","interaction-pass"],"preferredCapture":"browser-screenshot","fallbackCapture":"user-supplied","minimumEvidence":"Each visual pass needs reference, render, comparison sheet, AI vision score, layer scores, critique","reviewPairRule":"Same camera viewpoint","acceptanceAuthority":"AI vision review of comparison sheet"}
    },
    "sculptPipeline": {
        "passGateMode":"locked-sequential",
        "passOrder":["blockout","structural-pass","form-refinement","material-pass","surface-pass","lighting-pass","interaction-pass","optimization-pass"],
        "currentPass":"blockout",
        "completedPasses":[],
        "lastCompletedPass":"",
        "blockedReason":"blockout requires screenshot review",
        "nextRequiredEvidence": ["blockout render","comparison sheet","AI vision score >=0.75","layer scores","feature scores"]
    },
    "buildPasses": [
        {"id":"blockout","goal":"Primary bounding shapes - chassis box and circular platform","componentRefs":["root","stage-platform","chassis"],"acceptance":["Silhouette matches rounded-box + disc"]},
        {"id":"structural-pass","goal":"All separable major components attached","componentRefs":["face-screen","ears-left","ears-right","headphones","chest-ring","bumper","radio-module","wheel-FL"],"acceptance":["Every child attached cleanly to parent socket"]},
        {"id":"form-refinement","goal":"Refine headband arch, earcup cylinders, ear triangle shapes","componentRefs":["headband","earcup-left","earcup-right","chest-ring","bumper"],"acceptance":["Arch curvature and triangle ear angles match reference"]},
        {"id":"material-pass","goal":"Apply PBR materials per reference palette","componentRefs":["pink-body-shell","emissive-pink-white","screen-bezel","silver-metal-rims","rubber-tires"],"acceptance":["Pink #EE98B9 roughness 0.35 clearcoat 0.2, emissive #FF2A85/#FFFFFF 2.2, rims #D1D5DB metal 0.85"]},
        {"id":"surface-pass","goal":"Surface details, grilles, rivets, treads, antennas","componentRefs":["radio-antenna-1","bumper-knob-left","wheel-FL"],"acceptance":["Antennas, knobs, treads present"]},
        {"id":"lighting-pass","goal":"Studio lighting readable","componentRefs":["stage-platform","chassis"],"acceptance":["Readable under neutral, grazing, reference lookdev"]},
        {"id":"interaction-pass","goal":"Action-ready rigging pivots and sockets","componentRefs":["wheel-FL","wheel-FR","radio-module","headphones"],"acceptance":["Wheel axle pivots, antenna base pivots, sockets for attachments"]},
        {"id":"optimization-pass","goal":"Performance LOD and draw calls","componentRefs":["root"],"acceptance":["Triangle budget and instancing documented"]}
    ],
    "visualEvidence": [],
    "reviewHistory": [],
    "lodPlan": [{"tier":"near","distance":0,"strategy":"full component tree"},{"tier":"far","distance":30,"strategy":"merge static"}],
    "performanceBudget": {"qualityPriority":"reference-fidelity","targetTriangles":180000,"maxDrawCalls":140,"textureSize":1024,"fpsTarget":60,"optimizationPolicy":"Reach fidelity first then optimize"},
    "proceduralStrategy": ["Block out chassis rounded-box and 5-ring stage platform","Build face bezel dark with emissive white cat eyes and caret mouth","Add triangular cat ears with hot-pink inner pads emissive","Add arching headband tube plus cylindrical earcups with silver rims and hexagon glowing badges","Add concentric pink emissive chest ring + speaker cone/dome + bumper knobs + twin silver grilles","Add right-side radio module box with 3 toggles and dual whip antennas with ball tips","Add 4 wheels with black rubber toruses and silver 6-spoke star rims with treads"],
    "animationAnchors": ["wheel rotation around X axis","headphone earcup pivot","antenna wiggle at base","chest pulse scale"],
    "destructionAnchors": ["detachable wheels","detachable radio module","detachable earcups"]
}

with open("object-sculpt-spec.json","w") as out:
    json.dump(spec, out, indent=2)
print("wrote object-sculpt-spec.json with", len(components), "components and", len(materials), "materials")
