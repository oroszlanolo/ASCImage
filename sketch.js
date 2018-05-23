

let chars = [];

let myImage;
let smallBWImage;
let asciimage;
let canv;

let scaleSlider;
let thresholdSlider;
let distanceCalc;
let scaleP;
let thresholdP;
let generatingP;
let generateButt;
let saveName;
let saveButt;

function preload(){
	myImage = loadImage("Juli.JPG");
}


function setup() {
	createGUI();
	canv = createCanvas(1600,1000);
	canv.drop(CBLoad);
	setupChars();
	generateImage();
}

function createGUI(){
	scaleSlider = createSlider(512,4000,800,32);
	scaleSlider.mouseMoved(CBSliderS);
	scaleSlider.style("margin","10px");
	thresholdSlider = createSlider(2,4,3,0.2);
	thresholdSlider.mouseMoved(CBSliderT);
	thresholdSlider.style("margin","10px");
	distanceCalc = createCheckbox("Complex algorithm");
	distanceCalc.style("display","inline");
	distanceCalc.style("padding","10px");
	generateButt = createButton("Generate");
	generateButt.style("padding","10px");
	generateButt.mouseClicked(CBGenerate);
	saveName = createInput("Filename");
	saveName.style("margin","10px");
	saveButt = createButton("SAVE");
	saveButt.mouseClicked(CBSave);
	saveButt.style("margin","10px");
	saveButt.style("padding","10px");
	createP('');

	scaleP = createP("Max Size: " + scaleSlider.value());
	scaleP.style("padding-left","5px");
	scaleP.style("display","inline");

	thresholdP = createP("Threshold: " + thresholdSlider.value());
	thresholdP.style("padding-left","60px");
	thresholdP.style("display","inline");

	generatingP = createP("Generating. Please wait...");
	generatingP.style("padding-left","60px");
	generatingP.style("display","inline");
	generatingP.style("color","red");
	generatingP.hide();

	createP('');
}
function CBSliderS(){
	scaleP.html("Max Size: " + scaleSlider.value());
	if(scaleSlider.value() > 2000){
		scaleP.style("color","red");
	}else{
		scaleP.style("color","black");
	}
}
function CBSliderT(){
	thresholdP.html("Threshold: " + thresholdSlider.value());
}
function CBGenerate(){
	generatingP.show();
	generateImage();
}
function CBSave(){
	save(asciimage,saveName.value() + ".png");
}

function CBLoad(file){
	generatingP.show();
	loadImage(file.data,CBImageLoaded);
}

function CBImageLoaded(loadedImg){
	myImage = loadedImg;
	generateImage();
}


function generateImage() {
	createBWImage();
	background(255);
	resizeCanvas(smallBWImage.width * 2, smallBWImage.height);
	if(distanceCalc.checked()){
		drawAsci();
	}else{
		drawAsci2();
	}
	image(asciimage,0,0);
	image(smallBWImage, smallBWImage.width, 0, smallBWImage.width, smallBWImage.height);
	generatingP.hide();
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
	let scaleDown = max(BWImage.height,BWImage.width) > scaleSlider.value() ? max(BWImage.height,BWImage.width) / scaleSlider.value() : 1;
	smallBWImage = createGraphics(round(BWImage.width/scaleDown),round(BWImage.height/scaleDown));
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
	asciimage = createGraphics(smallBWImage.width,smallBWImage.height);
	let chWidth = chars[0].image.width;
	let chHeight = chars[0].image.height;
	let imgArea = chWidth*chHeight;
	let brness;
	smallBWImage.loadPixels();
	for(let i = 0; i < smallBWImage.height - 7; i += chHeight){
		for(let j = 0; j < smallBWImage.width; j += chWidth){
			brness = 0;
			let tmpImage = createImage(chWidth,chHeight);
			tmpImage.loadPixels();
			let tmpIndex = 0;
			for(let y = 0; y < chHeight; y++){
				for(let x = 0; x < chWidth; x++){
					let imIndex = ((i + y) * smallBWImage.width + (j + x)) * 4;
					brness += smallBWImage.pixels[imIndex];

					tmpImage.pixels[tmpIndex] = smallBWImage.pixels[imIndex];
					tmpIndex += 4;
				}
			}
			brness = brness / imgArea;
			tmpImage.updatePixels();
			brness += (255 - brness) / thresholdSlider.value();
			asciimage.image(getCharByBrightness(brness, tmpImage),j,i);
		}
	}
}

function getCharByBrightness(br, tmpImage){
	let i = 0;
	let minInd = 0;
	let minDist = 1000000;
	while(i < chars.length){
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

function drawAsci2(){
	asciimage = createGraphics(smallBWImage.width,smallBWImage.height);
	let chWidth = chars[0].image.width;
	let chHeight = chars[0].image.height;
	let imgArea = chWidth*chHeight;
	let brness;
	smallBWImage.loadPixels();
	for(let i = 0; i < smallBWImage.height - 7; i += chHeight){
		for(let j = 0; j < smallBWImage.width; j += chWidth){
			brness = 0;
			let tmpIndex = 0;
			for(let y = 0; y < chHeight; y++){
				for(let x = 0; x < chWidth; x++){
					let imIndex = ((i + y) * smallBWImage.width + (j + x)) * 4;
					brness += smallBWImage.pixels[imIndex];
					tmpIndex += 4;
				}
			}
			brness = brness / imgArea;
			brness += (255 - brness) / thresholdSlider.value();
			asciimage.image(getCharByBrightness2(brness),j,i);
		}
	}
}
function getCharByBrightness2(br){
	let i = 0;
	let minInd = 0;
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

	return chars[minInd].image;
}