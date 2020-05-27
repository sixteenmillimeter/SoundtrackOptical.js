'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var fs_extra_1 = require("fs-extra");
var jimp_1 = __importDefault(require("jimp"));
var audio_decode_1 = __importDefault(require("audio-decode"));
var path_1 = require("path");
//import WavDecoder from 'wav-decoder';
//import buffer from 'audio-lena/mp3';
/**
 * @class SoundtrackOptical describes an optical soundtrack created from an audio file
 **/
var SoundtrackOptical = /** @class */ (function () {
    //SoundFile soundfile;
    //PGraphics raw;
    //PApplet parent;
    /**
     * @constructor
     *
     * @param soundtrackFile {String} Path to soundtrackFile
     * @param {string} output Directory to output frame files to
     * @param dpi {Integer} Dpi of output resolution to scale to
     * @param volume {Float} Volume of output soundtrack, 0 to 1.0
     * @param type {String} Type of soundtrack either "unilateral", "variable area", "dual variable area", "multiple variable area", "variable density"
     * @param pitch {String} Pitch of the film, either "long" for projection or "short" for camera stock
     * @param positive {Boolean} Whether or not soundtrack is positive or negative
     */
    function SoundtrackOptical(soundtrackFile, output, dpi, volume, type, pitch, positive) {
        this.TYPE = 'variable density'; //'multiple variable area'// 'dual variable area'; //'unilateral'////
        this.SCALED = false;
        this.DPI = 2880;
        this.POSITIVE = true;
        this.VOLUME = 1.0;
        this.pitch = 'long';
        this.IN = 25.4;
        this.FRAME_H = 7.62;
        this.FRAME_W = 12.52 - 10.26;
        this.DPMM = this.DPI / this.IN;
        this.FRAME_H_PIXELS = Math.round(this.DPMM * this.FRAME_H);
        this.SAMPLE_RATE = this.FRAME_H_PIXELS * 24;
        this.DEPTH = Math.round(this.DPMM * this.FRAME_W);
        this.RAW_RATE = 0;
        this.RAW_FRAME_H = 0;
        this.RAW_FRAME_W = 0;
        this.LINE_W = 0;
        this.FRAMES = 0;
        this.i = 0;
        this.max = -Infinity;
        this.min = Infinity;
        this.FILEPATH = soundtrackFile;
        this.OUTPUT = typeof output !== 'undefined' ? output : __dirname;
        this.VOLUME = typeof volume !== 'undefined' ? volume : this.VOLUME;
        this.POSITIVE = typeof positive !== 'undefined' ? positive : this.POSITIVE;
        this.FRAME_H = (pitch == 'short') ? 7.605 : 7.62;
        this.TYPE = typeof type !== 'undefined' ? type : this.TYPE;
        this.POSITIVE = typeof positive !== 'undefined' ? positive : this.POSITIVE;
        if (typeof dpi !== 'undefined' && dpi != null) {
            this.SCALED = true;
            this.DPI = dpi;
            this.DPMM = this.DPI / this.IN;
            this.FRAME_H_PIXELS = Math.round(this.DPMM * this.FRAME_H);
            this.DEPTH = Math.floor(this.DPMM * this.FRAME_W);
        }
        else {
        }
        //this.ctx = this.canvas.getContext('2d');
        //this.raw = parent.createGraphics(this.RAW_FRAME_W, this.RAW_FRAME_H, parent.sketchRenderer());
    }
    SoundtrackOptical.prototype.decode = function () {
        return __awaiter(this, void 0, void 0, function () {
            var rawData, err_1, _a, err_2, x;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, fs_extra_1.readFile(this.FILEPATH)];
                    case 1:
                        rawData = _b.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _b.sent();
                        throw err_1;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        _a = this;
                        return [4 /*yield*/, audio_decode_1["default"](rawData)];
                    case 4:
                        _a.audioBuffer = _b.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        err_2 = _b.sent();
                        throw err_2;
                    case 6:
                        if (this.audioBuffer && this.audioBuffer.numberOfChannels > 1) {
                            throw new Error('Does not support multiple channel audio files, please include a mono audio file.');
                        }
                        this.RAW_RATE = this.audioBuffer.sampleRate;
                        this.SAMPLE_RATE = this.FRAME_H_PIXELS * 24;
                        this.RAW_FRAME_H = Math.round(this.RAW_RATE / 24);
                        this.RAW_FRAME_W = Math.round(((this.RAW_RATE / 24) / this.FRAME_H) * this.FRAME_W);
                        this.FRAMES = Math.ceil(this.audioBuffer._data.length / this.RAW_FRAME_H);
                        for (x = 0; x < this.audioBuffer._data.length; x++) {
                            this.compare = this.audioBuffer._data[x];
                            if (this.compare > this.max) {
                                this.max = this.compare;
                            }
                            if (this.compare < this.min) {
                                this.min = this.compare;
                            }
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Calls frame() every frame of parent PApplet draw()
     *
     **/
    SoundtrackOptical.prototype.draw = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.frame(this.i);
                this.i++;
                return [2 /*return*/];
            });
        });
    };
    SoundtrackOptical.prototype.intToPixel = function (val) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        return jimp_1["default"].rgbaToInt(val, val, val, 255, function (err, pix) {
                            if (err)
                                return reject(err);
                            return resolve(pix);
                        });
                    })];
            });
        });
    };
    SoundtrackOptical.prototype.blankRawFrame = function (bg) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                        var color;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this.intToPixel(bg)];
                                case 1:
                                    color = _a.sent();
                                    new jimp_1["default"](this.RAW_FRAME_W, this.RAW_FRAME_H, color, function (err, image) {
                                        if (err)
                                            return reject(err);
                                        return resolve(image);
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    SoundtrackOptical.prototype.map_range = function (value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    };
    /**
     * Draws a frame in raw window at position
     *
     * @param frameNumber {Integer} Frame of soundtrack to draw
     */
    SoundtrackOptical.prototype.frame = function (frameNumber) {
        return __awaiter(this, void 0, void 0, function () {
            var frameStr, framePath, line, color, bg, raw, err_3, y, err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        frameStr = this.padLeft(frameNumber, 6);
                        framePath = path_1.resolve(path_1.join(this.OUTPUT, "./" + frameStr + "-" + this.TYPE + ".png"));
                        color = this.POSITIVE ? 255 : 0;
                        bg = this.POSITIVE ? 0 : 255;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.blankRawFrame(bg)];
                    case 2:
                        raw = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_3 = _a.sent();
                        throw err_3;
                    case 4:
                        if (frameNumber != -1) {
                            this.i = frameNumber;
                        }
                        if (this.i >= this.FRAMES) {
                            return [2 /*return*/, false];
                        }
                        this.frameSample = this.audioBuffer._data.slice(this.i * this.RAW_FRAME_H, (this.i + 1) * this.RAW_FRAME_H);
                        for (y = 0; y < this.frameSample.length; y++) {
                            if (this.TYPE !== 'variable density') {
                                this.LINE_W = Math.round(this.map_range(this.frameSample[y], this.min, this.max, 0, this.RAW_FRAME_W * this.VOLUME));
                            }
                            if (this.TYPE === 'unilateral') {
                                line = this.unilateral(this.LINE_W, bg, color);
                            }
                            else if (this.TYPE === 'dual unilateral') {
                                // TODO!!!!
                            }
                            else if (this.TYPE === 'single variable area' || this.TYPE === 'variable area') {
                                line = this.variableArea(this.LINE_W, bg, color);
                            }
                            else if (this.TYPE === 'dual variable area') {
                                line = this.dualVariableArea(this.LINE_W, bg, color);
                            }
                            else if (this.TYPE === 'multiple variable area' || this.TYPE === 'maurer') {
                                line = this.multipleVariableArea(this.LINE_W, bg, color);
                            }
                            else if (this.TYPE === 'variable density') {
                                line = this.variableDensity(this.frameSample[y]);
                            }
                            raw.bitmap.data.set(line, y * line.length);
                        }
                        if (!this.SCALED) return [3 /*break*/, 5];
                        raw.resize(this.DEPTH, this.FRAME_H_PIXELS);
                        return [3 /*break*/, 8];
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, raw.writeAsync(framePath)];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        err_4 = _a.sent();
                        throw err_4;
                    case 8:
                        if (frameNumber === -1) {
                            this.i++;
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    SoundtrackOptical.prototype.buffer = function (frameNumber) {
        return __awaiter(this, void 0, void 0, function () {
            var line, color, bg, raw, err_5, y;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        color = this.POSITIVE ? 255 : 0;
                        bg = this.POSITIVE ? 0 : 255;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.blankRawFrame(bg)];
                    case 2:
                        raw = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_5 = _a.sent();
                        throw err_5;
                    case 4:
                        if (frameNumber != -1) {
                            this.i = frameNumber;
                        }
                        if (this.i >= this.FRAMES) {
                            return [2 /*return*/, false];
                        }
                        this.frameSample = this.audioBuffer._data.slice(this.i * this.RAW_FRAME_H, (this.i + 1) * this.RAW_FRAME_H);
                        for (y = 0; y < this.frameSample.length; y++) {
                            if (this.TYPE !== 'variable density') {
                                this.LINE_W = Math.round(this.map_range(this.frameSample[y], this.min, this.max, 0, this.RAW_FRAME_W * this.VOLUME));
                            }
                            if (this.TYPE === 'unilateral') {
                                line = this.unilateral(this.LINE_W, bg, color);
                            }
                            else if (this.TYPE === 'dual unilateral') {
                                // TODO!!!!
                            }
                            else if (this.TYPE === 'single variable area' || this.TYPE === 'variable area') {
                                line = this.variableArea(this.LINE_W, bg, color);
                            }
                            else if (this.TYPE === 'dual variable area') {
                                line = this.dualVariableArea(this.LINE_W, bg, color);
                            }
                            else if (this.TYPE === 'multiple variable area' || this.TYPE === 'maurer') {
                                line = this.multipleVariableArea(this.LINE_W, bg, color);
                            }
                            else if (this.TYPE === 'variable density') {
                                line = this.variableDensity(this.frameSample[y]);
                            }
                            raw.bitmap.data.set(line, y * line.length);
                        }
                        if (this.SCALED) {
                            raw.resize(this.DEPTH, this.FRAME_H_PIXELS);
                        }
                        if (frameNumber === -1) {
                            this.i++;
                        }
                        return [2 /*return*/, raw];
                }
            });
        });
    };
    SoundtrackOptical.prototype.unilateral = function (LINE_W, bg, color) {
        var line = new Uint8Array(this.RAW_FRAME_W * 4);
        line.set(this.line(LINE_W, color), 0);
        line.set(this.line(this.RAW_FRAME_W - LINE_W, bg), LINE_W * 4);
        return line;
    };
    SoundtrackOptical.prototype.variableArea = function (LINE_W, bg, color) {
        var line = new Uint8Array(this.RAW_FRAME_W * 4);
        var left = Math.round((this.RAW_FRAME_W - LINE_W) / 2);
        line.set(this.line(left, bg), 0);
        line.set(this.line(LINE_W, color), left * 4);
        line.set(this.line(this.RAW_FRAME_W - left - LINE_W, bg), (left + LINE_W) * 4);
        return line;
    };
    SoundtrackOptical.prototype.dualVariableArea = function (LINE_W, bg, color) {
        var line = new Uint8Array(this.RAW_FRAME_W * 4);
        var left = (this.RAW_FRAME_W / 4) - (LINE_W / 4);
        line.set(this.line(Math.round(left), bg), 0);
        line.set(this.line(Math.round(LINE_W / 2), color), Math.round(left) * 4);
        line.set(this.line(Math.round(left * 2), bg), Math.round(left + (LINE_W / 2)) * 4);
        line.set(this.line(Math.round(LINE_W / 2), color), Math.round((left * 3) + (LINE_W / 2)) * 4);
        line.set(this.line(this.RAW_FRAME_W - LINE_W - Math.round(left * 3), bg), (LINE_W + Math.round(left * 3)) * 4);
        return line;
    };
    SoundtrackOptical.prototype.multipleVariableArea = function (LINE_W, bg, color) {
        var line = new Uint8Array(this.RAW_FRAME_W * 4);
        var part = (LINE_W / 6);
        var left = ((this.RAW_FRAME_W / 6) - part) / 2;
        var rpart = Math.round(part);
        var rleft2 = Math.round(left * 2);
        line.set(this.line(Math.round(left), bg), 0);
        line.set(this.line(rpart, color), Math.round(left) * 4);
        line.set(this.line(rleft2, bg), Math.round(part + left) * 4);
        line.set(this.line(rpart, color), Math.round(part + (left * 3)) * 4);
        line.set(this.line(rleft2, bg), Math.round((part * 2) + (left * 3)) * 4);
        line.set(this.line(rpart, color), Math.round((part * 2) + (left * 5)) * 4);
        line.set(this.line(rleft2, bg), Math.round((part * 3) + (left * 5)) * 4);
        line.set(this.line(rpart, color), Math.round((part * 3) + (left * 7)) * 4);
        line.set(this.line(rleft2, bg), Math.round((part * 4) + (left * 7)) * 4);
        line.set(this.line(rpart, color), Math.round((part * 4) + (left * 9)) * 4);
        line.set(this.line(rleft2, bg), Math.round((part * 5) + (left * 9)) * 4);
        line.set(this.line(rpart, color), Math.round((part * 5) + (left * 11)) * 4);
        line.set(this.line(this.RAW_FRAME_W - Math.round((part * 5) + (left * 11) + part), bg), (this.RAW_FRAME_W - (this.RAW_FRAME_W - Math.round((part * 5) + (left * 11) + part))) * 4);
        return line;
    };
    SoundtrackOptical.prototype.variableDensity = function (sample) {
        var density = Math.round(this.map_range(sample, this.min, this.max, 0, 255 * this.VOLUME));
        var val;
        if (this.POSITIVE) {
            val = density;
        }
        else {
            val = 255 - density;
        }
        return this.line(this.RAW_FRAME_W, val);
    };
    SoundtrackOptical.prototype.line = function (len, color) {
        var pixels = new Uint8Array(len * 4);
        var cursor;
        for (var i = 0; i < len; i++) {
            cursor = i * 4;
            pixels[cursor] = color;
            pixels[cursor + 1] = color;
            pixels[cursor + 2] = color;
            pixels[cursor + 3] = 255;
        }
        return pixels;
    };
    SoundtrackOptical.prototype.padLeft = function (num, width, z) {
        if (z === void 0) { z = '0'; }
        var n = num + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    };
    return SoundtrackOptical;
}());
exports["default"] = SoundtrackOptical;
module.exports = SoundtrackOptical;
