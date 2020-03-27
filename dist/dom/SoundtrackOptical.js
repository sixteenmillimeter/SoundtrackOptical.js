var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * @class SoundtrackOptical describes an optical soundtrack created from an audio file
 **/
class SoundtrackOptical {
    /**
     * @constructor
     *
     *
     * @param canvas {HTMLCanvasElement} Canvas
     * @param soundtrackFile {String} Path to soundtrackFile
     * @param dpi {Integer} Target DPI of printer
     * @param volume {Float} Volume of output soundtrack, 0 to 1.0
     * @param type {String} Type of soundtrack either "unilateral", "variable area", "dual variable area", "multiple variable area", "variable density"
     * @param pitch {String} Pitch of the film, either "long" for projection or "short" for camera stock
     * @param positive {Boolean} Whether or not soundtrack is positive or negative
     */
    constructor(canvas, soundtrackFile, dpi, volume, type, pitch, positive) {
        this.TYPE = 'dual variable area'; //'unilateral'//'dual variable area'//'variable density'//'multiple variable area'////;
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
        this.SCALED = false;
        this.LINE_W = 0;
        this.FRAMES = 0;
        this.i = 0;
        this.max = -Infinity;
        this.min = Infinity;
        this.canvas = canvas;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.scale(1, 1);
        this.ctx.lineWidth = 1;
        this.FILEPATH = soundtrackFile;
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
    }
    decode() {
        return __awaiter(this, void 0, void 0, function* () {
            const audioSrc = this.FILEPATH;
            let request;
            let audioData;
            try {
                request = yield this.fetch(audioSrc);
            }
            catch (err) {
                throw err;
            }
            audioData = request.response;
            try {
                this.audioBuffer = yield this.decodeBuffer(audioData);
            }
            catch (err) {
                throw err;
            }
            if (this.audioBuffer && this.audioBuffer.numberOfChannels > 1) {
                throw new Error('Does not support multiple channel audio files, please include a mono audio file.');
            }
            this.soundData = this.audioBuffer.getChannelData(0);
            this.RAW_RATE = this.audioBuffer.sampleRate;
            this.SAMPLE_RATE = this.FRAME_H_PIXELS * 24;
            this.RAW_FRAME_H = Math.round(this.RAW_RATE / 24);
            this.RAW_FRAME_W = Math.round(((this.RAW_RATE / 24) / this.FRAME_H) * this.FRAME_W);
            this.FRAMES = Math.ceil(this.soundData.length / this.RAW_FRAME_H);
            this.canvas.height = this.RAW_FRAME_H;
            this.canvas.width = this.RAW_FRAME_W;
            for (let x = 0; x < this.soundData.length; x++) {
                this.compare = this.soundData[x];
                if (this.compare > this.max) {
                    this.max = this.compare;
                }
                if (this.compare < this.min) {
                    this.min = this.compare;
                }
            }
        });
    }
    fetch(url) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                const request = new XMLHttpRequest();
                request.open('GET', url, true);
                request.responseType = 'arraybuffer';
                request.onload = function () {
                    return resolve(request);
                };
                request.send();
            });
        });
    }
    decodeBuffer(audioData) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => {
                //@ts-ignore
                const context = new (window.AudioContext || window.webkitAudioContext)();
                function onBuffer(buffer) {
                    return resolve(buffer);
                }
                function onDecodeBufferError(err) {
                    return reject(err);
                }
                context.decodeAudioData(audioData, onBuffer, onDecodeBufferError);
            });
        });
    }
    map_range(value, low1, high1, low2, high2) {
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }
    /**
     * Calls frame() every frame of parent PApplet draw()
     *
     */
    draw() {
        this.frame(this.i);
        this.i++;
    }
    /**
     * Draws a frame on parent PApplet window at position
     *
     * @param frameNumber {Integer} Frame of soundtrack to draw
     */
    frame(frameNumber) {
        if (frameNumber != -1) {
            this.i = frameNumber;
        }
        if (this.i >= this.FRAMES) {
            return false;
        }
        if (this.POSITIVE) {
            this.ctx.fillStyle = '#000000';
        }
        else {
            this.ctx.fillStyle = '#FFFFFF';
        }
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.POSITIVE) {
            this.ctx.strokeStyle = '#FFFFFF';
        }
        else {
            this.ctx.strokeStyle = '#000000';
        }
        this.frameSample = this.soundData.subarray(this.i * this.RAW_FRAME_H, (this.i + 1) * this.RAW_FRAME_H);
        if (this.TYPE !== 'variable density') {
            this.ctx.beginPath();
        }
        for (let y = 0; y < this.RAW_FRAME_H; y++) {
            if (this.TYPE !== 'variable density') {
                this.LINE_W = Math.round(this.map_range(this.frameSample[y], this.min, this.max, 0, this.RAW_FRAME_W * this.VOLUME));
            }
            if (this.TYPE === 'unilateral') {
                this.unilateral(y, this.LINE_W);
            }
            else if (this.TYPE === 'dual unilateral') {
                // TODO!!!!
            }
            else if (this.TYPE === 'single variable area' || this.TYPE === 'variable area') {
                this.variableArea(y, this.LINE_W);
            }
            else if (this.TYPE === 'dual variable area') {
                this.dualVariableArea(y, this.LINE_W);
            }
            else if (this.TYPE === 'multiple variable area' || this.TYPE === 'maurer') {
                this.multipleVariableArea(y, this.LINE_W);
            }
            else if (this.TYPE === 'variable density') {
                this.variableDensity(y);
            }
        }
        if (this.TYPE !== 'variable density') {
            this.ctx.stroke();
        }
        if (frameNumber === -1) {
            this.i++;
        }
    }
    buffer(frameNumber) {
        if (frameNumber != -1) {
            this.i = frameNumber;
        }
        if (this.i >= this.FRAMES) {
            return false;
        }
        if (this.POSITIVE) {
            this.ctx.fillStyle = 'rgb(0,0,0)';
        }
        else {
            this.ctx.fillStyle = 'rgb(255,255,255)';
        }
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.POSITIVE && this.TYPE !== 'variable density') {
            this.ctx.strokeStyle = 'rgb(255,255,255)';
        }
        else {
            this.ctx.strokeStyle = 'rgb(0,0,0)';
        }
        this.frameSample = this.soundData.subarray(this.i * this.RAW_FRAME_H, (this.i + 1) * this.RAW_FRAME_H);
        for (let y = 0; y < this.RAW_FRAME_H; y++) {
            if (this.TYPE !== 'variable density') {
                this.LINE_W = Math.round(this.map_range(this.frameSample[y], this.min, this.max, 0, this.RAW_FRAME_W * this.VOLUME));
            }
            if (this.TYPE === 'unilateral') {
                this.unilateral(y + 1, this.LINE_W);
            }
            else if (this.TYPE === 'dual unilateral') {
                // TODO!!!!
            }
            else if (this.TYPE === 'single variable area' || this.TYPE === 'variable area') {
                this.variableArea(y + 1, this.LINE_W);
            }
            else if (this.TYPE === 'dual variable area') {
                this.dualVariableArea(y + 1, this.LINE_W);
            }
            else if (this.TYPE === 'multiple variable area' || this.TYPE === 'maurer') {
                this.multipleVariableArea(y + 1, this.LINE_W);
            }
            else if (this.TYPE === 'variable density') {
                this.variableDensity(y);
            }
        }
        if (this.TYPE === 'unilateral') {
            this.unilateral(this.RAW_FRAME_H + 1, this.LINE_W);
        }
        else if (this.TYPE === 'dual unilateral') {
            // TODO!!!!
        }
        else if (this.TYPE === 'single variable area' || this.TYPE === 'variable area') {
            this.variableArea(this.RAW_FRAME_H + 1, this.LINE_W);
        }
        else if (this.TYPE === 'dual variable area') {
            this.dualVariableArea(this.RAW_FRAME_H + 1, this.LINE_W);
        }
        else if (this.TYPE === 'multiple variable area' || this.TYPE === 'maurer') {
            this.multipleVariableArea(this.RAW_FRAME_H + 1, this.LINE_W);
        }
        if (frameNumber === -1) {
            this.i++;
        }
        return this.canvas;
    }
    unilateral(y, LINE_W) {
        for (let i = 0; i < 3; i++) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(LINE_W, y);
        }
    }
    variableArea(y, LINE_W) {
        const left = (this.RAW_FRAME_W - LINE_W) / 2;
        for (let i = 0; i < 3; i++) {
            this.ctx.moveTo(left, y);
            this.ctx.lineTo(left + LINE_W, y);
        }
    }
    dualVariableArea(y, LINE_W) {
        const left = (this.RAW_FRAME_W / 4) - (LINE_W / 4);
        for (let i = 0; i < 3; i++) {
            this.ctx.moveTo(left, y);
            this.ctx.lineTo(left + (LINE_W / 2), y);
            this.ctx.moveTo((left * 3) + (LINE_W / 2), y);
            this.ctx.lineTo((left * 3) + LINE_W, y);
        }
    }
    multipleVariableArea(y, LINE_W) {
        const left = (this.RAW_FRAME_W / 12) - (LINE_W / 12);
        const part = LINE_W / 6;
        for (let i = 0; i < 3; i++) {
            this.ctx.moveTo(left, y);
            this.ctx.lineTo(left + part, y);
            this.ctx.moveTo((left * 3) + part, y);
            this.ctx.lineTo((left * 3) + (part * 2), y);
            this.ctx.moveTo((left * 5) + (part * 2), y);
            this.ctx.lineTo((left * 5) + (part * 3), y);
            this.ctx.moveTo((left * 7) + (part * 3), y);
            this.ctx.lineTo((left * 7) + (part * 4), y);
            this.ctx.moveTo((left * 9) + (part * 4), y);
            this.ctx.lineTo((left * 9) + (part * 5), y);
            this.ctx.moveTo((left * 11) + (part * 5), y);
            this.ctx.lineTo((left * 11) + (part * 6), y);
        }
    }
    variableDensity(y) {
        let density = Math.round(this.map_range(this.frameSample[y], this.min, this.max, 0, 255 * this.VOLUME));
        if (!this.POSITIVE) {
            density = 255 - density;
        }
        this.ctx.beginPath();
        this.ctx.strokeStyle = `rgb(${density},${density},${density})`;
        this.ctx.moveTo(-1, y);
        this.ctx.lineTo(this.RAW_FRAME_W + 2, y + 1);
        this.ctx.stroke();
    }
}
