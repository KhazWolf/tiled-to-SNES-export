/*
 * tiled-to-SNES-export-8.js
 *
 * This extension adds the "SNES source files" type to the "Export As" menu,
 * which generates tile arrays that can be loaded directly into WLA as an "include"
 * 
 * Each tile layer is parsed in 32x32 chunks and converted to an array of
 * hexadecimal tile IDs - blank tiles are defaulted to $0000.
 * For example, 64x64 maps are parsed as four screenblocks like this:
 *
 *                        Array 1
 *                         +---+
 * Tile layer 1 64x64      | 0 |
 *     +---+---+           +---+
 *     | 0 | 1 |           | 1 |
 *     +---+---+     >     +---+
 *     | 2 | 3 |           | 2 |
 *     +---+---+           +---+
 *                         | 3 |
 *                         +---+
 *
 * This tool was adapted from the GBA Plugin that is Copyright (c) 2020 Jay van Hutten
 * This SNES version is Copyright (c) 2021 @KhazWolf
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * 
 */

/* global FileInfo, TextFile, tiled */


function decimalToHex(p_decimal, p_padding) {
    var hexValue = (p_decimal)
        .toString(16)
        .toUpperCase()
        .padStart(p_padding, "0");

    return "$"+hexValue;
}

var customMapFormat = {
    name: "SNES source file (8x8)",
    extension: "inc",
    write:

    function(p_map, p_fileName) {
        console.time("Export completed in");

        // Only allow valid map sizes to be parsed
        if (p_map.width % 32 != 0 || p_map.height %32 != 0) {
            return "Export failed: Invalid map size! Map width and height must be a multiple of 32.";
        }

        // Standard screenblock size for SNES
        const SCREENBLOCKWIDTH = 32;
        const SCREENBLOCKHEIGHT = 32;

        // Split full filename path into the filename (without extension) and the directory
        var fileBaseName = FileInfo.completeBaseName(p_fileName).replace(/[^a-zA-Z0-9-_]/g, "_");
        var filePath = FileInfo.path(p_fileName)+"/";

        // Replace the ‘/’ characters in the file path for ‘\’ on Windows
        filePath = FileInfo.toNativeSeparators(filePath);

        var tilemapLength = p_map.width * p_map.height;

        var sourceFileData = "";
        sourceFileData += fileBaseName+":\n";

        for (let i = 0; i < p_map.layerCount; ++i) {
            let currentLayer = p_map.layerAt(i);

            // Replace special characters for an underscore
            let currentLayerName = currentLayer.name.replace(/[^a-zA-Z0-9-_]/g, "_");

            let screenBlockCountX = currentLayer.width/SCREENBLOCKWIDTH;
            let screenBlockCountY = currentLayer.height/SCREENBLOCKHEIGHT;
            let screenBlockID = 0;

            if (currentLayer.isTileLayer) {
                for (let j = 0; j < screenBlockCountY; ++j) {
                    for (let k = 0; k < screenBlockCountX; ++k) {
                        sourceFileData +=";Layer "+(i+1)+" Screenblock "+screenBlockID+"\n";
                        screenBlockID++;

                        for (let y = 0; y < SCREENBLOCKHEIGHT; ++y) {
                            sourceFileData += ".dw ";

                            for (let x = 0; x < SCREENBLOCKWIDTH; ++x) {
                                let currentTileX = x+(SCREENBLOCKWIDTH*k);
                                let currentTileY = y+(SCREENBLOCKHEIGHT*j);
                                let currentTile = currentLayer.cellAt(currentTileX, currentTileY);
                                var currentTileID = currentTile.tileId;

                                // Default to $0000 for blank tiles
                                if (currentTileID == "-1") {
                                    sourceFileData += "$0000, ";
                                } else { 
                                    if (currentTile.flippedHorizontally) {
                                        // Set the HFLIP bit for this screen entry
                                        currentTileID |= (1 << 14);
                                    }
                                    if (currentTile.flippedVertically) {
                                        // Set the VFLIP bit for this screen entry
                                        currentTileID |= (1 << 15);
                                    }

                                    sourceFileData += decimalToHex(currentTileID, 4)+", ";
                                }
                            }

                            // Remove the last comma
                            sourceFileData = sourceFileData.slice(0,-2)+"\n";
                        }
                    }
                }
            }
        }

        // Remove the second newline at the end of the source file
        sourceFileData = sourceFileData.slice(0,-1);

        // Write source data to disk
        var sourceFile = new TextFile(filePath+fileBaseName+".inc", TextFile.WriteOnly);
        sourceFile.write(sourceFileData);
        sourceFile.commit();
        console.log("Tilemap exported to "+filePath+fileBaseName+".inc");

        console.timeEnd("Export completed in");
    }
}

tiled.registerMapFormat("SNES 8", customMapFormat)
