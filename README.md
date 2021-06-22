# Tiled to SNES export
This is an export plugin for the [Tiled map editor](https://www.mapeditor.org/) that adds the following type to the "Export As" menu:

* SNES source files - regular (*.inc)

This generates arrays of hexadecimal tile IDs*, that can be loaded directly into a SNES compiler for use as tiled backgrounds.

<sub>* Blank tiles are defaulted to $0000</sub>

### Regular backgrounds
Strictly speaking, valid map sizes for regular backgrounds are 32x32, 64x32, 32x64 and 64x64. However, this extension allows you to export maps of any size as long as the width and height are a multiple of 32.

Each tile layer is parsed in 32x32 chunks - a "screenblock".  Multiple layers are exported together in a single file consecutively.

## Installation
This extension requires Tiled 1.4 or newer. Get the latest version [here](https://www.mapeditor.org/).

To add this extension to your Tiled installation:
* Open Tiled and go to Edit > Preferences > Plugins and click the "Open" button to open the extensions directory.
* Download [tiled-to-SNES-export.js](https://raw.githubusercontent.com/KhazWolf/tiled-to-gba-export/master/tiled-to-SNES-export.js) in this repository and copy it to that location. The scripts can be placed either directly in the extensions directory or in a subdirectory.

## Output
The export plugins generate an .inc text file formatted to be compatible with the WLA-DX 65816 compiler

Below you'll find example output for a 64x32 *regular* map with two tile layers. Do note that the array entries here are shortened with "..." and "etc." for demonstration purposes only. The real output would contain 1024 entries per *screenblock*.

**example.inc**

```C
example:
;Layer 1 Screenblock 0
.dw $0002, $0002, $0002, $0002, $0002, ...
.dw $00EE, $00EE, $00EE, $00EE, $00EE, ...
.dw $40EE, $40EE, $40EE, $40EE, $40EE, ...
.dw $C0EE, $C0EE, $C0EE, $C0EE, $C0EE, ...
etc.

;Layer 1 Screenblock 1
.dw $0002, $0002, $0002, $0002, $0002, ...
.dw $00EE, $00EE, $00EE, $00EE, $00EE, ...
.dw $40EE, $40EE, $40EE, $40EE, $40EE, ...
.dw $C0EE, $C0EE, $C0EE, $C0EE, $C0EE, ...
etc.

```

## License
This work is licensed under the MIT License. See [LICENSE](https://raw.githubusercontent.com/KhazWolf/tiled-to-gba-export/master/LICENSE) for details.
