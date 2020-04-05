'use strict';

import { readFile, writeFile } from 'fs-extra';
import Jimp from 'jimp';
import decode from 'audio-decode';
//import WavDecoder from 'wav-decoder';
//import buffer from 'audio-lena/mp3';

/**
 * @class SoundtrackOptical describes an optical soundtrack created from an audio file
 **/
export default class SoundtrackOptical {
  private TYPE : string = 'variable density'//'multiple variable area'// 'dual variable area'; //'unilateral'////
  private SCALED : boolean = false;
  private DPI : number = 2880;
  private POSITIVE : boolean = true;
  private VOLUME : number = 1.0;
  private pitch : string = 'long';
  private FILEPATH : string;
  
  private IN : number      = 25.4;
  private FRAME_H : number = 7.62;
  private FRAME_W : number = 12.52 - 10.26;
  
  private DPMM : number = this.DPI / this.IN;
  private FRAME_H_PIXELS : number = Math.round(this.DPMM * this.FRAME_H);
  private SAMPLE_RATE : number   = this.FRAME_H_PIXELS * 24;
  private DEPTH : number         = Math.round(this.DPMM * this.FRAME_W);

  private RAW_RATE : number = 0;
  private RAW_FRAME_H : number = 0;
  private RAW_FRAME_W : number = 0;
  
  private LINE_W : number        = 0;
  public FRAMES : number        = 0;
  private i : number = 0;
  
  private max : number = -Infinity;
  private min : number = Infinity;
  private compare : number;
  
  private frameSample : number[]; //Float32?
  //private canvas : HTMLCanvasElement;
  //private ctx : CanvasRenderingContext2D;
  //private audioContext : AudioContext;
  private audioBuffer : any;
  //SoundFile soundfile;
  //PGraphics raw;
  //PApplet parent;
  
  /**
   * @constructor
   * 
   * @param soundtrackFile {String} Path to soundtrackFile
   * @param dpi {Integer} Dpi of output resolution to scale to
   * @param volume {Float} Volume of output soundtrack, 0 to 1.0
   * @param type {String} Type of soundtrack either "unilateral", "variable area", "dual variable area", "multiple variable area", "variable density"
   * @param pitch {String} Pitch of the film, either "long" for projection or "short" for camera stock
   * @param positive {Boolean} Whether or not soundtrack is positive or negative
   */
  
  constructor (soundtrackFile : string, dpi? : number, volume? : number, type? : string, pitch? : string, positive? : boolean) {
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
      this.DEPTH          = Math.floor(this.DPMM * this.FRAME_W);
    } else {

    }

