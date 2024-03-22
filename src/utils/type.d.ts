type TextureKeys =  "alpha"
| "color" 
| "height"
| "normal" 
| "roughness" 
| "metalness"
| "ambientOcclusion"

type SimpleTexture = Exclude<TextureKeys, "alpha" | "metalness" | "height">