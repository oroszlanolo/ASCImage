class Asccar{
    constructor(whatChar, w = 8){
        this.char = whatChar;
        this.w = w;
        this.h = w;
        this.setupImage();
        this.calculateLightness();
    }
    setupImage(){
        this.image = createGraphics(this.w, this.h);
        this.image.textAlign(CENTER,CENTER);
        this.image.textSize(this.w);
        this.image.stroke(0);
        this.image.fill(0);
        this.image.background(255);
        this.image.text(this.char, this.w / 2, this.h / 2);
    }
    calculateLightness(){
        this.image.loadPixels();
        let sum = 0;
        for(var i = 0; i < this.image.pixels.length; i += 4){
            sum += this.image.pixels[i];
        }
        sum /= (this.image.pixels.length / 4);
        this.brigthness = floor(sum);
    }
    dist(other){
        other.loadPixels();
        this.image.loadPixels();
        let imgDist = 0;
        for(let i = 0; i < this.image.pixels.length; i+=4){
            imgDist += abs(this.image.pixels[i] - other.pixels[i]);
        }
        return imgDist;
    }
}