    //this.ctx = this.canvas.getContext('2d');
    //this.raw = parent.createGraphics(this.RAW_FRAME_W, this.RAW_FRAME_H, parent.sketchRenderer());
  }

  public async decode () {
    let rawData : any;

    try {
      rawData = await readFile(this.FILEPATH);
    } catch (err) {
      throw err;
    }

    try {
      this.audioBuffer = await decode(rawData);
    } catch (err) {
      throw err;
    }

    if (this.audioBuffer && this.audioBuffer.numberOfChannels > 1) {
      throw new Error('Does not support multiple channel audio files, please include a mono audio file.');
    }

    this.RAW_RATE = this.audioBuffer.sampleRate;
    this.SAMPLE_RATE    = this.FRAME_H_PIXELS * 24;

    this.RAW_FRAME_H = Math.round(this.RAW_RATE / 24);
    this.RAW_FRAME_W = Math.round(((this.RAW_RATE / 24) / this.FRAME_H ) * this.FRAME_W);
    
    this.FRAMES = Math.ceil(this.audioBuffer._data.length / this.RAW_FRAME_H);

    for (let x : number = 0; x < this.audioBuffer._data.length; x++) {
      this.compare = this.audioBuffer._data[x];
      if (this.compare > this.max) {
        this.max = this.compare;
      }
      if (this.compare < this.min) {
        this.min = this.compare;
      }
    }
  }
  
  /**
   * Calls frame() every frame of parent PApplet draw()
   * 
   */
  public async draw () {
    this.frame(this.i);
    this.i++;
  }

  private async intToPixel (val : number) {
    return new Promise((resolve, reject) => {
      return Jimp.rgbaToInt(val, val, val, 255, (err, pix) => {
        if (err) return reject(err);
        return resolve(pix);
      });
    });
  }

  private async blankRawFrame (bg : any) {
    return new Promise(async (resolve : Function, reject : Function) => {
      const color : any = await this.intToPixel(bg);
      new Jimp(this.RAW_FRAME_W, this.RAW_FRAME_H, color, (err : Error, image : any) => {
        if (err) return reject(err);
        return resolve(image);
      });
    });
  }

  private map_range (value : number, low1 : number, high1 : number, low2 : number, high2 : number) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
  }
  
  /**
   * Draws a frame on parent PApplet window at position 
   * 
   * @param frameNumber {Integer} Frame of soundtrack to draw
   */
  
  public async frame (frameNumber? : number) {
    let line : Uint8Array;
  	let color : number = this.POSITIVE ? 255 : 0;
  	let bg : number = this.POSITIVE ? 0 : 255;
    let raw : any;

    try {
      raw = await this.blankRawFrame(bg);
    } catch (err) {
      throw err;
    }

  	if (frameNumber != -1) {
  		this.i = frameNumber;
  	}

    if (this.i >= this.FRAMES) {
		  return false;
    }

    this.frameSample = this.audioBuffer._data.slice(this.i * this.RAW_FRAME_H, (this.i + 1) * this.RAW_FRAME_H);

    for (let y : number = 0; y < this.frameSample.length; y++) {
      if (this.TYPE !== 'variable density') {
        this.LINE_W = Math.round(this.map_range(this.frameSample[y],this. min, this.max, 0, this.RAW_FRAME_W * this.VOLUME));
      }
      if (this.TYPE === 'unilateral') {
        line = this.unilateral(this.LINE_W, bg, color);
      } else if (this.TYPE === 'dual unilateral') {
        // TODO!!!!
      } else if (this.TYPE === 'single variable area' || this.TYPE === 'variable area') {
        line = this.variableArea(this.LINE_W, bg, color);
      } else if (this.TYPE === 'dual variable area') {
        line = this.dualVariableArea(this.LINE_W, bg, color);
      } else if (this.TYPE === 'multiple variable area' || this.TYPE === 'maurer') {
        line = this.multipleVariableArea(this.LINE_W, bg, color);
      } else if (this.TYPE === 'variable density') {
        line = this.variableDensity(this.frameSample[y]);
      }
      raw.bitmap.data.set(line, y * line.length);
    }

    if (this.SCALED) {
      raw.resize(this.DEPTH, this.FRAME_H_PIXELS);
    } else {
      try {
        //await raw.writeAsync(`./${frameNumber}-${this.TYPE}.png`);
      } catch (err) {
        throw err;
      }
    }
    
    if (frameNumber === -1) {
    	this.i++;
    }
  }

  public async buffer (frameNumber : number) {
    let line : Uint8Array;
    let color : number = this.POSITIVE ? 255 : 0;
    let bg : number = this.POSITIVE ? 0 : 255;
    let raw : any;

    try {
      raw = await this.blankRawFrame(bg);
    } catch (err) {
      throw err;
    }

    if (frameNumber != -1) {
      this.i = frameNumber;
    }

    if (this.i >= this.FRAMES) {
      return false;
    }

    this.frameSample = this.audioBuffer._data.slice(this.i * this.RAW_FRAME_H, (this.i + 1) * this.RAW_FRAME_H);
  
    for (let y : number = 0; y < this.frameSample.length; y++) {
      if (this.TYPE !== 'variable density') {
        this.LINE_W = Math.round(this.map_range(this.frameSample[y],this. min, this.max, 0, this.RAW_FRAME_W * this.VOLUME));
      }
      if (this.TYPE === 'unilateral') {
        line = this.unilateral(this.LINE_W, bg, color);
      } else if (this.TYPE === 'dual unilateral') {
        // TODO!!!!
      } else if (this.TYPE === 'single variable area' || this.TYPE === 'variable area') {
        line = this.variableArea(this.LINE_W, bg, color);
      } else if (this.TYPE === 'dual variable area') {
        line = this.dualVariableArea(this.LINE_W, bg, color);
      } else if (this.TYPE === 'multiple variable area' || this.TYPE === 'maurer') {
        line = this.multipleVariableArea(this.LINE_W, bg, color);
      } else if (this.TYPE === 'variable density') {
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

    return raw;
  }

  private unilateral (LINE_W : number, bg : number, color : number) : Uint8Array {
  	const line : Uint8Array = new Uint8Array(this.RAW_FRAME_W * 4);

    line.set(this.line(LINE_W, color), 0);
  	line.set(this.line(this.RAW_FRAME_W - LINE_W, bg), LINE_W * 4);
    return line;
  }

  private variableArea (LINE_W : number, bg : number, color : number) : Uint8Array {
    const line : Uint8Array = new Uint8Array(this.RAW_FRAME_W * 4);
    const left : number = Math.round((this.RAW_FRAME_W - LINE_W) / 2);

    line.set(this.line(left, bg), 0);
    line.set(this.line(LINE_W, color), left * 4);
    line.set(this.line(this.RAW_FRAME_W - left - LINE_W, bg), (left + LINE_W) * 4);
    return line;
  }

  private dualVariableArea (LINE_W : number, bg : number, color : number) : Uint8Array {
    const line : Uint8Array = new Uint8Array(this.RAW_FRAME_W * 4);
    const left : number = (this.RAW_FRAME_W / 4) - (LINE_W / 4);

    line.set(this.line(Math.round(left), bg), 0);
    line.set(this.line(Math.round(LINE_W / 2), color), Math.round(left) * 4);
    line.set(this.line(Math.round(left * 2), bg), Math.round(left + (LINE_W / 2)) * 4);
    line.set(this.line(Math.round(LINE_W / 2), color), Math.round((left * 3) + (LINE_W / 2)) * 4);
    line.set(this.line(this.RAW_FRAME_W - LINE_W - Math.round(left * 3), bg), (LINE_W + Math.round(left * 3)) * 4);
    return line;
  }

  private multipleVariableArea (LINE_W : number, bg : number, color : number) : Uint8Array {
    const line : Uint8Array = new Uint8Array(this.RAW_FRAME_W * 4);
    const part : number = (LINE_W / 6);
    const left : number = ((this.RAW_FRAME_W / 6) - part) / 2;
    const rpart : number = Math.round(part);
    const rleft2 : number = Math.round(left * 2);

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
    line.set(this.line(this.RAW_FRAME_W - Math.round((part * 5) + (left * 11) + part), bg), 
      (this.RAW_FRAME_W - (this.RAW_FRAME_W - Math.round((part * 5) + (left * 11) + part))) * 4);

    return line;
  }

  private variableDensity(sample : number) {
    const density : number = Math.round(this.map_range(sample, this.min, this.max, 0, 255 * this.VOLUME));
    let val : number;

    if (this.POSITIVE) {
      val = density;
    } else {
      val = 255 - density;
    }

    return this.line(this.RAW_FRAME_W, val);
  }

  private line (len : number, color : number) : Uint8Array {
  	let pixels : Uint8Array = new Uint8Array(len * 4);
  	let cursor : number;
  	for (let i : number = 0; i < len; i++) {
  		cursor = i * 4;
  		pixels[cursor] = color;
  		pixels[cursor + 1] = color;
  		pixels[cursor + 2] = color;
  		pixels[cursor + 3] = 255;
  	}
  	return pixels;
  }
}

module.exports = SoundtrackOptical;