import '@marcellejs/core/dist/marcelle.css';
import * as marcelle from '@marcellejs/core';
import { cropImage } from './cropImage.mjs';
import { getBase64FromImageData } from './getBase64FromImageData.mjs';

const myDashboard = marcelle.dashboard({
	title: 'Paint Expert',
	author: 'Group 13',
  });


// Tous les imageUpload et imageDisplay
const imageUpload = marcelle.imageUpload({width:224, height:224});
const imageDisplay = marcelle.imageDisplay(imageUpload.$images);

const imageUploadEvaluation = marcelle.imageUpload({width:224, height:224});
const imageDisplayEvaluation = marcelle.imageDisplay(imageUploadEvaluation.$images);

const imageUploadCrop = marcelle.imageUpload({width:224, height:224});
const imageDisplayCrop = marcelle.imageDisplay(imageUploadCrop.$images);



const featureExtractor = marcelle.mobileNet();

const label = marcelle.textInput();
label.title = 'Instance label';
const labelCrop = marcelle.textInput();
labelCrop.title = "Write your label here";

const capture = marcelle.button('Click to record an instance');
capture.title = 'Capture instances to the training set';


//dataset principal
const store = marcelle.dataStore('localStorage');
const trainingSet = marcelle.dataset('TrainingSet', store);
const trainingSetBrowser = marcelle.datasetBrowser(trainingSet);

//dataset du crop
const storeCrop = marcelle.dataStore('memory');
const trainingSetCrop = marcelle.dataset('TrainingSet', storeCrop);
const trainingSetTable = marcelle.datasetTable(trainingSetCrop, ['y', 'thumbnail', 'updatedAt']);
trainingSetTable.title = "cropped images";

const classifier = marcelle.mlpClassifier({ layers: [32, 32], epochs: 20 });

//Crop prediction visualisation
const cropPredViz = marcelle.batchPrediction("mlp", storeCrop);
const confusionMatrix = marcelle.confusionMatrix(cropPredViz);

//Tous les boutons
const trainingButton = marcelle.button('Train');

const addCropButton = marcelle.button('crop');
addCropButton.title = 'Add cropped image to the dataset';

const predictCrops = marcelle.button('predict');
predictCrops.title = "predict crops";

const plotTraining = marcelle.trainingPlot(classifier);


// instances du dataset de base
const $instances = capture.$click
.sample(imageUpload.$images)
.map(async (img) => ({
x: await featureExtractor.process(img),
y: label.$value.get(),
thumbnail: imageUpload.$thumbnails.get(),
}))
.awaitPromises();

$instances.subscribe(trainingSet.create);

//prediction du dataset normal
const $predictions = imageUploadEvaluation.$images
  .map(async (img) => {
    const features = await featureExtractor.process(img);
    return classifier.predict(features);
  })
  .awaitPromises();

const predViz = marcelle.confidencePlot($predictions);



//Boutons pour train le modele 
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

let imageDataCrop = null;
imageUploadCrop.$images.subscribe((x)=> {imageDataCrop = x;});

//Bouton add a cropped image
addCropButton.$click.subscribe(() =>{
	const image = imageUploadEvaluation.$images;
	console.log("image :", image);
	console.log("Xcrop :", sliderXValue);
	console.log("Ycrop :", sliderYValue);

	const croppedImages = cropImage(imageDataCrop, sliderXValue, sliderYValue);
	const instancesCrop = croppedImages.map((img) => ({
		x: img,
		y: labelCrop.$value.get(),
		thumbnail: getBase64FromImageData(img)
	}));
	console.log(instancesCrop);

	instancesCrop.forEach(instance => {
		trainingSetCrop.create(instance);
	});
});

//prediction des crop
predictCrops.$click.subscribe(()=> {
	const features = trainingSetCrop.items();
	console.log("features :", features);

	cropPredViz.clear();
	cropPredViz.predict(classifier, trainingSetCrop);
});

//const predVizCrop = marcelle.confidencePlot($predictionsCrop);






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
		.use([labelCrop, addCropButton])
		.use(trainingSetTable)
		.use(predictCrops)
		.use(confusionMatrix);

myDashboard.show();
	