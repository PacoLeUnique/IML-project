import '@marcellejs/core/dist/marcelle.css';
import * as marcelle from '@marcellejs/core';


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



const store = marcelle.dataStore('localStorage');
const trainingSet = marcelle.dataset('TrainingSet', store);

const trainingSetBrowser = marcelle.datasetBrowser(trainingSet);

const classifier = marcelle.mlpClassifier({ layers: [32, 32], epochs: 20 });
const trainingButton = marcelle.button('Train');

const plotTraining = marcelle.trainingPlot(classifier);

label.$value.subscribe((currentInput) => {
console.log('currentInput:', currentInput);
});


const $instances = capture.$click
.sample(imageUpload.$images)
.map(async (img) => ({
x: await featureExtractor.process(img),
y: label.$value.get(),
thumbnail: imageUpload.$thumbnails.get(),
}))
.awaitPromises();



const $predictions = imageUploadEvaluation.$images
  .map(async (img) => {
    const features = await featureExtractor.process(img);
    return classifier.predict(features);
  })
  .awaitPromises();

const predViz = marcelle.confidencePlot($predictions);

$predictions.subscribe(console.log);


//Bouton pour train le modele 
trainingButton.$click.subscribe(() => {
	classifier.train(trainingSet);
});

$instances.subscribe(trainingSet.create);


// Slider 

const sliderCropX = marcelle.slider({min: 1, max: 9, step: 1, pips:true, pipstep:4});
sliderCropX.title = "number of X divisions"; 
const sliderCropY = marcelle.slider({min: 1, max: 9, step: 1, pips:true, pipstep:4});
sliderCropY.title = "number of Y divisions"; 


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
		.use(imageDisplayCrop);

myDashboard.show();
	