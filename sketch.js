

let chars = [];

let myImage;
let smallBWImage;
var canv;

function preload(){
	myImage = loadImage("Juli.JPG");
}


function setup() {
	canv = createCanvas(1600,600);
	canv.drop(CBLoad);
	setupChars();
	createBWImage();
	image(smallBWImage,smallBWImage.width,0,smallBWImage.width,smallBWImage.height);
	drawAsci();
}

function CBLoad(file){
	loadImage(file.data,CBImageLoaded);
}

function CBImageLoaded(loadedImg){
	myImage = loadedImg;
	createBWImage();
	background(255);

	image(smallBWImage,smallBWImage.width,0,smallBWImage.width,smallBWImage.height);
	drawAsci();
}


function createBWImage(){
	let BWImage = createImage(myImage.width,myImage.height);
	BWImage.loadPixels();
	myImage.loadPixels();
	for(let i = 0; i < myImage.pixels.length; i += 4){
		let avg = 0;
		avg += myImage.pixels[i] * 0.299;
		avg += myImage.pixels[i + 1] * 0.587;
		avg += myImage.pixels[i + 2] * 0.114;
		// avg = floor(avg/3);
		BWImage.pixels[i] = avg;
		BWImage.pixels[i + 1] = avg;
		BWImage.pixels[i + 2] = avg;
		BWImage.pixels[i + 3] = 255;
	}
	BWImage.updatePixels();
	let scaleDown = max(BWImage.height,BWImage.width) > 1000 ? floor(max(BWImage.height,BWImage.width) / 700) : 1;
	smallBWImage = createGraphics(BWImage.width/scaleDown,BWImage.height/scaleDown);
	smallBWImage.image(BWImage,0,0,smallBWImage.width,smallBWImage.height);
}

function setupChars(){
	for(let i = 33; i < 128; i++){
		chars.push(new Asccar(String.fromCharCode(i)));
	}
	chars.sort(function(a,b){return a.brigthness - b.brigthness});
}


function draw() {
}

function drawAsci(){
	let chWidth = chars[0].image.width;
	let chHeight = chars[0].image.height;
	let imgArea = chWidth*chHeight;
	smallBWImage.loadPixels();
	for(let i = 0; i < smallBWImage.height - 10; i += chHeight){
		for(let j = 0; j < smallBWImage.width; j += chWidth){
			let brness = 0;
			let tmpImage = createImage(chWidth,chHeight);
			tmpImage.loadPixels();
			for(let y = 0; y < chHeight; y++){
				for(let x = 0; x < chWidth; x++){
					let imIndex = ((i + y) * smallBWImage.width + (j + x)) * 4;
					// let avgBrness = 0;
					brness += smallBWImage.pixels[imIndex];
					// avgBrness += smallBWImage.pixels[imIndex + 1];
					// avgBrness += smallBWImage.pixels[imIndex + 2];
					// avgBrness /= 3;
					// brness += avgBrness;

					let tmpIndex = (y * chWidth + x) * 4;
					tmpImage.pixels[tmpIndex] = smallBWImage.pixels[imIndex];
					tmpImage.pixels[tmpIndex + 1] = smallBWImage.pixels[imIndex + 1];
					tmpImage.pixels[tmpIndex + 2] = smallBWImage.pixels[imIndex + 2];
					tmpImage.pixels[tmpIndex + 3] = smallBWImage.pixels[imIndex + 3];
				}
			}
			tmpImage.updatePixels();
			brness = floor(brness / imgArea);
			brness += (255 - brness) / 3;
			fill(brness);
			noStroke();
			// rect(j,i,chWidth,chHeight);
			image(getCharByBrightness(brness, tmpImage),j,i);
		}
	}
}

function getCharByBrightness(br, tmpImage){
	let i = 0;
	let minInd = 0;
	let minDist = 1000000;
	while(i < chars.length - 1){
		if(abs(chars[i].brigthness - br) < 15){
			var tmpDist = chars[i].dist(tmpImage)
			if(tmpDist < minDist){
				minDist = tmpDist;
				minInd = i;
			}
		}
		i++;
	}
	
	if(minDist == 1000000){
		i = 0;
		while(i < chars.length - 1 && chars[i].brigthness < br){
			i++;
		}

		if(i == 0){
			return chars[0].image;
		}
		if(chars[i].brigthness - br < chars[i - 1].brigthness - br){
			return chars[i].image;
		}else{
			return chars[i-1].image;
		}
	}

	return chars[minInd].image;
}