import '@marcellejs/core/dist/marcelle.css';
import * as marcelle from '@marcellejs/core';
import { cropImage } from './cropImage.mjs';


// Tous les imageUpload et imageDisplay
const imageUpload = marcelle.imageUpload({width:224, height:224});
const imageDisplay = marcelle.imageDisplay(imageUpload.$images);

const imageUploadEvaluation = marcelle.imageUpload({width:224, height:224});
const imageDisplayEvaluation = marcelle.imageDisplay(imageUploadEvaluation.$images);

const imageUploadCrop = marcelle.imageUpload({width:224, height:224});
const imageDisplayCrop = marcelle.imageDisplay(imageUploadCrop.$images);

const myDashboard = marcelle.dashboard({
	title: 'My First Tutorial',
	author: 'Myself',
  });

const featureExtractor = marcelle.mobileNet();

const label = marcelle.textInput();
label.title = 'Instance label';

const capture = marcelle.button('Click to record an instance');
capture.title = 'Capture instances to the training set';


//dataset principal
const store = marcelle.dataStore('localStorage');
const trainingSet = marcelle.dataset('TrainingSet', store);
const trainingSetBrowser = marcelle.datasetBrowser(trainingSet);

//dataset du crop
const storeCrop = marcelle.dataStore('localStorage');
const trainingSetCrop = marcelle.dataset('TrainingSet', storeCrop);
const trainingSetBrowserCrop = marcelle.datasetBrowser(trainingSetCrop);

const classifier = marcelle.mlpClassifier({ layers: [32, 32], epochs: 20 });

//Tous les boutons
const trainingButton = marcelle.button('Train');

const addCropButton = marcelle.button('crop');
addCropButton.title = 'Add cropped image to the dataset';

const plotTraining = marcelle.trainingPlot(classifier);



const $instances = capture.$click
.sample(imageUpload.$images)
.map(async (img) => ({
x: await featureExtractor.process(img),
y: label.$value.get(),
thumbnail: imageUpload.$thumbnails.get(),
}))
.awaitPromises();

$instances.subscribe(trainingSet.create);


const $predictions = imageUploadEvaluation.$images
  .map(async (img) => {
    const features = await featureExtractor.process(img);
    return classifier.predict(features);
  })
  .awaitPromises();

const predViz = marcelle.confidencePlot($predictions);



//Bouton pour train le modele 
trainingButton.$click.subscribe(() => {
	classifier.train(trainingSet);
});


// Slider 
const sliderCropX = marcelle.slider({min: 1, max: 9, step: 1, pips:true, pipstep:4});
sliderCropX.title = "number of X divisions"; 
const sliderCropY = marcelle.slider({min: 1, max: 9, step: 1, pips:true, pipstep:4});
sliderCropY.title = "number of Y divisions"; 

let sliderXValue = 0;
let sliderYValue = 0;
sliderCropX.$values.subscribe((x) => {sliderXValue = x; } );
sliderCropY.$values.subscribe((y) => {sliderYValue = y; } );

//Bouton add a cropped image
addCropButton.$click.subscribe(() =>{
	const image = imageUploadEvaluation.$images;
	console.log("image :", image);
	console.log("Xcrop :", sliderXValue);
	console.log("Ycrop :", sliderYValue);
	const croppedImages = cropImage(image, sliderXValue, sliderYValue);

	console.log(croppedImages);

});





/// AFFICHAGE DES PAGES 

myDashboard.page('Data Management')
	.sidebar(imageDisplay, featureExtractor)
	.use(imageUpload)
	.use([label, capture], trainingSetBrowser, trainingButton)
	.use(plotTraining);

myDashboard.page('Direct Evaluation')
	.sidebar(imageDisplayEvaluation)
	.use(imageUploadEvaluation)
	.use(predViz);

myDashboard.page("Crop analysis")
	.sidebar(imageDisplayCrop)
		.use(imageUploadCrop)
		.use([sliderCropX, sliderCropY])
		.use(addCropButton)
		.use(imageDisplayCrop);

myDashboard.show();
	